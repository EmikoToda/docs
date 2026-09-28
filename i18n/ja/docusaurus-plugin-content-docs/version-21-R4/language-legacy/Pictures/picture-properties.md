---
id: picture-properties
title: PICTURE PROPERTIES
slug: /commands/picture-properties
displayed_sidebar: docs
---

<!--REF #_command_.PICTURE PROPERTIES.Syntax-->**PICTURE PROPERTIES** ( *picture* : Picture ; *width* : Real ; *height* : Real {; *hOffset* : Integer {; *vOffset* : Integer {; *mode* : Integer}}} )<!-- END REF-->
<!--REF #_command_.PICTURE PROPERTIES.Params-->
<div class="no-index">

| 引数 | 型 |  | 説明 |
| --- | --- | --- | --- |
| picture | Picture | &#8594; | 情報を取得するピクチャー |
| width | Real | &#8592; | ピクチャーの幅 (ピクセル) |
| height | Real | &#8592; | ピクチャーの高さ (ピクセル) |
| hOffset | Integer | &#8592; | バックグランド表示の時の水平方向のオフセット |
| vOffset | Integer | &#8592; | バックグランド表示の時の垂直方向のオフセット |
| mode | Integer | &#8592; | バックグランド表示の時の転送モード |
</div>
<!-- END REF-->

<div class="no-index">
<details><summary>履歴</summary>

|リリース|内容|
|---|---|
|18|変更|
|6|初出|

</details>
</div>

## 説明 

<!--REF #_command_.PICTURE PROPERTIES.Summary-->PICTURE PROPERTIES コマンドは、*picture*に渡したピクチャーに関する情報を返します。<!-- END REF-->

引数*width*と*height*には、ピクチャーの幅と高さを返します。

オプション引数*hOffset*、*vOffset*、*mode*には、フォーム上でバックグラウンド 表示フォーマットで表示された際のピクチャーの水平、垂直位置と転送モードを返します。

## 参照 

[Picture size](../commands/picture-size)  

## プロパティ

|  |  |
| --- | --- |
| コマンド番号 | 457 |
| スレッドセーフである | yes |


