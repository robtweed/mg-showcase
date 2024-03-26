# Using *glsdb* with Fastify

## Introduction

In the previous [tutorial document](./TUTORIAL-MGDBX-FASTIFY.md) we looked at how you can use the YottaDB and IRIS databases via the extremely high-performance *mg-dbx-napi* APIs within a Node.js / Fastify-based back-end.

This tutorial builds on that document, but focuses instead on the use of the higher-level abstraction of the YottaDB and IRIS databases provided by our [*glsdb*](https://github.com/robtweed/glsdb) technology.

*glsdb* has been designed to be JavaScript-centric, abstracting the underlying YottaDB and/or IRIS databases as persistent JSON stores: in effect creating persistent JavaScript objects that can closely mimic the behaviour of in-memory JavaScript objects.  You can [read about *glsdb* in more detail here](https://github.com/robtweed/glsdb).

## Getting Started

We can make use of the same Fastify script that we created in the previous tutorial:

- YottaDB:

        import Fastify from 'fastify';
        import QOper8 from 'qoper8-fastify';

        const fastify = Fastify({
          logger: true
        });

        const options = {
          mode: 'child_process',
          logging: true,
          poolSize: 2,
          exitOnStop: true,
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
        };

        fastify.register(QOper8, options);

        fastify.get('/local', function (req, reply) {
          reply.send({
            api: '/local',
            ok: true,
            from: 'Fastify'
          });
        });

        fastify.setNotFoundHandler((request, reply) => {
          let error = {error: 'Not found: ' + request.url};
          reply.code(404).type('application/json').send(JSON.stringify(error));
        });

        await fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
          if (err) {
            fastify.log.error(err)
            process.exit(1)
          }
        });


- IRIS:

- YottaDB:

        import Fastify from 'fastify';
        import QOper8 from 'qoper8-fastify';

        const fastify = Fastify({
          logger: true
        });

        const options = {
          mode: 'child_process',
          logging: true,
          poolSize: 2,
          exitOnStop: true,
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
        };

        fastify.register(QOper8, options);

        fastify.get('/local', function (req, reply) {
          reply.send({
            api: '/local',
            ok: true,
            from: 'Fastify'
          });
        });

        fastify.setNotFoundHandler((request, reply) => {
          let error = {error: 'Not found: ' + request.url};
          reply.code(404).type('application/json').send(JSON.stringify(error));
        });

        await fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
          if (err) {
            fastify.log.error(err)
            process.exit(1)
          }
        });


Note that these two versions of *fastify.mjs* are identical apart from the *options.mgdbx.open* credentials.


Since all the actual database access occurs within QOper8 Worker Handler modules, we simply need to change the two module files: *createUser.mjs* and *getUser.mjs*.

### createUser.mjs

Edit this file to look like this:

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

          let personIdDoc = new this.glsdb.node('Person.nextId');
          let personDoc = new this.glsdb.node('Person.data');
          let key = personId.increment();
          person.$(key).document = messageObj.data.body;

          finished({
            ok: true,
            key: key,
            handledByWorker: this.id,
          });
        };

        export {handler};


You can see that QOper8 makes *glsdb* automatically available to you via *this.glsdb* within your QOper8 Worker Handler modules.

The *glsdb* logic will behave exactly like the original low-level *mg-dbx-napi* API-based logic, but now we can make use of the higher-level *gladb* APIs that are available for instances of a *glsdb Node*.

So essentially we're creating two *glsdb Node* objects, one for accessing the *data* property of the *Person* Global Document, and the other for accessing its *nextId* property.

We allocate a new key by incrementing the *nextId* Node, and then map the contents of the incoming request body JSON directly into the *data* Node by applying its *document* setter. 


### getUser.mjs

Edit this file to look like this:

        const handler = function(messageObj, finished) {

          if (!messageObj.data.params) {
            return finished({error: 'Invalid request'});
          }

          let id = messageObj.data.params.id;

          if (!id || id === '') {
            return finished({error: 'Missing id'});
          }

          let person = new this.glsdb.node('Person.data.' + id);

          if (person.exists) {
            finished({
              document: person.document
            });
          }
          else {
            finished({error: 'No record exists with id ' + id});
          }
        };

        export {handler};


You can hopefully see in this module how much more succinct the *glsdb* syntax is than the *mg-dbx-napi* APIs.  We're doing exactly the same thing as the previous *mg-dbx-napi* version, but now, having instantiated the *glsdb* Node for the specified Person id, we can simply return its data by using its *document* getter to return it as JSON.

### Try it Out

Stop and restart the Fastify script, and then try our new *glsdb*-based *POST /user* API, eg:

        curl -v -X POST -H "Content-Type: application/json" -d "{\"firstName\": \"Rob\", \"lastName\": \"Tweed\"}" http://localhost:3000/user


If you've done everything correctly, you should get a similar response to the previous *mg-dbx-napi* version:

        {"ok":true,"key":"2","handledByWorker":0}


Now try the *GET /user/:id* API:

        curl http://localhost:3000/user/1

You should get the same response as before:

        {"document":{"firstName":"Rob","lastName":"Tweed"}}

----

## An Even Higher-Level Abstraction

*glsdb* has a further trick up its sleeve.  You can optionally make use of an even higher-level abstraction which, by making use of Proxy Objects, allows you to treat data stored in YottaDB and/or IRIS as persistent JavaScript Objects that are essentially indistinguishable in use from in-memory object.

Once again you can find out the full details of this 
[Proxy-based abstraction here](https://github.com/robtweed/glsdb#the-global-storage-proxy-api)

For now we'll just modify our example *createUser.mjs* and *getUser.mjs* module files to get you started on how to use this abstraction within a Fastify back-end.

### createUser.mjs

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

          let person = new this.glsdb.node('Person').proxy;
          let key = person.nextId++;
          person.data[key] = messageObj.data.body;

          finished({
            ok: true,
            key: key,
            handledByWorker: this.id,
          });
        };

        export {handler};

### getUser.mjs

        const handler = function(messageObj, finished) {

          if (!messageObj.data.params) {
            return finished({error: 'Invalid request'});
          }

          let id = messageObj.data.params.id;

          if (!id || id === '') {
            return finished({error: 'Missing id'});
          }

          let person = new this.glsdb.node('Person.data').proxy;

          if (Object.hasOwn(person, id)) {
            finished({
              document: person[id].valueOf()
            });
          }
          else {
            finished({error: 'No record exists with id ' + id});
          }
        };

        export {handler};

### Try it Out

Stop and restart the Fastify script, and then try the POST /user and GET /user:id APIs again.  They should behave identically, but this time you're using the much higher-level *glsdb* proxy abstraction.

As you can see from the examples above, the *glsdb* proxy objects are barely distinguisable from in-memory JavaScript objects in terms of their behaviour and the syntax you use with them, but if you check in the YottaDB or IRIS database, you will see that they are, indeed, accessing on-disk data!

You are now invited to try creating your own, more complex, QOper8 Worker Handler Modules, making use of some more of the *glsdb* functionality.



----