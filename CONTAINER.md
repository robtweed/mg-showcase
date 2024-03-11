# Using the mg-showcase Repository Containers

## Overview

The three Containers included in the *mg-showcase* repository are designed to work in essentially the same way, irrespective of the database and/or operating system you choose.

The concept behind the Containers is that you start them up either as an interactive/foreground process or as a daemon/background process, and then access them and use their built-in functionality by shelling-in to them via other processes.  The Containers therefore provide a run-time environment for our technologies that you can use, adapt and, if you want, conveniently and cleanly get rid of, without any changes being necessary to your host system other than having Docker installed.

Each container includes pre-installed copies of all our JavaScript-based tools and utilities, and also includes a number of pre-built demonstrators.  These include web/HTTP server based utilities and demonstrators that can be accessed externally via a browser or other HTTP client.

However, you can also make use of our Containers as a run-time environment for your own applications that build on and make use of our technologies.


## Starting/Running the Containers

- [YottaDB Container](https://github.com/robtweed/mg-showcase/blob/master/INSTALL.md#running-the-container)
- [IRIS Container for X64](https://github.com/robtweed/mg-showcase/blob/master/INSTALL.md#running-the-container-1)
- [IRIS Container for ARM64](https://github.com/robtweed/mg-showcase/blob/master/INSTALL.md#running-the-container-2)


## Shelling into the Containers

To start a shell process within any of the Containers:

      docker exec -it mg-showcase bash

- Note: change *mg-showcase* appropriately if you used a different name for the Container when you started it


You'll be placed in the working directory:

- YottaDB Container: */opt/mgateway*
- IRIS Containers: */home/irisowner*


To exit the shell process and return to the host:

      exit


## Stopping the Containers

### YottaDB Container

Before stopping the Container, it is important that you first close down all processes that might be accessing the YottaDB database, and then run-down the database.  Failure to carry out these steps can result in database degradation that can be difficult and time-consuming to resolve.

So, before stopping the Container, [shell into it](#shelling-into-the-containers) and make sure you're in the
correct working directory (*/opt/mgateway*)

Then type:

        ./stop_ydb


You can now exit the shell process and stop the Container from a host process:

        docker stop mg-showcase

----

### IRIS Container

The IRIS containers automatically clean up any open database connections before shutting down.

You can therefore simply stop your IRIS Container from a host process using:

        docker stop mg-showcase


----

## Using A Mapped Volume


Our recommended command for running/starting the *mg-showcase* Containers includes mapping a host directory:

- YottaDB Container:

        -v ~/yottadb-vol:/opt/mgateway/mapped


- IRIS Containers:

        -v ~/iris-vol:/home/irisowner/mapped

The reason for this is that although the Containers include pre-installed demonstrations, you can also extend/customise the Container and build out your own applications using the technologies that we have included in the Container.  You can do this customisation by creating files and building out your application logic in your mapped host directory/volume.

If you shell into the Container, you'll find your mapped volume at:

- YottaDB Container:

        /opt/mgateway/mapped

- IRIS Containers:

        /home/irisowner/mapped


Of course if you stop your Container, all the files you create in the */mapped* directory will persist in the host volume and will be available again whenever you restart the Container.

Our Containers therefore provide you with a pre-installed and pre-configured re-usable and disposable run-time environment upon which you can design and build your own applications.

