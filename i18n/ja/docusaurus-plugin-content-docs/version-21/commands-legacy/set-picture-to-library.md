---
id: set-picture-to-library
title: SET PICTURE TO LIBRARY
slug: /commands/set-picture-to-library
displayed_sidebar: docs
---

<!--REF #_command_.SET PICTURE TO LIBRARY.Syntax-->**SET PICTURE TO LIBRARY** ( *picture* ; *picRef* ; *picName* )<!-- END REF-->
<!--REF #_command_.SET PICTURE TO LIBRARY.Params-->
<div class="no-index">

| 引数 | 型 |  | 説明 |
| --- | --- | --- | --- |
| picture | Picture | &#8594;  | 新しいピクチャー |
| picRef | Integer | &#8594;  | ピクチャーライブラリ画像の参照番号 |
| picName | Text | &#8594;  | ピクチャーの新しい名前 |
</div>
<!-- END REF-->

<div class="no-index">
<details><summary>履歴</summary>

|リリース|内容|
|---|---|
|6|初出|

</details>
</div>

## 説明 

:::警告

このコマンドはプロジェクトモードでは使用できません。ピクチャーライブラリはバイナリーデータベースでのみ利用可能だからです。

:::

<!--REF #_command_.SET PICTURE TO LIBRARY.Summary-->SET PICTURE TO LIBRARY コマンドは、新規ピクチャーを作成、またはピクチャーライブラリにあるピクチャーを置き換えます。<!-- END REF-->

このコマンドを呼び出す前に、下記の引数を渡してください:

* *picRef*にピクチャー参照番号（1～32767の範囲）
* *picture*にピクチャー自身
* *picName*にピクチャーの名前（最大255文字）

同じ参照番号を持つ既存のピクチャーライブラリのピクチャーがある場合、そのピクチャーの内容は置き換えられ、引数*picture*と*picName*に渡された値でピクチャーと名前が変更されます。

*picRef*に渡された参照番号を持つピクチャーライブラリのピクチャーがない場合、新規ピクチャーがピクチャーライブラリに追加されます。

**4D Server:** SET PICTURE TO LIBRARYコマンドはサーバーマシン上で実行される (ストアドプロシージャーやトリガー) メソッドの中から使用することはできません。SET PICTURE TO LIBRARYコマンドをサーバーマシン上で呼び出しても、無視され、何も行われません。

**警告:** デザインオブジェクト (階層リスト項目、メニュー項目等) は、ピクチャーライブラリのピクチャーを参照することができます。プログラムによってピクチャーライブラリのピクチャーを修正する際は、注意する必要があります。

**Note:** *picture*に空のピクチャーを渡すか、*picRef*に負数またはヌル値を渡すと、コマンドは何も行いません。

## 例題 1 

以下の例は、ピクチャーライブラリの現在の内容に関わらず、最初にユニークなピクチャー参照番号を探すことによってピクチャーライブラリに新規ピクチャーを追加します:

```4d
 PICTURE LIBRARY LIST($alPicRef;$asPicNames)
 Repeat
    $vlPicRef:=1+Abs(Random)
 Until(Find in array($alPicRef;$vlPicRef)<0)
 SET PICTURE TO LIBRARY(vgPicture;$vlPicRef;"New Picture")
```

## 例題 2 

以下の例は、[PICTURE LIBRARY LIST](picture-library-list.md "PICTURE LIBRARY LIST")の3番目の例題で作成した、ディスク上のドキュメントに格納されたピクチャーをピクチャーライブラリの中に読み込みます:

```4d
 SET CHANNEL(10;"")
 If(OK=1)
    RECEIVE VARIABLE($vsTag)
    If($vsTag="4DV6PICTURELIBRARYEXPORT")
       RECEIVE VARIABLE($vlNbPictures)
       If($vlNbPictures>0)
          For($vlPicture;1;$vlNbPictures)
             RECEIVE VARIABLE($vlPicRef)
             If(OK=1)
                RECEIVE VARIABLE($vsPicName)
             End if
             If(OK=1)
                RECEIVE VARIABLE($vgPicture)
             End if
             If(OK=1)
                SET PICTURE TO LIBRARY($vgPicture;$vlPicRef;$vsPicName)
             Else
                $vlPicture:=$vlNbPictures+1
                ALERT("This file looks like being damaged.")
             End if
          End for
       Else
          ALERT("This file looks like being damaged.")
       End if
    Else
       ALERT("The file “"+Document+"” is not a Picture Library export file.")
    End if
    SET CHANNEL(11)
    End
```

## エラー管理 

ピクチャーライブラリにピクチャーを追加するための十分なメモリがない場合、エラーコード-108が生成されます。また、I/Oエラーが返される（例えば、ストラクチャーファイルがロックされている等）点にも注意してください。エラー処理メソッドを使って、このエラーを受け取ることができます。

## 参照 

[GET PICTURE FROM LIBRARY](get-picture-from-library.md)  
[PICTURE LIBRARY LIST](picture-library-list.md)  
[REMOVE PICTURE FROM LIBRARY](remove-picture-from-library.md)  

## プロパティ

|  |  |
| --- | --- |
| コマンド番号 | 566 |
| スレッドセーフである | no |
| システム変数を更新する | error |
| サーバー上での使用は不可 ||


