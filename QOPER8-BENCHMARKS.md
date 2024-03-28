# Benchmarking the QOper8 Package

In the earlier tutorials using Fastify and Bun.serve, you've seen that we use the QOper8 package, specifically the Child Process variant [*qoper8-cp*](https://github.com/robtweed/qoper8-cp), to manage a pool of Worker Processes, within which we can then safely use the synchronous APIs of our *mg-dbx-napi* Interface for YottaDB and IRIS.

You may be wondering what kind of performance this has, and if it significantly slows down the performance of Fastify and Bun.serve.

Let's take a look at its performance when running alone in isolation, and then when running in conjunction with Node.js/Fastify and with Bun.js/Bun.serve.


## QOper8 Performance in Isolation

### The *qoper8-cp* Benchmarking Tool

Let's first take a look at the raw performance of the *qoper8-cp* package.  We'll be running it in isolation from either Node.js or Bun.js.

To do this, we can make use of a benchmarking tool that is included with the QOper8 packages.

The way this tool works is it creates batches of simple messages which it adds to the QOper8 queue which then manages a pool of Child Process Workers, handles each queued message within the available workers and returns the response to the tool's main process.  The handler is a "do-nothing" one, simply returning a fixed response.

You tell the benchmarking tool:

- the maximum number of Child Process Workers to create and use
- how many messages to create and process in total
- how many messages to create in each batch
- how long, in ms, to wait between each batch

This ensures that the JavaScript environment isn't overwhelmed by the creation of a huge message array, and minimises the overhead of message creation/queueing from what we want to measure: the performance of the queue/worker round-trip.

### Getting Started

Let's start with just a small number of messages.

From within your running Container, switch to the *mapped* folder, eg:

- YottaDB:

        cd /opt/mgateway/mapped

- IRIS:

        cd /home/irishome/mapped


Next, use your favourite editing tool to create a file named *bm.mjs* containing:

        import {benchmark} from 'qoper8-cp/benchmark';

        benchmark({
          poolSize: 2,
          maxMessages: 1000,
          blockLength: 100,
          delay: 10
        });

So we'll use just 2 Child processes to handle 1,000 messages, created in batches of 100 every 10ms.  This is just a set of initial guesses that we'll fine tune as we go along.

Now run the benchmark:

- Node.js

        node bm.mjs

- Bun.js

        bun.mjs


I'm going to show the results we get on a standard M1 Mac Mini (which has 8 CPU cores)

You should see something like this:

        Block no: 1 (0): Queue exhausted
        delay reduced to 9
        Block no: 2 (100): queue length increased to 100
        delay increased to 10
        Block no: 3 (200): queue length increased to 191
        delay increased to 11
        Block no: 7 (600): Queue exhausted
        delay reduced to 10
        Block no: 8 (700): Queue exhausted
        delay reduced to 9
        Block no: 9 (800): Queue exhausted
        delay reduced to 8
        Block no: 10 (900): Queue exhausted
        delay reduced to 7
        Completed sending messages
        ===========================

        1,000 messages: 0.138 sec
        Processing rate: 7,246.377 message/sec
        Child Process 0: 498 messages handled
        Child Process 1: 502 messages handled

You'll notice that the tool automatically adjusts the delay up or down depending on whether the message queue was already exhausted (delay too long), or whether the message queue increased in length (delay too short).  The idea is to create a balance where a queue of messages is steadily maintained.

The summary at the end shows the processing rate and how many messages were handled by each of the Child Process Workers.

1000 messages isn't enough to get a good idea of what QOper8's performance really is, so now let's properly stress-test it.


## Stress Test With 2 Child Process Workers

Let's edit the *bm.mjs* file to contain:

        import {benchmark} from 'qoper8-cp/benchmark';

        benchmark({
          poolSize: 2,
          maxMessages: 500000,
          blockLength: 2000,
          delay: 100
        });

So we'll make it handle half a million messages using 2 Child Process Workers, with batches of 2,000 messages at a time every 100ms.

Let's see how that behaves on Node.js and Bun.js:

- Node.js

On our M1 Mac Mini, the 100ms delay proved about right, varying only a small amount above and below.

The resulting summary was:

        500,000 messages: 24.923 sec
        Processing rate: 20,061.79 message/sec
        Child Process 0: 249,989 messages handled
        Child Process 1: 250,011 messages handled


- Bun.js

On our M1 Mac Mini, the behaviour was quite different, with the delay reduced repeatedly due to the queue being exhausted, ending up around 56ms. The summary result was:


        500,000 messages: 15.637 sec
        Processing rate: 31,975.443 message/sec
        Child Process 0: 249,921 messages handled
        Child Process 1: 250,079 messages handled

