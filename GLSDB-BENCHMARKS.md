# Benchmarking *QOper8* + *mg-dbx-napi* + *glsdb*

## Typical Performance of Node.js + Fastify When Accessing Databases

Before going any further, it's worth taking a look at the kind of throughput that is normally expected when using Node.js and Fastify with mainstream databases.  Two of the most commonly-used databases are Postgres and MongoDB.

There have been two well-regarded articles published recently that have reported benchmark tests for these databases running with Node.js:

- [Postgres DB reads case](https://medium.com/deno-the-complete-reference/node-js-the-fastest-web-framework-in-2024-postgres-db-reads-case-c3574581cc5d)

- [MongoDB showdown](https://thenewstack.io/a-showdown-between-express-js-and-fastify-web-app-frameworks/)

Conveniently both articles included Node.js and Fastify as one of their test platforms, and both compare a simple "hello world" request with retrieving a record from Postgres and MongoDB respectively.  

Here's a summary of their results for Fastify:

- Postgres

  |                 | Rate/sec   |
  |-----------------|------------|
  | "hello World"   |  99,687    |
  | SQL request     |  14,276    |


- MongoDB

  |                  | Rate/sec   |
  |------------------|------------|
  | "hello World"    |  47,803    |
  | database request |   8,628    |


*Note: the raw performance is due to the different hardware being used. The Postgres tests were run on an M2 Macbook Pro with 16Gb RAM.*


So we can see that as soon as we begin accessing a database, the performance of Fastify plummets:

- when handling Postgres, performance is down to just 14% of the "do nothing" performance
- when handling MongoDB, performance is down to just 18% of the "do nothing" performance

Such massive reductions in throughput are actually the norm when accessing a database from Node.js, and, to be honest, make the theoretical "do nothing" high levels of performance of these Web Frameworks somewhat academic and irrelevant.  

The reality is that almost all production Web/REST back-ends will require access to a database, and the performance of the mainstream databases commonly used with Node.js or Bun is, put bluntly, pretty dire.


With that in mind, let's now take a look at how *mg-dbx-napi* and *glsdb* using YottaDB or IRIS perform.

Remember: the *mg-showcase* Containers include all the benchmark tests we're going to run, so you can very easily find out for yourself what the results look like on your own hardware.


## Benchmarking *QOper8*, *mg-dbx-napi* and *glsdb*

We've seen in this repository's [previous benchmark tests](./QOPER8-BENCHMARKS.md) that when
 using QOper8 in conjunction with Node.js/Fastify and Bun.js/Bun.serve, performance when processing a "do-nothing" "hello world" request in QOper8 Child Process Workers was approximately half that of processing the equivalent request in the main Web Framework process:

- Hello World in Main Web Framework Process

  |                 | Connections | Rate/sec   |
  |-----------------|-------------|------------|
  | Node.js/Fastify | 6           |  51,000    |
  | Bun.serve       | 8           | 106,000    |


- Hello world in QOper8 Child Process Workers

  |                 | Connections | Rate/sec   |
  |-----------------|-------------|------------|
  | Node.js/Fastify | 8           |  21,000    |
  | Bun.serve       | 32          |  49,000    |


It's worth considering what's happening when using QOper8.  The round trip for these QOper8-handled "hello world" request/response cycles is as follows:


         Client issues GET /user/1 request

                     |
                     |
                     V
         Request received by Fastify or Bun.serve Process

                     |
                     |
                     V

         Request added to QOper8 queue

                     |
                     |
                     V

         QOper8 dispatcher sends request to Child Process

                     |
                     |
                     V

         QOper8 Child process receives request and fires
         route-specific handler

                     |
                     |
                     V

          Handler creates and returns JSON "hello world" response

                     |
                     |
                     V

           QOper8 Child Process returns JSON response to main Web Framework process

                     |
                     |
                     V

            Response returned to client by Fastify or Bun.serve


We now want to see what additional performance hit occurs when, instead of running a simple "do-nothing" *Hello World* handler, we fetch a record from the YottaDB or IRIS database using the *glsdb* abstraction and return the resulting JSON record as a response.

So in performing this test the round-trip will now be:

         Client issues GET /user/1 request

                     |
                     |
                     V
         Request received by Fastify or Bun.serve Process

                     |
                     |
                     V

         Request added to QOper8 queue

                     |
                     |
                     V

         QOper8 dispatcher sends request to Child Process

                     |
                     |
                     V

         QOper8 Child process receives request and fires
         route-specific handler

                     |
                     |
                     V

         Handler invokes glsdb APIs to find and fetch user record from
         YottaDB or IRIS

                     |
                     |
                     V

          mg-dbx-napi APIs invoked, accessing Global Storage on YottaDB or IRIS

                     |
                     |
                     V

          glsdb packages results from mg-dbx-napi as JSON

                     |
                     |
                     V

          Handler returns JSON response

                     |
                     |
                     V

           QOper8 Child Process returns JSON response to main Web Framework process

                     |
                     |
                     V

            Response returned to client by Fastify or Bun.serve


The question, then, is how much more of a performance hit will we see as a result of these added steps within the QOper8 Child Process Workers:


         Handler invokes glsdb APIs to find and fetch user record from
         YottaDB or IRIS

                     |
                     |
                     V

          mg-dbx-napi APIs invoked, accessing Global Storage on YottaDB or IRIS

                     |
                     |
                     V

          glsdb packages results from mg-dbx-napi as JSON


## Getting Started

Once again we're going to start up the same Web/REST server as we used in the previous tests.  First make sure you're in the correct directory:

- YottaDB:

        cd /opt/mgateway

- IRIS:

        cd /home/irishome

Then start the Web/REST Server:


- Node.js / Fastify:

        node nws.mjs false 8

- Bun.js / Bun.serve

        bun bws.js false 8


In both cases, based on the results from the QOper8 standalone tests, you can see above that we'll be using a pool of 8 QOper8 Child Process workers.  Feel free to try different poolSize values when running the tests for yourself, to see the impact on performance.


Just as before, in a separate process, shell into your Container and then run *autocannon*.  This time we're going to use another of the routes handled by these server scripts: 

        GET /user/{{id}}

You can [view the source code](./dockerfiles/files/handlers/getUser.mjs) for its QOper8 Worker handler and see what it does.  In summary it:

- checks for the existence in the database of a Person record with the specified *id*
- if it exists, it maps its data into a corresponding JSON record
- the JSON is then returned

Typically a request and resulting response will look something like this:

        curl http://localhost:3000/user/1

        // {"document":{"firstName":"Chris","lastName":"Munt"}}


> <span style="font-size:10pt;">**Note**: Before you use this route, you'll need to make sure you previously created some user records in the database.  See:</span>
>
> - [<span style="font-size:10pt;">Fastify</span>](https://github.com/robtweed/mg-showcase/blob/master/TUTORIAL-GLSDB-FASTIFY.md#try-it-out) 
> - [<span style="font-size:10pt;">Bun.serve</span>](https://github.com/robtweed/mg-showcase/blob/master/TUTORIAL-GLSDB-BUN.md#try-it-out) 


Just like before, we'll use *autocannon* to benchmark each of our Web/REST Servers, eg:


        autocannon -c 32 -d 10 http://localhost:3000/user/1


Once again, feel free to try different numbers of connections to see the impact on performance on your hardware.

Note that the QOper8 handler will not be caching any of its data: every request will incur a new set of database accesses via the *mg-dbx-napi* interface.


## Summary of Results

Here's the results when using the YottaDB Container on our M1 Mac Mini:

  |                 | Connections | Rate/sec   |
  |-----------------|-------------|------------|
  | Node.js/Fastify | 16          |  20,000    |
  | Bun.serve       | 32          |  43,000    |


You can see that the performance, compared with a "do nothing" request handled by QOper8, has barely changed:

- Node.js / Fastify: 95%
- Bun.js / Bun.serve: 88%

The overall performance hit from using the entire stack - QOper8, *mg-dbx-napi*, *glsdb* and YottaDB - compared with a locally-processed "hello world" is:

- Node.js / Fastify: 39%
- Bun.js / Bun.serve: 41%

It's now clear that almost all of that performance drop is due to QOper8.

However, we're nevertheless still getting between 2 and 3 times better performance than reported elsewhere for Postgres and MongoDB when used with Fastify and Node.js.


Conclusions

These benchmarks tests demonstrate again the high performance of the YottaDB and IRIS databases.  When used with Node.js and Fastify or with Bun.js and Bun.serve, they deliver significantly higher performance than other well known, mainstream databases.

You can see from these tests, however, that  almost all of the (near 50%) performance hit we've incurred is due to the overhead of having to use the QOper8 package which, in turn, is needed to cleanly handle the synchronous APIs of *mg-dbx-napi*.

This suggests that if there was a way to dispense with QOper8, we could raise the performance bar significantly, because otherwise the tests demonstrate that there is only a tiny performance hit incurred by accessing data stored on YottaDB or IRIS when using *mg-dbx-napi* and *glsdb*.

That, then, leads us nicely to the next topic of our *mg-showcase*!






