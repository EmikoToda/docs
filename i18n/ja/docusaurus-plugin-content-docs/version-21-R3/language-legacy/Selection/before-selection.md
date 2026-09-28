---
id: before-selection
title: Before selection
slug: /commands/before-selection
displayed_sidebar: docs
---

<!--REF #_command_.Before selection.Syntax-->**Before selection** ( *aTable* : Table ) : Boolean<!-- END REF-->
<!--REF #_command_.Before selection.Params-->
<div class="no-index">

| 引数 | 型 |  | 説明 |
| --- | --- | --- | --- |
| aTable | Table | &#8594; | レコードポインターがセレクションの先頭より前に あるかをテストするテーブル, または 省略時、デフォルトテーブル |
| 戻り値 | Boolean | &#8592; | Yes (TRUE) または No (FALSE) |
</div>
<!-- END REF-->

## 説明 

<!--REF #_command_.Before selection.Summary-->**Before selection** は、カレントレコードポインターが*aTable*のカレントセレクションの前にある場合にTRUEを返します。<!-- END REF-->は、一般に[PREVIOUS RECORD](../commands/previous-record) により、カレントレコードポインターが先頭レコードの前に移動したかどうかを調べるために使用します。カレントセレクションが空の場合、**Before selection** はTRUEを返します。

カレントレコードポインターをセレクションに内に戻すには、[FIRST RECORD](../commands/first-record)、[LAST RECORD](../commands/last-record) または [GOTO SELECTED RECORD](../commands/goto-selected-record) を使用します。[NEXT RECORD](../commands/next-record) ではポインターはセレクション内に戻りません。

[PRINT SELECTION](../commands/print-selection) またはプリント...メニューを選択してレポートを印刷する場合も、**Before selection** は最初のヘッダーでTRUEを返します。以下のステートメントを使用して最初のヘッダーを判定し、先頭ページに特殊なヘッダーを印刷することができます:

```4d
  // レポート印刷に使用される出力フォームのメソッド
 $vpFormTable:=Current form table
 Case of
  // ...
    :(Form event code=On Header)
  // ヘッダエリアが印刷されようとしている
       Case of
          :(Before selection($vpFormTable->))
  // 最初のプレークヘッダ用のコード
  // ...
       End case
 End case
```

## 例題 

以下の例はレポートの印刷中に使用します。変数*vTitle*を設定し、先頭ページのヘッダーエリアに印刷します:

```4d
  // [Finances];"Summary" フォームメソッド
 Case of
  // ...
    :(Form event code=On Header)
       Case of
          :(Before selection([Finances])
             vTitle:="Corporate Report 1997" // 1ページめのタイトル
          Else
             vTitle:="" // 他のページではタイトルを印刷しない
       End case
 End case
```

## 参照 

[End selection](../commands/end-selection)  
[FIRST RECORD](../commands/first-record)  
[Form event code](../commands/form-event-code)  
[PREVIOUS RECORD](../commands/previous-record)  
[PRINT SELECTION](../commands/print-selection)  

## プロパティ

|  |  |
| --- | --- |
| コマンド番号 | 198 |
| スレッドセーフである | yes |