Bun.js is clearly a lot faster, but a lot of potential performance was lost in the test because the delay was initially way too long.  Let's edit in the finally-used delay:

        benchmark({
          poolSize: 2,
          maxMessages: 500000,
          blockLength:2000,
          delay: 56 // bun
        });

and now re-run the test on Bun.js.  This time the summary results are:

        500,000 messages: 14.643 sec
        Processing rate: 34,146.008 message/sec
        Child Process 0: 250,119 messages handled
        Child Process 1: 249,881 messages handled

So with the correct delay setting, it appears that Bun.js is more than 50% faster than Node.js at using QOPer8's Child Process pool.

## Stress Test With 4 Child Process Workers

So let's now see what happens if we increase the Worker Pool size.  We'll try doubling it to 4.

We'll use the same number of messages and the same batch size.

Here's our results on our M1 Mac Mini after a couple of tries, tuning the delay parameter:

|         | Delay (ms) | Rate/sec  |
|---------|------------|-----------|
| Node.js | 52         | 37,200    |
| Bun.js  | 30         | 62,600    |


Now Bun is nearly twice the speed of Node.js!

## Further Stress Tests

Further increasing the number of Workers continues to deliver yet higher throughput, but begins to plateau at around 8 workers for Bun and 10 workers for Bun:

- With 8 Workers:


  |         | Delay (ms) | Rate/sec   |
  |---------|------------|------------|
  | Node.js | 30         |  64,000    |
  | Bun.js  | 15         | 138,000    |


- With 10 Workers:


  |         | Delay (ms) | Rate/sec   |
  |---------|------------|------------|
  | Node.js | 30         |  64,000    |
  | Bun.js  | 12         | 154,000    |

- With 12 Workers:


  |         | Delay (ms) | Rate/sec   |
  |---------|------------|------------|
  | Node.js | 30         |  65,000    |
  | Bun.js  | 12         | 155,000    |


- With 16 Workers:


  |         | Delay (ms) | Rate/sec   |
  |---------|------------|------------|
  | Node.js | 30         |  63,000    |
  | Bun.js  | 12         | 154,000    |


So let's see what happens if we increase all the way up to 24 Workers:

  |         | Delay (ms) | Rate/sec   |
  |---------|------------|------------|
  | Node.js | 30         |  59,000    |
  | Bun.js  | 12         | 139,000    |


It seems, then, that if you try to use too many Workers, the performance actually begins to drop.  Having too many Workers appears to cause bottlenecks either to the operating systems or the internal networking between processes.

As a rule of thumb, we've found that on most systems, QOper8 throughput peaks when the number of child processes is equal to the number of CPU Cores.  On Apple M* systems, this relationship with CPU cores isn't, however, so clear cut.


## Summary of Standalone Benchmark

In summary, on our test platform, when running QOper8 on its own, with between 8 and 10 Workers, Node.js can process around 65,000 messages/second, whilst Bun can process far more: around 154,000 messages/second.

In fact for both platforms this is a very encouraging result, and QOper8 is clearly a performant package.

----

## QOper8 Performance When Integrated with a Web Framework

### Introduction

QOper8 was designed for use with a Web Framework, eg Fastify or Bun.serve, as a means of allowing the *mg-dbx-napi* synchronous APIs to be safely used within the confines of a Child Process without any concurrency concerns.

It's worth, therefore, taking a look at what the performance impact of QOper8 is when used with Web Frameworks.

Clearly, we first need to get some idea of the performance of Fastify and Bun.js running without QOper8, handling incoming requests in their main thread of execution.

### The Mechanics

