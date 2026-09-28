---
id: semaphore
title: Semaphore
slug: /commands/semaphore
displayed_sidebar: docs
---

<!--REF #_command_.Semaphore.Syntax-->**Semaphore** ( *semaphore* : Text {; *tickCount* : Integer} ) : Boolean<!-- END REF-->
<!--REF #_command_.Semaphore.Params-->
<div class="no-index">

| 引数 | 型 |  | 説明 |
| --- | --- | --- | --- |
| semaphore | Text | &#8594; | テストと設定を行うセマフォー |
| tickCount | Integer | &#8594; | 最大待ち時間 |
| 戻り値 | Boolean | &#8592; | FALSE: セマフォーの設定に成功した TRUE: 既にセマフォーが存在する |
</div>
<!-- END REF-->

<div class="no-index">
<details><summary>履歴</summary>

|リリース|内容|
|---|---|
|11 SQL|変更|
|<6|初出|

</details>
</div>

## 説明 

<!--REF #_command_.Semaphore.Summary-->セマフォーは、ワークステーション間、または同一ワークステーション上のプロセス間で共有されるフラグです。<!-- END REF-->セマフォーは、単に存在したり存在しなかったりするだけです。各ユーザーが実行して いるメソッドでセマフォーの存在を調べることができます。セマフォーは、クライアントのワークステーション、あるいはそれを作成したプロセスからのみ削除する事ができます。セマフォーを作成する、またはその存在の有無を調べることにより、ワークステーション間でのメソッドの通信が可能になります。セマフォーはレコードのアクセスの保護目的には使用しません。これは4Dと4D Serverが自動的に行います。セマフォーは、複数のユーザーが同じ処理を同時に実行するのを防ぐために用います。

**Semaphore** 関数はすでにセマフォーが存在する場合TRUEを返し、何も行いません。セマフォーが存在しない場合、**Semaphore** はセマフォーを作成しFALSEを返します。同時に1人のユーザーしかセマフォーを作成することはできません。**Semaphore**がFALSEを返すということは、セマフォーが存在しなかったことを意味すると同時に、コマンド呼び出したプロセスに対して新たにセマフォー設定されたことを意味します。

**Semaphore**は、セマフォーが設定されていなければFALSEを返します。またコマンドを呼び出したプロセスが既にそのセマフォーを設定している場合もFALSEを返します。

セマフォーは先頭の$を含めて255文字以内に制限されています。これより長い文字列を指定すると、切り捨てられた文字列を使ってセマフォーがテストされます。4Dではセマフォー名は大文字/小文字を区別するという事に注意して下さい(例えば、プログラムは"MySemaphore" と "mysemaphore"は異なるものであると認識します)。

オプションの引数*tickCount* は、*semaphore* が既にセットされている時の待ち時間 (tick) を設定します。  
この場合、関数はセマフォーが解放されるか、またはTRUEを返す前に待ち時間が終了まで待ちます。

4Dには2種類のセマフォー、ローカルセマフォーとグローバルセマフォーがあります。

* ローカルセマフォーは、同じワークステーショ ン上のすべてのプロセスからアクセスすることができます (同一ワークステーション上に限られます) 。ローカルセマフォーは、セマフォー名の先頭にドル記号 ($) を付けて作成します。ローカルセマフォーは、同一ワークステーション上で実行しているプロセス間で処理を監視する際に使用します。例えばローカルセマフォーを 使用して、シングルユーザーデータベースやワークステーション上のすべてのプロセスで共用するインタープロセス配列へのアクセスを監視します。
* グローバルセマフォーは、すべてのユーザーとそのプロセスからアクセスすることができます。グローバルセマフォーはマルチユーザーデータベースのユーザー間で処理を監視するために用います。

グローバルセマフォーとローカルセマフォーは理論的には同じものです。違いはその有効範囲にあります。

クライアント/サーバーモードでは、グローバルセマフォーはすべてのクライアントおよびサーバーで実行しているすべてのプロセス間で共用されます。ローカルセマフォーは、それが作成されたマシン上で実行しているプロセス間でのみ共用されます。

スタンドアロンモードの4Dでは、ユーザーは一人だけなため、グローバルセマフォーもローカルセマフォーもその有効範囲は同じです。ただし、シングルとマルチの両方の形でデータベースを使用する場合は、用途によってグローバルセマフォーとローカルセマフォーを使い分けてください。

