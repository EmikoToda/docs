"use strict";

/**
 * 日本語テクニカル用語の表記ゆれ正規化エンジン。
 * 依存パッケージなしで動作します。
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_GLOSSARY = path.join(__dirname, "glossary.tsv");
const DEFAULT_EXCEPTIONS = path.join(__dirname, "exceptions.tsv");

function parseTsv(file) {
  return fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line, i) => ({ line, no: i + 1 }))
    .filter(({ line }) => line.trim() !== "" && !line.trimStart().startsWith("#"))
    .map(({ line, no }) => ({ cols: line.split("\t").map((c) => c.trim()), no }));
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function loadGlossary(file = DEFAULT_GLOSSARY) {
  const rules = [];
  const seen = new Map();
  for (const { cols, no } of parseTsv(file)) {
    const [from, to, note = ""] = cols;
    if (!from || !to) {
      throw new Error(`${file}:${no}: 変換前/変換後の列が足りません`);
    }
    if (from === to) {
      throw new Error(`${file}:${no}: 変換前と変換後が同一です (${from})`);
    }
    if (seen.has(from)) {
      throw new Error(`${file}:${no}: "${from}" は ${seen.get(from)} 行目で定義済みです`);
    }
    seen.set(from, no);
    rules.push({ from, to, note, line: no });
  }
  // 長い表記を優先して適用する (例: ストアードプロシージャー > プロシージャ)。
  rules.sort((a, b) => b.from.length - a.from.length || a.from.localeCompare(b.from));
  return rules;
}

function loadExceptions(file = DEFAULT_EXCEPTIONS) {
  const keep = [];
  const literals = [];
  const regexes = [];
  const paths = [];
  for (const { cols, no } of parseTsv(file)) {
    const [kind, value] = cols;
    if (!value) throw new Error(`${file}:${no}: 値が空です`);
    switch (kind) {
      case "keep":
        keep.push(value);
        break;
      case "literal":
        literals.push(value);
        break;
      case "regex":
        regexes.push(new RegExp(value, "g"));
        break;
      case "path":
        paths.push(globToRegExp(value));
        break;
      default:
        throw new Error(`${file}:${no}: 未知の種別 "${kind}"`);
    }
  }
  return { keep, literals, regexes, paths };
}

function globToRegExp(glob) {
  const src = glob
    .split("**")
    .map((part) => part.split("*").map(escapeRegExp).join("[^/]*"))
    .join(".*");
  return new RegExp(`^${src}$`);
}

/** ルール同士・例外との矛盾を検証する。 */
function validate(rules, exceptions) {
  const problems = [];
  for (const rule of rules) {
    for (const word of exceptions.keep) {
      if (rule.to.includes(`${word}ー`)) {
        problems.push(
          `glossary.tsv:${rule.line}: "${rule.from} → ${rule.to}" は keep 指定の "${word}" に長音を付けます`
        );
      }
      if (word.includes(rule.from) && rule.to === `${rule.from}ー`) {
        problems.push(
          `glossary.tsv:${rule.line}: "${rule.from}" は keep 指定の "${word}" の一部と一致します`
        );
      }
    }
  }
  // 変換結果が収束しない (循環する) 定義を検出する。
  for (const rule of rules) {
    let current = rule.to;
    let converged = false;
    for (let pass = 0; pass < 8; pass++) {
      const next = applyRules(current, rules, []).text;
      if (next === current) {
        converged = true;
        break;
      }
      current = next;
    }
    if (!converged) {
      problems.push(`glossary.tsv:${rule.line}: "${rule.from} → ${rule.to}" の変換が収束しません`);
    }
  }
  return problems;
}

function buildMatcher(rules) {
  const map = new Map();
  const alternatives = rules.map((rule) => {
    map.set(rule.from, rule);
    // 「変換前 + ー」が変換後の場合、すでに正しい表記には反応させない。
    const suffix = rule.to === `${rule.from}ー` ? "(?!ー)" : "";
    return escapeRegExp(rule.from) + suffix;
  });
  return { regex: new RegExp(alternatives.join("|"), "g"), map };
}

function mergeRanges(ranges) {
  const sorted = ranges.filter(([a, b]) => b > a).sort((x, y) => x[0] - y[0]);
  const merged = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([range[0], range[1]]);
  }
  return merged;
}

function isProtected(ranges, start, end) {
  for (const [a, b] of ranges) {
    if (start < b && end > a) return true;
  }
  return false;
}

