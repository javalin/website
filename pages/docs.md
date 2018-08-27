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
* [ &nbsp;&nbsp;&nbsp;&nbsp;Cookie Store](#cookie-store)
* [ &nbsp;&nbsp;&nbsp;&nbsp;Extensions](#context-extensions)
* [Access manager](#access-manager)
* [Default responses](#default-responses)
* [Exception Mapping](#exception-mapping)
* [Error Mapping](#error-mapping)
* [WebSockets](#websockets)
* [Lifecycle events](#lifecycle-events)
* [Server setup](#server-setup)
* [ &nbsp;&nbsp;&nbsp;&nbsp;Start/stop](#starting-and-stopping)
* [ &nbsp;&nbsp;&nbsp;&nbsp;Configuration](#configuration)
* [ &nbsp;&nbsp;&nbsp;&nbsp;Custom server](#custom-server)
* [ &nbsp;&nbsp;&nbsp;&nbsp;SSL/HTTP2](#sslhttp2)
* [ &nbsp;&nbsp;&nbsp;&nbsp;Static Files](#static-files)
* [FAQ](#faq)
</div>

{% include javalin2banner.html %}

<h1 class="no-margin-top">Documentation</h1>

The documentation on this site is always for the latest version of Javalin (currently `{{site.javalinversion}}`). 
We don't have the capacity to maintain separate docs for every single version, 
but Javalin follows [semantic versioning](http://semver.org/), 
meaning there are no breaking changes unless it changes from 2.X to 3.X.

Docs for 1.7 (last 1.X version) can be found [here](/archive/docs/v1.7.0.html).

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

The `Handler` interface has a void return type. You use `ctx.result()` to set the response which will be returned to the user.

### Before handlers
Before-handlers are matched before every request (including static files, if you enable those).
<div class="comment">You might know before-handlers as filters, interceptors, or middleware from other libraries.</div>

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
Endpoint-handlers are matched in the order they are defined.
<div class="comment">You might know endpoint-handlers as routes or middleware from other libraries.</div>

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

Handler paths can include path-parameters. These are available via `Context.pathParam()`
{% capture java %}
get("/hello/:name", ctx -> {
    ctx.result("Hello: " + ctx.pathParam("name"));
});
{% endcapture %}
{% capture kotlin %}
get("/hello/:name") { ctx ->
    ctx.result("Hello: " + ctx.pathParam("name"))
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
After-handlers run after every request (even if an exception occurred)
<div class="comment">You might know after-handlers as filters, interceptors, or middleware from other libraries.</div>

{% capture java %}
app.after("/some-path/*", ctx -> {
    // runs after all request to /some-path/*
});

app.after(ctx -> {
    // run after every request
});
{% endcapture %}
{% capture kotlin %}
app.after("/some-path/*") { ctx ->
    // runs after all request to /some-path/*
}

app.after { ctx ->
    // run after every request
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

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

### CrudHandler
The `CrudHandler` is an interface that can be used within a `routes()` call:

{% capture java %}
app.routes(() -> {
    crud("users/:user-id", new UserController());
});
{% endcapture %}
{% capture kotlin %}
app.routes {
    crud("users/:user-id", UserController())
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

It implements the five most common crud operations:
```kotlin
interface CrudHandler {
    getAll(ctx)
    getOne(ctx, resourceId)
    create(ctx)
    update(ctx, resourceId)
    delete(ctx, resourceId)
}
```

## Context
The `Context` object provides you with everything you need to handle a http-request.
It contains the underlying servlet-request and servlet-response, and a bunch of getters
and setters. The getters operate mostly on the request-object, while the setters operate exclusively on
the response object.
```java
// request methods:
ctx.req;                            // get underlying HttpServletRequest
ctx.anyFormParamNull("k1", "k2");   // returns true if any form-param is null
ctx.anyQueryParamNull("k1", "k2");  // returns true if any query-param is null
ctx.body();                         // get the request body as string
ctx.bodyAsBytes();                  // get the request body as byte-array
ctx.bodyAsClass(clazz);             // convert json body to object (java/kotlin)
ctx.body<T>();                      // convert json body to object (kotlin)
ctx.formParam("key");               // get form param
ctx.formParams("key");              // get form param with multiple values
ctx.formParamMap();                 // get all form param key/values as map
ctx.pathParam("key");               // get a path-parameter, ex "/:id" -> param("id")
ctx.pathParamMap();                 // get all param key/values as map
ctx.splat(0);                       // get splat by nr, ex "/*" -> splat(0)
ctx.splats();                       // get array of splat-values
ctx.attribute("key", "value");      // set a request attribute
ctx.attribute("key");               // get a request attribute
ctx.attributeMap();                 // get all attribute key/values as map
ctx.basicAuthCredentials()          // get username and password used for basic-auth
ctx.contentLength();                // get request content length
ctx.contentType();                  // get request content type
ctx.cookie("key");                  // get cookie by name
ctx.cookieMap();                    // get all cookie key/values as map
ctx.header("key");                  // get a header
ctx.headerMap();                    // get all header key/values as map
ctx.host();                         // get request host
ctx.ip();                           // get request up
ctx.isMultipart();                  // check if request is multipart
ctx.mapFormParams("k1", "k2");      // map form params to their values, returns null if any form param is missing
ctx.mapQueryParams("k1", "k2");     // map query params to their values, returns null if any query param is missing
ctx.matchedPath();                  // get matched path, ex "/path/:param"
ctx.path();                         // get request path
ctx.port();                         // get request port
ctx.protocol();                     // get request protocol
ctx.queryParam("key");              // get query param
ctx.queryParams("key");             // get query param with multiple values
ctx.queryParamMap();                // get all query param key/values as map
ctx.queryString();                  // get request query string
ctx.method();                       // get request method
ctx.scheme();                       // get request scheme
ctx.sessionAttribute("foo", "bar"); // set session-attribute "foo" to "bar"
ctx.sessionAttribute("foo");        // get session-attribute "foo"
ctx.sessionAttributeMap();          // get all session attributes as map
ctx.uploadedFile("key");            // get file from multipart form
ctx.uploadedFiles("key");           // get files from multipart form
ctx.url();                          // get request url
ctx.userAgent();                    // get request user agent

// response methods:
ctx.res;                            // get underlying HttpServletResponse
ctx.result("result");               // set result (string)
ctx.result(inputStream);            // set result (stream)
ctx.result(future);                 // set result (future)
ctx.resultString();                 // get response result (string)
ctx.resultStream();                 // get response result (stream)
ctx.resultFuture();                 // get response result (future)
ctx.header("key", "value");         // set response header
ctx.html("body html");              // set result and html content type
ctx.json(object);                   // serialize object and set as result
ctx.redirect("/location");          // redirect to location
ctx.redirect("/location", 302);     // redirect to location with code
ctx.status();                       // get response status
ctx.status(404);                    // set response status
ctx.cookie("key", "value");         // set cookie with key and value
ctx.cookie("key", "value", 0);      // set cookie with key, value, and maxage
ctx.cookie(cookie);                 // set cookie using a Cookie object
ctx.removeCookie("key");            // remove cookie by key
ctx.removeCookie("key", "/path");   // remove cookie by key and path
```

### Cookie Store

The `ctx.cookieStore()` functions provide a convenient way for sharing information between handlers, request, or even servers:
```java
ctx.cookieStore(key, value); // store any type of value
ctx.cookieStore(key); // read any type of value
ctx.clearCookieStore(); // clear the cookie-store
```
The cookieStore works like this:
1. The first handler that matches the incoming request will populate the cookie-store-map with the data currently stored in the cookie (if any).
2. This map can now be used as a state between handlers on the same request-cycle, pretty much in the same way as `ctx.attribute()`
3. At the end of the request-cycle, the cookie-store-map is serialized, base64-encoded and written to the response as a cookie.
   This allows you to share the map between requests and servers (in case you are running multiple servers behind a load-balancer)

### Example:
{% capture java %}
serverOneApp.post("/cookie-storer") { ctx ->
    ctx.cookieStore("string", "Hello world!");
    ctx.cookieStore("i", 42);
    ctx.cookieStore("list", Arrays.asList("One", "Two", "Three"));
}
serverTwoApp.get("/cookie-reader") { ctx -> // runs on a different server than serverOneApp
    String string = ctx.cookieStore("string")
    int i = ctx.cookieStore("i")
    List<String> list = ctx.cookieStore("list")
}
{% endcapture %}
{% capture kotlin %}
serverOneApp.post("/cookie-storer") { ctx ->
    ctx.cookieStore("string", "Hello world!")
    ctx.cookieStore("i", 42)
    ctx.cookieStore("list", listOf("One", "Two", "Three"))
}
serverTwoApp.get("/cookie-reader") { ctx -> // runs on a different server than serverOneApp
    val string = ctx.cookieStore<String>("string")
    val i = ctx.cookieStore<Int>("i")
    val list = ctx.cookieStore<List<String>>("list")
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Since the client stores the cookie, the `get` request to `serverTwoApp`
will be able to retrieve the information that was passed in the `post` to `serverOneApp`.

Please note that cookies have a max-size of 4kb.

### Context extensions
Context extensions give Java developers a way of extending the `Context` object.

One of the most popular features of Kotlin is [extension functions](https://kotlinlang.org/docs/reference/extensions.html).
When working with an object you don't own in Java, you often end up making `MyUtil.action(object, ...)`.
If you, for example, want to serialize an object and set it as the result on the `Context`, you might do:

```java
app.get("/", ctx -> MyMapperUtil.serialize(ctx, myMapper, myObject)); // three args, what happens where?
```

With context extensions you can add custom extensions on the context:

```java
app.get("/", ctx -> ctx.use(MyMapper.class).serialize(object)); // use MyMapper to serialize object
```

Context extensions have to be added before you can use them, this would typically be done in the first `before` filter of your app:

```java
app.before(ctx -> ctx.register(MyMapper.class, new MyMapper(ctx, otherDependency));
```

## Access manager
Javalin has a functional interface `AccessManager`, which let's you 
set per-endpoint authentication and/or authorization. It's common to use before-handlers for this,
but per-endpoint security handlers give you much more explicit and readable code. You can implement your 
access-manager however you want. Here is an example implementation:

{% capture java %}
// Set the access-manager that Javalin should use
app.accessManager((handler, ctx, permittedRoles) -> {
    MyRole userRole = getUserRole(ctx);
    if (permittedRoles.contains(userRole)) {
        handler.handle(ctx);
    } else {
        ctx.status(401).result("Unauthorized");
    }
});

Role getUserRole(Context ctx) {
    // determine user role based on request
    // typically done by inspecting headers
}

enum MyRole implements Role {
    ANYONE, ROLE_ONE, ROLE_TWO, ROLE_THREE;
}

app.routes(() -> {
    get("/un-secured",   ctx -> ctx.result("Hello"),   roles(ANYONE));
    get("/secured",      ctx -> ctx.result("Hello"),   roles(ROLE_ONE));
});
{% endcapture %}
{% capture kotlin %}
// Set the access-manager that Javalin should use
app.accessManager { handler, ctx, permittedRoles ->
    val userRole = getUserRole(ctx) // determine user role based on request
    if (permittedRoles.contains(userRole)) {
        handler.handle(ctx)
    } else {
        ctx.status(401).result("Unauthorized")
    }
}

fun getUserRole(ctx: Context) : Role {
    // determine user role based on request
    // typically done by inspecting headers
}

internal enum class MyRole : Role {
    ANYONE, ROLE_ONE, ROLE_TWO, ROLE_THREE
}

app.routes {
    get("/un-secured",   { ctx -> ctx.result("Hello")},   roles(MyRole.ANYONE));
    get("/secured",      { ctx -> ctx.result("Hello")},   roles(MyRole.ROLE_ONE));
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Default responses

Javalin comes with a built in class called `HttpResponseException`, which can be used for default responses.\\
If the client accepts JSON, a JSON object is returned. Otherwise a plain text response is returned.

```java
app.post("/") { throw ForbiddenResponse("Off limits!") }
```
If client accepts JSON:
```json
{
    "title": "Off limits!",
    "status": 403,
    "type": "https://javalin.io/documentation#forbiddenresponse",
    "details": []
}
```
Otherwise:
```text
Forbidden
```

You can include a `Map<String, String>` of details if you wish.

### RedirectResponse
Returns a [302 Found](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302) response with the default title `Redirected`. 

### BadRequestResponse
Returns a [400 Bad Request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400) response with the default title `Bad request`. 

### UnauthorizedResponse
Returns a [401 Unauthorized](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) response with the default title `Unauthorized`. 

### ForbiddenResponse
Returns a [403 Forbidden](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403) response with the default title `Forbidden`. 

### NotFoundResponse
Returns a [404 Not Found](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404) response with the default title `Not found`. 

### MethodNotAllowedResponse
Returns a [405 Method Not Allowed](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/405) response with the default title `Method not allowed`. 

### ConflictResponse
Returns a [409 Conflict](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/409) response with the default title `Conflict`. 

### GoneResponse
Returns a [410 Gone](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/410) response with the default title `Gone`. 

### InternalServerErrorResponse
Returns a [500 Internal Server Error](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) response with the default title `Internal server error`. 

### BadGatewayResponse
Returns a [502 Bad Gateway](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/502) response with the default title `Bad gateway`. 

### ServiceUnavailableResponse
Returns a [503 Service Unavailable](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/503) response with the default title `Service unavailable`. 

### GatewayTimeoutResponse
Returns a [504 Gateway Timeout](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/504) response with the default title `Gateway timeout`. 

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

## Error Mapping
Error mapping is similar to exception mapping, but it operates on HTTP status codes instead of Exceptions:
{% capture java %}
app.error(404, ctx -> {
    ctx.result("Generic 404 message")
});
{% endcapture %}
{% capture kotlin %}
app.error(404) { ctx ->
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
app.exception(FileNotFoundException::class.java) { e, ctx ->
    ctx.status(404)
}.error(404) { ctx ->
    ctx.result("Generic 404 message")
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## WebSockets 

Javalin has a very intuitive way of handling WebSockets, similar to most node frameworks:

{% capture java %}
app.ws("/websocket/:path", ws -> {
    ws.onConnect(session -> System.out.println("Connected"));
    ws.onMessage((session, message) -> {
        System.out.println("Received: " + message);
        session.getRemote().sendString("Echo: " + message);
    });
    ws.onClose((session, statusCode, reason) -> System.out.println("Closed"));
    ws.onError((session, throwable) -> System.out.println("Errored"));
});
{% endcapture %}
{% capture kotlin %}
app.ws("/websocket/:path") { ws ->
    ws.onConnect { session -> println("Connected") }
    ws.onMessage { session, message ->
        println("Received: " + message)
        session.remote.sendString("Echo: " + message)
    }
    ws.onClose { session, statusCode, reason -> println("Closed") }
    ws.onError { session, throwable -> println("Errored") }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### WsSession
The `WsSession` object wraps Jetty's `Session` and adds the following methods:
```java
session.send("message")               // send a string message to session remote (the ws client)
session.send(bytes)                   // send a binary message to session remote (the ws client)
session.queryString()                 // get query-string from upgrade-request
session.queryParam("key")             // get query-param from upgrade-request
session.queryParams("key")            // get query-params from upgrade-request
session.queryParamMap()               // get query-param-map from upgrade-request
session.mapQueryParams("k1", "k2")    // map query-params to values (only useful in kotlin)
session.anyQueryParamNull("k1", "k2") // check if any query-param from upgrade-request is null
session.pathParam("key")              // get a path-parameter, ex "/:id" -> param("id")
session.pathParamMap()                // get all param key/values as map
session.header("key")                 // get a header
session.headerMap()                   // get all header key/values as map
session.host()                        // get request host
```

## Lifecycle events
Javalin has five lifecycle events: `SERVER_STARTING`, `SERVER_STARTED`, `SERVER_START_FAILED`, `SERVER_STOPPING` and `SERVER_STOPPED`.
The snippet below shows all of them in action:
{% capture java %}
Javalin app = Javalin.create()
    .event(JavalinEvent.SERVER_STARTING, () -> { ... })
    .event(JavalinEvent.SERVER_STARTED, () -> { ... })
    .event(JavalinEvent.SERVER_START_FAILED, () -> { ... })
    .event(JavalinEvent.SERVER_STOPPING, () -> { ... })
    .event(JavalinEvent.SERVER_STOPPED, () -> { ... });

app.start(); // SERVER_STARTING -> (SERVER_STARTED || SERVER_START_FAILED)
app.stop(); // SERVER_STOPPING -> SERVER_STOPPED
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create()
    .event(JavalinEvent.SERVER_STARTING) { ... })
    .event(JavalinEvent.SERVER_STARTED) { ... })
    .event(JavalinEvent.SERVER_START_FAILED) { ... })
    .event(JavalinEvent.SERVER_STOPPING) { ... })
    .event(JavalinEvent.SERVER_STOPPED) { ... });

app.start() // SERVER_STARTING -> (SERVER_STARTED || SERVER_START_FAILED)
app.stop() // SERVER_STOPPING -> SERVER_STOPPED
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Server setup

Javalin runs on an embedded [Jetty](http://eclipse.org/jetty/).

### Starting and stopping
To start and stop the server, use the aptly named `start()` and `stop` methods. 

```java
Javalin app = Javalin.create()
    .start() // start server (sync/blocking)
    .stop() // stop server (sync/blocking)
```

### Configuration
The following snippet shows all the configuration currently available in Javalin:

{% capture java %}
Javalin.create() // create has to be called first
    .contextPath("/context-path") // set a context path (default is "/")
    .dontIgnoreTrailingSlashes() // treat '/test' and '/test/' as different URLs
    .defaultContentType(string) // set a default content-type for responses
    .disableStartupBanner() // remove the javalin startup banner from logs
    .enableCaseSensitiveUrls() // allow urls like '/camelCasedUrl' and match on case
    .enableCorsForOrigin("origin") // enables cors for the specified origin(s)
    .enableAutogeneratedEtags() // auto-generates etags for get-requests
    .enableDebugLogging() // enable extensive debug logging
    .enableRouteOverview("/path") // render a HTML page showing all mapped routes
    .enableSinglePageMode("path", "filePath") // catch 404s and return file-content as response body
    .enableStaticFiles("/public") // enable static files (opt. second param Location.CLASSPATH/Location.EXTERNAL)
    .enableWebJars() // enables webjars at /webjars/name/version/file.ext
    .disableDynamicGzip() // don't gzip any dynamic responses (static files are still gzipped)
    .maxBodySizeForRequestCache(long) // set max body size for request cache
    .port(port) // set the port
    .requestLogger( ... ) // configure Javalin to use the supplied RequestLogger 
    .server( ... ) // see section below
    .sessionHandler( ... ) // see section below
    .start(); // start the server (has to be called last)
{% endcapture %}
{% capture kotlin %}
Javalin.create().apply { // create has to be called first
    contextPath("/context-path") // set a context path (default is "/")
    dontIgnoreTrailingSlashes() // treat '/test' and '/test/' as different URLs
    defaultContentType(string) // set a default content-type for responses
    disableStartupBanner() // remove the javalin startup banner from logs
    enableAutogeneratedEtags() // auto-generates etags for get-requests
    enableCaseSensitiveUrls() // allow urls like '/camelCasedUrl' and match on case
    enableCorsForOrigin("origin") // enables cors for the specified origin(s)
    enableDebugLogging() // enable extensive debug logging
    enableRouteOverview("/path") // render a HTML page showing all mapped routes
    enableSinglePageMode("path", "filePath") // catch 404s and return file-content as response body
    enableStaticFiles("/public") // enable static files (opt. second param Location.CLASSPATH/Location.EXTERNAL)
    enableWebJars() // enables webjars at /webjars/name/version/file.ext
    disableDynamicGzip() // don't gzip any dynamic responses (static files are still gzipped)
    maxBodySizeForRequestCache(long) // set max body size for request cache
    port(port) // set the port
    requestLogger( ... ) // configure Javalin to use the supplied RequestLogger 
    server( ... ) // see section below
    sessionHandler( ... ) // see section below
}.start() // start the server (has to be called last)
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Any argument to `contextPath()` will be normalized to the form `/path` (slash, path, no-slash)

### Custom server
If you need to customize the embedded server, you can call the `app.server()` method:
{% capture java %}
app.server(() -> {
    Server server = new Server();
    // do whatever you want here
    return server;
});
{% endcapture %}
{% capture kotlin %}
app.server {
    val server = Server()
    // do whatever you want here
    server
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

#### Custom SessionHandler

You can configure the `SessionHandler` by calling `app.sessionHandler(...)`. 

If you want to persist sessions to the file system, you could use a `FileSessionDataStore`:

```kotlin
private fun fileSessionHandler() = SessionHandler().apply {
    httpOnly = true
    sessionCache = DefaultSessionCache(this).apply {
        sessionDataStore = FileSessionDataStore().apply {
            val baseDir = File(System.getProperty("java.io.tmpdir"))
            storeDir = File(baseDir, "javalin-session-store").apply { mkdir() }
        }
    }
}
```

Read more about how to configure sessions in 
[Jetty's documentation](https://www.eclipse.org/jetty/documentation/9.4.x/session-management.html).

#### Custom jetty handlers
You can configure your embedded jetty-server with a handler-chain
([example](https://github.com/tipsy/javalin/blob/master/src/test/java/io/javalin/TestCustomJetty.java#L66-L82)),
and Javalin will attach it's own handlers to the end of this chain.
{% capture java %}
StatisticsHandler statisticsHandler = new StatisticsHandler();

Javalin.create()
    .server(() -> {
        Server server = new Server();
        server.setHandler(statisticsHandler);
        return server;
    })
    .start();
{% endcapture %}
{% capture kotlin %}
val statisticsHandler = StatisticsHandler()

Javalin.create().apply {
    server {
        Server(queuedThreadPool).apply {
            handler = statisticsHandler
        }
    }
}.start();
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### SSL/HTTP2

To configure SSL or HTTP2 you need to use a custom server (see previous section).\\
An example of a custom server with SSL can be found in the examples, 
[HelloWorldSecure](https://github.com/tipsy/javalin/blob/master/src/test/java/io/javalin/examples/HelloWorldSecure.java#L24-L32).

A custom HTTP2 server is a bit more work to set up, but we have a repo with a
fully functioning example server in both Kotlin and Java: [javalin-http2-example](https://github.com/tipsy/javalin-http2-example)

### Static Files
You can enabled static file serving by doing `app.enableStaticFiles("/classpath-folder")`, and/or
`app.enableStaticFiles("/folder", Location.EXTERNAL)`.
Static resource handling is done **after** endpoint matching, 
meaning your self-defined endpoints have higher priority. The process looks like this:
```bash
before-handlers
endpoint-handlers
if no-endpoint-handler-found
    static-file-handler
    if static-file-found
        static-file-handler send response
    else 
        response is 404
after-handlers
```
If you do `app.enableStaticFiles("/classpath-folder")`.
Your `index.html` file at `/classpath-folder/index.html` will be available 
at `http://{host}:{port}/index.html` and `http://{host}:{port}/`.

You can call `enableStaticFiles` multiple times to set up multiple handlers.

WebJars can be enabled by calling `enableWebJars()`, they will be available at `/webjars/name/version/file.ext`.

#### Caching
Javalin serves static files with the `Cache-Control` header set to `max-age=0`. This means
that browsers will always ask if the file is still valid. If the version the browser has in cache
is the same as the version on the server, Javalin will respond with a `304 Not modified` status,
and no response body. This tells the browser that it's okay to keep using the cached version.
If you want to skip this check, you can put files in a dir called `immutable`,
and Javalin will set `max-age=31622400`, which means that the browser will wait
one year before checking if the file is still valid.
This should only be used for versioned library files, like `vue-2.4.2.min.js`, to avoid
the browser ending up with an outdated version if you change the file content. 
WebJars also use `max-age=31622400`, as the version number is always part of the path.

## FAQ
Frequently asked questions

### Javadoc
There is a Javadoc available at [javadoc.io](http://javadoc.io/doc/io.javalin/javalin).  
Please contribute to the Javadoc if you can.

### Deploying
To deploy Javalin, simply create a [jar with dependencies](https://maven.apache.org/plugins/maven-assembly-plugin/usage.html), 
then launch the jar with `java -jar filename.jar`. That's it.  
Javalin has an embedded server, so you don't need an application server.  
There is also a tutorial on [deploying Javalin to Heroku](/tutorials/heroku).

### Uploads
Uploaded files are easily accessible via `ctx.uploadedFiles()`:
{% capture java %}
app.post("/upload", ctx -> {
    ctx.uploadedFiles("files").forEach(file -> {
        FileUtil.streamToFile(file.getContent(), "upload/" + file.getName())
    });
});
{% endcapture %}
{% capture kotlin %}
app.post("/upload") { ctx ->
    ctx.uploadedFiles("files").forEach { (contentType, content, name, extension) ->
        FileUtil.streamToFile(content, "upload/$name")
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

The corresponding HTML could look something like:
```markup
<form method="post" action="/upload" enctype="multipart/form-data">
    <input type="file" name="files" multiple>
    <button>Submit</button>
</form>
```

<h3 id="logging">Adding a logger</h3>

If you're reading this, you've probably seen the following message while running Javalin:

```text
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.
```

This is nothing to worry about.

Like a lot of other Java projects, Javalin does not have a logger included,
which means that you have to add your own logger. If you don't know/care
a lot about Java loggers, the easiest way to fix this is to add the following
dependency to your project:

```markup
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-simple</artifactId>
    <version>{{site.slf4jversion}}</version>
</dependency>
```

This will remove the warning from SLF4J, and enable
helpful debug messages while running Javalin.

### Asynchronous requests
While the default threadpool (200 threads) is enough for most use cases,
sometimes slow operations should be run asynchronously. Luckily it's very easy in Javalin, just
pass a `CompletableFuture` to `ctx.result()`:

```kotlin
import io.javalin.Javalin

fun main(args: Array<String>) {
    val app = Javalin.create().start(7000)
    app.get("/") { ctx -> ctx.result(getFuture()) }
}

// hopefully your future is less pointless than this:
private fun getFuture() = CompletableFuture<String>().apply {
    Executors.newSingleThreadScheduledExecutor().schedule({ this.complete("Hello World!") }, 1, TimeUnit.SECONDS)
}
```
<div class="comment">Synonyms for ctrl+f: Async, CompletableFuture, Future, Concurrent, Concurrency</div>

You can only set future results in endpoint handlers (get/post/put/etc).\\
After-handlers, exception-handlers and error-handlers run like you'd expect them to after
the future has been resolved or rejected.

### Configuring the JSON mapper

The JSON mapper can be configured like this:
```java
Gson gson = new GsonBuilder().create();
JavalinJson.setFromJsonMapper(gson::fromJson);
JavalinJson.setToJsonMapper(gson::toJson);
```

#### Configuring Jackson

The JSON mapper uses Jackson by default, which can be configured by calling:
```java
JavalinJackson.configure(objectMapper)
```

Note that these are global settings, and can't be configured per instance of Javalin.

### Views and Templates
Javalin looks for templates/markdown files in `src/resources`,
and uses the correct rendering engine based on the extension of your template.
Javalin currently supports six template engines (see below), as well as markdown.
You can also register your own rendering engine.
{% capture java %}
ctx.render("/templateFile.ext", model("firstName", "John", "lastName", "Doe"))
{% endcapture %}
{% capture kotlin %}
ctx.render("/templateFile.ext", mapOf("firstName" to "John", "lastName" to "Doe"))
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Register:
```java
JavalinRenderer.register(new JavalinPebble(), ".peb", ".pebble");

JavalinRenderer.register((filePath, model) -> {
    return MyRenderer.render(filePath, model);
}, ".ext");
```

Configure:
```kotlin
JavalinThymeleaf.configure(templateEngine)
JavalinVelocity.configure(velocityEngine)
JavalinFreemarker.configure(configuration)
JavalinMustache.configure(mustacheFactory)
JavalinJtwig.configure(configuration)
JavalinPebble.configure(configuration)
JavalinCommonmark.configure(htmlRenderer, markdownParser)
```
Note that these are global settings, and can't be configured per instance of Javalin.


### TimeoutExceptions and ClosedChannelExceptions
So, you're seeing `TimeoutExceptions` and `ClosedChannelExceptions` in your DEBUG logs?
There is nothing to worry about, typically a browser will keep the HTTP connection open until the
server terminates it. When this happens is decided by the server's `idleTimeout` setting, 
which is 30 seconds by default in Jetty/Javalin. This is not a bug.