**注:** インターフェースやインタープロセス変数など、クライアントアプリケーションのローカルな状態を管理するためにセマフォーを使用する場合、ローカルセマフォー を利用することをお勧めします。このようなケースでグローバルセマフォーを使用すると、不必要なネットーワークアクセスが行われるだけでなく、不必要に他の クライアントに影響を与えてしまいます。ローカルセマフォーを使用すればこのような望ましくない副作用を避けることができます。

## 例題 1 

セマフォーを使用した典型的なコードを考えてみます:

```4d
 While(Semaphore("MySemaphore";300))
    IDLE
 End while
  // セマフォで保護されたコードをここに記載
 CLEAR SEMAPHORE("MySemaphore")
```

## 例題 2 

以下の例では、2人のユーザーがProducts テーブルの価格を更新するのを防ぎます。以下のメソッドではセマフォーを用いて、これを実現しています:

```4d
 If(Semaphore("UpdatePrices")) // セマフォの作成を試行
    ALERT("Another user is already updating prices. Retry later.")
 Else
    DoUpdatePrices // 料金の更新
    CLEAR SEMAPHORE("UpdatePrices")) // セマフォをクリア
 End if
```

## 例題 3 

以下の例はローカルセマフォーを使用します。複数のプロセスを持つデータベースで、To Doリストを管理する必要があるとします。このリストはテーブルではなく、インタープロセス配列で管理します。セマフォーを使って同時にアクセスされるのを防ぎます。このような場合に、To Doリストは自分だけのものなため、ローカルセマフォーで十分です。

インタープロセス配列はOn Startup データベースメソッドで初期化します:

```4d
 ARRAY TEXT(<>ToDoList;0) // The To Do list is initially empty
```

To Doリストに項目を追加するメソッドを次に示します:

```4d
  // ADD TO DO LIST project method
  // ADD TO DO LIST ( Text )
  // ADD TO DO LIST ( To do list item )
 #DECLARE($item : Text)
 If(Not(Semaphore("$AccessToDoList";300)))
  // Wait 5 seconds if the semaphore already exists
    $vlElem:=Size of array(<>ToDoList)+1
    INSERT IN ARAY(<>ToDoList;$vlElem)
    <>ToDoList{$vlElem}:=$item
    CLEAR SEMAPHORE("$AccessToDoList") // Clear the semaphore
 End if
```

どのプロセスからも上記メソッドを呼び出せます。

## 例題 4 

以下のメソッドは、セマフォーが存在する場合コードを実行せず、呼び出し元メソッドにエラーコードとテキストメッセージを返します。

シンタックス:   

```4d
 $L_Error:=Semaphore_proof(->$T_Text_error)
```

```4d
  // セマフォーを使用した保護構造
 #DECLARE($errorPtr : Pointer) -> $result : Integer
 var $L_MyError : Integer
  // エラーメッセージ


var $T_Sema_local;$T_Message : Text
 
  // メソッド開始
 $L_MyError:=0
 $T_Sema_local:="$tictac"
 
 If(Semaphore($T_Sema_local;300))
  // 300 tickの待ち時間の間に、同じセマフォを作成したプロセスがWe expected 300 ticks but the semaphore
  // そのセマフォを解放しなかった場合、ここで停止する
    $L_MyError:=-1
 
 Else
 
  // このメソッドは同時に複数プロセスで実行されることがない
 
  // このプロセスでセマフォーを設定したので、
  // このプロセスで必ずセマフォーを解放しなければならない
 
  // 処理を行う
    ...
  // セマフォーを解放する
    CLEAR SEMAPHORE($T_Sema_local)
 End if
 
 If($L_MyError=-1)
    $T_Message:="セマフォー "+$T_Sema_local+" が既に設定されていたためコードは実行されませんでした。"
 Else
    $T_Message:="OK"
 End if
 
 $result:=$L_MyError
 $errorPtr->:=$T_Message  // 呼び出し元メソッドはエラーコードとメッセージテキストを受け取る


```

## 参照 

[CLEAR SEMAPHORE](../commands/clear-semaphore)  
[Test semaphore](../commands/test-semaphore)  
*セマフォーとシグナル*  

## プロパティ

|  |  |
| --- | --- |
| コマンド番号 | 143 |
| スレッドセーフである | yes |


