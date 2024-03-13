# mgw-showcase: Dockerised showcase for MGateway JavaScript Technologies
 
Rob Tweed <rtweed@mgateway.com>  
28 February 2024, MGateway Ltd [https://www.mgateway.com](https://www.mgateway.com)  

Twitter: @rtweed

Google Group for discussions, support, advice etc: [http://groups.google.co.uk/group/enterprise-web-developer-community](http://groups.google.co.uk/group/enterprise-web-developer-community)


## Background

[Global Storage Databases](https://github.com/robtweed/global_storage) are the fastest and most flexible databases technologies available today, and yet are almost unknown outside a few niche marketplaces.  Their design makes them a natural fit for JavaScript where they can uniquely provide direct persistence of JavaScript Objects and JSON data structures from within the language.

Whilst JavaScript interfaces to Global Storage Databases have been available for some time, all have previously suffered from severe performance bottlenecks which have negated the extremely high performance potential of the databases.

MGateway Ltd have long been an independent pioneer in bringing Global Storage Database to the attention of the wider mainstream of the IT industry, and have striven to deliver the highest possible performance in their technologies.  Our latest generation of solutions now allow the full ultra-high performance and unique flexibility of Global Storage databases to be available to the JavaScript developer.  If you are a JavaScript developer who is looking for  database performance that is orders of magnitude better than anything else on the marketplace, then we believe we have the solutions you need, and this *mg-showcase* repository is for you!

Our *mg-showcase* repository is designed to allow anyone interested in our JavaScript-based
technology to quickly and easily try it out, explore it and begin to make use of it, allowing JavaScript developers to discover and try out for themselves these uniquely powerful database technologies.

## Repository Contents

The repository includes three Docker installations that you can build and run: all you need is
an Intel X64 machine or ARM64 machine (eg Apple M1 or M2, Raspberry Pi 4 or later) with Docker
already installed.

The three Docker installations include all our JavaScript technologies, and only differ in terms of the
database that will be included during the build phase, specifically:

- YottaDB (Container can be built on both Intel X64 and ARM64 host machines)
- InterSystems IRIS (for building on Intel X64 host machines)
- InterSystems IRIS (for building on ARM64 host machines)

Each container also includes:

- a pre-installed copy of the NGINX web server;
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
  - Stric (a high-performance web server specifically for Bun.js)
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
  - qoper8-stric: a Stric extension that integrates qoper8-cp and mg-dbx-napi

  - mg_web: a JavaScript-based interface to YottaDB and IRIS, but integrated directly into NGINX
  - mgw-router: a JavaScript router built on mg_web, offering a high-performance, JavaScript web framework that is built on NGINX - an industrial-strength Web Server rather than a native JavaScript web server (eg Express, Fastify etc)

- Client-side technologies:

  - Golgi: An example web application is included that has been built using our Golgi WebComponent framework.  This application can be used to benchmark the performance of JavaScript access to the YottaDB or IRIS databases, and also to graphically explore the database structures of these [Global Storage](https://github.com/robtweed/global_storage) databases.


## Further Reading

- [Installing the Containers](./INSTALL.md)
- [Using the mg-showcase Repository Containers](./CONTAINER.md)
- [Basic Performance Benchmarking Demonstrations](./BASIC-BENCHMARKS.md)

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
