#!/usr/bin/env node
"use strict";

/**
 * 日本語テクニカル用語の表記ゆれを検出/修正する CLI。
 *
 *   node tools/ja-normalize/index.js            # 検査のみ (差分があれば exit 1)
 *   node tools/ja-normalize/index.js --fix      # 修正して書き込み
 *   node tools/ja-normalize/index.js --fix i18n/ja/docusaurus-plugin-content-docs/current
 */

const fs = require("fs");
const path = require("path");
const {
  DEFAULT_EXCEPTIONS,
  DEFAULT_GLOSSARY,
  loadExceptions,
  loadGlossary,
  normalizeText,
  validate,
} = require("./normalize");

const DEFAULT_TARGETS = ["i18n/ja"];
const EXTENSIONS = new Set([".md", ".mdx", ".json"]);
const IGNORED_DIRS = new Set([".git", "node_modules", "build", ".docusaurus"]);

function parseArgs(argv) {
  const options = {
    fix: false,
    summary: false,
    glossary: DEFAULT_GLOSSARY,
    exceptions: DEFAULT_EXCEPTIONS,
    targets: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--fix") options.fix = true;
    else if (arg === "--summary") options.summary = true;
    else if (arg === "--glossary") options.glossary = argv[++i];
    else if (arg === "--exceptions") options.exceptions = argv[++i];
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg.startsWith("-")) throw new Error(`未知のオプション: ${arg}`);
    else options.targets.push(arg);
  }
  if (options.targets.length === 0) options.targets = DEFAULT_TARGETS;
  return options;
}

function collectFiles(target, excludedPaths) {
  const stat = fs.statSync(target);
  const files = [];
  if (stat.isFile()) {
    files.push(target);
  } else {
    for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        files.push(...collectFiles(path.join(target, entry.name), excludedPaths));
      } else if (EXTENSIONS.has(path.extname(entry.name))) {
        files.push(path.join(target, entry.name));
      }
    }
  }
  return files.filter((file) => {
    const rel = path.relative(process.cwd(), file).split(path.sep).join("/");
    return !excludedPaths.some((re) => re.test(rel));
  });
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }

  if (options.help) {
    console.log(
      [
        "使い方: node tools/ja-normalize/index.js [options] [paths...]",
        "",
        "  --fix              検出箇所を修正してファイルに書き込む",
        "  --summary          ファイルごとの詳細を省略し集計のみ表示する",
        "  --glossary <file>  用語集 TSV のパス (既定: tools/ja-normalize/glossary.tsv)",
        "  --exceptions <file> 例外定義 TSV のパス",
        "",
        `既定の対象: ${DEFAULT_TARGETS.join(", ")}`,
      ].join("\n")
    );
    return;
  }

  let rules;
  let exceptions;
  try {
    rules = loadGlossary(options.glossary);
    exceptions = loadExceptions(options.exceptions);
  } catch (error) {
    console.error(`用語集の読み込みに失敗しました: ${error.message}`);
    process.exit(2);
  }

  const problems = validate(rules, exceptions);
  if (problems.length > 0) {
    console.error("用語集の定義に矛盾があります:");
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(2);
  }

  const files = [];
  for (const target of options.targets) {
    if (!fs.existsSync(target)) {
      console.error(`対象が見つかりません: ${target}`);
      process.exit(2);
    }
    files.push(...collectFiles(target, exceptions.paths));
  }

  const perRule = new Map();
  let totalHits = 0;
  let changedFiles = 0;

  for (const file of files) {
    const original = fs.readFileSync(file, "utf8");
    const { text, hits } = normalizeText(original, {
      rules,
      exceptions,
      ext: path.extname(file),
    });
    if (hits.length === 0) continue;

    changedFiles++;
    totalHits += hits.length;
    for (const hit of hits) {
      const key = `${hit.from} → ${hit.to}`;
      perRule.set(key, (perRule.get(key) || 0) + 1);
    }

    if (options.fix) fs.writeFileSync(file, text);
    if (!options.summary) {
      for (const hit of hits) {
        console.log(`${file}:${hit.line}:${hit.column}: ${hit.from} → ${hit.to}`);
      }
    }
  }

  const label = options.fix ? "修正" : "検出";
  console.log("");
  for (const [rule, count] of [...perRule].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(6)}  ${rule}`);
  }
  console.log(
    `\n${files.length} ファイルを検査し、${changedFiles} ファイル / ${totalHits} 箇所を${label}しました。`
  );

  if (!options.fix && totalHits > 0) {
    console.log("\n修正するには: npm run ja:fix");
    process.exit(1);
  }
}

main();
