# Installing the mg-showcase Repository Containers

These instructions describe the steps needed to install the *mg-showcase* repository Containers on your system.


# Pre-Requisites

You'll need Docker and *git* installed on the machine on which you want
to build and run the Docker Containers that are included in this repository.

## Make Sure Docker is Installed

In order to build and run the Docker Containers that are included in this repository, you must, of course,
have Docker installed.

Consult the relevant documentation on how to install Docker on your particular hardware and operating system.

if you're using Linux as a host system, then whichever method you use to install Docker, by default, it 
will require *root* priveleges to use its commands, requiring the use of
the *sudo* prefix before the *docker* command.

To avoid this, you can do the following:

```console
sudo usermod -aG docker ${USER}
su - ${USER}
```
        
  NB: You'll be asked to enter your user's password

Now you can simply use the *docker* command.


## Install *git*

You'll need to ensure that you can clone this Github Repository to your host machine, so make sure
you have installed *git*.  If not, on Linux systems:

```console
sudo apt-get update
sudo apt-get install -y git
```

(or the equivalent for your Linux distribution or operating system)

----

# Clone this Repository to your Host Machine

Decide on a parent directory into which you'll clone this Repository.  In these instructions
I'll assume you'll use your host system's home directory, eg */home/ubuntu*.

Then clone this Repository, eg:

```console
cd ~
git clone https://github.com/robtweed/mg-showcase
```

On completion, you'll find that you have a directory named *~/mg-showcase*
containing a copy of this Repository.


----

# Select the Database You want to Use

## What's the Choice?

