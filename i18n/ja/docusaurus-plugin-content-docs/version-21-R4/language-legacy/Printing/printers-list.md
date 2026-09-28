---
id: printers-list
title: PRINTERS LIST
slug: /commands/printers-list
displayed_sidebar: docs
---

<!--REF #_command_.PRINTERS LIST.Syntax-->**PRINTERS LIST** ( *namesArray* : Text array {; *altNamesArray* : Text array {; *modelsArray* : Text array}} )<!-- END REF-->
<!--REF #_command_.PRINTERS LIST.Params-->
<div class="no-index">

| 引数 | 型 |  | 説明 |
| --- | --- | --- | --- |
| namesArray | Text array | &#8592; | プリンター名 |
| altNamesArray | Text array | &#8592; | Windows: プリンターの場所 macOS: カスタムプリンター名 |
| modelsArray | Text array | &#8592; | プリンターモデル |
</div>
<!-- END REF-->

<div class="no-index">
<details><summary>履歴</summary>

|リリース|内容|
|---|---|
|16|変更|
|2004.1|変更|
|<6|初出|

</details>
</div>

## 説明 

<!--REF #_command_.PRINTERS LIST.Summary-->**PRINTERS LIST** コマンドは、引数として渡された各配列にそのマシンで使用できるプリンターの名前、およびオプションとしてプリンターの場所とモデルを返します。<!-- END REF-->

**Note:** プリントサーバー (スプーラ) を使用してプリンターを管理している場合、フルアクセスパス (Windows) またはスプーラの名前 (macOS) が返されます。

*namesArray* 引数には、テキスト配列を渡します。コマンドの実行後、この配列には使用できるプリンターの名前が代入されます。macOSの場合、固定のシステムの名称になります。

オプションで2番目の引数として*altNamesArray* を渡すことができます。この配列に含まれる内容はプラットフォームにより異なります:

* Windowsでは、各プリンターに関して、ネットワーク・ロケーション(または、ローカル・ポート) が代入されます。
* macOSでは、各プリンターに関して、ユーザーが変更することのできるカスタム名称が代入されます。例えば、ダイアログボックスの中でこの名前を使用することができます。

オプション引数*modelsArray* を渡した場合、各プリンターのモデルを取得できます。

4Dで選択されたプリンターの変更や取得を行うには、[SET CURRENT PRINTER](../commands/set-current-printer) および [Get current printer](../commands/get-current-printer) コマンドを使用します。最初の配列 (*namesArray* ) に返された名前を渡さなければなりません。

Windows上では、プリンター名はOSレベルで手動にて変更することができます。一方、プリンターの場所とモデルタイプは、その物理的特性に関連しています。したがって、オプションの配列に返された値を使用して、選択したプリンターの特性を調べることができます。特に、クライアントマシンがすべて同じプリンターを使用していることをチェックすることができます。

macOS上では、プリンター名 (プリンターサーバーの名前) を使用して、このチェックを行います。このプリンター名は、接続している各マシンに対して同じ名前になります。

## システム変数およびセット 

コマンドが正しく実行されるとシステム変数OKに1が設定され、そうでなければ0が設定され、空の配列が返されます。

## 参照 

[Get current printer](../commands/get-current-printer)  
[SET CURRENT PRINTER](../commands/set-current-printer)  

## プロパティ

|  |  |
| --- | --- |
| コマンド番号 | 789 |
| スレッドセーフである | no |
| システム変数を更新する | OK |


