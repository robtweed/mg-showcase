# Benefits of *mg_web* for ObjectScript and M Developers

As an M or ObjectScript developer, why should you be switching to using *mg_web*?  There are, in fact, many benefits.

- It allows you to use any of the "big three" industry-strength Web Servers:

  - NGINX (which we've used in the *mg-showcase* Container)
  - Apache
  - IIS (if you're a Microsoft Server user)

  These provide all the performance, reliability, resilience and security you need for safe web-enablement of your applications.

- It allows use of HTTP version 1.1 and 2.0 and WebSockets, and of course all three Web Servers themselves can be configured to use TLS/SSL.  You won't have such flexibility and functionality if you use, for example, a simple Web Server written in M code.

- If you're a Cache user and have legacy WebLink applications, *mg_web* provides a 
[WebLink compatibility layer](https://github.com/chrisemunt/mg_web/blob/master/mg_web_weblink_config.md)
to allow you to migrate to IRIS.  Note that InterSystems no longer support WebLink for IRIS, so *mg_web* is the recommended migration path.

- If you're a Cache or IRIS user, you should note that *mg_web* will avoid the "grace period" and *License Exceeded* problems you'll unfortunately probably be all too familiar with when using CSP.  If you're struggling with licensing when making your system available via a Web/HTTP interface, *mg_web* is a great alternative to CSP, and provides much more flexibility without losing any functionality.

- If you're an IRIS user, you should note that even though both *mgweb.conf* and *mgweb-server* expect to dispatch to an extrinsic function, within that function you have access to all of the proprietary extensions provided by IRIS, so, for example, you can use IRIS Classes and Objects and also IRIS SQL.  You are **NOT** limited to just legacy M code.

- Conversely, if you write your handlers using standard M code and Globals, you can freely migrate any applications between YottaDB and IRIS without any code change whatsoever, allowing you to avoid any lock-in.

- If you're considering migrating applications from M/ObjectScript code to JavaScript, then *mg_web* can support both environments, allowing you to run them simultaneously with the same YottaDB or IRIS backend, and therefore allowing you to migrate incrementally at your own pace.

- Finally, *mg_web* is extremely fast: much faster than any JavaScript-based framework when accessing a database, particularly if you use an in-process API connection between the Web Server and YottaDB or IRIS.