You can choose from either [YottaDB](https://yottadb.com/) or [IRIS](https://www.intersystems.com/data-platform/).

When used with our technologies, both these databases will appear to operate identically as 
[Global Storage](https://github.com/robtweed/global_storage) Databases, so the choice is yours.


## Licensing and Expiry

You should note that YottaDB is a Free Open Source product, whilst IRIS is a commercially-licensed product.

The YottaDB version is unrestricted:

- there is no limit to the number of connections/user processes you can use with it
- there is no expiry date

The version of IRIS used within this repository's Containers is the InterSystems IRIS Community Edition.  This is licensed for up to 8 connections/user processes, and will expire a year after the specific version was originally released (7 November 2024 for version 2023.3).

## Dockerfile Platform Compatibility

The Dockerfiles for both YottaDB and IRIS are compatible with both Intel/AMD X64 and ARM64 systems.

----

# Installing and Starting the Containers

- [YottaDB](#the-yottadb-container)
- [IRIS](#the-iris-container)

- [Next Steps](#next-steps)

----

# The YottaDB Container

## Building the Container

Before building the containers, first ensure that you are in the root directory of the repository.

For example, if you cloned the *mg-showcase* repository to your root folder:

```console
cd ~/mg-showcase
```

To build the Container:

```console
docker build -t mg-showcase -f dockerfiles/yottadb/Dockerfile .
```

Feel free to change the container name to something other than *mg-showcase*.  However, our examples and documentation will assume you've used this name.

Note: if you're upgrading the Container to a later release version, it's a good idea to disable the Docker build cache and force a complete rebuild, eg:

```console
docker build --no-cache -t mg-showcase -f dockerfiles/yottadb/Dockerfile .
```

## Running the Container

To start the Container:

```console
docker run -it --name mg-showcase --rm -p 8080:8080 -p 3000:3000 -p 7042:7042 -v ~/yottadb-vol:/opt/mgateway/mapped mg-showcase
```

### Notes

- replace the *-it* parameter with *-d* to run the container as a background daemon process
- replace the *--name* value with any other name you wish
- use any other external listener port(s) by changing the first value of the *-p* arguments, eg:

        -p 8082:8080

  The internal web server listener ports should always be 8080 and 3000

- port 7042 is for optional networked access to the database using our *mgsi* interface

- replace the mapped host directory (*~/yottadb-vol*) with any other folder you want to use
- replace *mg-showcase* appropriately if you built it with a different name

- you may see the following warning when starting up the container:

        # WARNING Memory overcommit must be enabled! Without it, a background save or 
        replication may fail under low memory condition. Being disabled, it can also 
        cause failures without low memory condition, see 
        https://github.com/jemalloc/jemalloc/issues/1328. To fix this issue add 
        'vm.overcommit_memory = 1' to /etc/sysctl.conf and then reboot or run the 
        command 'sysctl vm.overcommit_memory=1' for this to take effect.    

  This relates to the Redis installation.  As we have only included Redis for the purposes of
performance comparisons, it can be safely ignored.  Note that the suggested fix needs to be applied to
the host system and not the Docker Container.

### Data Persistence

When you map a host volume as shown above when starting the Container, YottaDB will automatically use that host volume for the location of its database files.  As a result, each time you stop and restart the container, any information stored in the YottaDB database will be retained, provided, of course, you map the same host volume each time.

----


# The IRIS Container

## Building the Container

Before building the containers, first ensure that you are in the root directory of the repository.

For example, if you cloned the *mg-showcase* repository to your root folder:

```console
cd ~/mg-showcase
```

To build the Container:

```console
docker build -t mg-showcase -f dockerfiles/iris/Dockerfile .
```

Feel free to change the container name to something other than *mg-showcase*.  However, our examples and documentation will assume you've used this name.

Note 1: you'll experience a delay towards the end of the build whilst some IRIS code is invoked to customise the container and it will appear to sit doing nothing for a while.  This is perfectly normal behaviour: be patient and let it finish.

Note 2: if you're upgrading the Container to a later release version, it's a good idea to disable the Docker build cache and force a complete rebuild, eg:

```console
docker build --no-cache -t mg-showcase -f dockerfiles/iris/Dockerfile .
```

## Running the Container

To start the Container:

```console
docker run -it --name mg-showcase -it --rm -p 1972:1972 -p 52773:52773 -p 51773:51773 -p 7042:7042 -p 8080:8080 -p 3000:3000 -v ~/iris-vol:/home/irisowner/mapped mg-showcase --check-caps false
```

### Notes

- replace the *-it* parameter with *-d* to run the container as a background daemon process
- replace the --name value with any other name you wish
- use any other external listener port(s) by changing the first value of the *-p* arguments, eg:

        -p 8082:8080

  The internal web server listener ports should always be 8080 and 3000

- ports 1972, 52773 and 51773 are for use with various IRIS-specific functionality
- port 7042 is for optional networked access to the database using our *mgsi* interface

- replace the mapped host directory (*~/iris-vol*) with any other folder you want to use
- replace *mg-showcase* appropriately if you built it with a different name

- you may see the following warning when starting up the container:

        # WARNING Memory overcommit must be enabled! Without it, a background save or 
        replication may fail under low memory condition. Being disabled, it can also 
        cause failures without low memory condition, see 
        https://github.com/jemalloc/jemalloc/issues/1328. To fix this issue add 
        'vm.overcommit_memory = 1' to /etc/sysctl.conf and then reboot or run the 
        command 'sysctl vm.overcommit_memory=1' for this to take effect.    

  This relates to the Redis installation.  As we have only included Redis for the purposes of
performance comparisons, it can be safely ignored.  Note that the suggested fix needs to be applied to
the host system and not the Docker Container.

### Data Persistence

By default, data stored in the IRIS database will not persist between restarts.

To add persistence, you should follow the 
[official instructions provided by InterSystems](https://docs.intersystems.com/irislatest/csp/docbook/DocBook.UI.Page.cls?KEY=ADOCK#ADOCK_iris_durable_running).

----

# Next Steps

You now have a running showcase system, complete with the database of your choice.

Go back to the main [README document](https://github.com/robtweed/mg-showcase?tab=readme-ov-file#further-reading) and consult the other documents in this repository to discover what you can now try out and do with your Container.
