# *mg_web* Benchmarks

## Introduction

In this document we'll look at the performance of *mg_web* together with NGINX, using the version that is pre-installed in the *mg-showcase* Containers.

Feel free to try these tests for yourself using one of the Containers on your own system.

## NGINX Standalone

First, let's review the performance of NGINX running standalone and invoking a locally-defined route within its configuration file (*/etc/nginx/nginx.conf*).

This route is already present in the NGINX Configuration file that was pre-installed in your *mg-showcase* Container:

```console
        location  ~ ^/local {
          default_type application/json;
          return 200 '{"status":"success","result":"nginx test json"}';
        }
```

On our reference machine - a standard M1 Mac Mini with 16Mb RAM - our best results were achieved with these *autocannon* settings:

```console
autocannon -c 128 -d 5 -w 4 http://localhost:8080/local
```

Try out various different settings on your own system to find your optimum results.

Here's our results:

```console
http://localhost:8080/local
Running 5s test @ http://localhost:8080/local
128 connections
4 workers

+-------------------------------------------------------------------+
¦ Stat    ¦ 2.5% ¦ 50%  ¦ 97.5% ¦ 99%   ¦ Avg     ¦ Stdev   ¦ Max   ¦
+---------+------+------+-------+-------+---------+---------+-------¦
¦ Latency ¦ 0 ms ¦ 1 ms ¦ 14 ms ¦ 18 ms ¦ 2.17 ms ¦ 3.89 ms ¦ 72 ms ¦
+-------------------------------------------------------------------+
+-------------------------------------------------------------------------------------+
¦ Stat      ¦ 1%      ¦ 2.5%    ¦ 50%     ¦ 97.5%   ¦ Avg       ¦ Stdev     ¦ Min     ¦
+-----------+---------+---------+---------+---------+-----------+-----------+---------¦
¦ Req/Sec   ¦ 197,503 ¦ 197,503 ¦ 256,767 ¦ 262,399 ¦ 246,374.4 ¦ 24,655.13 ¦ 197,480 ¦
+-----------+---------+---------+---------+---------+-----------+-----------+---------¦
¦ Bytes/Sec ¦ 39.7 MB ¦ 39.7 MB ¦ 51.6 MB ¦ 52.7 MB ¦ 49.5 MB   ¦ 4.94 MB   ¦ 39.7 MB ¦
+-------------------------------------------------------------------------------------+

Req/Bytes counts sampled once per second.
# of samples: 20

1233k requests in 5.01s, 248 MB read
```

So NGINX on its own is an incredibly fast Web Server, giving us a performance of around 250,000 requests/sec.

of course, this is processing a not very useful "do-nothing" route.


## NGINX + *mg_web*

Now let's do an equivalent test, this time using a route that will be handled by *mg_web* within its Child Processes.  Once again, you'll find this route has already been defined:

- within the NGINX Configuration file, all routes prefixed with */mgweb* will be handled by *mg_web*:

```console
        location /mgweb {
          MGWEB On;
          MGWEBThreadPool default;
        }
```

- within the *mgweb.conf* file, these routes are to be processed by the the *demo_router.mjs* module via the *mg_dbx_js* Socket Server:

```console
  <location /mgweb >
    function /opt/mgateway/demo_router.mjs
    servers NodeJS
  </location >
```

- finally, within the *demo_router.mjs* file, there's a simple "do-nothing" route (*/mgweb/helloworld*) defined:

```javascript
router.get('/mgweb/helloworld', (Request, ctx) => {
  return {
    payload: {
      hello: 'world 123'
    }
  };
});
```

So let's see how this performs by comparison with NGINX alone.

We found that we got the best results with 4 NGINX Workers:

```console
./nginx workers 4
```

With these in place, once again we needed to try various *autocannon* settings, and obtained best results with this:

```console
autocannon -c 64 -d 5 http://localhost:8080/mgweb/helloworld
```

Here's our results:

```console
Running 5s test @ http://localhost:8080/mgweb/helloworld
64 connections

+------------------------------------------------------------------+
¦ Stat    ¦ 2.5% ¦ 50%  ¦ 97.5% ¦ 99%  ¦ Avg     ¦ Stdev   ¦ Max   ¦
+---------+------+------+-------+------+---------+---------+-------¦
¦ Latency ¦ 0 ms ¦ 2 ms ¦ 7 ms  ¦ 8 ms ¦ 2.47 ms ¦ 1.92 ms ¦ 14 ms ¦
+------------------------------------------------------------------+
+-----------------------------------------------------------------------------------+
¦ Stat      ¦ 1%      ¦ 2.5%    ¦ 50%     ¦ 97.5%   ¦ Avg      ¦ Stdev    ¦ Min     ¦
+-----------+---------+---------+---------+---------+----------+----------+---------¦
¦ Req/Sec   ¦ 60,831  ¦ 60,831  ¦ 65,343  ¦ 65,663  ¦ 64,262.4 ¦ 1,803.39 ¦ 60,820  ¦
+-----------+---------+---------+---------+---------+----------+----------+---------¦
¦ Bytes/Sec ¦ 10.6 MB ¦ 10.6 MB ¦ 11.4 MB ¦ 11.5 MB ¦ 11.2 MB  ¦ 315 kB   ¦ 10.6 MB ¦
+-----------------------------------------------------------------------------------+

Req/Bytes counts sampled once per second.
# of samples: 5

322k requests in 5.02s, 56.2 MB read
```

So we now see a significant drop in NGINX throughput, but that's not surprising.  What is very encouraging is that this level of performance is already higher than Fastify running without a Proxy and performing a local "do-nothing" response: typically we see around 50,000 requests/sec for Fastify in this mode.

