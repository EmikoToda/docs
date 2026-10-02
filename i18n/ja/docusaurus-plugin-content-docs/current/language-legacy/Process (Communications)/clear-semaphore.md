---
id: clear-semaphore
title: CLEAR SEMAPHORE
slug: /commands/clear-semaphore
displayed_sidebar: docs
---

<!--REF #_command_.CLEAR SEMAPHORE.Syntax-->**CLEAR SEMAPHORE** ( *semaphore* : Text )<!-- END REF-->
<!--REF #_command_.CLEAR SEMAPHORE.Params-->
<div class="no-index">

| 引数 | 型 |  | 説明 |
| --- | --- | --- | --- |
| semaphore | Text | &#8594; | クリアするセマフォー |
</div>
<!-- END REF-->

## 説明 

<!--REF #_command_.CLEAR SEMAPHORE.Summary-->CLEAR SEMAPHOREは、[Semaphore](semaphore.md "Semaphore")コマンドで設定された*semaphore*を消去します。<!-- END REF-->

ルールとして、作成されたすべてのセマフォーは消去するべきです。セマフォーが消去されない場合、セマフォーを作成したプロセスが終了するまで、作成されたセマフォーはメモリ上に残ります。プロセスは自身が作成したセマフォーしか消去することはできません。セマフォーを作成していないプロセス内からセマフォーを消去しようとしても、何も行いません。

## 例題 

[Semaphore](semaphore.md "Semaphore")の例題参照

## 参照 

[Semaphore](../commands/semaphore)  
[Test semaphore](../commands/test-semaphore)  
*セマフォーとシグナル*  

## プロパティ

|  |  |
| --- | --- |
| コマンド番号 | 144 |
| スレッドセーフである | yes |


