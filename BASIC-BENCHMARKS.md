# Basic Performance Benchmarking Demonstrations

Our extensive experience at MGateway Ltd has proven to us that [Global Storage Databases](https://github.com/robtweed/global_storage) are the fastest databases technologies available today.

We're keen to allow others to experience this performance for themselves, which is one of the reasons we've created this repository: making it quick and easy for you to try out these database technologies which many/most of you will have never even heard of!

# Simple Key/Value Storage Benchmark Demonstration

Let's start with a very simple and basic test: we're going to create a set of simple persistent key/value pairs of the form:

        keyvalue[n] = 'hello world'

        where n is an integer starting from 1

We'll run a simple JavaScript loop and, by default, we'll create 10 million such key/value pair records in the database and time how long it takes to create them.

We'll then run the loop again and time how long it takes to read back the key/value pairs from the database.

The benchmark demonstration uses our ultra-high performance [*mg-dbx-napi*](https://github.com/chrisemunt/mg-dbx-napi) JavaScript interface.

You'll also be able to test for any performance differences between Node.js and Bun.js, running the exact same script.

# Examining the Source Code

All three of our *mg-showcase* Containers includes a version of this benchmark demonstration.  You'll find the source file as follows:

- YottaDB Container:  /opt/mgateway/bm_mgdbxnapi.mjs
- IRIS Containers: /home/irisowner/bm_mgdbxnapi.mjs


Feel free to examine its source code to see how the benchmark works.  

Consult the
[*mg-dbx-napi*](https://github.com/chrisemunt/mg-dbx-napi?tab=readme-ov-file#connecting-to-the-database) documentation which explains the syntax used for creating and reading 
Global Storage key/value pairs via the *mg-dbx-napi* interface.


# Running the Benchmark Demonstration

- [Start your *mg-showcase* Container](https://github.com/robtweed/mg-showcase/blob/master/CONTAINER.md#startingrunning-the-containers) if it isn't already running
- [Shell into the Container](https://github.com/robtweed/mg-showcase/blob/master/CONTAINER.md#shelling-into-the-containers) from another process.  You should be in the default directory:

  - YottaDB Container: /opt/mgateway
  - IRIS Containers: /home/irisowner


- Now run the benchmark demonstration script.  We'll start by creating just 1000 key/value pairs:

  - Node.js:

        node bm_mgdbxnapi.mjs 1000

  - Bun.js:

        bun bm_mgdbxnapi.mjs 1000


## Example Results

### YottaDB Container

- Processor: X64 - Intel(R) Celeron(R) 2955U @ 1.40GHz with 2 Cores

  - Node.js

        root@c353f95cfb7a:/opt/mgateway# node bm_mgdbxnapi.mjs 1000
        mg-dbx-napi performance test
        Insert and read back 1000 key/value pairs
        Global name used is ^ydbtest
        Please wait...
        -----
        finished 1000 inserts in 0 seconds
        rate: 52,631 /sec
        ------
        finished 1000 gets in 0 seconds
        rate: 125,000 /sec

  - Bun.js

        root@c353f95cfb7a:/opt/mgateway# bun bm_mgdbxnapi.mjs 1000
        mg-dbx-napi performance test
        Insert and read back 1000 key/value pairs
        Global name used is ^ydbtest
        Please wait...
        -----
        finished 1000 inserts in 0 seconds
        rate: 50,000 /sec
        ------
        finished 1000 gets in 0 seconds
        rate: 166,666 /sec

- Processor: ARM64 - Standard M1 Apple Mac Mini with 8 CPU cores

  - Node.js

        root@fa5bdd7f4f7e:/opt/mgateway# node bm_mgdbxnapi.mjs 1000
        mg-dbx-napi performance test
        Insert and read back 1000 key/value pairs
        Global name used is ^ydbtest
        Please wait...
        -----
        finished 1000 inserts in 0 seconds
        rate: 142,857 /sec
        ------
        finished 1000 gets in 0 seconds
        rate: 500,000 /sec


  - Bun.js

        root@fa5bdd7f4f7e:/opt/mgateway# bun bm_mgdbxnapi.mjs 1000
        mg-dbx-napi performance test
        Insert and read back 1000 key/value pairs
        Global name used is ^ydbtest
        Please wait...
        -----
        finished 1000 inserts in 0 seconds
        rate: 250,000 /sec
        ------
        finished 1000 gets in 0 seconds
        rate: 500,000 /sec


### IRIS Container

- Processor: X64 - Intel(R) Celeron(R) 2955U @ 1.40GHz with 2 Cores

  - Node.js

        irisowner@c49319fa143f:~$ node bm_mgdbxnapi.mjs 1000
        mg-dbx-napi performance test
        Insert and read back 1000 key/value pairs
        Global name used is ^iristest
        Please wait...
        -----
        finished 1000 inserts in 0 seconds
        rate: 38,461 /sec
        ------
        finished 1000 gets in 0 seconds
        rate: 142,857 /sec

  - Bun.js

        irisowner@c49319fa143f:~$ bun bm_mgdbxnapi.mjs 1000
        mg-dbx-napi performance test
        Insert and read back 1000 key/value pairs
        Global name used is ^iristest
        Please wait...
        -----
        finished 1000 inserts in 0 seconds
        rate: 58,823 /sec
        ------
        finished 1000 gets in 0 seconds
        rate: 166,666 /sec

- Processor: ARM64 - Standard M1 Apple Mac Mini with 8 CPU cores

  - Node.js

        irisowner@57adf75db712:~$ node bm_mgdbxnapi.mjs 1000
        mg-dbx-napi performance test
        Insert and read back 1000 key/value pairs
        Global name used is ^iristest
        Please wait...
        -----
        finished 1000 inserts in 0 seconds
        rate: 142,857 /sec
        ------
        finished 1000 gets in 0 seconds
        rate: 500,000 /sec


  - Bun.js

        irisowner@57adf75db712:~$ bun bm_mgdbxnapi.mjs 1000
        mg-dbx-napi performance test
        Insert and read back 1000 key/value pairs
        Global name used is ^iristest
        Please wait...
        -----
        finished 1000 inserts in 0 seconds
        rate: 333,333 /sec
        ------
        finished 1000 gets in 0 seconds
        rate: 1,000,000 /sec


## Things to Notice

Let's summarise these results in two tables:


|       X64    | YottaDB  | IRIS   |
|--------------|----------|--------|
|Node.js Write |52,631    |38,461  |
|Bun.js  Write |50,000    |58,823  |
|--------------|----------|--------|
|Node.js Read  |125,000   |142,857 |
|Bun.js  Read  |166,666   |166,666 |



|     ARM64    | YottaDB  | IRIS    |
|--------------|----------|---------|
|Node.js Write |142,857   |142,857  |
|Bun.js  Write |250,000   |333,000  |
|--------------|----------|---------|
|Node.js Read  |500,000   |500,000  |
|Bun.js  Read  |500,000   |1,000,000|


Although we've only created a relatively small number of key/value pairs in this initial benchmark test, we can already see a number of interesting patterns emerging:

- Clearly the X64 machine used here is, not surprisingly a lot slower than the M1 Mac Mini, but you can see that regardless of Operating System and database, everything else works identically.  The only difference is that for clarity, the Global or Document Name we've used for each database is different:

  - YottaDB: ydbtest
  - IRIS: iristest

- Generally, Bun.js appears to provide better performance, except when writing key/value pairs to YottaDB on the X64 machine.

- YottaDB appears to outperform IRIS when writing key/value pairs on the X64 machine, but for this test there's otherwise not much between them.

- IRIS read and write performance on the M1 Mac is impressively high when using Bun.js

Next we'll increase the number of key/value pairs generated and read and see if these patterns persist.

----

# Running the Benchmark With More Key/Value Pairs


- Re-run the benchmark demonstration script, but this time specifying 1,000,000 key/value pairs:

  - Node.js:

        node bm_mgdbxnapi.mjs 1000000

  - Bun.js:

        bun bm_mgdbxnapi.mjs 1000000

## Example Results

### YottaDB Container

- Processor: X64 - Intel(R) Celeron(R) 2955U @ 1.40GHz with 2 Cores

  - Node.js

        root@c353f95cfb7a:/opt/mgateway# node bm_mgdbxnapi.mjs 1000000
        mg-dbx-napi performance test
        Insert and read back 1000000 key/value pairs
        Global name used is ^ydbtest
        Please wait...
        -----
        finished 1000000 inserts in 3 seconds
        rate: 251,319 /sec
        ------
        finished 1000000 gets in 2 seconds
        rate: 417,536 /sec

  - Bun.js

        root@c353f95cfb7a:/opt/mgateway# bun bm_mgdbxnapi.mjs 1000000
        mg-dbx-napi performance test
        Insert and read back 1000000 key/value pairs
        Global name used is ^ydbtest
        Please wait...
        -----
        finished 1000000 inserts in 3 seconds
        rate: 262,950 /sec
        ------
        finished 1000000 gets in 2 seconds
        rate: 423,011 /sec

- Processor: ARM64 - Standard M1 Apple Mac Mini with 8 CPU cores

  - Node.js

        root@b438c148a44e:/opt/mgateway# node bm_mgdbxnapi.mjs 1000000
        mg-dbx-napi performance test
        Insert and read back 1000000 key/value pairs
        Global name used is ^ydbtest
        Please wait...
        -----
        finished 1000000 inserts in 0 seconds
        rate: 1,510,574 /sec
        ------
        finished 1000000 gets in 0 seconds
        rate: 2,309,468 /sec


  - Bun.js

        root@b438c148a44e:/opt/mgateway# bun bm_mgdbxnapi.mjs 1000000
        mg-dbx-napi performance test
        Insert and read back 1000000 key/value pairs
        Global name used is ^ydbtest
        Please wait...
        -----
        finished 1000000 inserts in 0 seconds
        rate: 1,373,626 /sec
        ------
        finished 1000000 gets in 0 seconds
        rate: 2,036,659 /sec


### IRIS Container

- Processor: X64 - Intel(R) Celeron(R) 2955U @ 1.40GHz with 2 Cores

  - Node.js

        irisowner@0190429c1c41:~$ node bm_mgdbxnapi.mjs 1000000
        mg-dbx-napi performance test
        Insert and read back 1000000 key/value pairs
        Global name used is ^iristest
        Please wait...
        -----
        finished 1000000 inserts in 4 seconds
        rate: 245,579 /sec
        ------
        finished 1000000 gets in 3 seconds
        rate: 326,904 /sec

  - Bun.js

        irisowner@0190429c1c41:~$ bun bm_mgdbxnapi.mjs 1000000
        mg-dbx-napi performance test
        Insert and read back 1000000 key/value pairs
        Global name used is ^iristest
        Please wait...
        -----
        finished 1000000 inserts in 3 seconds
        rate: 268,961 /sec
        ------
        finished 1000000 gets in 2 seconds
        rate: 334,112 /sec

- Processor: ARM64 - Standard M1 Apple Mac Mini with 8 CPU cores

  - Node.js

        irisowner@57adf75db712:~$ node bm_mgdbxnapi.mjs 1000000
        mg-dbx-napi performance test
        Insert and read back 1000000 key/value pairs
        Global name used is ^iristest
        Please wait...
        -----
        finished 1000000 inserts in 0 seconds
        rate: 1,111,111 /sec
        ------
        finished 1000000 gets in 0 seconds
        rate: 1,862,197 /sec


  - Bun.js

        irisowner@57adf75db712:~$ bun bm_mgdbxnapi.mjs 1000000
        mg-dbx-napi performance test
        Insert and read back 1000000 key/value pairs
        Global name used is ^iristest
        Please wait...
        -----
        finished 1000000 inserts in 0 seconds
        rate: 1,145,475 /sec
        ------
        finished 1000000 gets in 0 seconds
        rate: 1,675,041 /sec

## Things to Notice

Let's summarise these results in two tables:


|       X64    | YottaDB  | IRIS   |
|--------------|----------|--------|
|Node.js Write |251,319   |245,579 |
|Bun.js  Write |262,950   |268,961 |
|--------------|----------|--------|
|Node.js Read  |417,536   |326,904 |
|Bun.js  Read  |423,011   |334,112 |



|     ARM64    | YottaDB  | IRIS     |
|--------------|----------|----------|
|Node.js Write |1,510,574 |1,111,111 |
|Bun.js  Write |1,373,626 |1,145,475 |
|--------------|----------|----------|
|Node.js Read  |2,309,468 |1,862,127 |
|Bun.js  Read  |2,036,659 |1,675,041 |

Now we can begin to get a proper impression of just how fast these two databases are, and how fast a connection our *mg-dbx-napi* interface gives you.  

Of the two databases, at least on the two platforms we've used for these tests, YottaDB appears to be the faster: impressive for a free Open Source database technology!

And take a look at the read performance in particular! These are near in-memory levels of performance, yet the test is genuinely reading the individual key/value pairs directly from the databases.  In our experience, we have yet to find any other database technologies that come close to providing these levels of performance.

Now of course, this is a very simple test of a very simple key/value pair data structure.  

In the next document we'll look at how you can test and measure the performance when writing and reading more complex data structures.

----

# Comparison With Redis

The most commonly-used database used with Node.js for high-performance storage and retrieval of key/value data is Redis.  It's generally considered to be an extremely high-performance persistence store.

So how does it compare with YottaDB and IRIS?

To answer that, you'll find that the Container includes a pre-installed copy of Redis and the standard *redis* interface package for Node.js.  We've also included a benchmark test that closely matches the key/value storage used in the YottaDB and IRIS benchmark tests.  You can [find the file here](./dockerfiles/files/benchmark_redis.mjs)
 in the repo and you'll also find it in your running Container's default directory:

- YottaDB: /opt/mgateway/benchmark_redis.mjs
- IRIS: /home/irisowner/benchmark_redis.mjs

Here's our results when run on the exact same hardware as the *mg-dbx-napi* tests above:

- Processor: X64 - Intel(R) Celeron(R) 2955U @ 1.40GHz with 2 Cores

        root@db72cac4c3df:/opt/mgateway# node benchmark_redis.mjs
        Redis performance test
        Insert and read back 100,000 key/value pairs using HSET and HGET
        Please wait...
        -----
        finished 100,000 inserts in 8 seconds
        rate: 11,293 /sec
        ------
        finished 100,000 gets in 8 seconds
        rate: 11,499 /sec
        -----------

        Redis performance test
        Insert and read back 100,000 key/value pairs using SET and GET
        Please wait...
        -----
        finished 100,000 inserts in 8 seconds
        rate: 11,552 /sec
        ------
        finished 100,000 gets in 8 seconds
        rate: 11,814 /sec

- Processor: ARM64 - Standard M1 Apple Mac Mini with 8 CPU cores

        root@15b9ed4d53af:/opt/mgateway# node benchmark_redis.mjs
        Redis performance test
        Insert and read back 100,000 key/value pairs using HSET and HGET
        Please wait...
        -----
        finished 100,000 inserts in 5 seconds
        rate: 17,056 /sec
        ------
        finished 100,000 gets in 5 seconds
        rate: 17,079 /sec
        -----------

        Redis performance test
        Insert and read back 100,000 key/value pairs using SET and GET
        Please wait...
        -----
        finished 100,000 inserts in 5 seconds
        rate: 17,041 /sec
        ------
        finished 100,000 gets in 5 seconds
        rate: 17,123 /sec

You can see that the performance of YottaDB and IRIS using our *mg-dbx-napi* interface is orders of magnitude higher than using Redis.

Redis, of course, uses a networked interface, and one trick it has up its sleeve is pipelining to improve performance.  You'll [find another test](./dockerfiles/files/benchmark_redis_pl.mjs) 
for Redis using a pipelined connection: look for:

- YottaDB: /opt/mgateway/benchmark_redis_pl.mjs
- IRIS: /home/irisowner/benchmark_redis_pl.mjs

Here's the results running in on our ARM64 M1 Mac Mini:

        root@15b9ed4d53af:/opt/mgateway# node benchmark_redis_pl.mjs
        Redis performance test: pipelined
        Insert and read back 500,000 key/value pairs using HSET and HGET
        Please wait...
        -----
        finished 500,000 inserts in 1 seconds
        rate: 256,016 /sec
        ------
        finished 500,000 gets in 1 seconds
        rate: 264,970 /sec
        -----------

So this is a definite improvement, but still a small fraction - under 20% - of the performance of YottaDB and IRIS using our *mg-dbx-napi* interface.

Our conclusion is clear: if you want to achieve a significant improvement in persistent key/value pair storage when using Node.js, you need to think about replacing Redis with YottaDB and IRIS!

----

# Comparison with the Native Node.js API for IRIS

IRIS installations include its vendor's own API for accessing the database from Node.js: it's known as the *Native Node.js API*.  If you're already an IRIS user and using this API, you may be interested to know how it compares with our *mg-dbx-napi* interface.

In fact there's one big difference to be aware of immediately: the *Native Node.js API* can only make use of a network connection between Node.js and IRIS.  This, in itself, is a significant limiting factor when it comes to performance.  Whilst our *mg-dbx-napi* interface can also be configured to use a networked interface, the examples shown above make use of *mg-dbx-napi*'s in-process API connection to IRIS.

You can see for yourself what kind of performance you get by comparison via the *Native Node.js API* for IRIS: we've included a script that runs the equivalent key/value pair test.  You'll see it in the default directory when you shell into the container: *iris_native_test.js*.

You can run this using Node.js.  Here's examples on our two test machines:


- Processor: X64 - Intel(R) Celeron(R) 2955U @ 1.40GHz with 2 Cores

        irisowner@0190429c1c41:~$ node iris_native_test.js 1000000
        Platform name:  lnxubuntux64
        finished 1,000,000 inserts in 52 seconds
        rate: 19,196 /sec
        ------
        finished 1,000,000 gets in 52 seconds
        rate: 18,953 /sec

- Processor: ARM64 - Standard M1 Apple Mac Mini with 8 CPU cores

        irisowner@57adf75db712:~$ node iris_native_test.js 1000000
        Platform name:  lnxubuntuarm64
        finished 1,000,000 inserts in 8 seconds
        rate: 111,383 /sec
        ------
        finished 1,000,000 gets in 10 seconds
        rate: 95,584 /sec

You can see that, by comparison with the earlier results for our *mg-dbx-napi*'s API-based interface, the vendor-provided *Native Node.js API* delivers 10% or less of the performance of *mg-dbx-napi* when using the exact same database instance on the exact same hardware,
and when creating an almost identical set of persistent key/value pairs.

----

# Comparison with the NodeM Interface for YottaDB

In the YottaDB documentation you will see that for Node.js access there is another interface package available that is known as [*NodeM*](https://github.com/dlwicksell/nodem).  If you're already a YottaDB user and using this interface, you may be interested to know how it compares with our *mg-dbx-napi* interface.

Both interfaces have much in common: they each allow both network and in-process/API connections to be made between Node.js and YottaDB.

However, you'll find that not only does our *mg-dbx-napi* interface support Bun.js as well as Node.js, its performance is significantly higher than that of *NodeM*. 

You can see for yourself what kind of performance you get by comparison via NodeM: we've included a script that runs the equivalent key/value pair test.  You'll see it in the default directory when you shell into the container: *benchmark_nodem.js*.

You can run this using Node.js.  Here's examples on our two test machines:


- Processor: X64 - Intel(R) Celeron(R) 2955U @ 1.40GHz with 2 Cores

        root@db72cac4c3df:/opt/mgateway# node benchmark_nodem.js 1000000
        Node.js Adaptor for YottaDB: Version: 0.20.4 (ABI=115) [FWS]; YottaDB Version: 1.38
        Nodem performance test
        Insert and read back 1000000 key/value pairs
        Global name used is ^ydbtest
        Please wait...
        -----
        finished 1000000 inserts in 11 seconds
        rate: 88,167 /sec
        ------
        finished 1000000 gets in 13 seconds
        rate: 72,421 /sec

- Processor: ARM64 - Standard M1 Apple Mac Mini with 8 CPU cores

        root@15b9ed4d53af:/opt/mgateway# node benchmark_nodem.js 1000000
        Node.js Adaptor for YottaDB: Version: 0.20.4 (ABI=115) [FWS]; YottaDB Version: 1.38
        Nodem performance test
        Insert and read back 1000000 key/value pairs
        Global name used is ^ydbtest
        Please wait...
        -----
        finished 1000000 inserts in 3 seconds
        rate: 286,697 /sec
        ------
        finished 1000000 gets in 4 seconds
        rate: 244,319 /sec

You can see that, by comparison with the earlier results for our *mg-dbx-napi*'s API-based interface, *NodeM* delivers significantly lower performance than *mg-dbx-napi* when using the exact same database instance on the exact same hardware,
and when creating an almost identical set of persistent key/value pairs.


