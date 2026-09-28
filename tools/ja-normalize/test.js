"use strict";

const assert = require("node:assert");
const { test } = require("node:test");

const {
  loadExceptions,
  loadGlossary,
  normalizeText,
  validate,
} = require("./normalize");

const rules = loadGlossary();
const exceptions = loadExceptions();

function run(text, ext = ".md") {
  return normalizeText(text, { rules, exceptions, ext }).text;
}

test("用語集と例外定義に矛盾がない", () => {
  assert.deepStrictEqual(validate(rules, exceptions), []);
});

test("基本的な長音付加", () => {
  assert.strictEqual(run("ユーザとサーバ"), "ユーザーとサーバー");
  assert.strictEqual(run("パラメータを渡す"), "パラメーターを渡す");
  assert.strictEqual(run("メニュバー"), "メニューバー");
});

test("すでに正しい表記は変更しない", () => {
  const text = "ユーザーがサーバーのフォルダーを開きます。";
  assert.strictEqual(run(text), text);
});

test("冪等である", () => {
  const once = run("ユーザインタフェースとプロシージャ");
  assert.strictEqual(run(once), once);
  assert.strictEqual(once, "ユーザーインターフェースとプロシージャー");
});

test("長い表記が優先される", () => {
  assert.strictEqual(run("ストアードプロシージャー"), "ストアドプロシージャー");
  assert.strictEqual(run("ストアードプロシージャ"), "ストアドプロシージャー");
  assert.strictEqual(run("インタプリター"), "インタープリター");
  assert.strictEqual(run("インタープリタ"), "インタープリター");
});

test("多段変換が 1 回の実行で収束する", () => {
  const once = run("ストアードプロシージャを実行するユーザインタフェース");
  assert.strictEqual(once, "ストアドプロシージャーを実行するユーザーインターフェース");
  assert.strictEqual(run(once), once);
});

test("短音のまま維持する語には影響しない", () => {
  const text = "メモリ、ライブラリ、クエリ、フォーミュラ、シグネチャ、ボディ、サードパーティ、コミュニティ";
  assert.strictEqual(run(text), text);
});

test("コードフェンス内は変換しない", () => {
  const text = ["ユーザ名", "```4d", "// ユーザ を取得", "$userFolder:=Folder(fk database folder)", "```", "ユーザ名"].join("\n");
  const out = run(text).split("\n");
  assert.strictEqual(out[0], "ユーザー名");
  assert.strictEqual(out[2], "// ユーザ を取得");
  assert.strictEqual(out[5], "ユーザー名");
});

test("インラインコード内は変換しない", () => {
  assert.strictEqual(run("`ユーザ` はユーザです"), "`ユーザ` はユーザーです");
});

test("リンク先のパスは変換せずアンカーは変換する", () => {
  assert.strictEqual(
    run("[ユーザ設定](../ユーザ/settings.md)"),
    "[ユーザー設定](../ユーザ/settings.md)"
  );
  assert.strictEqual(run("[ワーカ](#ワーカ)"), "[ワーカ](#ワーカ)");
  assert.strictEqual(run("[ヘッダ](users.md#ヘッダ)"), "[ヘッダー](users.md#ヘッダー)");
});

test("URL は変換しない", () => {
  const text = "詳細は https://example.com/ユーザ/index.html を参照";
  assert.strictEqual(run(text), text);
});

test("HTML タグの属性は変換しないが本文は変換する", () => {
  assert.strictEqual(
    run('<img src="ユーザ.png" alt="ユーザ" />ユーザ'),
    '<img src="ユーザ.png" alt="ユーザ" />ユーザー'
  );
  assert.strictEqual(run("<!-- ユーザ -->ユーザ"), "<!-- ユーザ -->ユーザー");
});

test("front matter は title のみ変換する", () => {
  const text = ["---", "id: ユーザ", "title: ユーザ管理", "---", "", "ユーザ"].join("\n");
  const out = run(text).split("\n");
  assert.strictEqual(out[1], "id: ユーザ");
  assert.strictEqual(out[2], "title: ユーザー管理");
  assert.strictEqual(out[5], "ユーザー");
});

test("翻訳 JSON では message の値だけ変換する", () => {
  const text = JSON.stringify(
    { "sidebar.ユーザ": { message: "ユーザ設定", description: "label for ユーザ" } },
    null,
    2
  );
  const out = run(text, ".json");
  assert.match(out, /"sidebar\.ユーザ"/);
  assert.match(out, /"message": "ユーザー設定"/);
  assert.match(out, /"description": "label for ユーザ"/);
  assert.doesNotThrow(() => JSON.parse(out));
});

test("例外の literal 指定が効く", () => {
  const custom = { ...exceptions, literals: ["ユーザ定義"] };
  const out = normalizeText("ユーザ定義とユーザ設定", { rules, exceptions: custom, ext: ".md" }).text;
  assert.strictEqual(out, "ユーザ定義とユーザー設定");
});

test("検出位置を行・列で報告する", () => {
  const { hits } = normalizeText("1行目\nユーザ", { rules, exceptions, ext: ".md" });
  assert.strictEqual(hits.length, 1);
  assert.strictEqual(hits[0].line, 2);
  assert.strictEqual(hits[0].column, 1);
});
