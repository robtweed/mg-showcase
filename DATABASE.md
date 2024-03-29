# Quick Guide to Examining the Contents of your Database

## Understanding the Basics of Global Storage Databases

Before continuing with this document, it's a good idea to familiarise yourself with the basic concepts behind
Global Storage Databases.  
[Read our summary explanation](https://github.com/robtweed/global_storage/blob/master/Global_Storage.md)


## Examining your Database Contents

There are essentially two ways in which you can examine the contents of the database that you're using with your Container:

- using some basic tools written using JavaScript and our *mg-dbx-napi* interface

- using the database's built-in tools that are written in its native language

## What you'll want to know

You'll usually want to be able to view:

- the so-called Directory Listing: a list of the names of the Global Storage Documents in your database

- the contents of an individual named Global Storage Document, either in full or limited to one or more selected subscripts.

## Using our JavaScript-based Tools

### Directory Listing

To get a list of the Global Storage Documents that exist in your database:

- make sure you're in the Container's default directory:

  - YottaDB Container: /opt/mgateway
  - IRIS Containers: /home/irisowner

- Then run the command:

```console
./gd
```

It's named this as it's short for Global Directory.

If you've been running the basic benchmarking demonstration, you should see:

  - YottaDB Container:

        root@c353f95cfb7a:/opt/mgateway# ./gd
        *** Global Directory ***
        ------------------------
        ^ydbtest
        ------------------------


  - IRIS Container:

        irisowner@0190429c1c41:~$ ./gd
        *** Global Directory ***
        ------------------------
        ^%cspSession
        ^%qHTMLElementD
        ^%qJavaMetaDictionary
        ... etc

        ^iristest
        ... etc
        ------------------------


Why the difference?

The Yottadb database will only contain the Global Storage Documents that you've created in the single database directory that has been configured for use in our YottaDB *mg-showcase* Container.

IRIS databases work slightly differently: they have a number of *namespaces*, each of which can contain one or more Global Storage Documents.  The IRIS *mg-showcase* Container makes use of a standard, pre-existing namespace named *USER* that you'll usually find in all IRIS databases.  The IRIS Community Edition that we use as the basis for our Container comes pre-populated with a number of other Global Storage Documents in the *USER* namespace, and these are what you're seeing when you run the *./gd* command.  You can safely ignore them and leave them alone. However, you should see the *^iristest* Document in the list: this was created when you ran the Benchmark demo.

---

### Viewing an Individual Global Storage Document

To view the structure and contents of an individual Global Storage Document:

- make sure you're in the Container's default directory:

  - YottaDB Container: /opt/mgateway
  - IRIS Containers: /home/irisowner

- Then run the command:

        ./g {name}

        where {name} is the name of the Global Storage Document you want to view

#### Example:

If you've previously run the basic benchmark demonstration, you probably specified a very large number of key/value pairs.  If you try listing the Global Document it created using *./g*, it will go on forever!  So let's first fix that.

Rerun the benchmark demo, but this time specify a very small number of key/value pairs, eg:

        $ node bm_mgdbxnapi.mjs 10

        mg-dbx-napi performance test
        Insert and read back 10 key/value pairs
        Global name used is ^iristest
        Please wait...
        -----
        finished 10 inserts in 0 seconds
        rate: 10,000 /sec
        ------
        finished 10 gets in 0 seconds
        rate: 8 /sec

Now try listing the Global Document:

- YottaDB Container:

        ./g ydbtest

        ^ydbtest[ 1 ] = "hello world"
                  2 ] = "hello world"
                  3 ] = "hello world"
                  4 ] = "hello world"
                  5 ] = "hello world"
                  6 ] = "hello world"
                  7 ] = "hello world"
                  8 ] = "hello world"
                  9 ] = "hello world"


- IRIS Container:

        ./g iristest

        ^iristest[ 1 ] = "hello world"
                   2 ] = "hello world"
                   3 ] = "hello world"
                   4 ] = "hello world"
                   5 ] = "hello world"
                   6 ] = "hello world"
                   7 ] = "hello world"
                   8 ] = "hello world"
                   9 ] = "hello world"



So in both cases, you're seeing the raw structure and contents of the specified Global Storage Document.  As you can see, each record represents an individual key/value pair, with a numeric key and a value of *hello world*.

You'll see in later documents how you can use the *./g* command to drill down into more complex Global Documents that have multiple keys.

----

## Using the Database's Built-in Tools

Global Storage Databases are somewhat unusual in that they include a built-in language that can be used to maintain the database and can be used to write applications.

