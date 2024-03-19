# Tutorial: Getting Started with the mg-dbx-napi Interface

## Background

If you tried out our simple key/value pair benchmark demonstration, you were actually running a simple Node.js script that made use of basic *mg-dbx-napi* interface calls.

You can take a look at the source code which is a good and simple example of how you can use the *mg-dbx-napi* interface to access the YottaDB or IRIS datbases:

- [YottaDB](./dockerfiles/yottadb/files/bm_mgdbxnapi.mjs)
- [IRIS](./dockerfiles/iris/files/bm_mgdbxnapi.mjs)

The *mg-dbx-napi* APIs are fully documented in its [Github Repository](https://github.com/chrisemunt/mg-dbx-napi), but let's quickly take a look at how you can get started with it from within the *mg-showcase* Container.  You can then use the main documentation for a more in-depth understanding.

## Using the Mapped Directory for your Work

The simple key/value pair benchmark example is installed into the Container at build time.  Each time you restart the Container, a fresh copy of it is used.  Basically, any files in the default directories will be replaced with new copies whenever the Container is restarted.  This means that you shouldn't create your own files in these directories:

- YottDB Container: /opt/mgateway
- IRIS Container: /user/irisowner

If you do create your own files within these directories, and/or edit any of the files we provide within these directories, your work will disappear if you stop and restart the Container.

Instead, you should create your own files in the */mapped* subdirectory of these directories: you mapped this host system directory into the Container when you started it: that was the purpose of the *-v* parameter, eg:

        -v ~/yottadb-vol:/opt/mgateway/mapped

        -v ~/iris-vol:/home/irisowner/mapped


The great thing about a mapped Docker directory is that you can actually create and edit files within it using your favourite editor on the host system: you don't have to create and edit them from within the Container's processes.  Any file that you create in the mapped directory on the host is immediately available to the Container's run-time environment, and any edit you make to a file in the mapped directory from within the host system is automatically and immediately available within the Container.

Furthermore, each time you stop and restart the Container, provided you re-map the same host system directory, your files will be available again within the COntainer.

## Getting Started

So let's create a JavaScript/Node.js script file in your mapped directory.  Use your favourite editing tool for this.  I'm going to call my script file *mgdbx.mjs*.  I'm using a file extension of *.mjs* because it needs to import a Node.js module.

The first thing we need to do is to import the *mg-dbx-napi* module:

        import {server, mglobal} from 'mg-dbx-napi';  

For our example we just need the *server* and *mglobal* classes.

We then need to create a *server* instance:

        const db = new server();

Now we're ready to connect to the database.  We have a choice of connections:

- network connection
- in-process API connection

For this example we're going to use the much faster API connection.  The way we open the connection is a little different for the two databases: YottaDB and IRIS.  Make sure you use the parameter values exactly as shown which match the Container configuration of each database:

- YottaDB:

        db.open({
          type: "YottaDB",
          path: "/usr/local/lib/yottadb/r138",
          env_vars: {
            ydb_gbldir: '/opt/yottadb/yottadb.gld',
            ydb_routines: '/opt/mgateway/m /usr/local/lib/yottadb/r138/libyottadbutil.so',
            ydb_ci: '/usr/local/lib/yottadb/r138/zmgsi.ci'
          }
        });

- IRIS:

        db.open({
          type: "IRIS",
          path:"/usr/irissys/mgr",
          username: "_SYSTEM",
          password: "secret",
          namespace: "USER"
        });


OK we're now ready to access the databases.

One thing you should be aware of: *mg-dbx-napi* is a low-level interface which accesses the raw database structures which are known as *Globals*.  In order to understand its APIs and how and why you use them, you need to have a good understanding of Globals.  A detailed discussion about Globals is outside the scope of this tutorial, but if you want to find out more you should take a look at the documentation provided by the vendors of YottaDB and IRIS.

For the purpose of this quick tutorial, let's just create a simple Global structure:

First create an instance of the Global class:

        let employee = new mglobal(db, 'employee');

Now we can create a simple employee record, eg:

        employee.set(123, 'name', 'Rob Tweed');
        employee.set(123, 'office', 'London');

Finally we'll close the database connection

        db.close();

## Summary

Putting this together, our script file looks like this:

- YottDB:

        import {server, mglobal} from 'mg-dbx-napi'; 
        const db = new server();
        db.open({
          type: "YottaDB",
          path: "/usr/local/lib/yottadb/r138",
          env_vars: {
            ydb_gbldir: '/opt/yottadb/yottadb.gld',
            ydb_routines: '/opt/mgateway/m /usr/local/lib/yottadb/r138/libyottadbutil.so',
            ydb_ci: '/usr/local/lib/yottadb/r138/zmgsi.ci'
          }
        });
        let employee = new mglobal(db, 'employee');
        employee.set(123, 'name', 'Rob Tweed');
        employee.set(123, 'office', 'London');
        db.close();

- IRIS:

        import {server, mglobal} from 'mg-dbx-napi'; 
        const db = new server();
        db.open({
          type: "IRIS",
          path:"/usr/irissys/mgr",
          username: "_SYSTEM",
          password: "secret",
          namespace: "USER"
        });
        let employee = new mglobal(db, 'employee');
        employee.set(123, 'name', 'Rob Tweed');
        employee.set(123, 'office', 'London');
        db.close();


## Run the Script

We can now run it.  Connect to your Container, eg:

        docker exec -it mg-showcase bash

Change to the */mapped* sub-directory:

        cd mapped

Now run your script:

        node mgdbx.mjs

It should run silently without error.

By the way: you'll find that you can also run this script using Bun.js, without any changes being necessary:

        bun mgdbx.mjs


## Check the Results in the Database


Now let's check what it's done:

First, go back to the default directory:

        cd ..

Now ue the *g* utility to view a Global Document named *employee*:

        ./g employee

You should see:

        ^employee[ 123 ]

It's showing you that the Global Document does indeed exist, and it has a single first subscript: *123*.

Now you can drill down to the next level:

        ./g employee.123

and now you should see:

        ^employee[ 123, name ] = "Rob Tweed"
                        office ] = "London"

and there are the records you created in the script!


## Script to Read the Database Records

Let's now write another Node.js script to read back these records.  We'll name this file *mgdbx2.mjs*:

- YottaDB:

        import {server, mglobal} from 'mg-dbx-napi'; 
        const db = new server();
        db.open({
          type: "YottaDB",
          path: "/usr/local/lib/yottadb/r138",
          env_vars: {
            ydb_gbldir: '/opt/yottadb/yottadb.gld',
            ydb_routines: '/opt/mgateway/m /usr/local/lib/yottadb/r138/libyottadbutil.so',
            ydb_ci: '/usr/local/lib/yottadb/r138/zmgsi.ci'
          }
        });
        let employee = new mglobal(db, 'employee');
        let name = employee.get(123, 'name');
        let office = employee.get(123, 'office');
        console.log({name, office});
        db.close();

- IRIS:

        import {server, mglobal} from 'mg-dbx-napi'; 
        const db = new server();
        db.open({
          type: "IRIS",
          path:"/usr/irissys/mgr",
          username: "_SYSTEM",
          password: "secret",
          namespace: "USER"
        });
        let employee = new mglobal(db, 'employee');
        let name = employee.get(123, 'name');
        let office = employee.get(123, 'office');
        console.log({name, office});
        db.close();

Let's try running it:

        cd mapped
        node mgdbx2.mjs

And you should see:

        { name: 'Rob Tweed', office: 'London' }


Congratulations!  You now have two basic examples of how to use the *mg-dbx-napi* interface.