For this reason, we've included, within the *mg-showcase* Containers, a very popular HTTP benchmarking tool called 
[AutoCannon](https://www.npmjs.com/package/autocannon).

We can use the *autocannon* tool together with the two Web/REST servers that have been included in the *mg-showcase* Containers and that we've used previously for the 
[Persistent JSON Performance Benchmark Demomstration](./JSON-BENCHMARKS.md):

- Node.js / Fastify: *nws.mjs*
- Bun.js / Bun.serve: *bws.js*

Both these Web/REST servers deliberately include two simple "do-nothing" routes:

- /local: handled in the main Web Server process
- /helloworld: handled in a QOper8 Child Process worker

These are ideal for benchmarking testing to compare performance with and without QOper8.

### Getting Started

First you need to be in the Container's default directory:

- YottaDB:

        cd /opt/mgateway

- IRIS:

        cd /home/irisowner

Next, start one of the included Web/REST Servers, making sure they run in "silent" (ie non-logging) mode:

- Node.js / Fastify:

        node nws.mjs false

- Bun.js / Bun.serve

        bun bws.js false


In a separate process, shell into your Container and then run *autocannon*.  We'll just give it a quick test to begin with, eg:

        autocannon -c 1 -d 1 http://localhost:3000/local

What this will do is make repeated requests to the */local* route from 1 connection (signified by the *-c 1* flag) for a duration of 1 second (signified by the -d 1 flag).

You'll then get back a report looking something like this:

        Running 1s test @ http://localhost:3000/local
        1 connections

        +-----------------------------------------------------------------+
        ¦ Stat    ¦ 2.5% ¦ 50%  ¦ 97.5% ¦ 99%  ¦ Avg     ¦ Stdev   ¦ Max  ¦
        +---------+------+------+-------+------+---------+---------+------¦
        ¦ Latency ¦ 0 ms ¦ 0 ms ¦ 0 ms  ¦ 0 ms ¦ 0.01 ms ¦ 0.05 ms ¦ 4 ms ¦
        +-----------------------------------------------------------------+
        +-------------------------------------------------------------------------------+
        ¦ Stat      ¦ 1%      ¦ 2.5%    ¦ 50%     ¦ 97.5%   ¦ Avg     ¦ Stdev ¦ Min     ¦
        +-----------+---------+---------+---------+---------+---------+-------+---------¦
        ¦ Req/Sec   ¦ 12,711  ¦ 12,711  ¦ 12,711  ¦ 12,711  ¦ 12,708  ¦ 0     ¦ 12,708  ¦
        +-----------+---------+---------+---------+---------+---------+-------+---------¦
        ¦ Bytes/Sec ¦ 2.01 MB ¦ 2.01 MB ¦ 2.01 MB ¦ 2.01 MB ¦ 2.01 MB ¦ 0 B   ¦ 2.01 MB ¦
        +-------------------------------------------------------------------------------+

        Req/Bytes counts sampled once per second.
        # of samples: 1

        13k requests in 1.01s, 2.01 MB read


The most useful figure to refer to, by the way, is the *Avg* one, ie the average throughput figure which, in the example above, is 12,708 requests/sec.

OK! Everything is now ready for benchmark testing.


### Performance Without QOper8

We'll first see what each Web/REST server is capable of without QOper8 handling requests.  We'll use a duration of 10 seconds to properly stress-test the server and send requests for the */local* route.

The thing to do is vary the number of connections (using the *-c flag).  You should find that the throughput (ie requests handled per second) goes up as you add more connections before reaching a plateau beyond which point adding more connections has little or no effect.  For example:

        autocannon -c 6 -d 10 http://localhost:3000/local


The optimum number of connections is going to vary depending on your platform, but, for example, on our M1 Mac Mini:

  |                 | Connections | Rate/sec   |
  |-----------------|-------------|------------|
  | Node.js/Fastify | 6           |  51,000    |
  | Bun.serve       | 8           | 106,000    |


You can already see just how much faster Bun.js is as a Web/REST server than Fastify running on Node.js!


### Performance With QOper8

We can now repeat this process using the QOper8-handled */helloworld* route.

This time we not only have to consider the number of *autocannon* connections, but also the QOper8 Child Process Worker pool size.  By default the supplied Web/REST Server uses a QOper8 pool size of 2, but you can adjust this when you start it up by adding it as a command line parameter.

For example, to start the Web/REST server with a poolSize of 8 QOper8 Workers:

        node nws.mjs false 8

or:

        bun bws.js false 8

By the way, to stop the Web/REST Server, hit *CTRL* & C.  You may have to do this several times before it fully shuts down and returns you to the *bash* shell prompt.

In the earlier benchmarks tests running QOper8 in isolation, we found that optimum throughput occurred with 8 - 10 workers on our M1 Mac Mini, so we'll use 8 workers as a good basis for these next benchmark tests.

So, having restarted the Web/REST server in your *mg-showcase* Container as shown above, now try autocannon again, eg:

        autocannon -c 6 -d 10 http://localhost:3000/helloworld

Once again, try changing the number of connections until you see the maximum throughput plateau.

Here's our results from our M1 Mac Mini:

  |                 | Connections | Rate/sec   |
  |-----------------|-------------|------------|
  | Node.js/Fastify | 8           |  21,000    |
  | Bun.serve       | 32          |  49,000    |


### Summary Findings

At least on our M1 Mac Mini, it appears that running QOper8 to handle incoming requests in Child Process Workers reduces the performance of both Fastify and Bun.serve by about 50%.

Interestingly, Bun.serve running with QOper8 delivers similar performance to Fastify running without QOper8!

So clearly there is a significant reduction in performance when using QOper8, but, having said that, these throughput rates are nevertheless perfectly satisfactory and will rarely become a practical limitation.  In particular, a combination of Bun.js and QOper8 is going to deliver phenomenal results.



