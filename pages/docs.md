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
* [Context (ctx)](#context)
* [Access manager](#access-manager)
* [Exception Mapping](#exception-mapping)
* [Error Mapping](#error-mapping)
* [Lifecycle events](#lifecycle-events)
* [Server configuration](#server-configuration)
* [ &nbsp;&nbsp;&nbsp;&nbsp;Start/stop](#starting-and-stopping)
* [ &nbsp;&nbsp;&nbsp;&nbsp;Port](#port)
* [ &nbsp;&nbsp;&nbsp;&nbsp;Custom server](#custom-server)
* [ &nbsp;&nbsp;&nbsp;&nbsp;SSL](#ssl)
* [ &nbsp;&nbsp;&nbsp;&nbsp;Static Files](#static-files)
* [Javadoc](#javadoc)
* [FAQ](#faq)
</div>

<h1 class="no-margin-top">Documentation</h1>

The documentation on this site is always for the latest version of Javalin. 
We don't have the capacity to maintain separate docs for each version, 
but Javalin follows [semantic versioning](http://semver.org/).

<div class="notification star-us">
    <div>
        If you like Javalin, please consider starring us on GitHub:
    </div>
    <iframe id="starFrame" class="githubStar"
            src="https://ghbtns.com/github-btn.html?user=tipsy&amp;repo=javalin&amp;type=star&amp;count=true&size=large"
            frameborder="0" scrolling="0" width="150px" height="30px">
    </iframe>
</div>

## Getting started

Add the dependency:
{% include macros/mavenDep.md %}

Start coding:
{% include macros/gettingStarted.md %}

## Handlers
Javalin has a three main handler types: before-handlers, endpoint-handlers, and after-handlers. 
(There are also exception-handlers and error-handlers, but we'll get to them later). 
The before-, endpoint- and after-handlers require three parts:

* A verb, ex: `before`, `get`, `post`, `put`, `delete`, `after`
* A path, ex: `/`, `/hello-world`
* A handler implementation `ctx -> { ... }`

The `Handler` interface has a void return type, so you have to use  `ctx.result()` to return data to the user.

### Before handlers
Before-handlers are matched before every request (including static files, if you enable those).

{% capture java %}
app.before("/some-path/*", ctx -> {
    // runs before all request to /some-path/*
});
app.before(ctx -> {
    // calls before("/*", handler)
});
{% endcapture %}
{% capture kotlin %}
app.before("/some-path/*") { ctx ->
    // runs before all request to /some-path/*
}
app.before { ctx ->
    // calls before("/*", handler)
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Endpoint handlers
Endpoint handlers are matched in the order they are defined.

{% capture java %}
app.get("/", ctx -> {
    // some code
    ctx.json(object)
});

app.post("/", ctx -> {
    // some code
    ctx.status(201)
});
{% endcapture %}
{% capture kotlin %}
app.get("/") { ctx ->
    // some code
    ctx.json(object)
}

app.post("/") { ctx ->
    // some code
    ctx.status(201)
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Handler paths can include path-parameters. These are available via `Context.param()`
{% capture java %}
get("/hello/:name", ctx -> {
    ctx.result("Hello: " + ctx.param("name"));
});
{% endcapture %}
{% capture kotlin %}
get("/hello/:name") { ctx ->
    ctx.result("Hello: " + ctx.param("name"))
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Handler-paths can also include wildcard parameters (splats). These are available via `Context.splat()`

{% capture java %}
get("/hello/*/and/*", ctx -> {
    ctx.result("Hello: " + ctx.splat(0) + " and " + ctx.splat(1));
});
{% endcapture %}
{% capture kotlin %}
get("/hello/*/and/*") { ctx ->
    ctx.result("Hello: " + ctx.splat(0) + " and " + ctx.splat(1))
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### After handlers
After handlers
{% capture java %}
app.after("/some-path/*", ctx -> {
    // runs after all request to /some-path/* (excluding static files)
});

app.after(ctx -> {
    // run after every request (excluding static files)
});
{% endcapture %}
{% capture kotlin %}
app.after("/some-path/*") { ctx ->
    // runs after all request to /some-path/* (excluding static files)
}

app.after { ctx ->
    // run after every request (excluding static files)
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}


### Reverse path lookup
You can look up the path for a specific `Handler` by calling `app.pathFinder(handler)`
or `app.pathFinder(handler, handlerType)`. If the `Handler` is registered on multiple
paths, the first matching path will be returned.

## Handler groups
You can group your endpoints by using the `routes()` and `path()` methods. `routes()` creates 
a temporary static instance of Javalin so you can skip the `app.` prefix before your handlers:
{% capture java %}
app.routes(() -> {
    path("users", () -> {
        get(UserController::getAllUsers);
        post(UserController::createUser);
        path(":id", () -> {
            get(UserController::getUser);
            patch(UserController::updateUser);
            delete(UserController::deleteUser);
        });
    });
});
{% endcapture %}
{% capture kotlin %}
app.routes {
    path("users") {
        get(userController::getAllUsers);
        post(userController::createUser);
        path(":id") {
            get(userController::getUser);
            patch(userController::updateUser);
            delete(userController::deleteUser);
        }
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Note that `path()` prefixes your paths with `/` (if you don't add it yourself).\\
This means that `path("api", ...)` and `path("/api", ...)` are equivalent.

## Context
The `Context` object provides you with everything you need to handle a http-request.
It contains the underlying servlet-request and servlet-response, and a bunch of getters
and setters. The getters operate mostly on the request-object, while the setters operate exclusively on
the response object.
```java
// request methods:
ctx.request();                     // get underlying HttpServletRequest
ctx.anyQueryParamNull("k1", "k2")  // returns true if any query-param is null
ctx.async();                       // run the request asynchronously
ctx.body();                        // get the request body as string
ctx.bodyAsBytes();                 // get the request body as byte-array
ctx.bodyAsClass(clazz);            // convert json body to object (requires jackson)
ctx.bodyParam("key");              // get parameter from request body
ctx.formParam("key");              // get parameter from form-post request
ctx.param("key");                  // get a path-parameter, ex "/:id" -> param("id")
ctx.paramMap();                    // get all param key/values as map
ctx.splat(0);                      // get splat by nr, ex "/*" -> splat(0)
ctx.splats();                      // get array of splat-values
ctx.attribute("key", "value");     // set a request attribute
ctx.attribute("key");              // get a request attribute
ctx.attributeMap();                // get all attribute key/values as map
ctx.contentLength();               // get request content length
ctx.contentType();                 // get request content type
ctx.cookie("key");                 // get cookie by name
ctx.cookieMap();                   // get all cookie key/values as map
ctx.header("key");                 // get a header
ctx.headerMap();                   // get all header key/values as map
ctx.host();                        // get request host
ctx.ip();                          // get request up
ctx.mapQueryParams("k1", "k2")     // map qps to their values, returns null if any qp is missing
ctx.next();                        // pass the request to the next handler
ctx.path();                        // get request path
ctx.port();                        // get request port
ctx.protocol();                    // get request protocol
ctx.queryParam("key");             // get query param
ctx.queryParams("key");            // get query param with multiple values
ctx.queryParamMap();               // get all query param key/values as map
ctx.queryString();                 // get request query string
ctx.method();                      // get request method
ctx.scheme();                      // get request scheme
ctx.uploadedFile("key");           // get file from multipart form
ctx.uploadedFiles("key");          // get files from multipart form
ctx.uri();                         // get request uri
ctx.url();                         // get request url
ctx.userAgent();                   // get request user agent
// response methods
ctx.response();                    // get underlying HttpServletResponse
ctx.result("result");              // set result (string)
ctx.result(inputStream);           // set result (stream)
ctx.resultString();                // get response result (string)
ctx.resultStream();                // get response result (stream)
ctx.charset("charset");            // set response character encoding
ctx.header("key", "value");        // set response header
ctx.html("body html");             // set result and html content type
ctx.json(object);                  // set result with object-as-json (requires jackson)
ctx.redirect("/location");         // redirect to location
ctx.redirect("/location", 302);    // redirect to location with code
ctx.status();                      // get response status
ctx.status(404);                   // set response status
ctx.cookie("key", "value");        // set cookie with key and value
ctx.cookie("key", "value", 0);     // set cookie with key, value, and maxage
ctx.cookie(cookieBuilder);         // set cookie using cookiebuilder
ctx.removeCookie("key");           // remove cookie by key
ctx.removeCookie("/path", "key");  // remove cookie by path and key
```

### Session
Javalin doesn't directly expose the servlet session,
but you can access the underlying session object by unwrapping the request if you must:
```java
ctx.request().getSession().setAttribute("locale","EN");
ctx.request().getSession().getAttribute("locale");
```

## Access manager
Javalin has a functional interface `AccessManager`, which let's you 
set per-endpoint authentication or authorization. It's common to use before-handlers for this,
but per-endpoint security handlers give you much more explicit and readable code. You can implement your 
access-manager however you want, but here is an example implementation:

{% capture java %}
// Set the access-manager that Javalin should use
app.accessManager(handler, ctx, permittedRoles) -> {
    MyRole userRole = ...
    if (permittedRoles.contains(currentUserRole)) {
        handler.handle(ctx);
    } else {
        ctx.status(401).body("Unauthorized");
    }
};

// Create an enum implementing 'Role':
enum MyRoles implements Role {
    ANYONE, ROLE_ONE, ROLE_TWO, ROLE_THREE;
}

// Declare explicitly secured endpoint handlers:
app.routes(() -> {
    get("/un-secured",   ctx -> ctx.result("Hello"),   roles(ANYONE));
    get("/secured",      ctx -> ctx.result("Hello"),   roles(ROLE_ONE));
});
{% endcapture %}
{% capture kotlin %}
// Set the access-manager that Javalin should use
app.accessManager({ handler, ctx, permittedRoles ->
    val userRole = ...
    if (permittedRoles.contains(currentUserRole)) {
        handler.handle(ctx)
    } else {
        ctx.status(401).body("Unauthorized")
    }
}

// Create an enum implementing 'Role':
internal enum class MyRoles:Role {
    ANYONE, ROLE_ONE, ROLE_TWO, ROLE_THREE
}

// Declare explicitly secured endpoint handlers:
app.routes {
    get("/un-secured",   { ctx -> ctx.result("Hello")},   roles(ANYONE));
    get("/secured",      { ctx -> ctx.result("Hello")},   roles(ROLE_ONE));
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Exception Mapping
All handlers (before, endpoint, after) can throw `Exception`
(and any subclass of `Exception`) 
The `app.exception()` method gives you a way of handling these exceptions:
{% capture java %}
app.exception(NullPointerException.class, (e, ctx) -> {
    // handle nullpointers here
});

app.exception(Exception.class, (e, ctx) -> {
    // handle general exceptions here
    // will not trigger if more specific exception-mapper found
});
{% endcapture %}
{% capture kotlin %}
app.exception(NullPointerException::class.java) { e, ctx ->
    // handle nullpointers here
}

app.exception(Exception::class.java) { e, ctx ->
    // handle general exceptions here
    // will not trigger if more specific exception-mapper found
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### HaltException
Javalin has a `HaltException` which is handled before other exceptions.
When throwing a `HaltException` you can include a status code, a message, or both:
{% capture java %}
throw new HaltException();                     // (status: 200, message: "Execution halted")
throw new HaltException(401);                  // (status: 401, message: "Execution halted")
throw new HaltException("My message");         // (status: 200, message: "My message")
throw new HaltException(401, "Unauthorized");  // (status: 401, message: "Unauthorized")
{% endcapture %}
{% capture kotlin %}
throw HaltException()                          // (status: 200, message: "Execution halted")
throw HaltException(401)                       // (status: 401, message: "Execution halted")
throw HaltException("My message")              // (status: 200, message: "My message")
throw HaltException(401, "Unauthorized")       // (status: 401, message: "Unauthorized")
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}


## Error Mapping
Error mapping is similar to exception mapping, but it operates on HTTP status codes instead of Exceptions:
{% capture java %}
app.error(404, ctx -> {
    ctx.result("Generic 404 message")
});
{% endcapture %}
{% capture kotlin %}
app.error(404) { ctx) ->
    ctx.result("Generic 404 message")
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

It can make sense to use them together:

{% capture java %}
app.exception(FileNotFoundException.class, (e, ctx) -> {
    ctx.status(404);
}).error(404, ctx -> {
    ctx.result("Generic 404 message")
});
{% endcapture %}
{% capture kotlin %}
app.exception(FileNotFoundException::class.java, { e, ctx ->
    ctx.status(404)
}).error(404, { ctx ->
    ctx.result("Generic 404 message")
})
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Lifecycle events
Javalin has five lifecycle events: `SERVER_STARTING`, `SERVER_STARTED`, `SERVER_START_FAILED`, `SERVER_STOPPING` and `SERVER_STOPPED`.
The snippet below shows all of them in action:
{% capture java %}
Javalin app = Javalin.create()
    .event(EventType.SERVER_STARTING, e -> { ... })
    .event(EventType.SERVER_STARTED, e -> { ... })
    .event(EventType.SERVER_START_FAILED, e -> { ... })
    .event(EventType.SERVER_STOPPING, e -> { ... })
    .event(EventType.SERVER_STOPPED, e -> { ... });

app.start(); // SERVER_STARTING -> (SERVER_STARTED || SERVER_START_FAILED)
app.stop(); // SERVER_STOPPING -> SERVER_STOPPED
{% endcapture %}
{% capture kotlin %}
Javalin app = Javalin.create()
    .event(EventType.SERVER_STARTING, { e -> ... })
    .event(EventType.SERVER_STARTED, { e -> ... })
    .event(EventType.SERVER_START_FAILED, { e -> ... })
    .event(EventType.SERVER_STOPPING, { e -> ... })
    .event(EventType.SERVER_STOPPED, { e -> ... });

app.start() // SERVER_STARTING -> (SERVER_STARTED || SERVER_START_FAILED)
app.stop() // SERVER_STOPPING -> SERVER_STOPPED
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

The lambda takes an `Event` object, which contains the type of event that happened,
and a reference to the `this` (the javalin object which triggered the event).

## Server configuration

Javalin runs on an embedded [Jetty](http://eclipse.org/jetty/). 
The architecture for adding other embedded servers is in place, and pull requests are welcome.


### Starting and stopping
To start and stop the server, use the appropriately named `start()` and `stop` methods. 

```java
Javalin app = Javalin.create()
    .start() // starting server (sync)
    .stop() // stopping server (sync)
```

Declaring handlers (`get`, `before`, etc) automatically calls `start()` on the instance.

### Port
By default, Javalin runs on port 7000. If you want to set another port, use `app.port()`.   
*This has to be done before starting the server*.

### Custom server
If you need to customize the embedded server, you can call the `app.embeddedServer()` method:
{% capture java %}
app.embeddedServer(new EmbeddedJettyFactory(() -> {
    Server server = new Server();
    // do whatever you want here
    return server;
}));
{% endcapture %}
{% capture kotlin %}
app.embeddedServer(EmbeddedJettyFactory({
    val server = Server()
    // do whatever you want here
    server
}))
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}
*This has to be done before starting the server <small>(duh)</small>*.

### Ssl

To configure SSL you need to use a custom server (see previous section).\\
An example of a custom server with SSL can be found
[here](https://github.com/tipsy/javalin/blob/master/src/test/java/io/javalin/examples/HelloWorldSecure.java#L25-L33).

### Static Files
You can enabled static file serving by doing `app.enableStaticFiles("/classpath-folder")`, or
`app.enableStaticFiles("/folder", Location.EXTERNAL)`.
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

## FAQ

### Adding a logger {#logging}

If you're reading this, you've probably seen the following message while running Javalin:

~~~text
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.
~~~

This is nothing to worry about.

Like a lot of other Java projects, Javalin does not have a logger included,
which means that you have to add your own logger. If you don't know/care
a lot about Java loggers, the easiest way to fix this is to add the following
dependency to your project:

~~~markup
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-simple</artifactId>
    <version>1.7.25</version>
</dependency>
~~~

This will remove the warning from SLF4J, and enable
helpful debug messages while running Javalin.

<br><br><br><br><br><br><br>

