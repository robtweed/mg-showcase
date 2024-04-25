# Introduction to *mg_web* for ObjectScript and M Developers

## Background

[*mg_web*](https://github.com/chrisemunt/mg_web) provides a high-performance minimalistic interface between three popular web servers ( Microsoft IIS, Apache and Nginx ) and a choice of either Global Storage Database Servers (eg YottaDB and InterSystems IRIS ) or JavaScript.

In this document, we're going to focus on the former use-case, where *mg_web* uses YottaDB or IRIS as its connected server.  If you're more interested in its use with JavaScript, this is [documented elsewhere](./MGWEB.m).

When connected directly to YottaDB or IRIS, it allows the back-end handling to be written in either M code (if you're using YottaDB) or ObjectScript (if you're using IRIS).  

Of course, ObjectScript is a superset of the M language, so handlers written in standard M code will run identically on both YottaDB and IRIS servers, but users of IRIS can optionally also make use of all its proprietary extensions such as Objects, Classes and SQL.

## Try it Out

The *mg-showcase* Containers are pre-configured with some working demonstrations of REST APIs, so let's try them out.

Everything should be ready to run as soon as you've started your *mg-showcase* Container.  The examples run identically with both YottaDB and IRIS.

There are three REST APIs configured on your Container:

- *GET /mgwm/helloworld*: a simple "do-nothing" API that is handled within the YottaDB or IRIS server
- *POST /mgwm/save*: creates a simple Person record with a unique Id
- *GET /mgwm/user/:userId*: returns a Person record with a specified Id

All three can be invoked from within the Container using, for example, *curl*.

However, if you started the Container with port 8080 mapped to the host, you can invoke *curl* on the host system too.


### Hello World

First let's try out a simple "hello world" API.  For example, using *curl*

```console
curl http://localhost:8080/mgwm/helloworld
```

This should return a JSON response:

```javascript
{"hello": "world"}
```

### Create a Person Record

Now let's try one of the APIs that actually uses Global Storage:

```console
curl -v -X POST -H "Content-Type: application/json" -d "{\"firstName\": \"Chris\",\"lastName\": \"Munt\"}" http://localhost:8080/mgwm/save
```

You should get back a JSON response:

```javascript
{
  "id": 1,
  "ok": true
}
```

Try taking a look at a Global named *^Person* from within a terminal session, eg:

- YottaDB: *zwr ^Person*
- IRIS: *zw ^Person*

You should see something like this:

```console
^Person("data",1,"firstName")="Chris"
^Person("data",1,"lastName")="Munt"
^Person("nextId")=1
```

> Note: [See here](#running-an-m-or-objectscript-terminal-session) to start a terminal session in your Container


You can try invoking the API again with a different name, eg:

```console
curl -v -X POST -H "Content-Type: application/json" -d "{\"firstName\": \"Rob\",\"lastName\": \"Tweed\"}" http://localhost:8080/mgwm/save
```

and you should see a response showing that an *id* of 2 has been allocated:

```javascript
{
  "id": 2,
  "ok": true
}
```

and the *^Person* Global should now look like this:

```console
^Person("data",1,"firstName")="Chris"
^Person("data",1,"lastName")="Munt"
^Person("data",2,"firstName")="Rob"
^Person("data",2,"lastName")="Tweed"
^Person("nextId")=2
```

Now try leaving out one of the properties, eg:

```console
curl -v -X POST -H "Content-Type: application/json" -d "{\"lastName\": \"Smith\"}" http://localhost:8080/mgwm/save
```

This time you should see an error response with an HTTP status code of 422:

```javascript
{"error":"Missing or empty firstName"}
```

### Return a Specified Person Record

Now we can try fetching one of the saved *^Person* records:

```console
curl http://localhost:8080/mgwm/user/1
```

You should see the response:

```javascript
{
  "data":{
    "firstName":"Chris",
    "lastName":"Munt"
  },
  "key":1
}
```

or try:

```console
curl http://localhost:8080/mgwm/user/2
```

You should see the response:

```javascript
{
  "data":{
    "firstName":"Rob",
    "lastName":"Tweed"
  },
  "key":2
}
```

If you try this:

```console
curl http://localhost:8080/mgwm/user/
```

You should get back an error response:

```javascript
{"error":"User Id not defined"}
```

or if you try a non-existent user Id:

```console
curl http://localhost:8080/mgwm/user/99
```

You should get back an error response:

```javascript
{"error":"No such user in the database"}
```

### Using Invalid Routes

If you try any other */mgwm/* route, you should get an error, eg:

```console
curl http://localhost:8080/mgwm/xxxx
```

should return an error response:

```javascript
{"error":"Resource Not Found"}
```


## Performance and Benchmarks

You'll find that *mg_web* is extremely fast.  This is for several reasons:

- its internal design
- its low-level, generic interface
- the inherently high performance of NGINX
- the use of an in-process API connection between NGINX and YottaDB or IRIS, providing the least possible round-trip path
- the inherently high performance of the M or ObjectScript language and the YottaDB or IRIS database

Whilst most Web Frameworks 
[significantly slow down when accessing a database](https://github.com/robtweed/mg-showcase/blob/master/MGWEB.md#the-problem-with-javascript-web-frameworks), you'll find that *mg_web* runs faster than most of the fastest JavaScript Web Frameworks when they're only returning a "do nothing" response!

Don't just take our word for it: take a look for yourself on your own *mg-showcase* Container:

First, I'd recommend that you try changing the number of NGINX Workers.  The optimum number will depend on the platform you're running the Container on, but on our M1 Mac Mini, we get best results with 4 workers.  To change the number of workers, make sure you're in the *home/default* directory:

- YottaDB: */opt/mgateway*
- IRIS: */home/irisuser*

Then type (change the number as required):

```console
./nginx workers 4
```

NGINX will automatically reload after changing the number of workers.

Now try the *hello world* API using *autocannon*.  Once again you may need to try altering the number of connections (the *-c* argument) for optimum throughput, but on our M1 Mac Mini:

```console
autocannon -c 32 -d 5 http://localhost:8080/mgwm/helloworld
```

Our results on our M1 Mac Mini are:

  |               | Rate/sec   |
  |---------------|------------|
  | YottaDB       |  80,000    |
  | IRIS          |  62,000    |


It's interesting just how much faster YottaDB is compared with IRIS when used with *mg_web*!


Now of course, the *hello world* API doesn't actually access any data within the database, so let's try using the
*GET /mgwm/user/:userId* API to access and fetch data from YottaDB or IRIS:

```console
autocannon -c 32 -d 5 http://localhost:8080/mgwm/user/1
```

Unsurprisingly there's a bit of a performance reduction, but the results are still significantly better than for any equivalent JavaScript Web Framework when accessing a database:


  |               | Rate/sec   |
  |---------------|------------|
  | YottaDB       |  66,000    |
  | IRIS          |  50,000    |


Once again, YottaDB returns the better performance, at least on our test platform.


## Configuration: How The Examples Work

In order to understand how and why the examples described above actually worked, we need to look at the *mg_web* configuration.

There are several layers to the configuration needed to make *mg_web* work with NGINX and either YottaDB or IRIS.  Let's now take a deep dive into the configuration used in the *mg-showcase* Containers.

### NGINX

The first layer is within NGINX itself, and there are two parts to this:

- When you build your *mg-showcase* Container, the *mg_web* repository is downloaded from Github and NGINX is built with the *mg_web* add-on module.  If you look in the Dockerfile you'll see this taking place.  If you want to create your own non-Dockerised *mg-web* system, adapt this code from the Dockerfile, eg:

```console
RUN cd /opt \
  && wget https://nginx.org/download/nginx-1.25.4.tar.gz \
  && tar zxf nginx-1.25.4.tar.gz \
  && cd nginx-1.25.4 \
  && CFLAGS=-Wno-error ./configure --prefix=/var/www/html --sbin-path=/usr/sbin/nginx --conf-path=/etc/nginx/nginx.conf --http-log-path=/var/log/nginx/access.log --error-log-path=/var/log/nginx/error.log --with-pcre --lock-path=/var/lock/nginx.lock --pid-path=/var/run/nginx.pid --with-http_ssl_module --with-http_image_filter_module=dynamic --modules-path=/etc/nginx/modules --with-http_v2_module --with-stream=dynamic --with-http_addition_module --with-http_mp4_module --with-threads --add-module=/opt/mg_web \
  && make \
  && make install
```

- The NGINX configuration file which you'll find in your Container as */etc/nginx/nginx.conf* includes directives to initialise and use *mg_web* as well as URL/Location directives that instruct NGINX to hand off their processing to *mg_web*.  You can see the source code here:

  - [YottaDB](./dockerfiles/yottadb/files/nginx.conf)
  - [IRIS](./dockerfiles/iris/files/nginx.conf)

  Here are the key pieces (from the YottaDB version, but the IRIS version is comparable, just using different file paths):

```console
    # Enable mg_web

    MGWEBConfigFile /opt/mgateway/mgweb.conf;
    MGWEBLogFile /opt/mgateway/mgweb.log;
```
  and the routing/redirection directive

```console
        location /mgwm {
          MGWEB On;
          MGWEBThreadPool default;
        }
```

  As a result, all incoming URLs prefixed by */mgwm/* will be forwarded by NGINX to *mg_web* for processing.

  You'll see that we've told NGINX that the details of how to handle these URLs is in the *mg_web* configuration file (*mgweb.conf*) which takes us to the second configuration layer.

### *mgweb.conf*

The second layer is defined in the *mgweb.conf* file.  You'll find this in your Container:

- YottaDB: /opt/mgateway/mgweb.conf
- IRIS: /home/irisowner/mgweb.conf

You can see the source code for these configuration files here:

- [YottaDB](./dockerfiles/yottadb/files/mgweb.conf)
- [IRIS](./dockerfiles/iris/files/mgweb.conf)

There are two key pieces to notice in this configuration file.

- the *location* directive
- the *server* directive

#### Location Directive

The *location* Directive specifies the URL route(s) that will be handled by *mg_web*.  

We've already seen above that NGINX has been told to forward all URLs prefixed by */mgwm*.  So you'll see a corresponding directive in the *mgweb.conf* file.  For example, in the YottaDB version:

```console
<location /mgwm>
 function api^%zmgweb
 servers ydbapi
</location>
```

This is telling *mg_web* to do two things with all URLs prefixed by */mgwm*:

- to pass all the matching incoming requests to a server named *ydbapi* for processing
- on that server, process them using the handler function that is specified here as *api^%zmgweb* which, of course, is an M (or ObjectScript) extrinsic function.

The *ydbapi* server is defined in a Server directive as described below.

#### Server Directive

The *ydbapi* Server is defined as follows:

```console
<server ydbapi>
 type YottaDB
 path /usr/local/lib/yottadb/r138
 <env>
   ydb_gbldir=/opt/yottadb/yottadb.gld
   ydb_routines=/opt/mgateway/m /usr/local/lib/yottadb/r138/libyottadbutil.so
   ydb_ci=/usr/local/lib/yottadb/r138/zmgsi.ci
 </env>
</server>
```

In this case, it's telling *mg_web* to make an API connection to the YottaDB installation in our *mg-showcase* Container.

If you're using the IRIS Container, you'll see that it uses a Server named *irisapi* which makes an equivalent API connection to the IRIS installation.


### The Handler Function: Introducing *mgweb-server*.

You've seen above that in both the YottaDB and IRIS Containers, URLs prefixed by */mgwm/* are passed to the YottaDB or IRIS database for processing, and that the processing is done by an extrinsic function: *api^%zmgweb*.

This function is actually another one of our products: [*mgweb-server*](https://github.com/robtweed/mgweb-server).

The *mg_web* API for handling incoming requests and returning outgoing responses is deliberately a very low-level one.  This makes it entirely generic, allowing it to be adapted in whatever way you wish.  It also makes it highly performant.

However, the developer experience is not ideal if using the raw *mg_web* API.  Since much of the use of *mg_web* will be to handle REST APIs, we've created *mgweb-server* to create a quicker and simpler, and hopefully more intuitive developer experience.

The full details of how to use *mgweb-server* are explained in its 
[documentation](https://github.com/robtweed/mgweb-server).  However, we'll summarise what's going on in our examples and how they've been implemented using *mgweb-server*.

To use *mgweb-server*, you always specify *api^%zmgweb* as the function in an *mgweb.conf* Location directive.

You then need to define the next configuration level, which tells this *mgweb-server* function how to route the REST APIs you're interested in.

### *mgweb-server* Routes

*mgweb-server* Routes are defined in a Global named *^%zmgweb*.

If you look at this Global using, eg *zwr ^%zmgweb* on YottaDB (or using the zw command on IRIS), you'll see these nodes:

```console
^%zmgweb("routes","GET","/mgwm/helloworld")="helloworld^%zmgwebExamples"
^%zmgweb("routes","GET","/mgwm/user/:userId")="getUser^%zmgwebExamples"
^%zmgweb("routes","POST","/mgwm/save")="save^%zmgwebExamples"
```

These were automatically set up for you when you started your *mg-showcase* container.

- The second subscript in the Global is the HTTP Method to match
- The third subscript in the Global is the URL Path to match.  This can be parametric if required (eg the second one has a variable sub-path *:userId*)
- The data value is the M/ObjectScript function that will handle matching routes.

You can add/edit routes by modifying this Global directly, but you may find it easier to define and edit them using a JSON file.  If you look in your Container's Home/Default directory, you'll see the one we use: *mgweb-routes.json*.  You'll see that it contains the same information above only in JSON format:

```javascript
[
  {
    "uri": "/mgwm/helloworld",
    "method": "GET",
    "handler": "helloworld^%zmgwebExamples"
  },
  {
    "uri": "/mgwm/save",
    "method": "POST",
    "handler": "save^%zmgwebExamples"
  },
  {
    "uri": "/mgwm/user/:userId",
    "method": "GET",
    "handler": "getUser^%zmgwebExamples"
  }
]
```

If you modify its contents, you can rebuild the Global by running in a terminal session:

```console
 d buildRoutes^%zmgwebExamples
```

Or, if you want to use a different JSON file, eg in your mapped folder:

```console
 w $$buildAPIs^%zmgwebUtils("/opt/mgateway/mapped/my-own-routes.json")
```

> Note: [See here](#running-an-m-or-objectscript-terminal-session) to start a terminal session in your Container


### *mgweb-server* Handler Functions

#### Hello World

Let's first take a look at the very simple handler for the *GET /mgwm/helloworld* route: *helloworld^%zmgwebExamples*.  You can see the source code here:

- [YottaDB](./dockerfiles/yottadb/files/_zmgwebExamples.m)
- [IRIS](./dockerfiles/iris/files/zmgwebExamples.ro)

In both cases the code is the same:

helloworld(req) ;
 n res
 s res("hello")="world"
 QUIT $$response^%zmgweb(.res)
 ;


*mgweb-server* assumes you're always using JSON requests and responses (ie with a */application/json* Content Type), and provides automatic mapping between local arrays and a corresponding JSON structure.

The *req* argument is a pre-parsed local array containing all the relevant parts of the incoming HTTP request.  In this case we're ignoring it, but we'll see it in more detail later.

The JSON response is created by creating a local array named *res*, in this case:

```console
 s res("hello")="world"
```

This will be automatically mapped by the *$$response^%zmgweb()* function to a corresponding JSON structure:

```javascript
{"hello": "world"}
```

and returned as the response to *mg_web* and hence to NGINX which forwards it to the awaiting HTTP Client.


#### Creating a Person Record

Now let's look at the handler for the *POST /mgwm/save* API: : *save^%zmgwebExamples*.

It's a little more complex as it needs to validate the incoming request and return errors if invalid, or, if everything is OK, save the incoming data to a Global named *^Person*.

The idea is that we'll POST a request, eg if we're using *curl*:

```console
curl -v -X POST -H "Content-Type: application/json" -d "{\"firstName\": \"Chris\",\"lastName\": \"Munt\"}" http://localhost:8080/mgwm/save
```

The request has to include a JSON payload that includes properties named *firstName* and *lastName*.  Here's the handler:

```console
save(req) ;
 n errors,id,res
 ;
 i '$d(req("body")) d  QUIT $$errorResponse^%zmgweb(.errors)
 . s errors("error")="Missing or empty body"
 ;
 i '$d(req("body","firstName")) d  QUIT $$errorResponse^%zmgweb(.errors)
 . s errors("error")="Missing or empty firstName"
 ;
 i '$d(req("body","lastName")) d  QUIT $$errorResponse^%zmgweb(.errors)
 . s errors("error")="Missing or empty lastName"
 ;
 s id=$increment(^Person("nextId"))
 m ^Person("data",id)=req("body")
 s res("id")=id
 s res("ok")="true"
 QUIT $$response^%zmgweb(.res)
 ;
```

In this case we're interested in the incoming POST'ed *body* contents which should be in the pre-parsed *req* local array: *req("body")*.

You can see that we first check that the body exists, and if it does, that it contains a *firstName* and *lastName* property.  Note how the incoming JSON body contents:

```javascript
{
  "firstName": "Chris",
  "lastName": "Munt"
}
```

will have been automatically converted to an equivalent local array structure for you:

```console
   req("body","firstName")="Chris"
   req("body","lastName")="Munt"
``` 

You can see that error responses are generated and returned using *$$errorResponse^%zmgweb(.errors)*, where *errors* is a local array that is mapped to corresponding JSON.

If the incoming request is valid, then we increment an *id* counter and merge the body contents to the *^Person("data",id)* Global record, before returning the *id* in the JSON response.


#### Fetching a Person Record

Finally, let's look at the handler for the *GET /mgwm/user/:userId* API: : *getUser^%zmgwebExamples*.

The code is hopefully now fairly understandable:

```console
getUser(req) ;
 n errors,id,res
 ;
 s userId=$g(req("params","userId"))
 i userId="" d  QUIT $$errorResponse^%zmgweb(.errors)
 . s errors("error")="User Id not defined"
 ;
 i '$D(^Person("data",userId)) d  QUIT $$errorResponse^%zmgweb(.errors)
 . s errors("error")="No such user in the database"
 ;
 m res("data")=^Person("data",userId)
 s res("key")=userId
 QUIT $$response^%zmgweb(.res)
 ;
```

We'd invoke this using a URL such as:

```console
  curl http://localhost:8080/mgwm/user/1
```

Which would return the record for a ^Person with a *userId* of 1.

The key thing to note here is that the parametric URL subpath (:userId) is made available to you as *req("params","userId")*.

After first checking that a UserId has been specified and that a corresponding record exists in the database, the contents are merged from the ^Person global to the *res* local array and returned as JSON by *mgweb-server's* *$$response^%zmgweb(.res)* function.


### Handling Invalid Routes

*mgweb-server* automatically handles invalid routes for you.  Only the routes you specifically define will be handled.  Trying to invoke any other URL route will return a 404 error with the JSON payload:

```javascript
{"error":"Resource Not Found"}
```
----

## Running an M or ObjectScript Terminal Session

To start a terminal session in your Container

- YottaDB:

  Make sure you're in the *default* directory (*/opt/mgateway*), then type:

```console
./ydb
```

- IRIS

  From any directory type:

```console
iris terminal IRIS
```

In both cases, type H followed by the *Enter* key to return to the Container's *bash* shell.

----