const INLINE_PATTERNS = [
  /`[^`\n]*`/g, // インラインコード
  /<!--[\s\S]*?-->/g, // HTML コメント
  /<\/?[A-Za-z][^>\n]*>/g, // HTML タグ (属性を含む)
  /https?:\/\/[^\s)<>"']+/g, // 生の URL
];
const FRONT_MATTER_TRANSLATABLE = new Set(["title", "description", "sidebar_label", "keywords"]);

/** Markdown 中で変換してはいけない範囲を求める。 */
function markdownProtectedRanges(text) {
  const fences = mergeRanges(collect(text, [/```[\s\S]*?(?:```|$)/g, /~~~[\s\S]*?(?:~~~|$)/g]));
  const ranges = [...fences];

  for (const pattern of INLINE_PATTERNS) {
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      // コードフェンスをまたぐ誤マッチは無視する (フェンス自体が保護済み)。
      if (fences.some(([a, b]) => start < b && end > a && !(start >= a && end <= b))) continue;
      ranges.push([start, end]);
    }
  }

  // リンク先のパス部分は保護する。ただし `#` 以降のアンカーは見出しと一緒に変換する。
  for (const pattern of [/\]\(\s*([^)\s]+)/g, /^\[[^\]]+\]:[ \t]*(\S+)/gm]) {
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const target = m[1];
      const start = m.index + m[0].length - target.length;
      const hash = target.indexOf("#");
      ranges.push([start, start + (hash === -1 ? target.length : hash)]);
    }
  }

  ranges.push(...frontMatterProtectedRanges(text));
  return mergeRanges(ranges);
}

function collect(text, patterns) {
  const ranges = [];
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(text)) !== null) ranges.push([m.index, m.index + m[0].length]);
  }
  return ranges;
}

function frontMatterProtectedRanges(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!match) return [];
  const body = match[1];
  const offset = match[0].indexOf(body);
  const ranges = [];
  let cursor = 0;
  for (const line of body.split("\n")) {
    const start = offset + cursor;
    const keyMatch = /^([A-Za-z0-9_-]+):[ \t]*(.*)$/.exec(line);
    if (keyMatch && FRONT_MATTER_TRANSLATABLE.has(keyMatch[1])) {
      // 値だけを変換対象にし、キー名は保護する。
      ranges.push([start, start + line.length - keyMatch[2].length]);
    } else {
      ranges.push([start, start + line.length]);
    }
    cursor += line.length + 1;
  }
  return ranges;
}

/** Docusaurus の翻訳 JSON では "message" の値以外をすべて保護する。 */
function jsonProtectedRanges(text) {
  const allowed = [];
  const pattern = /"message"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = pattern.exec(text)) !== null) {
    const start = m.index + m[0].length - m[1].length - 1;
    allowed.push([start, start + m[1].length]);
  }
  const ranges = [];
  let cursor = 0;
  for (const [a, b] of mergeRanges(allowed)) {
    ranges.push([cursor, a]);
    cursor = b;
  }
  ranges.push([cursor, text.length]);
  return mergeRanges(ranges);
}

function exceptionRanges(text, exceptions) {
  const ranges = [];
  for (const literal of exceptions.literals) {
    let from = 0;
    let at;
    while ((at = text.indexOf(literal, from)) !== -1) {
      ranges.push([at, at + literal.length]);
      from = at + literal.length;
    }
  }
  ranges.push(...collect(text, exceptions.regexes));
  return ranges;
}

function protectedRangesFor(text, ext, exceptions = { literals: [], regexes: [] }) {
  const base = ext === ".json" ? jsonProtectedRanges(text) : markdownProtectedRanges(text);
  return mergeRanges([...base, ...exceptionRanges(text, exceptions)]);
}

function applyRules(text, rules, protectedRanges = []) {
  const { regex, map } = buildMatcher(rules);
  const hits = [];
  regex.lastIndex = 0;
  const out = text.replace(regex, (matched, offset) => {
    if (isProtected(protectedRanges, offset, offset + matched.length)) return matched;
    const rule = map.get(matched);
    hits.push({ index: offset, from: rule.from, to: rule.to });
    return rule.to;
  });
  return { text: out, hits };
}

const MAX_PASSES = 8;

/**
 * 1 ファイル分のテキストを正規化する。
 * 変換結果がさらに別ルールの対象になる場合に備え、収束するまで繰り返し適用する。
 * @returns {{text: string, hits: Array<{index: number, line: number, column: number, from: string, to: string}>}}
 */
function normalizeText(text, { rules, exceptions, ext = ".md" }) {
  let current = text;
  const allHits = [];
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const ranges = protectedRangesFor(current, ext, exceptions);
    const { text: out, hits } = applyRules(current, rules, ranges);
    if (hits.length === 0) return { text: current, hits: allHits };
    for (const hit of hits) allHits.push({ ...hit, ...lineCol(current, hit.index) });
    current = out;
  }
  throw new Error(`${MAX_PASSES} 回適用しても収束しませんでした。用語集に循環定義がある可能性があります。`);
}

function lineCol(text, index) {
  const before = text.slice(0, index);
  const line = before.split("\n").length;
  const column = index - (before.lastIndexOf("\n") + 1) + 1;
  return { line, column };
}

module.exports = {
  DEFAULT_GLOSSARY,
  DEFAULT_EXCEPTIONS,
  applyRules,
  globToRegExp,
  loadExceptions,
  loadGlossary,
  normalizeText,
  protectedRangesFor,
  validate,
};
