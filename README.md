# mgw-showcase: Dockerised showcase for MGateway's Web Platform Technologies
 
Rob Tweed <rtweed@mgateway.com>  
28 February 2024, MGateway Ltd [https://www.mgateway.com](https://www.mgateway.com)  

Twitter: @rtweed

Google Group for discussions, support, advice etc: [http://groups.google.co.uk/group/enterprise-web-developer-community](http://groups.google.co.uk/group/enterprise-web-developer-community)


## Version

This is version 2.8 of the *mg-showcase* repository and Containers, released on 25 April 2024.

## Background

[Global Storage Databases](https://github.com/robtweed/global_storage) are the fastest and most flexible databases technologies available today, and yet are almost unknown outside a few niche marketplaces.  Their design makes them a natural fit for JavaScript where they can uniquely provide direct persistence of JavaScript Objects and JSON data structures from within the language.

Whilst JavaScript interfaces to Global Storage Databases have been available for some time, all have previously suffered from severe performance bottlenecks which have negated the extremely high performance potential of the databases.

MGateway Ltd have long been an independent pioneer in bringing Global Storage Database technologies to the attention of the wider mainstream of the IT industry, and have striven to deliver the highest possible performance in their technologies.  Our latest generation of solutions now allow the full ultra-high performance and unique flexibility of Global Storage databases to be available to the JavaScript developer.  If you are a JavaScript developer who is looking for  database performance that is orders of magnitude better than anything else on the marketplace, then we believe we have the solutions you need, and this *mg-showcase* repository is for you!

Our *mg-showcase* repository is designed to allow anyone interested in our JavaScript-based
technology to quickly and easily try it out, explore it and begin to make use of it, allowing JavaScript developers to discover and try out for themselves these uniquely powerful database technologies.

For existing users of Global Storage Databases, our *mg-showcase* repository also includes Web Platform technologies that demonstrate the use of these databases' native languages, known as ObjectScript or M.

## Repository Contents

The repository includes two Docker installations that you can build and run: all you need is
an Intel X64 machine or ARM64 machine (eg Apple M1 or M2, Raspberry Pi 4 or later) with Docker
already installed.

The two Docker installations include all our key Web Platform technologies, and only differ in terms of the
Global Storage Database that will be included during the build phase, specifically:

- [YottaDB](https://yottadb.com/)
- [InterSystems IRIS](https://www.intersystems.com/products/intersystems-iris/)

Both Containers can be built on Intel X64 or ARM64 host machines


Each container also includes:

- a pre-installed copy of the NGINX web server;
- a pre-installed copy of Redis (to allow performance comparisons);
- a number of useful Linux packages:

  - curl
  - git
  - locate
  - nano
  - unzip
  - wget

- a pre-installed copy of Node.js
- a pre-installed copy of Bun.js
- a number of pre-installed JavaScript packages including:

  - Fastify (a high-performance web server platform designed for Node.js)
  - json5 (for parsing JavaScript string literals and JSON)
  - autocannon (benchmarking/performance tool)


## MGateway Technologies Included

Each Container includes the same pre-installed set of our JavaScript-specific technologies, 
all of which are ready to run when you start the container:

- Server-side technologies:

  - mg-dbx-napi: our extremely high-performance interface to YottaDB and IRIS
  - qoper8-cp: queue-based Child Process pool management utility
  - glsdb: abstracting the YottaDB and IRIS databases into persistent JSON/JavaScript Object stores
  - qoper8-fastify: a Fastify Plug-in that integrates qoper8-cp, mg-dbx-napi and glsdb
  - mg-bun-router: a router for Bun.serve that also integrates qoper8-cp, mg-dbx-napi and glsdb

  - mg_web: an add-on interfacing module for NGINX, allowing connection to external servers
  - mg_web_js: a JavaScript-based server for mg_web that provides an interface to YottaDB and IRIS
  - mgw-router: a JavaScript router for mg_web_js that provides an Express-like router API

  Our *mg_web*-based solutions create an extremely high-performance JavaScript web framework, rather than relying on a native JavaScript web server (eg Express, Fastify etc), *mg_web* allows the use of industry-standard Web Servers such as NGINX.

  For existing users of the database tchnologies, each Container also includes pre-built demonstrations of *mg_web* directly connecting NGINX to the YottaDB or IRIS database, allowing handlers to be written in ObjectScript/M rather than JavaScript.  Your Container also includes another of our products, specifically designed for the M or ObjectScript developer:

  -mgweb-server: an M/ObjectScript-based router for handling REST APIs

- Client-side technologies:

  - Golgi: An example web application is included that has been built using our Golgi WebComponent framework.  This application can be used to benchmark the performance of JavaScript access to the YottaDB or IRIS databases, and also to graphically explore the database structures of these [Global Storage](https://github.com/robtweed/global_storage) databases.


## Further Reading

- [Installing the Containers](./INSTALL.md)
- [Using the mg-showcase Repository Containers](./CONTAINER.md)
- [Basic Performance Benchmarking Demonstrations](./BASIC-BENCHMARKS.md)
- [Quick Guide to Examining the Contents of your Database](./DATABASE.md)
- [Persistent JSON Performance Benchmark Demomstration](./JSON-BENCHMARKS.md)
- Tutorials
  - [Getting Started with the mg-dbx-napi Interface](./TUTORIAL-MGDBX.md)
  - Node.js & Fastify
    - [Using the mg-dbx-napi Interface with Fastify](./TUTORIAL-MGDBX-FASTIFY.md)
    - [Using *glsdb* with Fastify](./TUTORIAL-GLSDB-FASTIFY.md)
  - Bun.js & Bun.serve
    - [Using the mg-dbx-napi Interface with Bun.serve](./TUTORIAL-MGDBX-BUN.md)
    - [Using *glsdb* with Bun.serve](./TUTORIAL-GLSDB-BUN.md)
  - [Benchmarking QOper8](./QOPER8-BENCHMARKS.md)
  - [Benchmarking QOper8 + mg-dbx-napi + glsdb](./GLSDB-BENCHMARKS.md)
- mg_web for JavaScript Developers
  - [The Elephant in the JavaScript Web Framework Room](./WHY-MGWEB.md)
  - [Introduction to mg_web](./MGWEB.md)
  - [mg_web Benchmarks](./MGWEB-BENCHMARKS.md)
- mg_web for ObjectScript/M developers
  - [Introduction to mg_web for ObjectScript and M Developers](./MGWEB-M.md)
  - [Benefits of mg_web for ObjectScript and M Developers](./MGWEB-BENEFITS.md)

... more to follow


## License

 Copyright (c) 2024 MGateway Ltd,                           
 Redhill, Surrey UK.                                                      
 All rights reserved.                                                     
                                                                           
  https://www.mgateway.com                                                  
  Email: rtweed@mgateway.com                                               
                                                                           
                                                                           
  Licensed under the Apache License, Version 2.0 (the "License");          
  you may not use this file except in compliance with the License.         
  You may obtain a copy of the License at                                  
                                                                           
      http://www.apache.org/licenses/LICENSE-2.0                           
                                                                           
  Unless required by applicable law or agreed to in writing, software      
  distributed under the License is distributed on an "AS IS" BASIS,        
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
  See the License for the specific language governing permissions and      
   limitations under the License.      
