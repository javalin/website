---
layout: default
title: Documentation
rightmenu: true
permalink: /future-documentation
---

{% include notificationBanner.html %}

<div id="spy-nav" class="right-menu" markdown="1">
* [Getting Started](#getting-started)
* [HTTP Handlers](#handlers)
  * [Before](#before-handlers)
  * [Endpoint](#endpoint-handlers)
  * [After](#after-handlers)
  * [Context (ctx)](#context)
* [WebSockets](#websockets)
  * [Before](#wsbefore)
  * [Endpoint](#wsendpoint)
  * [After](#wsafter)
  * [Context (ctx)](#wscontext)
* [Handler groups](#handler-groups)
* [Validation](#validation)
* [Access manager](#access-manager)
* [Default responses](#default-responses)
* [Exception Mapping](#exception-mapping)
* [Error Mapping](#error-mapping)
* [Server-sent Events](#server-sent-events)
* [Configuration](#configuration)
  * [Static Files](#static-files)
  * [Single page mode](#single-page-mode)
  * [Logging](#logging)
  * [Server setup](#server-setup)
* [Lifecycle events](#lifecycle-events)
* [Plugins](#plugins)
* [Modules](#modules)
* [FAQ](#faq)
</div>

<h1 class="no-margin-top">Documentation</h1>

<h2 style="text-align:center;">This documentation is for a future <br>version of Javalin, it might still change.</h2>

{% include sponsorOrStar.html %}

## Getting started

Add the dependency:
{% include macros/mavenDep.md %}

Start coding:
{% include macros/gettingStarted.md %}

## Handlers
Javalin has three main handler types: before-handlers, endpoint-handlers, and after-handlers.
(There are also exception-handlers and error-handlers, but we'll get to them later).
The before-, endpoint- and after-handlers require three parts:

* A verb, one of: `before`, `get`, `post`, `put`, `patch`, `delete`, `after` <small>(... `head`, `options`, `trace`, `connect`)</small>
* A path, ex: `/`, `/hello-world`, `/hello/{name}`
* A handler implementation, ex `ctx -> { ... }`, `MyClass implements Handler`, etc

The `Handler` interface has a void return type. You use a method like `ctx.result(result)`,
`ctx.json(obj)`, or `ctx.future(future)` to set the response which will be returned to the user.

You can learn about how Javalin handles concurrency in [FAQ - Concurrency](#concurrency).

### Before handlers
Before-handlers are matched before every request (including static files).
<div class="comment">You might know before-handlers as filters, interceptors, or middleware from other libraries.</div>

{% capture java %}
app.before(ctx -> {
    // runs before all requests
});
app.before("/path/*", ctx -> {
    // runs before request to /path/*
});
{% endcapture %}
{% capture kotlin %}
app.before { ctx ->
    // runs before all requests
}
app.before("/path/*") { ctx ->
    // runs before request to /path/*
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Endpoint handlers
Endpoint handlers are the main handler type, and defines your API. You can add a GET handler to
server data to a client, or a POST handler to receive some data.
Common methods are supported directly on the `Javalin` class (<small>GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS</small>),
uncommon operations (<small>TRACE, CONNECT</small>) are supported via `Javalin#addHandler`.

Endpoint-handlers are matched in the order they are defined.

<div class="comment">You might know endpoint-handlers as routes or middleware from other libraries.</div>

{% capture java %}
app.get("/output", ctx -> {
    // some code
    ctx.json(object);
});

app.post("/input", ctx -> {
    // some code
    ctx.status(201);
});
{% endcapture %}
{% capture kotlin %}
app.get("/output") { ctx ->
    // some code
    ctx.json(object)
}

app.post("/input") { ctx ->
    // some code
    ctx.status(201)
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Handler paths can include path-parameters. These are available via `ctx.pathParam("key")`:
{% capture java %}
app.get("/hello/{name}", ctx -> { // the {} syntax does not allow slashes ('/') as part of the parameter
    ctx.result("Hello: " + ctx.pathParam("name"));
});
app.get("/hello/<name>", ctx -> { // the <> syntax allows slashes ('/') as part of the parameter
    ctx.result("Hello: " + ctx.pathParam("name"));
});
{% endcapture %}
{% capture kotlin %}
app.get("/hello/{name}") { ctx -> // the {} syntax does not allow slashes ('/') as part of the parameter
    ctx.result("Hello: " + ctx.pathParam("name"))
}
app.get("/hello/<name>") { ctx -> // the <> syntax allows slashes ('/') as part of the parameter
    ctx.result("Hello: " + ctx.pathParam("name"))
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Handler paths can also include wildcard parameters:

{% capture java %}
app.get("/path/*", ctx -> { // will match anything starting with /path/
    ctx.result("Hello: " + ctx.splat(0) + " and " + ctx.splat(1));
});
{% endcapture %}
{% capture kotlin %}
app.get("/path/*") { ctx -> // will match anything starting with /path/
    ctx.result("Hello: " + ctx.splat(0) + " and " + ctx.splat(1))
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

However, you cannot extract the value of a wildcard.
Use a slash accepting path-parameter (`<param-name>`) if you need this behavior.

### After handlers
After-handlers run after every request (even if an exception occurred)
<div class="comment">You might know after-handlers as filters, interceptors, or middleware from other libraries.</div>

{% capture java %}
app.after(ctx -> {
    // run after all requests
});
app.after("/path/*", ctx -> {
    // runs after request to /path/*
});
{% endcapture %}
{% capture kotlin %}
app.after { ctx ->
    // run after all requests
}
app.after("/path/*") { ctx ->
    // runs after request to /path/*
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Context
The `Context` object provides you with everything you need to handle a http-request.
It contains the underlying servlet-request and servlet-response, and a bunch of getters
and setters.

```java
// Request methods
body()                                  // request body as string
bodyAsBytes()                           // request body as array of bytes
bodyAsInputStream()                     // request body as input stream
bodyAsClass(clazz)                      // request body as specified class (deserialized from JSON)
bodyStreamAsClass(clazz)                // request body as specified class (memory optimized version of above)
bodyValidator(clazz)                    // request body as validator typed as specified class
uploadedFile("name")                    // uploaded file by name
uploadedFiles("name")                   // all uploaded files by name
uploadedFiles()                         // all uploaded files as list
formParam("name")                       // form parameter by name, as string
formParamAsClass("name", clazz)         // form parameter by name, as validator typed as specified class
formParams("name")                      // list of form parameters by name
formParamMap()                          // map of all form parameters
pathParam("name")                       // path parameter by name as string
pathParamAsClass("name", clazz)         // path parameter as validator typed as specified class
pathParamMap()                          // map of all path parameters
basicAuthCredentialsExist()             // true if request has basic auth credentials
basicAuthCredentials()                  // basic auth credentials (if set)
attribute("name", value)                // set an attribute on the request
attribute("name")                       // get an attribute on the request
attributeMap()                          // map of all attributes on the request
contentLength()                         // content length of the request body
contentType()                           // request content type
cookie("name")                          // request cookie by name
cookieMap()                             // map of all request cookies
header("name")                          // request header by name (can be used with Header.HEADERNAME)
headerAsClass("name", clazz)            // request header by name, as validator typed as specified class
headerMap()                             // map of all request headers
host()                                  // host as string
ip()                                    // ip as string
isMultipart()                           // true if the request is multipart
isMultipartFormData()                   // true if the request is multipart/formdata
method()                                // request methods (GET, POST, etc)
path()                                  // request path
port()                                  // request port
protocol()                              // request protocol
queryParam("name")                      // query param by name as string
queryParamAsClass("name", clazz)        // query param parameter by name, as validator typed as specified class
queryParams("name)                      // list of query parameters by name
queryParamMap()                         // map of all query parameters
queryString()                           // full query string
scheme()                                // request scheme
sessionAttribute("name", value)         // set a session attribute
sessionAttribute("name")                // get a session attribute
consumeSessionAttribute("name")         // get a session attribute, and set value to null
cachedSessionAttribute("name", value)   // get a session attribute, and cache the value as a request attribute
cachedSessionAttribute("name")          // set a session attribute, and cache the value as a request attribute
sessionAttributeMap()                   // map of all session attributes
url()                                   // request url
fullUrl()                               // request url + query string
contextPath()                           // request context path
userAgent()                             // request user agent

// Response methods
result("result")                        // set result stream to specified string (overwrites any previously set result)
result(byteArray)                       // set result stream to specified byte array (overwrites any previously set result)
result(inputStream)                     // set result stream to specified input stream (overwrites any previously set result)
seekableStream(inputStream, "type")     // write content immediately as seekable stream (useful for audio and video)
resultStream()                          // get current result stream
resultString()                          // get current result stream as string (if possible), and reset result stream
future(future, callback)                // set the result to be a future, see async section (overwrites any previously set result)
resultFuture()                          // get current result future
contentType("type")                     // set the response content type
header("name", "value")                 // set response header by name (can be used with Header.HEADERNAME)
redirect("/path", code)                 // redirect to the given path with the given status code
status(code)                            // set the response status code
status()                                // get the response status code
cookie("name", "value", maxAge)         // set response cookie by name, with value and max-age (optional).
cookie(cookie)                          // set cookie using servlet Cookie class
removeCookie("name", "/path")           // removes cookie by name and path (optional)
json(obj)                               // calls result(jsonString), and also sets content type to json
jsonStream(obj)                         // calls result(jsonStream), and also sets content type to json
html("html")                            // calls result(string), and also sets content type to html
render("/template.tmpl", model)         // calls html(renderedTemplate)

// Other methods
handlerType()                           // handler type of the current handler (BEFORE, AFTER, GET, etc)
appAttribute("name")                    // get an attribute on the Javalin instance
matchedPath()                           // get the path that was used to match this request (ex, "/hello/{name}")
endpointHandlerPath()                   // get the path of the endpoint handler that was used to match this request
cookieStore                             // see cookie store section below
```

#### Cookie Store

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

##### Example:
{% capture java %}
serverOneApp.post("/cookie-storer", ctx -> {
    ctx.cookieStore("string", "Hello world!");
    ctx.cookieStore("i", 42);
    ctx.cookieStore("list", Arrays.asList("One", "Two", "Three"));
});
serverTwoApp.get("/cookie-reader", ctx -> { // runs on a different server than serverOneApp
    String string = ctx.cookieStore("string")
    int i = ctx.cookieStore("i")
    List<String> list = ctx.cookieStore("list")
});
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

## WebSockets

Javalin has a very intuitive way of handling WebSockets. You declare an endpoint
with a path and configure the different event handlers in a lambda:

{% capture java %}
app.ws("/websocket/{path}", ws -> {
    ws.onConnect(ctx -> System.out.println("Connected"));
});
{% endcapture %}
{% capture kotlin %}
app.ws("/websocket/{path}") { ws ->
    ws.onConnect { ctx -> println("Connected") }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

There are a total of five events supported:

```java
ws.onConnect(WsConnectContext)
ws.onError(WsErrorContext)
ws.onClose(WsCloseContext)
ws.onMessage(WsMessageContext)
ws.onBinaryMessage(WsBinaryMessageContext)
```

The different flavors of `WsContext` expose different things, for example,
`WsMessageContext` has the method `.message()` which gives you the message that the client sent.
The differences between the different contexts is small, and a full overview can be seen in the [WsContext](#wscontext) section.

You can learn about how Javalin handles WebSocket concurrency in [FAQ - Concurrency](#concurrency).

### WsBefore
The `app.wsBefore` adds a handler that runs before a WebSocket handler.
You can have as many before-handlers as you want per WebSocket endpoint, and all events are supported.
{% capture java %}
app.wsBefore(ws -> {
    // runs before all WebSocket requests
});
app.wsBefore("/path/*", ws -> {
    // runs before websocket requests to /path/*
});
{% endcapture %}
{% capture kotlin %}
app.wsBefore { ws ->
    // runs before all WebSocket requests
}
app.wsBefore("/path/*") { ws ->
    // runs before websocket requests to /path/*
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### WsEndpoint
A WebSocket endpoint is declared with `app.ws(path, handler)`. WebSocket handlers require unique paths.
{% capture java %}
app.ws("/websocket/{path}", ws -> {
    ws.onConnect(ctx -> System.out.println("Connected"));
    ws.onMessage(ctx -> {
        User user = ctx.messageAsClass(User.class); // convert from json
        ctx.send(user); // convert to json and send back
    });
    ws.onBinaryMessage(ctx -> System.out.println("Message"))
    ws.onClose(ctx -> System.out.println("Closed"));
    ws.onError(ctx -> System.out.println("Errored"));
});
{% endcapture %}
{% capture kotlin %}
app.ws("/websocket/{path}") { ws ->
    ws.onConnect { ctx -> println("Connected") }
    ws.onMessage { ctx ->
        val user = ctx.messageAsClass<User>(); // convert from json
        ctx.send(user); // convert to json and send back
    }
    ws.onBinaryMessage { ctx -> println("Message") }
    ws.onClose { ctx -> println("Closed") }
    ws.onError { ctx -> println("Errored") }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### WsAfter
The `app.wsAfter` adds a handler that runs after a WebSocket handler.
You can have as many after-handlers as you want per WebSocket endpoint, and all events are supported.

{% capture java %}
app.wsAfter(ws -> {
    // runs after all WebSocket requests
});
app.wsAfter("/path/*", ws -> {
    // runs after websocket requests to /path/*
});
{% endcapture %}
{% capture kotlin %}
app.wsAfter { ws ->
    // runs after all WebSocket requests
}
app.wsAfter("/path/*") { ws ->
    // runs after websocket requests to /path/*
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## WsContext
The `WsContext` object provides you with everything you need to handle a websocket-request.
It contains the underlying websocket session and servlet-request, and convenience methods for sending
messages to the client.

```java
// Session methods
send(obj)                               // serialize object to json string and send it to client
send("message")                         // send string to client
send(byteBuffer)                        // send bytes to client

// Upgrade Context methods (getters)
matchedPath()                           // get the path that was used to match this request (ex, "/hello/{name}")
host()                                  // host as string

queryParam("name")                      // query param by name as string
queryParamAsClass("name", clazz)        // query param parameter by name, as validator typed as specified class
queryParams("name)                      // list of query parameters by name
queryParamMap()                         // map of all query parameters
queryString()                           // full query string

pathParam("name")                       // path parameter by name as string
pathParamAsClass("name", clazz)         // path parameter as validator typed as specified class
pathParamMap()                          // map of all path parameters

header("name")                          // request header by name (can be used with Header.HEADERNAME)
headerAsClass("name", clazz)            // request header by name, as validator typed as specified class
headerMap()                             // map of all request headers

cookie("name")                          // request cookie by name
cookieMap()                             // map of all request cookies

attribute("name", value)                // set an attribute on the request
attribute("name")                       // get an attribute on the request
attributeMap()                          // map of all attributes on the request

sessionAttribute("name")                // get a session attribute
sessionAttributeMap()                   // map of all session attributes
```


### WsMessageContext
```java
message()                               // receive a string message from the client
messageAsClass(clazz)                   // deserialize message from client
```

### WsBinaryMessageContext
```java
data()                                  // receive a byte array of data from the client
offset()                                // the offset of the data
length()                                // the length of the data
```

### WsCloseContext
```java
status()                                // the int status for why connection was closed
reason()                                // the string reason for why connection was closed
```

### WsErrorContext
```java
error()                                 // the throwable error that occurred
```

### WsConnectContext
The `WsConnectContext` class doesn't add anything to the base `WsContext`

## Handler groups
You can group your endpoints by using the `routes()` and `path()` methods. `routes()` creates
a temporary static instance of Javalin so you can skip the `app.` prefix before your handlers.
This is equivalent to calling `ApiBuilder.get(app, ...)`, which translates
to `app.get(...)`. It is **not** a global singleton that holds any information, so
you can use this safely in multiple locations and from multiple threads.

You can import all the HTTP methods with `import static io.javalin.apibuilder.ApiBuilder.*`.

{% capture java %}
app.routes(() -> {
    path("users", () -> {
        get(UserController::getAllUsers);
        post(UserController::createUser);
        path("{id}", () -> {
            get(UserController::getUser);
            patch(UserController::updateUser);
            delete(UserController::deleteUser);
        });
        ws("events", UserController::webSocketEvents);
    });
});
{% endcapture %}
{% capture kotlin %}
app.routes {
    path("users") {
        get(UserController::getAllUsers)
        post(UserController::createUser)
        path("{id}") {
            get(UserController::getUser)
            patch(UserController::updateUser)
            delete(UserController::deleteUser)
        }
        ws("events", UserController::webSocketEvents)
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
    crud("users/{user-id}", new UserController());
});
{% endcapture %}
{% capture kotlin %}
app.routes {
    crud("users/{user-id}", UserController())
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

## Validation
You can use Javalin's `Validator` class for query, form, and path parameters, as well as
headers and the request body:

{% capture java %}
ctx.queryParamAsClass("paramName", MyClass.class)   // creates a Validator<MyClass> for the value of queryParam("paramName")
ctx.formParamAsClass("paramName", MyClass.class)    // creates a Validator<MyClass> for the value of formParam("paramName")
ctx.pathParamAsClass("paramName", MyClass.class)    // creates a Validator<MyClass> for the value of pathParam("paramName")
ctx.headerAsClass("headerName", MyClass.class)      // creates a Validator<MyClass> for the value of header("paramName")
ctx.bodyValidator(MyClass.class)                    // creates a Validator<MyClass> for the value of body()
{% endcapture %}
{% capture kotlin %}
ctx.queryParamAsClass<MyClass>("paramName")         // creates a Validator<MyClass> for the value of queryParam("paramName")
ctx.formParamAsClass<MyClass>("paramName")          // creates a Validator<MyClass> for the value of formParam("paramName")
ctx.pathParamAsClass<MyClass>("paramName")          // creates a Validator<MyClass> for the value of pathParam("paramName")
ctx.headerAsClass<MyClass>("headerName")            // creates a Validator<MyClass> for the value of header("paramName")
ctx.bodyValidator<MyClass>()                        // creates a Validator<MyClass> for the value of body()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

You can also create your own validator manually through
`Validator.create(clazz, value, fieldName)`.

### Validator API

```java
allowNullable()                     // turn the Validator into a NullableValidator (must be called first)
check(predicate, "error")           // add a check with a ValidationError("error") to the Validator
check(predicate: validationError)   // add a check with a ValidationError to the Validator
get()                               // return the validated value as the specified type, or throw BadRequestResponse
getOrDefault()                      // return default-value if value is null, else call get()
errors()                            // get all the errors of the Validator (as map("fieldName", List<ValidationError>))
```

### Validation examples
{% capture java %}
// VALIDATE A SINGLE QUERY PARAMETER WITH A DEFAULT VALUE /////////////////////////////////////////////
Integer myValue = ctx.queryParamAsClass<Integer>("value").getOrDefault(788) // validate value
ctx.result(value) // return validated value to the client
// GET ?value=a would yield HTTP 400 - {"my-qp":[{"message":"TYPE_CONVERSION_FAILED","args":{},"value":"a"}]}
// GET ?value=1 would yield HTTP 200 - 1 (the validated value)
// GET ?        would yield HTTP 200 - 788 (the default value)


// VALIDATE TWO DEPENDENT QUERY PARAMETERS ////////////////////////////////////////////////////////////
Instant fromDate = ctx.queryParamAsClass("from", Instant.class).get();
Instant toDate = ctx.queryParamAsClass("to", Instant.class)
    .check(it -> it.isAfter(fromDate), "'to' has to be after 'from'")
    .get();


// VALIDATE A JSON BODY ///////////////////////////////////////////////////////////////////////////////
MyObject myObject = ctx.bodyValidator(MyObject.class)
    .check(obj -> obj.myObjectProperty == someValue, "THINGS_MUST_BE_EQUAL")
    .get();

// VALIDATE WITH CUSTOM VALIDATIONERROR ///////////////////////////////////////////////////////////////
ctx.queryParamAsClass("param", Integer.class)
    .check({ it > 5 }, new ValidationError("OVER_LIMIT", Map.of("limit", 5)))
    .get();
// GET ?param=10 would yield HTTP 400 - {"param":[{"message":"OVER_LIMIT","args":{"limit":5},"value":10}]}
{% endcapture %}
{% capture kotlin %}
// VALIDATE A SINGLE QUERY PARAMETER WITH A DEFAULT VALUE /////////////////////////////////////////////
val myValue = ctx.queryParamAsClass<Int>("value").getOrDefault(788) // validate value
ctx.result(value) // return validated value to the client
// GET ?value=a would yield HTTP 400 - {"my-qp":[{"message":"TYPE_CONVERSION_FAILED","args":{},"value":"a"}]}
// GET ?value=1 would yield HTTP 200 - 1 (the validated value)
// GET ?        would yield HTTP 200 - 788 (the default value)


// VALIDATE TWO DEPENDENT QUERY PARAMETERS ////////////////////////////////////////////////////////////
val fromDate = ctx.queryParamAsClass<Instant>("from").get()
val toDate = ctx.queryParamAsClass<Instant>("to")
    .check({ it.isAfter(fromDate) }, "'to' has to be after 'from'")
    .get()


// VALIDATE A JSON BODY ///////////////////////////////////////////////////////////////////////////////
val myObject = ctx.bodyValidator<MyObject>()
    .check({ it.myObjectProperty == someValue }, "THINGS_MUST_BE_EQUAL")
    .get()

// VALIDATE WITH CUSTOM VALIDATIONERROR ///////////////////////////////////////////////////////////////
ctx.queryParamAsClass<Int>("param")
    .check({ it > 5 }, ValidationError("OVER_LIMIT", args = mapOf("limit" to 5)))
    .get()
// GET ?param=10 would yield HTTP 400 - {"param":[{"message":"OVER_LIMIT","args":{"limit":5},"value":10}]}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Collecting multiple errors
{% capture java %}
Validator<Integer> ageValidator = ctx.queryParamAsClass("age", Integer.class)
    .check(n -> !n.contains("-"), "ILLEGAL_CHARACTER")

// Empty map if no errors, otherwise a map with the key "age" and failed check messages in the list.
Map<String, List<Integer>> errors = ageValidator.errors();

// Merges all errors from all validators in the list. Empty map if no errors exist.
Map<String, List<Object>> manyErrors = Validator.collectErrors(ageValidator, otherValidator, ...)
{% endcapture %}
{% capture kotlin %}
val ageValidator = ctx.queryParamAsClass<Int>("age")
    .check({ !it.contains("-") }, "ILLEGAL_CHARACTER")

// Empty map if no errors, otherwise a map with the key "age" and failed check messages in the list.
val errors = ageValidator.errors()

// Merges all errors from all validators in the list. Empty map if no errors exist.
val manyErrors = listOf(ageValidator, otherValidator, ...)
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Custom converters
If you need to validate a non-included class, you have to register a custom converter:

{% capture java %}
JavalinValidation.register(Instant.class, v -> Instant.ofEpochMilli(v.toLong());
{% endcapture %}
{% capture kotlin %}
JavalinValidation.register(Instant::class.java) { Instant.ofEpochMilli(it.toLong()) }
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Access manager
Javalin has a functional interface `AccessManager`, which let's you
set per-endpoint authentication and/or authorization. It's also common to use
before-handlers for this, but enforcing per-endpoint roles give you much more
explicit and readable code. You can implement your access-manager however you want.
Below is an example implementation:

{% capture java %}
// Set the access-manager that Javalin should use
config.accessManager((handler, ctx, routeRoles) -> {
    MyRole userRole = getUserRole(ctx);
    if (permittedRoles.contains(userRole)) {
        handler.handle(ctx);
    } else {
        ctx.status(401).result("Unauthorized");
    }
});

Role getUserRole(Context ctx) {
    // determine user role based on request.
    // typically done by inspecting headers, cookies, or user session
}

enum Role implements RouteRole {
    ANYONE, ROLE_ONE, ROLE_TWO, ROLE_THREE;
}

app.get("/un-secured",   ctx -> ctx.result("Hello"),   Role.ANYONE);
app.get("/secured",      ctx -> ctx.result("Hello"),   Role.ROLE_ONE);
{% endcapture %}
{% capture kotlin %}
// Set the access-manager that Javalin should use
config.accessManager { handler, ctx, routeRoles ->
    val userRole = getUserRole(ctx) // determine user role based on request
    if (permittedRoles.contains(userRole)) {
        handler.handle(ctx)
    } else {
        ctx.status(401).result("Unauthorized")
    }
}

fun getUserRole(ctx: Context) : Role {
    // determine user role based on request.
    // typically done by inspecting headers, cookies, or user session
}

enum class Role : RouteRole {
    ANYONE, ROLE_ONE, ROLE_TWO, ROLE_THREE
}

app.get("/un-secured",   { ctx -> ctx.result("Hello") },   Role.ANYONE);
app.get("/secured",      { ctx -> ctx.result("Hello") },   Role.ROLE_ONE);
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

The `AccessManager` will also run before your WebSocket upgrade request
(if you have added roles to the endpoint), but keep in mind that WebSockets are long lived,
so it might be wise to perform a check in `wsBefore` too/instead.

If you want to perform less restricted access management,
you should consider using a `before` filter.

<h2>!!! DOCS BELOW ARE UNFINISHED !!!</h2>

## Default responses

Javalin comes with a built in class called `HttpResponseException`, which can be used for default responses.\\
If the client accepts JSON, a JSON object is returned. Otherwise a plain text response is returned.

```java
app.post("/") { throw new ForbiddenResponse("Off limits!") }
```
If client accepts JSON:
```java
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

## WebSocket Exception Mapping
The different WebSocket handlers throw exceptions. The `app.wsException()` method gives you a way of handling these exceptions:
{% capture java %}
app.wsException(NullPointerException.class, (e, ctx) -> {
    // handle nullpointers here
});

app.wsException(Exception.class, (e, ctx) -> {
    // handle general exceptions here
    // will not trigger if more specific exception-mapper found
});
{% endcapture %}
{% capture kotlin %}
app.wsException(NullPointerException::class.java) { e, ctx ->
    // handle nullpointers here
}

app.wsException(Exception::class.java) { e, ctx ->
    // handle general exceptions here
    // will not trigger if more specific exception-mapper found
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Error Mapping
HTTP Error mapping is similar to exception mapping, but it operates on HTTP status codes instead of Exceptions:
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

You can also include the content type when declaring your error mappers:

{% capture java %}
app.error(404, "html" ctx -> {
    ctx.html("Generic 404 message")
});
{% endcapture %}
{% capture kotlin %}
app.error(404, "html") { ctx ->
    ctx.html("Generic 404 message")
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

This can be useful if you, for example, want one set of error handlers for HTML, and one for JSON.

## Server-sent Events
Server-sent events (often also called event source) are very simple in Javalin.
You call `app.sse()`, which gives you access to the connected `SseClient`:

{% capture java %}
app.sse("/sse", client ->
    client.sendEvent("connected", "Hello, SSE");
    client.onClose(() -> System.out.println("Client disconnected"));
});
{% endcapture %}
{% capture kotlin %}
app.sse("/sse") { client ->
    client.sendEvent("connected", "Hello, SSE")
    client.onClose { println("Client disconnected") }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

The `SseClient` has access to three things:

```java
client.sendEvent() // method(s) for sending events to client
client.onClose(runnable) // callback which runs when a client closes its connection
client.ctx // the Context for when the client connected (to fetch query-params, etc)
```

## Configuration

You can pass a config object when creating a new instance of Javalin.
The below snippets shows all the available config options:

{% capture java %}
Javalin.create(config -> {

    // JavalinServlet

    // WsServlet

    // Server

    // Misc
}).start()
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->

    // JavalinServlet

    // WsServlet

    // Server

    // Misc
}.start()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Static Files
You can enabled static file serving by doing `config.addStaticFiles("/classpath-folder")`, and/or
`config.addStaticFiles("/folder", Location.EXTERNAL)`.
Static resource handling is done **after** endpoint matching,
meaning your self-defined endpoints have higher priority. The process looks like this:

```txt
run before-handlers
run endpoint-handlers
if no-endpoint-handler-found
    run static-file-handler
    if static-file-found
        static-file-handler sends response
    else
        response is 404
after-handlers
```

If you do `config.addStaticFiles("/classpath-folder")`.
Your `index.html` file at `/classpath-folder/index.html` will be available
at `http://{host}:{port}/index.html` and `http://{host}:{port}/`.

You can call `addStaticFiles` multiple times to set up multiple handlers.

WebJars can be enabled by calling `enableWebJars()`, they will be available at `/webjars/name/version/file.ext`.

WebJars can be found on [https://www.webjars.org/](https://www.webjars.org/).
Everything available through NPM is also available through WebJars.

### Single page mode
Single page mode is similar to static file handling. It runs after endpoint matching and after static file handling.
It's basically a very fancy 404 mapper, which converts any 404's into a specified page.
You can define multiple single page handlers for your application by specifying different root paths.

You can enabled single page mode by doing `config.addSinglePageRoot("/root", "/path/to/file.html")`, and/or
`config.addSinglePageRoot("/root", "/path/to/file.html", Location.EXTERNAL)`.

#### Dynamic single page handler
You can also use a `Handler` to serve your single page root (as opposed to a static file):

```java
config.addSinglePageHandler("/root",  ctx -> {
    ctx.html(...);
});
```

### Logging

#### Adding a logger

Javalin does not have a logger included,
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

#### Request logging
You can add a HTTP request logger by calling `config.requestLogger()`.
The method takes a `Context` and the time in milliseconds it took to finish the request:

{% capture java %}
Javalin.create(config -> {
    config.requestLogger((ctx, ms) -> {
        // log things here
    });
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.requestLogger { ctx, ms ->
        // log things here
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

#### WebSocket logging
You can add a WebSocket logger by calling `config.wsLogger()`. The method takes a `WsHandler`,
(the same interface as a normal `app.ws()` call), and can be used to log events of all types.
The following example just shows `onMessage`, but `onConnect`, `onError` and `onClose` are all available:

{% capture java %}
app.create(config -> {
    config.wsLogger(ws -> {
        ws.onMessage(ctx -> {
            System.out.println("Received: " + ctx.message());
        });
    });
});
{% endcapture %}
{% capture kotlin %}
app.create { config ->
    config.wsLogger(ws -> {
        ws.onMessage { ctx ->
            println("Received: " + ctx.message());
        }
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}
The logger runs after the WebSocket handler for the endpoint.

#### Dev logging

{% capture java %}
app.create(config -> {
    config.enableDevLogging(); // enable extensive development logging for http and websocket
});
{% endcapture %}
{% capture kotlin %}
app.create { config ->
    config.enableDevLogging() // enable extensive development logging for http and websocket
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Server setup

Javalin runs on an embedded [Jetty](http://eclipse.org/jetty/). To start and stop the server,
use `start()` and `stop`:

```java
Javalin app = Javalin.create()
    .start() // start server (sync/blocking)
    .stop() // stop server (sync/blocking)
```

The `app.start()` method spawns a user thread, starts the server, and then returns.
Your program will not exit until this thread is terminated by calling `app.stop()`.

If you want to do a clean shutdown when the program is exiting, you could use:

```java
Runtime.getRuntime().addShutdownHook(new Thread(() -> {
	app.stop();
}));

app.events(event -> {
    event.serverStopping(() -> { /* Your code here */ });
    event.serverStopped(() -> { /* Your code here */ });
});
```

#### Setting the Host

The `Javalin#start` method is overloaded to accept the Host (IP) as the first argument:

```java
Javalin.create().start("127.0.0.1", 1235)
```

#### Custom server
If you need to customize the embedded server, you can call the `server()` method:
{% capture java %}
app.create(config -> {
    config.server(() -> {
        Server server = new Server(); // configure this however you want
        return server;
    }
});
{% endcapture %}
{% capture kotlin %}
app.create { config ->
    config.server {
        val server = Server() // configure this however you want
        server
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

#### Custom SessionHandler

You can configure the `SessionHandler` by calling the `sessionHandler(...)` method.

If you want to persist sessions to the file system, you can use a `FileSessionDataStore`:

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

Read more about how to configure sessions in our
[session tutorial](https://javalin.io/tutorials/jetty-session-handling-kotlin).

#### Custom jetty handlers
You can configure your embedded jetty-server with a handler-chain
([example](https://github.com/tipsy/javalin/blob/master/javalin/src/test/java/io/javalin/TestCustomJetty.kt#L71-L87)),
and Javalin will attach it's own handlers to the end of this chain.
{% capture java %}
StatisticsHandler statisticsHandler = new StatisticsHandler();

Javalin.create(config -> {
    config.server(() -> {
        Server server = new Server();
        server.setHandler(statisticsHandler);
        return server;
    })
}).start();
{% endcapture %}
{% capture kotlin %}
val statisticsHandler = StatisticsHandler()

Javalin.create { config ->
    config.server {
        Server().apply {
            handler = statisticsHandler
        }
    }
}.start();
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

#### SSL/HTTP2

To configure SSL or HTTP2 you need to use a custom server (see previous section).\\
An example of a custom server with SSL can be found in the examples,
[HelloWorldSecure](https://github.com/tipsy/javalin/blob/master/javalin/src/test/java/io/javalin/examples/HelloWorldSecure.java#L22-L30).

A custom HTTP2 server is a bit more work to set up, but we have a repo with a
fully functioning example server in both Kotlin and Java: [javalin-http2-example](https://github.com/tipsy/javalin-http2-example)

## Lifecycle events
Javalin has events for server start/stop, as well as for when handlers are added.
The snippet below shows all of them in action:
{% capture java %}
Javalin app = Javalin.create().events(event -> {
    event.serverStarting(() -> { ... });
    event.serverStarted(() -> { ... });
    event.serverStartFailed(() -> { ... });
    event.serverStopping(() -> { ... });
    event.serverStopped(() -> { ... });
    event.handlerAdded(handlerMetaInfo -> { ... });
    event.wsHandlerAdded(wsHandlerMetaInfo -> { ... });
});

app.start() // serverStarting -> (serverStarted || serverStartFailed)
app.stop() // serverStopping -> serverStopped
{% endcapture %}
{% capture kotlin %}
Javalin app = Javalin.create().events { event ->
    event.serverStarting { ... }
    event.serverStarted { ... }
    event.serverStartFailed { ... }
    event.serverStopping { ... }
    event.serverStopped { ... }
    event.handlerAdded { handlerMetaInfo -> }
    event.wsHandlerAdded { wsHandlerMetaInfo -> }
}

app.start() // serverStarting -> (serverStarted || serverStartFailed)
app.stop() // serverStopping -> serverStopped
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Plugins
Javalin 3 introduced a new plugin system with two interfaces, `Plugin` and `PluginLifecycleInit`:

```java
interface Plugin {
    void apply(@NotNull Javalin app);
}
interface PluginLifecycleInit {
    void init(@NotNull Javalin app);
}
```

When implementing `PluginLifecycleInit#init`, you are not allowed to add `Handler` instances to the app.\\
The two interface methods are called like this during setup:

```java
initPlugins.forEach(plugin -> {
    plugin.init(app);
    // will throw exception if `init` adds Handler
});

plugins.forEach(plugin -> plugin.apply(app));
```

This is mainly so each plugin has a chance to add `handlerAdded` listeners before other plugins
add *their* handlers, so that each plugin has a complete overview of all handlers.

### Route overview plugin

You can enable a HTML page showing all the routes of your application by registering it on the config:

```java
Javalin.create(config ->
    config.registerPlugin(new RouteOverviewPlugin(path));        // show all routes on specified path
    config.registerPlugin(new RouteOverviewPlugin(path, roles)); // show all routes on specified path (with auth)
)
```

### Micrometer Plugin

You can enable the Micrometer plugin by registering it on the `config`:

```java
Javalin.create(config ->
    config.registerPlugin(new MicrometerPlugin());
)
```

Additional documentation for the plugin can be found [here](/plugins/micrometer).

### OpenAPI Plugin

Javalin has an OpenAPI (Swagger) plugin. Full documentation for the plugin can be found [here](/plugins/openapi),
below are a few examples:

#### OpenAPI DSL
When using the OpenAPI DSL you define an `OpenApiDocumentation` object to pair with your `Handler`:

```kotlin
val addUserDocs = document()
        .body<User>()
        .result<Unit>("400")
        .result<Unit>("204")

fun addUserHandler(ctx: Context) {
    val user = ctx.body<User>()
    UserRepository.addUser(user)
    ctx.status(204)
}
```

You then combine these when you add your routes:

```kotlin
post("/users", documented(addUserDocs, ::addUserHandler))
```

#### OpenAPI annotations

If you prefer to keep your documentation separate from your code, you can use annotations instead:

```kotlin
@OpenApi(
    requestBody = OpenApiRequestBody(User::class),
    responses = [
        OpenApiResponse("400", Unit::class),
        OpenApiResponse("201", Unit::class)
    ]
)
fun createUser(ctx: Context) {
    val user = ctx.body<User>()
    UserRepository.createUser(user)
    ctx.status(201)
}
```

If you use the annotation API you don't need to connect the documentation and the handler manually,
you just reference your handler as normal:

```kotlin
post("/users", ::addUserHandler)
```

Javalin will then extract the information from the annotation and build the documentation automatically.

To enable hosted docs you have to specify some paths in your Javalin config:

```kotlin
val app = Javalin.create {
    it.enableOpenApi(
            OpenApiOptions(Info().version("1.0").description("My Application"))
                    .path("/swagger-json")
                    .swagger(SwaggerOptions("/swagger").title("My Swagger Documentation"))
                    .reDoc(ReDocOptions("/redoc").title("My ReDoc Documentation"))
    )
}
```

Full documentation for the OpenAPI plugin can be found at [/plugins/openapi](/plugins/openapi).

### GraphQL plugin
Javalin has an GraphQL plugin. You can see its documentation at [/plugins/graphql](/plugins/graphql).

### Redirect-to-lowercase-path plugin

This plugin redirects requests with uppercase/mixcase paths to lowercase paths.
For example, `/Users/John` redirects to `/users/John` (if endpoint is `/users/:userId`).
It does not affect the casing of path-params and query-params, only static
URL fragments (`Users` becomes `users` above, but `John` remains `John`).\\
When using this plugin, you can only add paths with lowercase URL fragments.

```java
Javalin.create(config ->
    config.registerPlugin(new RedirectToLowercasePathPlugin());
)
```

### Rate limiting

There is a very simple rate-limited included in Javalin `3.7.0` and newer.
You can call it in the beginning of your endpoint `Handler` functions:

{% capture java %}
app.get("/", ctx -> {
    new RateLimit(ctx).requestPerTimeUnit(5, TimeUnit.MINUTES); // throws if rate limit is exceeded
    ctx.status("Hello, rate-limited World!");
});
{% endcapture %}
{% capture kotlin %}
app.get("/") { ctx ->
    RateLimit(ctx).requestPerTimeUnit(5, TimeUnit.MINUTES) // throws if rate limit is exceeded
    ctx.status("Hello, rate-limited World!")
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Every rate limiter is independent (IP and `Handler` based), so different endpoints can have different rate limits. It works as follows:

* A map of maps holds one IP/counter map per method/path combination (`Handler`).
* On each request the counter for that IP is incremented.
* If the counter exceeds the number of requests specified, an exception is thrown.
* All counters are cleared periodically on every timeunit that you specified.

## Modules

As of `3.9.0`, Javalin is a multi-module project. The current modules (for `{{site.javalinversion}}`)  are:

* `javalin` - the standard Javalin dependency, just as before
* `javalin-bundle` - `javalin`, `javalin-openapi`, `jackson` and `logback`
* `javalin-openapi` - the OpenAPI plugin and all required dependencies
* `javalin-graphql` - the new GraphQL plugin (thanks to [7agustibm](https://github.com/7agustibm))
* `javalin-without-jetty` - `javalin` with all `jetty` dependencies excluded
  and Jetty specific methods removed (useful for running on e.g. Tomcat)

## FAQ
Frequently asked questions.

### Android
To use Javalin in an Android project, you will need to:

*1: Target the Android SDK 26 and higher:*

```
defaultconfig {
  minSdkVersion 26
  targetSdkVersion 28
}
```

*2: Target Java 8:*

```
compileOptions {
    sourceCompatibility JavaVersion.VERSION_1_8
    targetCompatibility JavaVersion.VERSION_1_8
}
```

*3: Insert this in your build.gradle file:*

```
packagingOptions {
  exclude 'org/eclipse/jetty/http/encoding.properties'
}
```

*4: Specify `android.enableD8=true` in your `gradle.properties` file.*

---

### Concurrency

By default, Javalin serves requests using a Jetty `QueuedThreadPool` with 250 threads.
Handlers are invoked in parallel on multiple threads, so all handler implementations should be thread-safe.

The default configuration adds a very thin abstraction layer on top of Jetty. It has similar performance to raw
Jetty, which is able to handle
[over a million plaintext requests per second](https://www.techempower.com/benchmarks/#section=data-r20&hw=ph&test=plaintext&l=zik0vz-sf&p=ziimf3-zik0zj-zik0zj-zik0zj-1ekf).

If you have *a lot* of long running requests, it might be worth looking into [Asynchronous requests](#asynchronous-requests),
or [setting up Javalin with project Loom](https://github.com/tipsy/loomylin).

If you're not sure if you need async requests, you probably don't.

#### WebSocket Message Ordering

WebSocket operates over TCP, so messages will arrive at the server in the order that they were sent
by the client. Javalin then handles the messages from a given WebSocket connection sequentially.
Therefore, the order that messages are handled is guaranteed to be the same as the order the client
sent them in.

However, different connections will be handled in parallel on multiple threads, so the WebSocket
event handlers should be thread-safe.

---

### Testing
People often ask how to test Javalin apps. Since Javalin is just a library, you can
instantiate and start the server programmatically. This means testing is really up to you.
There is a tutorial at [/tutorials/testing](/tutorials/testing) which goes through
some different types of tests (unit tests, functional/integration tests, ui/end-to-end tests).
You can read it to get some ideas for how to test your app.

---

### Javadoc
There is a Javadoc available at [javadoc.io](http://javadoc.io/doc/io.javalin/javalin).
Please contribute to the Javadoc if you can.

---

### Deploying
To deploy Javalin, simply create a [jar with dependencies](https://maven.apache.org/plugins/maven-assembly-plugin/usage.html),
then launch the jar with `java -jar filename.jar`. That's it.
Javalin has an embedded server, so you don't need an application server.
There is also a tutorial on [deploying Javalin to Heroku](/tutorials/heroku).

---

### Other web servers
<div class="comment"><strong>Ctrl+f</strong>: "without jetty", "tomcat", "standalone", "servlet container", "war".</div>

Javalin is primarily meant to be used with the embedded Jetty server, but if you want to run Javalin
on another web server (such as Tomcat), you can use the `Javalin.createStandalone()` factory method.

This method will create a Javalin instance, which exposes the `HttpServlet` that
Javalin uses to handle HTTP requests (via `app.servlet()`). Please note that Javalin's WebSockets
functionality has a hard dependency on Jetty, and will not work in standalone mode.

Remember to exclude Jetty when setting this up. If you need more instructions, follow the
[tutorial](https://javalin.io/2018/11/15/javalin-embedded-example.html).

---

### Uploads
Uploaded files are easily accessible via `ctx.uploadedFiles()`:
{% capture java %}
app.post("/upload", ctx -> {
    ctx.uploadedFiles("files").forEach(uploadedFile -> {
        FileUtil.streamToFile(uploadedFile.getContent(), "upload/" + uploadedFile.getFilename())
    });
});
{% endcapture %}
{% capture kotlin %}
app.post("/upload") { ctx ->
    ctx.uploadedFiles("files").forEach { uploadedFile ->
        FileUtil.streamToFile(uploadedFile.content, "upload/${uploadedFile.filename}")
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

The corresponding HTML might look something like this:
```markup
<form method="post" action="/upload" enctype="multipart/form-data">
    <input type="file" name="files" multiple>
    <button>Submit</button>
</form>
```

---

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

#### Async timeout settings
Jetty has a default timeout of 30 seconds for async requests (this is not related to the `idleTimeout` of a connector).
If you wait for processes that run for longer than this, you can configure the async request manually by calling `ctx.req.startAsync()`.
For more information, see [issue 448](https://github.com/tipsy/javalin/issues/448).

---

### Configuring the JSON mapper

Note that these are global settings, and can't be configured per instance of Javalin.

#### Configuring Jackson
The JSON mapper uses Jackson by default, which can be configured by calling:
```java
JavalinJackson.configure(objectMapper)
```

#### Using Gson
Javalin can be configured to use [Gson](https://github.com/google/gson) instead of Jackson. In Java:

```java
Gson gson = new GsonBuilder().create();
JavalinJson.setFromJsonMapper(gson::fromJson);
JavalinJson.setToJsonMapper(gson::toJson);
```

In Kotlin:

```kotlin
val gson = GsonBuilder().create()

JavalinJson.fromJsonMapper = object : FromJsonMapper {
    override fun <T> map(json: String, targetClass: Class<T>) = gson.fromJson(json, targetClass)
}

JavalinJson.toJsonMapper = object : ToJsonMapper {
    override fun map(obj: Any): String = gson.toJson(obj)
}
```

---

### Adding other Servlets and Filters to Javalin
Javalin is designed to work with other `Servlet` and `Filter` instances running on the Jetty Server.
Filters are pretty straighforward to add, since they don't finish the request. If you need to add a serlvet
there's an example in the repo:
[/src/test/java/io/javalin/examples/HelloWorldServlet.java#L21-L29](https://github.com/tipsy/javalin/blob/master/javalin/src/test/java/io/javalin/examples/HelloWorldServlet.java#L21-L29)

---

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
JavalinRenderer.register(JavalinPebble.INSTANCE, ".peb", ".pebble");

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

---

### Vue support (JavalinVue)
If you don't want to deal with NPM and frontend builds, Javalin has support for simplified Vue.js development.
This requires you to make a layout template, `src/main/resources/vue/layout.html`:

```markup
<head>
    <script src="/webjars/vue/2.6.10/dist/vue.min.js"></script>
    @componentRegistration
</head>
<body>
<main id="main-vue" v-cloak>
    @routeComponent
</main>
<script>
    new Vue({el: "#main-vue"});
</script>
</body>
```

When you put `.vue` files in `src/main/resources/vue`, Javalin will scan
the folder and register the components in your `<head>` tag.

Javalin will also put path-parameters and query-parameters in the Vue instance,
which you can access:

```markup
<template id="thread-view">
    {% raw %}<div>{{ $javalin.pathParams["user"] }}</div>{% endraw %}
</template>
<script>
    Vue.component("thread-view", {
        template: "#thread-view"
    });
</script>
```

To map a path to a Vue component you use the `VueComponent` class:

```java
get("/messages", VueComponent("inbox-view"))
get("/messages/:user", VueComponent("thread-view"))
```

This will give you a lot of the benefits of a modern frontend architecture,
with very few of the downsides.

There's a tutorial explaining the concepts: [/tutorials/simple-frontends-with-javalin-and-vue](/tutorials/simple-frontends-with-javalin-and-vue)

#### Shared state
If you want to share state from your server with Vue, you can provide `JavalinVue` with a state function:

```java
JavalinVue.stateFunction = { ctx -> mapOf("user" to getUser(ctx)) }
```

This can then be accessed from the `state` variable:

```markup
<template id="user-template">
    {% raw %}<div>{{ $javalin.state.user }}</div>{% endraw %}
</template>
```

The function runs for every request, so the state is always up to
date when the user navigates or refreshes the page.

#### Inline files
You can inline files into your layout template by using the following functions:

```html
<head>
    <style>@inlineFile("/vue/styles.css")</style> <!-- always included -->
    <script>@inlineFileDev("/vue/scripts-dev.js")</script> <!-- only included in dev -->
    <script>@inlineFileNotDev("/vue/scripts-not-dev.js")</script> <!-- only included in not dev -->
</head>
```

#### CDN WebJars
You can reference your WebJars with `@cdnWebjar/` instead of the normal `/webjars/`.
If you do this, the path will resolve to `/webjars/` on when `isDevFunction` returns true, and `https//cdn.jsdelivr.net/.../`
on non-localhost. **Note that this only works with NPM webjars.**

#### Vue directory location

By default, JavalinVue will set the vue root directory based on the first request it serves.

* On localhost, the root dir will be set to the `src/main/resources/vue` (external location)
* On non-localhost, the root dir will be set to `/vue` (classpath location)

This can cause issues when running a jar locally or in docker. You can override the default dir:

```java
JavalinVue.rootDirectory(path, location); // String path, String location
JavalinVue.rootDirectory(path); // java.nio.Path path
```

#### isDevFunction
You can override the `JavalinVue.isDevFunction` to let `JavalinVue` know if the environment is develop or not.
This is used to disable caching on dev to speed up development. The default function returns true if the request is on localhost.

#### Optimize dependencies
If you set `JavalinVue.optimizeDependencies` to true, `JavalinVue` will only load the required dependencies for your route component.
This is set to false by default.

---

### TimeoutExceptions and ClosedChannelExceptions
If you encounter `TimeoutExceptions` and `ClosedChannelExceptions` in your DEBUG logs,
this is nothing to worry about. Typically, a browser will keep the HTTP connection open until the
server terminates it. When this happens is decided by the server's `idleTimeout` setting,
which is 30 seconds by default in Jetty/Javalin. This is not a bug.

### Documentation for previous versions
Docs for 2.8.0 (last 2.X version) can be found [here](/archive/docs/v2.8.0.html).\\
Docs for 1.7.0 (last 1.X version) can be found [here](/archive/docs/v1.7.0.html).