When you're using our interfaces and tools with JavaScript, you're **not** using that built-in language.  However, if you're already a user of YottaDB or IRIS then you'll probably be familiar with the built-in language.  If not, you can ignore this section if you wish!

The built-in language is known as *M* on YottaDB and is usually referred to as *ObjectScript* on IRIS.  ObjectScript is essentially an extended superset of the M language.

In a manner similar to using the Node.js REPL, you can start an interactive shell on both databases from within which you can directly execute M or ObjectScript Commands.  In this document we'll look at just two such commands: actually they are utilities rather than commands.  There's some differences between the corresponding utilities on each database, so we'll now look at them for each database in turn.

### YottaDB

First you need to start the interactive shell.

- make sure you're in the Container's default directory: /opt/mgateway

- now type the command:

```console
./ydb
```

  You should see:

        YDB>

  You can now type M commands or run any of YottaDB's built-in M utilities.

  Note: You can exit this shell at any time by typing **H** followed by the *Enter* key.  You'll be returned to the Linux prompt.


#### Global Directory List

To list all Global Documents in the database, at the *YDB>* prompt, type:

```console
d ^%GD
```

You should see:

        Global Directory

        Global ^

Type an asterisk (*) followed by the *Enter* key and you should see a list of all the Global Documents, eg:

        ^ydbtest
        Total of 1 global.

        Global ^

To exit the utility, just hit the *Enter* key and you'' return to the *YDB>* prompt.


#### Listing an Individual Global Document

The simplest way to list an individual YottaDB Global Document is to use the *zwr* command:

At the *YDB>* prompt, type:

```console
zwr ^ydbtest
```

Note that you need to add the *caret* (^) symbol before the name, eg:

        YDB>zwr ^ydbtest
        ^ydbtest(1)="hello world"
        ^ydbtest(2)="hello world"
        ^ydbtest(3)="hello world"
        ^ydbtest(4)="hello world"
        ^ydbtest(5)="hello world"
        ^ydbtest(6)="hello world"
        ^ydbtest(7)="hello world"
        ^ydbtest(8)="hello world"
        ^ydbtest(9)="hello world"

        YDB>

You'll be returned to the *YDB>* prompt at the end of the listing.

Once again, though displayed in a slightly different format, you'll see the structure and contents of this Global Document which, as we saw before, is a simple key/value pair structure with a numeric key and a value of *hello world*.

----

### IRIS

First you need to start the interactive shell.  You can start this from any directory in the Container.

- Type the command:

```console
iris terminal IRIS
```

  You should see:

        USER>

This is because by default you'll shell into the *USER* namespace.

  You can now type ObjectScript commands or run any of IRIS's built-in ObjectScript utilities.

  Note: You can exit this shell at any time by typing **H** followed by the *Enter* key.  You'll be returned to the Linux prompt.


#### Global Directory List

To list all Global Documents in the database, at the *YDB>* prompt, type:

```console
d ^%GD
```

You'll see the following prompts.  Just hit the *Enter* key to accept the default for each one:

        Which globals? * =>
        Include system globals? No =>
        Show global mappings? No =>
        Device:
        Right margin: 80 =>

You should then see a Global Directory Listing similar to the following:

                                Global Directory Display of USER
                                      6:23 PM  Mar 14 2024
        %zmgsi              DeepSee.Cubes       DeepSee.FolderD     DeepSee.FolderI
        DeepSee.FolderItemD DeepSee.FolderItemI DeepSee.UserPreferences
        Ens.Config          Ens.Config.SearchTablePropC
        Ens.Config.SearchTablePropD             Ens.Config.SearchTablePropI
        Ens.Configuration   Ens.Mirror          EnsEDI.Description  EnsEDI.Schema
        EnsEDI.X12.Description                  EnsEDI.X12.Schema   intest
        iristest

        19 globals listed

After the listing you'll be returned to the *USER>* prompt.


#### Listing an Individual Global Document

The simplest way to list an individual YottaDB Global Document is to use the *zw* command:

At the *USER>* prompt, type:

```console
zw ^iristest
```

Note that you need to add the *caret* (^) symbol before the name.  You should see something like:

        ^iristest(1)="hello world"
        ^iristest(2)="hello world"
        ^iristest(3)="hello world"
        ^iristest(4)="hello world"
        ^iristest(5)="hello world"
        ^iristest(6)="hello world"
        ^iristest(7)="hello world"
        ^iristest(8)="hello world"
        ^iristest(9)="hello world"

You'll be returned to the *USER>* prompt at the end of the listing.

Once again, though displayed in a slightly different format, you'll see the structure and contents of this Global Document which, as we saw before, is a simple key/value pair structure with a numeric key and a value of *hello world*.