And in our [previous benchmark document](https://github.com/robtweed/mg-showcase/blob/master/WHY-MGWEB.md#fastify-proxied-via-nginx)
we saw that when proxied via NGINX, Fastify throughput reduced to just 21,000 requests/sec.

So NGINX coupled with *mg_web* is delivering 3X the performance of an equivalent Fastify configuration!

We're also now seeing 3X the performance of Fastify running without an NGINX proxy and handling requests in QOper8.  Here were our previous results for QOper8:


  |                 | Connections | Rate/sec   |
  |-----------------|-------------|------------|
  | Node.js/Fastify | 8           |  21,000    |
  | Bun.serve       | 32          |  49,000    |


## NGINX + *mg_web* + *mg-dbx-napi* access to YottaDB

Now let's see what the performance looks like when we make *mg_web* do some real work and retrieve records from the YottaDB database.

We're going to use the low-level *mg-dbx-napi* APIs for this to begin with, to see how much they affect performance.

If you take a look at the *demo-router.mjs* module, you'll see the API route we'll use:

```javascript
router.get('/mgweb/userx/:userId', (Request, ctx) => {

  let db = ctx.glsdb.dbx.db;
  let person = ctx.person;
  if (!person) {
    person = new ctx.glsdb.dbx.mglobal(db, 'Person');
    ctx.person = person;
  }
  let id = Request.params.userId;
  let firstname = person.get('data', id, 'firstName');
  let lastname = person.get('data', id, 'lastName');

  return {
    payload: {
      key: id,
      data: {
        firstName: firstname,
        lastName: lastname
      }
    }
  };

});
```

We need to make sure we have some data in the *Person* Global Document to make this work.  If you worked through some of the earlier tutorials you'll have already created such records.  However you could create a record for testing now, using another of the predefined *demo_router* *mg_web* routes:

    curl -v -X POST -H "Content-Type: application/json" -d "{\"firstName\": \"Rob\", \"lastName\": \"Tweed\"}" http://localhost:8080/mgweb/save

So now we're ready for benchmarking.

As always you'll need to try a few different *autocannon* settings to achieve the best throughput.  Here's the one we used:

```console
autocannon -c 64 -d 5 http://localhost:8080/mgweb/userx/1
```

This gave us the following results:

```console
Running 5s test @ http://localhost:8080/mgweb/userx/1
64 connections


+------------------------------------------------------------------+
¦ Stat    ¦ 2.5% ¦ 50%  ¦ 97.5% ¦ 99%  ¦ Avg     ¦ Stdev   ¦ Max   ¦
+---------+------+------+-------+------+---------+---------+-------¦
¦ Latency ¦ 0 ms ¦ 2 ms ¦ 7 ms  ¦ 8 ms ¦ 2.45 ms ¦ 2.08 ms ¦ 76 ms ¦
+------------------------------------------------------------------+
+-----------------------------------------------------------------------------------+
¦ Stat      ¦ 1%      ¦ 2.5%    ¦ 50%     ¦ 97.5%   ¦ Avg      ¦ Stdev    ¦ Min     ¦
+-----------+---------+---------+---------+---------+----------+----------+---------¦
¦ Req/Sec   ¦ 45,503  ¦ 45,503  ¦ 61,791  ¦ 62,239  ¦ 58,588.8 ¦ 6,557.95 ¦ 45,484  ¦
+-----------+---------+---------+---------+---------+----------+----------+---------¦
¦ Bytes/Sec ¦ 9.65 MB ¦ 9.65 MB ¦ 13.1 MB ¦ 13.2 MB ¦ 12.4 MB  ¦ 1.39 MB  ¦ 9.64 MB ¦
+-----------------------------------------------------------------------------------+

Req/Bytes counts sampled once per second.
# of samples: 5

293k requests in 5.02s, 62.1 MB read
```

We can see that there's a reduction, but it's only down from around 64,000/sec to around 59,000/sec, a less than 10% reduction.

Compare this with [benchmarks for Fastify accessing Postgres and MongoDB](./GLSDB-BENCHMARKS.md#typical-performance-of-nodejs--fastify-when-accessing-databases) and you can see that the performance when accessing YottaDB via NGINX and *mg_web* is orders of magnitude better - there's literally no comparison!


## NGINX + *mg_web* + *mg-dbx-napi* access to YottaDB Using the *glsdb* Abstraction

Finally let's check to see what impact, if any, we see when we use the *glsdb* abstraction for accessing YottaDB data.

The *mg-dbx-napi* APIs are clearly very fast, but, by design, they provide very low-level access to Global Storage databases and are not especially developer-friendly.

*glsdb* by comparison provides a much more JavaScript-centric abstraction of the underlying data.  But at what cost?

Let's take a look now.


This time we'll use another route that is pre-defined in the *demo_router* module:

```javascript
router.get('/mgweb/user/:userId', (Request, ctx) => {

  let person = new ctx.glsdb.node('Person.data');
  let data = person.$(Request.params.userId).document;

  return {
    payload: {
      key: Request.params.userId,
      data: data
    }
  };

});
```

This is going to do exactly the same job as the previous */mgweb/userx/:userId* route, but is now using the much slicker and less verbose *glsdb* APIs.

We used this *autocannon* command:

```console
autocannon -c 64 -d 5 http://localhost:8080/mgweb/user/1
```

Our results were as follows:

```console
Running 5s test @ http://localhost:8080/mgweb/user/1
64 connections

+------------------------------------------------------------------+
¦ Stat    ¦ 2.5% ¦ 50%  ¦ 97.5% ¦ 99%  ¦ Avg     ¦ Stdev   ¦ Max   ¦
+---------+------+------+-------+------+---------+---------+-------¦
¦ Latency ¦ 0 ms ¦ 2 ms ¦ 7 ms  ¦ 8 ms ¦ 2.64 ms ¦ 1.88 ms ¦ 13 ms ¦
+------------------------------------------------------------------+
+----------------------------------------------------------------------------------+
¦ Stat      ¦ 1%      ¦ 2.5%    ¦ 50%     ¦ 97.5%   ¦ Avg     ¦ Stdev    ¦ Min     ¦
+-----------+---------+---------+---------+---------+---------+----------+---------¦
¦ Req/Sec   ¦ 47,103  ¦ 47,103  ¦ 49,695  ¦ 49,951  ¦ 49,072  ¦ 1,088.38 ¦ 47,084  ¦
+-----------+---------+---------+---------+---------+---------+----------+---------¦
¦ Bytes/Sec ¦ 9.99 MB ¦ 9.99 MB ¦ 10.5 MB ¦ 10.6 MB ¦ 10.4 MB ¦ 230 kB   ¦ 9.98 MB ¦
+----------------------------------------------------------------------------------+

Req/Bytes counts sampled once per second.
# of samples: 5

246k requests in 5.02s, 52 MB read
```

So we can see that we've dropped further to just under 50,000 requests/second, but this is still a relatively insignificant drop in performance compared with using any other mainstream database and JavaScript Web Framework, and yet we're getting all the advantages of the *glsdb* abstraction.


Clearly then you can decide which is more important to you:

- for the absolute best performance possible, use the low-level *mg-dbx-napi* APIs
- for more developer-friendly syntax that is arguably lower in downstream maintenance overheads, use the *glsdb* abstraction which will still not significantly degrade overall performance.


## Summary

Please try these tests out for yourself using one of the *mg-showcase* Containers on your own system.

We're confident that the results you'll see will be orders of magnitude better than anything else you've seen when accessing a database via a JavaScript Web Framework.

We believe that *mg_web* establishes a new paradigm for Web Frameworks, and is a clear leader in terms of performance and throughput whilst taking advantage of all the benefits of the three established industry-standard Web Servers.
