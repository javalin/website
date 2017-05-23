---
layout: default
title: Documentation
rightmenu: true
permalink: /documentation
---

<div id="spy-nav" class="right-menu" markdown="1">
* [Getting Started](#getting-started)
* [Handlers](#handlers)
* [ &nbsp;&nbsp;&nbsp;&nbsp;Before](#before-handlers)
* [ &nbsp;&nbsp;&nbsp;&nbsp;Endpoint](#endpoint-handlers)
* [ &nbsp;&nbsp;&nbsp;&nbsp;After](#after-handlers)
* [Handler groups](#handler-groups)
* [Access manager](#access-manager)
* [Request](#request)
* [Response](#response)
* [Exception Mapping](#exception-mapping)
* [Error Mapping](#error-mapping)
* [Lifecycle events](#lifecycle-events)
* [Server configuration](#server-configuration)
* [ &nbsp;&nbsp;&nbsp;&nbsp;Start/stop](#starting-and-stopping)
* [ &nbsp;&nbsp;&nbsp;&nbsp;Port](#port)
* [ &nbsp;&nbsp;&nbsp;&nbsp;SSL](#ssl)
* [ &nbsp;&nbsp;&nbsp;&nbsp;ThreadPool](#threadpool)
* [ &nbsp;&nbsp;&nbsp;&nbsp;Static Files](#static-files)
* [Javadoc](#javadoc)
</div>

<h1 class="no-margin-top">Documentation</h1>

The documentation on this site is always for the latest version of Javalin. 
We don't have the capacity to maintain separate docs for each version, 
but Javalin follows [semantic versioning](http://semver.org/).

{% comment %}
<p> 
    If you like Javalin, please help us out by starring us on GitHub:
    <div id="githubStar">
        <iframe id="starFrame" class="githubStar" 
                src="https://ghbtns.com/github-btn.html?user=tipsy&amp;repo=javalin&amp;type=star&amp;count=false&size=large" 
                frameborder="0" scrolling="0" width="75px" height="30px">
        </iframe>
    </div>
</p>
{% endcomment %}

## Getting started

Add the dependency:
{% include macros/mavenDep.md %}

Start coding:
{% include macros/gettingStarted.html %}

## Handlers
Javalin has a three main handler types: before-handlers, endpoint-handlers, and after-handlers. 
(There are also exception-handlers and error-handlers, but we'll get to them later). 
The before-, endpoint- and after-handlers required three parts:

* A verb, ex: `before`, `get`, `post`, `put`, `delete`, `after`
* A path, ex: `/`, `/hello-world`
* A handler implementation `(req, res) -> { ... }`

The `Handler` interface has a void return type, so you should update the `response` object to return data to the user.

### Before handlers
Before-handlers are matched before every request (including static files, if you enable those).

~~~java
before("/some-path", (req, res) -> { 
    // runs before all request to /some-path*
});

before((req, res) -> {
    // calls before("/*", handler)
});
~~~

### Endpoint handlers
Endpoint handlers are matched in the order they are defined.

~~~java
get("/", (req, res) -> {
    //some code
    response.json(object)
});

post("/", (req, res) -> {
    // some code
    response.status(201)
});
~~~

Handler paths can include path-parameters. These are available via `Request.param()`
~~~java
get("/hello/:name", (req, res) -> {
    response.body("Hello: " + request.params("name"));
});
~~~

Handler-paths can also include wildcard parameters (splats). These are available via `Request.param()`

~~~java
get("/hello/*/and/*", (req, res) -> {
    response.body("Hello: " + request.splat(0) + " and " + request.splat(1));
});
~~~

### After handlers
After handlers
~~~java
after((req, res) -> {
    // run after every request, excluding static files
});
~~~

## Handler groups
You can group your endpoints by using the `routes()` and `path()` methods. `routes()` creates 
a temporary static instance of Javalin so you can skip the `app.` prefix before your handlers:
~~~java
app.routes(() -> {
    get("/endpoint",                    SomeClass::someMethod);
    get("/endpoint",                    SomeClass::someMethod);
    path("/path", () -> {
        get("/endpoint",                SomeClass::someMethod);
        get("/endpoint",                SomeClass::someMethod);
        delete("/endpoint",             SomeClass::someMethod);
        post("/endpoint",               SomeClass::someMethod);
        path("/path", () -> {
            get("/endpoint",            SomeClass::someMethod);
            post("/endpoint",           SomeClass::someMethod);
            put("/endpoint",            SomeClass::someMethod);
        });
    });
});
~~~

## Access manager
Javalin has a functional interface `AccessManager`, which let's you 
set per-endpoint authentication or authorization. It's common to use before-handlers for this,
but per-endpoint security handlers give you much more explicit and readable code. You can implement your 
access-manager however you want, but here is an example implementation:

~~~java
// Set the access-manager that Javalin should use
app.accessManager(handler, req, res, permittedRoles) -> {
    MyRole userRole = ...
    if (permittedRoles.contains(currentUserRole)) {
        handler.handle(request, response);
    } else {
        response.status(401).body("Unauthorized");
    }
};

// Create an enum implementing 'Role':
enum MyRoles implements Role {
    ANYONE, ROLE_ONE, ROLE_TWO, ROLE_THREE;
}

// Declare explicitly secured endpoint handlers:
app.routes(() -> {
    get("/un-secured",   (req, res) -> res.body("Hello"),   roles(ANYONE));
    get("/secured",      (req, res) -> res.body("Hello"),   roles(ROLE_ONE));
});
~~~

## Request
~~~java
request.unwrap();                   // get underlying HttpServletRequest
request.body();                     // get the request body as string
request.bodyAsBytes();              // get the request body as byte-array
request.bodyParam("key");           // get parameter from request body
request.formParam("key");           // get parameter from form-post request
request.param("key");               // get a path-parameter, ex "/:id" -> param("id")
request.paramMap();                 // get all param key/values as map
request.splat(0);                   // get splat by nr, ex "/*" -> splat(0)
request.splats();                   // get array of splat-values
request.attribute("key", "value");  // set a request attribute
request.attribute("key");           // get a request attribute
request.attributeMap();             // get all attribute key/values as map
request.contentLength();            // get request content length
request.contentType();              // get request content type
request.cookie("key");              // get cookie by name
request.cookieMap();                // get all cookie key/values as map
request.header("key");              // get a header
request.headerMap();                // get all header key/values as map
request.host();                     // get request host
request.ip();                       // get request up
request.path();                     // get request path
request.port();                     // get request port
request.protocol();                 // get request protocol
request.queryParam("key");          // get query param
request.queryParams("key");         // get query param with multiple values
request.queryParamMap();            // get all query param key/values as map
request.queryString();              // get request query string
request.requestMethod();            // get request method
request.scheme();                   // get request scheme
request.uri();                      // get request uri
request.url();                      // get request url
request.userAgent();                // get request user agent
~~~

### Session
Javalin doesn't directly expose the servlet session, 
but you can access the underlying session object by unwrapping the request if you must:
~~~java
request.unwrap().getSession().setAttribute("locale","EN");
request.unwrap().getSession().getAttribute("locale");
~~~

## Response
All Response-setters return the response object, meaning you can chain calls.  
For example: `response.status(200).body("body");`
~~~java
response.unwrap();                      // get underlying HttpServletResponse
response.contentType();                 // get response content type
response.contentType("type");           // set response content type
response.body();                        // get response body
response.body("body");                  // set response body
response.encoding();                    // get response encoding
response.encoding("charset");           // set response encoding
response.header("key");                 // get response header
response.header("key", "value");        // set response header
response.html("body html");             // set response body and html content type
response.json(jsonObject);              // set response body and json content type
response.redirect("/location");         // redirect to location
response.redirect("/location", 302);    // redirect to location with code
response.status();                      // get response status
response.status(404);                   // set response status
response.cookie("key", "value");        // set cookie with key and value
response.cookie("key", "value", 0);     // set cookie with key, value, and maxage
response.cookie(cookieBuilder);         // set cookie using cookiebuilder
response.removeCookie("key");           // remove cookie by key
response.removeCookie("/path", "key");  // remove cookie by path and key
~~~

## Exception Mapping
All handlers (before, endpoint, after) can throw `Exception`
(and any subclass of `Exception`) 
The `app.exception()` method gives you a way of handling these exceptions:
~~~java
app.exception(NullPointerException.class, (e, req, res) -> {
    // handle nullpointers here
});

app.exception(Exception.class, (e, req, res) -> {
    // handle general exceptions here
    // will not trigger if more specific exception-mapper found
});
~~~

### HaltException
Javalin has a `HaltException` which is handled before other exceptions.
When throwing a `HaltException` you can include a status code, a message, or both:
~~~java
throw new HaltException();                     // (status: 200, message: "Execution halted")
throw new HaltException(401);                  // (status: 401, message: "Execution halted")
throw new HaltException("My message");         // (status: 200, message: "My message")
throw new HaltException(401, "Unauthorized");  // (status: 401, message: "Unauthorized")
~~~

## Error Mapping
Error mapping is similar to exception mapping, but it operates on HTTP status codes instead of Exceptions:
~~~java
app.error(404, (req, res) -> {
    response.body("Generic 404 message")
});
~~~

It can make sense to use them together:

~~~java
app.exception(FileNotFoundException.class, (e, req, res) -> {
    res.status(404);
}).error(404, (req, res) -> {
    res.body("Generic 404 message")
});
~~~

## Lifecycle events
Javalin has four lifecycle events: `SERVER_STARTING`, `SERVER_STARTED`, `SERVER_STOPPING` and `SERVER_STOPPED`.
The snippet below shows all of them in action:
~~~java
Javalin app = Javalin.create()
    .event(Event.Type.SERVER_STARTING, e -> { ... })
    .event(Event.Type.SERVER_STARTED, e -> { ... })
    .event(Event.Type.SERVER_STOPPING, e -> { ... })
    .event(Event.Type.SERVER_STOPPED, e -> { ... });

app.start() // SERVER_STARTING
    .awaitInitialization() // SERVER_STARTED
    .stop() // SERVER_STOPPING
    .awaitTermination(); // SERVER_STOPPED
~~~

The lambda takes an `Event` object, which contains the type of event that happened,
and a reference to the `this` (the javalin object which triggered the event).
~~~java
app.event(Event.Type.SERVER_STOPPED, event -> {
    // do something after the server has stopped
});
~~~

## Server configuration

Javalin runs on an embedded [Jetty](http://eclipse.org/jetty/). 
The architecture for adding other embedded servers is in place, and pull requests are welcome.


### Starting and stopping
To start and stop the server, use the appropriately named `start()` and `stop` methods. 
The process of starting and stopping the server is asynchronous, 
but you can use `awaitInitialization()` and `awaitTermination()` if you need it to be synchronous:

~~~java
Javalin app = Javalin.create()
    .start() // starting server (async)
    .awaitInitialization() // block until server is started
    .stop() // stopping server (async)
    .awaitTermination(); // block until server is stopped
~~~

Declaring handlers (`get`, `before`, etc) automatically calls `start()` on the instance.

If there are problems while starting the server, there is a special handler that catches them:

~~~java
private Consumer<Exception> startupExceptionHandler = (e) -> {
    log.error("Failed to start Javalin", e);
};
~~~

You can specify the behavior of this cosumer by calling the `startupExceptionHandler()` method: 
~~~java
startupExceptionHandler((e) -> System.out.println("Uh-oh"));
~~~
*This has to be done before starting the server*.

### Port
By default, Javalin runs on port 7000. If you want to set another port, use `app.port()`.   
*This has to be done before starting the server*.

### Secure (HTTPS/SSL) {#ssl}

You can set the connection to be secure via the `ssl()` method.

~~~java
app.ssl(keystoreFilePath, keystorePassword); // re-use keystore for truststore

app.ssl(keystoreFilePath, keystorePassword, truststoreFilePath, truststorePassword);
~~~

*This has to be done before starting the server*.

### ThreadPool

You can configure the threadpool by using the `threadPool()` and `threadPoolConfig()` methods

~~~java
app.threadPool(
    threadPoolConfig()
        .maxThreads(20)
        .minThreads(4)
        .threadIdleTimeoutMillis(60000)
);
~~~

*This has to be done before starting the server*.

### Static Files
You can enabled static file serving by doing `app.enableStaticFiles("/classpath-folder")`.
Static resource handling is done **after** endpoint matching, 
meaning your self-defined endpoints have higher priority. The process looks like this:
~~~bash
run before-handlers
run endpoint-handlers
if no-endpoint-handler-found
    run static-file-handler
    if static-file-found
        static-file-handler finishes response and
        sends to user, no after-filter is run
    else 
        response is 404, javalin finishes the response
        with after-handlers and error-mapping
~~~
If you do `app.enableStaticFiles("/classpath-folder")`.
Your `index.html` file at `/classpath-folder/index.html` will be available 
at `http://{host}:{port}/index.html` and `http://{host}:{port}/`.

## Javadoc
There is a Javadoc available at [javadoc.io](http://javadoc.io/doc/io.javalin/javalin), 
but Javalin doesn't really have lot of comments. Please use the website to learn how to
use Javalin, the only comments in the source code are to understand the 
internal apis/control flow.

Pull-requests adding Javadoc comments in the source code are not welcome.

<br>

<a href="#getting-started">Back to the top</a>
