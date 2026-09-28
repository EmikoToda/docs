---
id: qr-get-header-and-footer
title: QR GET HEADER AND FOOTER
slug: /commands/qr-get-header-and-footer
displayed_sidebar: docs
---

<!--REF #_command_.QR GET HEADER AND FOOTER.Syntax-->**QR GET HEADER AND FOOTER** ( *area* ; *selector* ; *leftTitle* ; *centerTitle* ; *rightTitle* ; *height* {; *picture* {; *pictAlignment*}} )<!-- END REF-->
<!--REF #_command_.QR GET HEADER AND FOOTER.Params-->
<div class="no-index">

| 引数 | 型 |  | 説明 |
| --- | --- | --- | --- |
| area | Integer | &#8594;  | エリア参照 |
| selector | Integer | &#8594;  | 1 = ヘッダー, 2 = フッター |
| leftTitle | Text | &#8592; | 左側に表示されるテキスト |
| centerTitle | Text | &#8592; | 中央に表示されるテキスト |
| rightTitle | Text | &#8592; | 右側に表示されるテキスト |
| height | Integer | &#8592; | ヘッダーまたはフッターの高さ |
| picture | Picture | &#8592; | 表示するピクチャー |
| pictAlignment | Integer | &#8592; | ピクチャーの整列属性 |
</div>
<!-- END REF-->

<div class="no-index">
<details><summary>履歴</summary>

|リリース|内容|
|---|---|
|2003|初出|

</details>
</div>

## 説明 

<!--REF #_command_.QR GET HEADER AND FOOTER.Summary-->QR GET HEADER AND FOOTER コマンドを使用し、ヘッダーまたはフッターの内容とサイズを取得できます。<!-- END REF-->

*selector* を使用して、ヘッダーまたはフッターを選択します:

* *selector*に1を指定すると、ヘッダー情報を取得できます。
* *selector*に2を指定すると、フッター情報を取得できます。

*leftTitle*, *centerTitle* そして *rightTitle*にはそれぞれ左側、中央、右側にあるヘッダーまたはフッターの値が返されます。

*height*には、そのレポートに対して選択された単位で表わされたヘッダーまたはフッターの高さが返されます。

*picture*には、ヘッダーまたはフッターに表示されるピクチャーが返されます。

*pictAlignment*には、ヘッダーまたはフッターに表示されるピクチャーの整列属性が返されます。

* *pictAlignment*が1の場合、そのピクチャーは左揃えです。
* *pictAlignment*が2の場合、そのピクチャーは中央揃えです。
* *pictAlignment*が3の場合、そのピクチャーは右揃えです。

無効な*area*番号を渡した場合、エラー番号-9850が生成されます。  
無効な*selector*引数を渡した場合、エラー番号-9852が生成されます。

## 例題 

次のコードは、ヘッダータイトルの値とヘッダーサイズを取得し、それを警告として表示します:

```4d
 QR GET HEADER AND FOOTER(MyArea;1;$LeftText;$CenterText;$RightText;$height)
 Case of
    :($LeftText #"")
       ALERT("The left title is "+Char(34)+$LeftText+Char(34))
    :($CenterText #"")
       ALERT("The center title is "+Char(34)+$CenterText+Char(34))
    :($RightText #"")
       ALERT("The right title is "+Char(34)+$RightText+Char(34))
    Else
       ALERT("No header title in this report.")
 End case
 ALERT("The height of the header is "+String($height))
```

## 参照 

[QR SET HEADER AND FOOTER](qr-set-header-and-footer.md)  

## プロパティ

|  |  |
| --- | --- |
| コマンド番号 | 775 |
| スレッドセーフである | no |
| システム変数を更新する | error |


