# ja-normalize — 日本語テクニカル用語の表記ゆれ正規化

`i18n/ja` 配下の Markdown / 翻訳 JSON に対して、テクニカル用語のカタカナ表記を
用語集 (`glossary.tsv`) にもとづいて正規化します。追加の npm パッケージは不要です。

> GitHub Actions を使ったことがない方は、ブラウザーだけで操作できる
> **[はじめての ja-normalize (HOWTO.md)](HOWTO.md)** を参照してください。

```
プロシージャ  → プロシージャー
ユーザ        → ユーザー
インタフェース → インターフェース
```

## ファイル構成

- glossary.tsv — 用語集（変換前 / 変換後 / 備考）
- exceptions.tsv — 例外定義（特定の状況で変換しない語のガード）
- normalize.js — 変換エンジン（実際に置換を行うロジック）
- index.js — CLI（コマンドラインインターフェース）
- test.js — テストファイル
- README.md — 仕様とルール
- HOWTO.md — 初心者向けガイド

## 使い方

```bash
npm run ja:check                       # 検査のみ (表記ゆれがあれば exit 1)
npm run ja:fix                         # 一括修正
npm run ja:test                        # 用語集と変換ロジックのテスト

node tools/ja-normalize/index.js --summary                 # 集計のみ表示
node tools/ja-normalize/index.js --fix i18n/ja/.../current # 対象を限定
node tools/ja-normalize/index.js --help
```

引数を省略した場合の対象は `i18n/ja` です。ファイル・ディレクトリを直接指定することもできます。

## 用語集 (`glossary.tsv`)

`変換前<TAB>変換後<TAB>備考` のタブ区切りです。記述順は問いません
(常に「長い表記」が優先して適用されます)。

| 保証される性質 | 内容 |
| --- | --- |
| 冪等性 | 変換後 = 変換前 + `ー` のルールは `(?!ー)` で保護され、二重に長音が付きません |
| 最長一致 | `ストアードプロシージャー → ストアドプロシージャー` が `プロシージャ` より先に適用されます |
| 収束 | 変換結果がさらに別ルールに引っかかる定義は、起動時に検証エラーになります |

## 例外 (`exceptions.tsv`)

| 種別 | 意味 |
| --- | --- |
| `keep` | 「値 + ー」を生成するルールがあれば検証エラーにする (メモリ、ライブラリ、クエリ等) |
| `literal` | その文字列が現れた箇所は変換しない (固有名詞・UI ラベル) |
| `regex` | 正規表現にマッチした範囲を変換しない |
| `path` | その glob に一致するファイルを処理対象から除外する |

誤変換を見つけたら、スクリプトを変更するのではなく `exceptions.tsv` に追記してください。

## 変換しない箇所

Markdown の構造を壊さないよう、以下は自動的に保護されます。

- コードフェンス (```` ``` ````, `~~~`) とインラインコード
- HTML コメント、HTML タグと属性値
- URL、およびリンク先のパス部分
  - ただし `#` 以降のアンカーは見出しと同時に変換されます (リンク切れ防止のため)
- front matter のキー名と、`title` / `description` / `sidebar_label` / `keywords` 以外の値
- 翻訳 JSON (`code.json` 等) では `"message"` の値以外すべて

## 自動実行

- **CI**: `.github/workflows/ja-normalize.yml`
  - `i18n/ja/**` を含む Pull Request / push で検査を実行
  - `workflow_dispatch` の `mode: fix` で一括修正 Pull Request を作成
- **pre-commit フック** (任意):

  ```bash
  git config core.hooksPath .githooks
  ```

  ステージされた `i18n/ja` 配下のファイルのみを検査します (`git commit --no-verify` で回避可能)。

## Crowdin との関係

`i18n/ja` は Crowdin から取り込まれるため、このリポジトリだけを修正しても
次回の `npm run crowdin-download` で元に戻る可能性があります。運用としては、

1. ダウンロード直後に `npm run ja:fix` を実行してから差分をコミットする
2. 同じ用語集を Crowdin の用語集 / QA チェックにも登録する

の両方をおこなうことを推奨します。
