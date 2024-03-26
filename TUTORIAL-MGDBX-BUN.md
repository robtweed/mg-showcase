# Using the mg-dbx-napi Interface with Bun.serve

## Introduction

In the [previous tutorial](./TUTORIAL-MGDBX.md), 
we created some simple scripts that created and read back records from YottaDB and/or IRIS.

Such scripts aren't, however, how you'd normally make use of YottaDB and/or IRIS when using Bun.js.  Mostly you'll be wanting to use these databases as part of a back-end HTTP server - typically a REST-based API server.

If you're using Bun.js, then you'll almost certainly be using [Bun.serve](https://bun.sh/docs/api/http), its built-in HTTP server.  It's probably the fastest available server-side JavaScript web framework with incredible levels of performance: a great match, then, for the high-performance of YottaDB, IRIS and *mg-dbx-napi*.

So in this tutorial we'll look at how you can put together a Bun.serve-based REST server that makes use of the *mg-dbx-napi* interface to the YottaDB and IRIS databases.

## A Working Example

You've actually already seen one in action: when you ran the 
[JSON benchmark tests](./JSON-BENCHMARKS.md), you were running Bun.serve:

- [nws.mjs for YottaDB](./dockerfiles/yottadb/files/bws.mjs)
- [nws.mjs for IRIS](./dockerfiles/iris/files/bws.mjs) 

Take a look at the source code.  The tutorial that follows should help you to understand what's going on in that code.

## Safely Handling mg-dbx-napi's Synchronous APIs

You've probably noticed in the previous tutorial that the APIs provided by the *mg-dbx-napi* interface are synchronous which, of course, for a JavaScript database interface is somewhat unusual and perhaps surprising. Paradoxically, a key reason for the performance of *mg-dbx-napi* is its synchronous design, but that's a topic beyond the scope of this showcase repository. 

whilst these synchronous APIs were OK for a simple script that is run by a single user, it's a different story when the interface APIs are being used simultaneously by potentially large numbers of concurrent users all in the same Bun.js process.  Even though, as you've seen already, read and write performance through *mg-dbx-napi* is incredibly fast, nevertheless each request takes a finite time, during which the Bun.js thread would be blocked for any other concurrent user(s).  So how can this problem be reconciled?

Well, it's for this very reason that we created the *QOper8* package. There are actually three variants:

- QOper8-ww for WebWorkers
- QOper8-wt for Worker Threads
- QOper8-cp for Child Processes

The one we'll be using is *Qoper8-cp* which is actually the best for use with YottaDB and IRIS.

All variants of QOper8 work in essentially the same way:

- incoming requests are placed on an in-memory queue
- when a message is added to the queue:
  - if no workers (eg Child Processes) have been started, QOper8 starts one up
  - if one or more workers have already been started, QOper8 checks for an available one
  - if no workers are available, QOper8 will start another new worker unless the worker pool size maximum has been reached, in which case the message will be left in the queue

- if a worker is available, QOper8 removes the message from the queue and sends it to the worker
- the worker is now flagged as unavailable
- based on its message type, QOper8 invokes a handler method to process the request in the worker and return a response
- on receipt of the response from the worker, the worker is flagged as available
- the response can then be forwarded to the awaiting client that originally sent the request

You'll have probably realised that this mechanism means that each worker - Child Process in our case - will only handle a single request at a time.  Meanwhile the master process runs completely asynchronously, adding messages to the queue and awaiting their resulting response.

With no concurrency to worry about within the QOper8 Workers, there's no problem using the synchronous APIs of *mg-dbx-napi*.

So a key thing to understand: when using Bun.serve and QOper8, any *mg-dbx-napi* connections to the YottaDB or IRIS databases are made within each QOper8 worker, and **NOT** in the main *Bun.serve* process.


## Start Creating a Bun Script

We'll start by writing a simple REST Server using Bun.serve:

        Bun.serve({
          port: 3000,
          async fetch(Req) {
            return Response.json({ok:true, from: 'Bun'});
          }
        });

Copy and save this to your container's *mapped* directory as, eg */opt/mgateway/mapped/bunserve.js* and then start it up:

        cd mapped
        bun bunserve.js

If you send any HTTP request, eg:

        curl -v http://localhost:3000/local

You should get the same response:

        {"ok":true,"from":"Bun"}


You can stop the Bun.serve process by typing *CTRL* & C.


## Adding *mg-bun-router* to Bun.serve

Clearly the REST server we've created is of little value.

We need to be able to route incoming HTTP requests to associated handler methods which return their respective responses.  There are probably a number of routing packages that you could consider using, but for reasons that will become clear later, we're going to use one that we've created for Bun: 

- [*mg-bun-router*](https://github.com/robtweed/mg-bun-router)

So we can edit our *bunserve.js* file as follows:

        import {Router} from 'mg-bun-router';
        let router = new Router();

        router.get('/local', (req) => {
          return Response.json({hello: 'handled by Bun'});
        });

        router.invalid();

        Bun.serve({
          port: 3000,
          async fetch(Req) {
            return await router.useRoutes(Req);
          }
        });

Restart the Bun script:

        bun bunserve.js

Try the *GET /local* API:

        curl http://localhost:3000/local

You should get the response from the router handler method:

        {"hello":"handled by Bun"}

Any other HTTP request should return an error response from the "catch-all" error handler: *router.invalid()*:

        {"error":"Unrecognised request"}


So now we have a basic Bun-based REST API server that can handle incoming requests within its own main process.


## Intergrating QOper8 with Bun.serve

The *mg-bun-router* package wasn't simply developed to provide routing functionality for Bun.serve.  It also integrates QOper8 and makes it simple and easy to specify routes that Bun.serve will forward to QOper8 for handling in a Worker Child Process rather than being handled in the Bun.serve process thread of execution.

So it's simply a matter of telling *mg-bun-router* to activate that functionality. We do that by passing an *options* object as an argument when invoking *mg-bun-router*'s Constructor, ie:

        let router = new Router(options);

The *options* object that allows you to specify a few things:

- a couple of basic configuration settings:

  - whether or not to log all QOper8 activity to the console.  This is useful during development
  - the QOper8 maximum worker pool size.  We'll use the default of 2

- an array - *workerHandlersByRoute* - that defines any API routes that you want to handle in QOper8 workers.
 Each element of the array is an object that defines a specific route using three properties:

  - method: the HTTP method (eg *get*, *post* etc)
  - url: the API path for this route (eg */api/xyz*).  This can be a parameterised path and/or can contain a wildcard
  - handlerPath: the file path of the module that will handle this route within a QOper8 Worker.  Note that this path is relative to the path in which Bun.serve has been started (you can, of course, specify an absolute file path if you prefer)

- another object - *mgdbx* - where you can define any *mg-dbx-napi* configuration settings.  The one you'll particularly use is the *open* parameters which define how to open a connection to either YottaDB or IRIS


So let's use the following *options* object:

- YottaDB Container

        const options = {
          logging: true,
          poolSize: 2,
          mgdbx: {
            open: {
              type: "YottaDB",
              path: "/usr/local/lib/yottadb/r138",
              env_vars: {
                ydb_gbldir: '/opt/yottadb/yottadb.gld',
                ydb_routines: '/opt/mgateway/m /usr/local/lib/yottadb/r138/libyottadbutil.so',
                ydb_ci: '/usr/local/lib/yottadb/r138/zmgsi.ci'
              }
            }
          },
          workerHandlersByRoute: [
            {
              method: 'get',
              url: '/helloworld',
              handlerPath: 'getHelloWorld.mjs'
            }
          ]
        };


- IRIS Container:

        const options = {
          logging: true,
          poolSize: 2,
          mgdbx: {
            open: {
              type: "IRIS",
              path:"/usr/irissys/mgr",
              username: "_SYSTEM",
              password: "secret",
              namespace: "USER"
            }
          },
          workerHandlersByRoute: [
            {
              method: 'get',
              url: '/helloworld',
              handlerPath: 'getHelloWorld.mjs'
            }
          ]
        };


So in each case we're specifying a single route that will be executed in a QOper8 Child Process:

        GET /helloworld

Putting this all together, here's what our *bunserve.js* file for YottaDB should look like:

        import {Router} from 'mg-bun-router';

        const options = {
          logging: true,
          poolSize: 2,
          mgdbx: {
            open: {
              type: "YottaDB",
              path: "/usr/local/lib/yottadb/r138",
              env_vars: {
                ydb_gbldir: '/opt/yottadb/yottadb.gld',
                ydb_routines: '/opt/mgateway/m /usr/local/lib/yottadb/r138/libyottadbutil.so',
                ydb_ci: '/usr/local/lib/yottadb/r138/zmgsi.ci'
              }
            }
          },
          workerHandlersByRoute: [
            {
              method: 'get',
              url: '/helloworld',
              handlerPath: 'getHelloWorld.mjs'
            }
          ]
        };

        let router = new Router(options);

        router.get('/local', (req) => {
          return Response.json({hello: 'handled by Bun'});
        });

        router.invalid();

        Bun.serve({
          port: 3000,
          async fetch(Req) {
            return await router.useRoutes(Req);
          }
        });


Next, we need to create the actual handler module file.  This has a particular structure that is fully documented in the 
[QOper8 documentation](https://github.com/robtweed/qoper8-cp#the-message-handler-method-script), so we'll just show an example here.

Let's create our simple "hello world" handler file as follows and save to your Container's *mapped* directory as: *getHelloWorld.mjs"

        const handler = function(messageObj, finished) {

          finished({
            ok: true,
            hello: 'world',
            handledByWorker: this.id,
            messageObj: messageObj
          });
        };

        export {handler};

## Try it Out

We can now try it out.

Restart your Bun.serve script:

        bun bunserve.js

The local route should still work as before:


        curl http://localhost:3000/local

        // {"hello":"handled by Bun"}


Now try our new *helloworld* route:


        curl http://localhost:3000/helloworld

You should see a lot of activity in the Bun.serve process console, and you should see a response similar to this:

        {
            "ok": true,
            "hello": "world",
            "handledByWorker": 0,
            "messageObj": {
                "type": "/helloworld",
                "data": {
                    "method": "GET",
                    "headers": {
                        "accept": "*/*",
                        "host": "localhost:3000",
                        "user-agent": "curl/7.88.1"
                    },
                    "url": "http://localhost:3000/helloworld",
                    "hostname": "localhost",
                    "protocol": "http:",
                    "params": {},
                    "pathname": "/helloworld",
                    "query": {},
                    "cookies": {},
                    "routerPath": "/helloworld"
                },
                "qoper8": {}
            }
        }


In this test version we've deliberately returned the original *messageObj* object that was sent to the worker handler method, so we can see what it typically looks like.  You'll see that it has two properties:

- type: this will be the same as the routerPath value.  This property is for use internally by QOper8
- data: this contains a repackaged version of the incoming HTTP Request Object.  This repackaging is done by *mg-bun-router* and [described in its documentation](https://github.com/robtweed/mg-bun-router#specifying-routes).

Your API handler methods will need to decide what to do based on the contents of *messageObj.data: everything they need is in this object that is derived from the original incoming Request object.

If you try the GET /helloworld request again, you should see more activity in the Bun.serve process console, and if you look at the response, you should see that the *handledByWorker* value should be *0* again.  That's because the Child Process has been re-used by QOper8.

QOper8 Child Processes are not closed down after handling each request: they're left running and available for use by the next incoming requests.  This means there is no startup/tear-down overhead when using Child Processes with QOper8.


## Accessing YottaDB and IRIS from within a QOper8 Worker

### Background

The next step is to take a look at how to access YottaDB and/or IRIS from within a QOper8 Worker, via the *mg-dbx-napi* interface.

You've already seen how the *options* object passed to *mg-bun-router* included how to open a connection to YottaDB or IRIS, via the *mgdbx.open* sub-object.  In the previous example, even though we haven't actually used it, when the QOper8 Child Process Worker was started, QOper8 opened the connection to the database using the *options.mgdbx.open* credentials.

In doing so, it then made the *mg-dbx-napi* APIs available to you within your Worker Handler Module via:

- *this.use*: the recommended way to instantiate an instance of the *mg-dbx-napi* *mglobal* Class in order to access a specific Global.  This automatically provides a cached instance of the *mglobal* instance to ensure maximum performance of the associated APIs

- *this.mgdbx*: exposes all the *mg-dbx-napi* Classes and the opened *db* object, for more advanced use

### Example

Let's add a simple example to our Bun.serve script.  Extend the *workerHandlersByRoute* array in the *options* object to include a new route:

          workerHandlersByRoute: [
            {
              method: 'get',
              url: '/helloworld',
              handlerPath: 'getHelloWorld.mjs'
            },
            {
              method: 'post',
              url: '/user',
              handlerPath: 'createUser.mjs'
            }
          ]


Next, create and save the *createUser.mjs* Worker Handler Module:

        const handler = function(messageObj, finished) {

          if (!messageObj.data.body) {
            return finished({error: 'Invalid request'});
          }
          if (!messageObj.data.body.firstName || messageObj.data.body.firstName === '') {
            return finished({error: 'Missing first name'});
          }
          if (!messageObj.data.body.lastName || messageObj.data.body.lastName === '') {
            return finished({error: 'Missing last name'});
          }

          let person = this.use("Person");
          let key = person.increment('nextId', 1);
          person.set('data', key, 'firstName', messageObj.data.body.firstName);
          person.set('data', key, 'lastName', messageObj.data.body.lastName);

          finished({
            ok: true,
            key: key,
            handledByWorker: this.id,
          });
        };

        export {handler};


You'll notice that, by way of example, we're doing some basic validation of the incoming request contents.

### Try it Out

Stop and restart the Bun.serve script, and then try our new *POST /user* API, eg:

        curl -v -X POST -H "Content-Type: application/json" -d "{\"firstName\": \"Rob\", \"lastName\": \"Tweed\"}" http://localhost:3000/user


If you've done everything correctly, you should get a response such as:

        {"ok":true,"key":"1","handledByWorker":0}

If so, it appears that we've successfully saved a user record into the YottaDB or IRIS database.

Using the techniques 
[described in the earlier document](./DATABASE.md#examining-your-database-contents)
take a look for the Global named *Person*.  For example, on YottaDB using its interactive shell:

        YDB> zwr ^Person

        ^Person("data",1,"firstName")="Rob"
        ^Person("data",1,"lastName")="Tweed"
        ^Person("nextId")=4

Congratulations!  You've successfully created a user record in a Global Storage database!

Try re-running the *curl* POST command to create further records with different first and last names.

### Reading a User Record Back from the Database

Let's add another API to read back a specified user record.

You'll notice that response from the *POST /user* API included the value of the key assigned to the new record, in this case a value of 1:

        {"ok":true,"key":"1","handledByWorker":0}


Extend the *workerHandlersByRoute* array in the *options* object to include our new route:

          workerHandlersByRoute: [
            {
              method: 'get',
              url: '/helloworld',
              handlerPath: 'getHelloWorld.mjs'
            },
            {
              method: 'post',
              url: '/user',
              handlerPath: 'createUser.mjs'
            },
            {
              method: 'get',
              url: '/user/:id',
              handlerPath: 'getUser.mjs'
            }
          ]


Note that we'll use a parametric URL path for this one, specifying the user *id* as the second part of the path, eg:

          GET /user/1


Next, create and save the *getUser.mjs* Worker Handler Module:

        const handler = function(messageObj, finished) {

          if (!messageObj.data.params) {
            return finished({error: 'Invalid request'});
          }

          let id = messageObj.data.params.id;
          if (!id || id === '') {
            return finished({error: 'Missing id'});
          }

          let person = this.use("Person");
          let exists = +person.defined('data', id);
          if (exists !== 0) {
            finished({
              document: {
                firstName: person.get('data', id, 'firstName'),
                lastName: person.get('data', id, 'lastName')
              }
            });
          }
          else {
            finished({error: 'No record exists with id ' + id});
          }
        };

        export {handler};

### Try it Out

Stop and restart the Bun.serve script, and then try our new *GET /user/:id* API, eg:

        curl http://localhost:3000/user/1

You should get the response:

        {"document":{"firstName":"Rob","lastName":"Tweed"}}

----

### Further Use of the *mg-dbx-napi* APIs

Feel free to try out more of the *mg-dbx-napi* APIs by creating more APIs and/or amending the examples above.  Further use is beyond the scope of this document: you should consult the
[*mg-dbx-napi* documentation](https://github.com/chrisemunt/mg-dbx-napi).


### Introducing *glsdb*

You'll probably have already noticed that the *mg-dbx-napi* APIs provide a low-level access interface to the underlying Global Storage technology.  We have also created an alternative way of using YottaDB and IRIS, by layering on top of *mg-dbx-napi* an abstraction that we have named 
[*glsdb*](https://github.com/robtweed/glsdb).

*glsdb* has been designed to be JavaScript-centric, abstracting the underlying YottaDB and/or IRIS databases as persistent JSON stores: in effect creating persistent JavaScript objects that can closely mimic the behaviour of in-memory JavaScript objects.

In the next document, we'll look at how you can use *glsdb* instead of the underlying *mg-dbx-napi* interface within a Bun.serve back-end.


----


