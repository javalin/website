---
layout: default
title: Documentation
rightmenu: true
permalink: /documentation
---

{% include notificationBanner.html %}

<div id="spy-nav" class="right-menu" markdown="1">
- [Getting Started](#getting-started)
- [HTTP Handlers](#handlers)
  - [Before](#before-handlers)
  - [Endpoint](#endpoint-handlers)
  - [After](#after-handlers)
  - [Context (ctx)](#context)
- [WebSockets](#websockets)
  - [Before](#wsbefore)
  - [Endpoint](#wsendpoint)
  - [After](#wsafter)
  - [WsContext (wsCtx)](#wscontext)
- [Handler groups](#handler-groups)
  - [CrudHandler](#crudhandler)
- [Validation](#validation)
  - [Validator API](#validator-api)
  - [Validation examples](#validation-examples)
  - [Collecting errors](#collecting-multiple-errors)
  - [ValidationException](#validationexception)
  - [Custom converters](#custom-converters)
- [Access manager](#access-manager)
- [Default responses](#default-responses)
- [Exception Mapping](#exception-mapping)
- [Error Mapping](#error-mapping)
- [Server-sent Events](#server-sent-events)
  - [SseClient API](#sseclient-api)
- [Configuration](#configuration)
  - [Compression](#compression)
  - [ContextResolvers](#contextresolvers)
  - [HttpConfig](#httpconfig)
  - [JettyConfig](#jettyconfig)
  - [RequestLoggerConfig](#requestloggerconfig)
  - [RoutingConfig](#routingconfig)
  - [SpaRootConfig](#sparootconfig)
  - [StaticFileConfig](#staticfileconfig)
  - [Logging](#logging)
  - [Server setup](#server-setup)
- [Lifecycle events](#lifecycle-events)
- [Plugins](#plugins)
- [FAQ](#faq)
  - [Request lifecycle](#request-lifecycle)
  - [Rate limiting](#rate-limiting)
  - [Android](#android)
  - [Concurrency](#concurrency)
  - [Testing](#testing)
  - [Javadoc](#javadoc)
  - [Deploying](#deploying)
  - [Other web servers](#other-web-servers)
  - [Uploads](#uploads)
  - [Async requests](#asynchronous-requests)
  - [JSON mapper](#configuring-the-json-mapper)
  - [Servlets and Filters](#adding-other-servlets-and-filters-to-javalin)
  - [Views and Templates](#views-and-templates)
  - [Vue support](#vue-support-javalinvue)
  - [Jetty debug logs](#jetty-debug-logs)
  - [Minecraft](#minecraft)
  - [Documentation for previous versions](#documentation-for-previous-versions)
</div>

<h1 class="no-margin-top">Documentation</h1>

The documentation is for the latest version of Javalin, currently `{{site.javalinversion}}`.
Javalin follows [semantic versioning](http://semver.org/), meaning there are no breaking
changes unless the major (leftmost) digit changes, for example `4.X.X` to `5.X.X`.

{% include sponsorOrStar.html %}

## Getting Started

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
    ctx.result("You are here because " + ctx.path() + " matches " + ctx.matchedPath());
});
{% endcapture %}
{% capture kotlin %}
app.get("/path/*") { ctx -> // will match anything starting with /path/
    ctx.result("You are here because " + ctx.path() + " matches " + ctx.matchedPath())
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

However, you cannot extract the value of a wildcard.
Use a slash accepting path-parameter (`<param-name>` instead of `{param-name}`) if you need this behavior.

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
body()                                // request body as string
bodyAsBytes()                         // request body as array of bytes
bodyAsClass(clazz)                    // request body as specified class (deserialized from JSON)
bodyStreamAsClass(clazz)              // request body as specified class (memory optimized version of above)
bodyValidator(clazz)                  // request body as validator typed as specified class
bodyInputStream()                     // the underyling input stream of the request
uploadedFile("name")                  // uploaded file by name
uploadedFiles("name")                 // all uploaded files by name
uploadedFiles()                       // all uploaded files as list
uploadedFileMap()                     // all uploaded files as a "names by files" map
formParam("name")                     // form parameter by name, as string
formParamAsClass("name", clazz)       // form parameter by name, as validator typed as specified class
formParams("name")                    // list of form parameters by name
formParamMap()                        // map of all form parameters
pathParam("name")                     // path parameter by name as string
pathParamAsClass("name", clazz)       // path parameter as validator typed as specified class
pathParamMap()                        // map of all path parameters
basicAuthCredentials()                // basic auth credentials (or null if not set)
attribute("name", value)              // set an attribute on the request
attribute("name")                     // get an attribute on the request
attributeOrCompute("name", ctx -> {}) // get an attribute or compute it based on the context if absent
attributeMap()                        // map of all attributes on the request
contentLength()                       // content length of the request body
contentType()                         // request content type
cookie("name")                        // request cookie by name
cookieMap()                           // map of all request cookies
header("name")                        // request header by name (can be used with Header.HEADERNAME)
headerAsClass("name", clazz)          // request header by name, as validator typed as specified class
headerMap()                           // map of all request headers
host()                                // host as string
ip()                                  // ip as string
isMultipart()                         // true if the request is multipart
isMultipartFormData()                 // true if the request is multipart/formdata
method()                              // request methods (GET, POST, etc)
path()                                // request path
port()                                // request port
protocol()                            // request protocol
queryParam("name")                    // query param by name as string
queryParamAsClass("name", clazz)      // query param parameter by name, as validator typed as specified class
queryParams("name")                   // list of query parameters by name
queryParamMap()                       // map of all query parameters
queryString()                         // full query string
scheme()                              // request scheme
sessionAttribute("name", value)       // set a session attribute
sessionAttribute("name")              // get a session attribute
consumeSessionAttribute("name")       // get a session attribute, and set value to null
cachedSessionAttribute("name", value) // set a session attribute, and cache the value as a request attribute
cachedSessionAttribute("name")        // get a session attribute, and cache the value as a request attribute
cachedSessionAttributeOrCompute(...)  // same as above, but compute and set if value is absent
sessionAttributeMap()                 // map of all session attributes
url()                                 // request url
fullUrl()                             // request url + query string
contextPath()                         // request context path
userAgent()                           // request user agent
req()                                 // get the underlying HttpServletRequest

// Response methods
result("result")                      // set result stream to specified string (overwrites any previously set result)
result(byteArray)                     // set result stream to specified byte array (overwrites any previously set result)
result(inputStream)                   // set result stream to specified input stream (overwrites any previously set result)
future(futureSupplier)                // set the result to be a future, see async section (overwrites any previously set result)
writeSeekableStream(inputStream)      // write content immediately as seekable stream (useful for audio and video)
result()                              // get current result stream as string (if possible), and reset result stream
resultInputStream()                   // get current result stream
contentType("type")                   // set the response content type
header("name", "value")               // set response header by name (can be used with Header.HEADERNAME)
redirect("/path", code)               // redirect to the given path with the given status code
status(code)                          // set the response status code
status()                              // get the response status code
cookie("name", "value", maxAge)       // set response cookie by name, with value and max-age (optional).
cookie(cookie)                        // set cookie using javalin Cookie class
removeCookie("name", "/path")         // removes cookie by name and path (optional)
json(obj)                             // calls result(jsonString), and also sets content type to json
jsonStream(obj)                       // calls result(jsonStream), and also sets content type to json
html("html")                          // calls result(string), and also sets content type to html
render("/template.tmpl", model)       // calls html(renderedTemplate)
res()                                 // get the underlying HttpServletResponse

// Other methods
async(runnable)                       // lifts request out of Jetty's ThreadPool, and moves it to Javalin's AsyncThreadPool
handlerType()                         // handler type of the current handler (BEFORE, AFTER, GET, etc)
appAttribute("name")                  // get an attribute on the Javalin instance. see app attributes section below
matchedPath()                         // get the path that was used to match this request (ex, "/hello/{name}")
endpointHandlerPath()                 // get the path of the endpoint handler that was used to match this request
cookieStore()                         // see cookie store section below
```

It is also possible to cast `Context` to an internal Javalin implementation.

The following example accesses the `JavalinServletContext` task queue, and skips
any remaining tasks for the request (access-manager, http-handlers, after-handlers, etc):

{% capture java %}
app.before(ctx -> {
    ctx.result("My result here");
    JavalinServletContext jsc = (JavalinServletContext) ctx;
    jsc.getTasks().clear();
})
{% endcapture %}
{% capture kotlin %}
app.before { ctx ->
    it.result("My result here")
    (ctx as JavalinServletContext).tasks.clear()
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

#### App Attributes

App Attributes can be registered on the Javalin instance, then accessed through the `appAttribute(...)` method in `Context`:

{% capture java %}
app.attribute("myValue", "foo");

app.get("/attribute", ctx -> {
    String myValue = ctx.attribute("myValue");
    ctx.result(myValue); // -> foo
});
{% endcapture %}
{% capture kotlin %}
app.attribute("myValue", "foo")

app.get("/attribute") { ctx ->
    val myValue: String = ctx.appAttribute("myValue")
    ctx.result(myValue) // -> foo
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

#### Cookie Store

The `CookieStore` class provides a convenient way for sharing information between handlers, request, or even servers:
```java
ctx.cookieStore().set(key, value); // store any type of value
ctx.cookieStore().get(key);        // read any type of value
ctx.cookieStore().clear();         // clear the cookie-store
```
The cookieStore works like this:
1. The first handler that matches the incoming request will populate the cookie-store-map with the data currently stored in the cookie (if any).
2. This map can now be used as a state between handlers on the same request-cycle, pretty much in the same way as `ctx.attribute()`
3. At the end of the request-cycle, the cookie-store-map is serialized, base64-encoded and written to the response as a cookie.
   This allows you to share the map between requests and servers (in case you are running multiple servers behind a load-balancer)

##### Example:
{% capture java %}
serverOneApp.post("/cookie-storer", ctx -> {
    ctx.cookieStore().set("string", "Hello world!");
    ctx.cookieStore().set("i", 42);
    ctx.cookieStore().set("list", Arrays.asList("One", "Two", "Three"));
});
serverTwoApp.get("/cookie-reader", ctx -> { // runs on a different server than serverOneApp
    String string = ctx.cookieStore().get("string")
    int i = ctx.cookieStore().get("i")
    List<String> list = ctx.cookieStore().get("list")
});
{% endcapture %}
{% capture kotlin %}
serverOneApp.post("/cookie-storer") { ctx ->
    ctx.cookieStore().set("string", "Hello world!")
    ctx.cookieStore().set("i", 42)
    ctx.cookieStore().set("list", listOf("One", "Two", "Three"))
}
serverTwoApp.get("/cookie-reader") { ctx -> // runs on a different server than serverOneApp
    val string = ctx.cookieStore().get("string")
    val i = ctx.cookieStore().get("i")
    val list = ctx.cookieStore().get("list")
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

### WsContext
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

#### WsMessageContext
```java
message()                               // receive a string message from the client
messageAsClass(clazz)                   // deserialize message from client
```

#### WsBinaryMessageContext
```java
data()                                  // receive a byte array of data from the client
offset()                                // the offset of the data
length()                                // the length of the data
```

#### WsCloseContext
```java
status()                                // the int status for why connection was closed
reason()                                // the string reason for why connection was closed
```

#### WsErrorContext
```java
error()                                 // the throwable error that occurred
```

#### WsConnectContext
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
check(predicate, validationError)   // add a check with a ValidationError to the Validator (can have args for localization)
get()                               // return the validated value as the specified type, or throw ValidationException
getOrThrow(exceptionFunction)       // return the validated value as the specified type, or throw custom exception
getOrDefault()                      // return default-value if value is null, else call get()
errors()                            // get all the errors of the Validator (as map("fieldName", List<ValidationError>))
```

### Validation examples
{% capture java %}
// VALIDATE A SINGLE QUERY PARAMETER WITH A DEFAULT VALUE /////////////////////////////////////////////
Integer myValue = ctx.queryParamAsClass("value", Integer.class).getOrDefault(788) // validate value
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
Map<String, List<Object>> manyErrors = JavalinValidation.collectErrors(ageValidator, otherValidator, ...)
{% endcapture %}
{% capture kotlin %}
val ageValidator = ctx.queryParamAsClass<Int>("age")
    .check({ !it.contains("-") }, "ILLEGAL_CHARACTER")

// Empty map if no errors, otherwise a map with the key "age" and failed check messages in the list.
val errors = ageValidator.errors()

// Merges all errors from all validators in the list. Empty map if no errors exist.
val manyErrors = listOf(ageValidator, otherValidator, ...).collectErrors()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### ValidationException
When a `Validator` throws, it is mapped by:

```kotlin
app.exception(ValidationException::class.java) { e, ctx ->
    ctx.json(e.errors).status(400)
}
```

You can override this by doing:

{% capture java %}
app.exception(ValidationException.class, (e, ctx) -> {
    // your code
});
{% endcapture %}
{% capture kotlin %}
app.exception(ValidationException::class.java) { e, ctx ->
    // your code
}
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
    if (routeRoles.contains(userRole)) {
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
    if (routeRoles.contains(userRole)) {
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

## Default responses
Javalin comes with a built in class called `HttpResponseException`, which can be used for default responses.
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
All handlers (before, endpoint, after, ws) can throw `Exception`
(and any subclass of `Exception`).
The `app.exception()` and `app.wsException()` methods gives you a way of handling these exceptions:
{% capture java %}
// HTTP exceptions
app.exception(NullPointerException.class, (e, ctx) -> {
    // handle nullpointers here
});

app.exception(Exception.class, (e, ctx) -> {
    // handle general exceptions here
    // will not trigger if more specific exception-mapper found
});

// WebSocket exceptions
app.wsException(NullPointerException.class, (e, ctx) -> {
    // handle nullpointers here
});

app.wsException(Exception.class, (e, ctx) -> {
    // handle general exceptions here
    // will not trigger if more specific exception-mapper found
});
{% endcapture %}
{% capture kotlin %}
// HTTP exceptions
app.exception(NullPointerException::class.java) { e, ctx ->
    // handle nullpointers here
}

app.exception(Exception::class.java) { e, ctx ->
    // handle general exceptions here
    // will not trigger if more specific exception-mapper found
}

// WebSocket exceptions
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
app.sse("/sse", client -> {
    client.sendEvent("connected", "Hello, SSE");
    client.onClose(() -> System.out.println("Client disconnected"));
    client.close(); // close the client
});
{% endcapture %}
{% capture kotlin %}
app.sse("/sse") { client ->
    client.sendEvent("connected", "Hello, SSE")
    client.onClose { println("Client disconnected") }
    client.close() // close the client
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Clients are automatically closed when leaving the handler, if you need to use the client outside the handler, you can use `client.keepAlive()`:

{% capture java %}
Queue<SseClient> clients = new ConcurrentLinkedQueue<SseClient>();

app.sse("/sse", client -> {
    client.keepAlive();
    client.onClose(() - > clients.remove(client));
    clients.add(client);
});
{% endcapture %}
{% capture kotlin %}
val clients = ConcurrentLinkedQueue<SseClient>()

app.sse("/sse") { client ->
    client.keepAlive()
    client.onClose { clients.remove(client) }
    clients.add(client)
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### SseClient API

```java
sendEvent("myMessage")                      // calls emit("message", "myMessage", noId)
sendEvent("eventName", "myMessage")         // calls emit("eventName", "myMessage", noId)
sendEvent("eventName", "myMessage", "id")   // calls emit("eventName", "myMessage", "id")
sendComment("myComment")                    // calls emit("myComment")
onClose(runnable)                           // callback which runs when a client closes its connection
keepAlive()                                 // keeps the connection alive. useful if you want to keep a list of clients to broadcast to.
close()                                     // closes the connection
terminated()                                // returns true if the connection has been closed
ctx                                         // the Context from when the client connected (to fetch query-params, etc)
```

## Configuration
You can pass a config object when creating a new instance of Javalin.
Javalin's configuration is grouped into multiple subconfigs:

```java
Javalin.create(config -> {
    config.core          // access manager, json mapper, context resolvers, misc
    config.http          // etags, request size, timeout, etc
    config.routing       // context path, slash treatment
    config.jetty         // jetty settings
    config.staticFiles   // static files and webjars
    config.spaRoot       // single page application roots
    config.compression   // gzip, brotli, disable compression
    config.requestLogger // http and websocket loggers
    config.plugins       // enable bundled plugins or add custom ones
    config.vue           // vue settings, see /plugins/vue
});
```

All available subconfigs are explained in the sections below.

### Compression
{% capture java %}
Javalin.create(config -> {
    config.compression.custom(compressionStrategy);       // set a custom CompressionStrategy
    config.compression.brotliAndGzip(gzipLvl, brotliLvl); // use both gzip and brotli (optional lvls)
    config.compression.gzipOnly(gzipLvl);                 // use gzip only (optional lvl)
    config.compression.brotliOnly(brotliLvl);             // use brotli only (optional lvl)
    config.compression.none();                            // disable compression
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.compression.custom(compressionStrategy)       // set a custom CompressionStrategy
    config.compression.brotliAndGzip(gzipLvl, brotliLvl) // use both gzip and brotli (optional lvls)
    config.compression.gzipOnly(gzipLvl)                 // use gzip only (optional lvl)
    config.compression.brotliOnly(brotliLvl)             // use brotli only (optional lvl)
    config.compression.none()                            // disable compression
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### ContextResolvers
Some of the methods in `Context` can be configured through the `ContextResolvers` configuration class:

{% capture java %}
Javalin.create(config -> {
    config.contextResolver.ip = ctx -> "custom ip";           // called by Context#ip()
    config.contextResolver.host = ctx -> "custom host";       // called by Context#host()
    config.contextResolver.scheme = ctx -> "custom scheme";   // called by Context#scheme()
    config.contextResolver.url = ctx -> "custom url";         // called by Context#url()
    config.contextResolver.fullUrl = ctx -> "custom fullUrl"; // called by Context#fullUrl()
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.contextResolver.ip = { ctx -> "custom ip" }           // called by Context#ip()
    config.contextResolver.host = { ctx -> "custom host" }       // called by Context#host()
    config.contextResolver.scheme = { ctx -> "custom scheme" }   // called by Context#scheme()
    config.contextResolver.url = { ctx -> "custom url" }         // called by Context#url()
    config.contextResolver.fullUrl = { ctx -> "custom fullUrl" } // called by Context#fullUrl()
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### HttpConfig
{% capture java %}
Javalin.create(config -> {
    config.http.generateEtags = booleanValue;     // if javalin should generate etags for dynamic responses (not static files)
    config.http.prefer405over404 = booleanValue;  // return 405 instead of 404 if path is mapped to different HTTP method
    config.http.maxRequestSize = longValue;       // the max size of request body that can be accessed without using using an InputStream
    config.http.defaultContentType = stringValue; // the default content type
    config.http.asyncTimeout = longValue;         // timeout in milliseconds for async requests (0 means no timeout)
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.http.generateEtags = booleanValue     // if javalin should generate etags for dynamic responses (not static files)
    config.http.prefer405over404 = booleanValue  // return 405 instead of 404 if path is mapped to different HTTP method
    config.http.maxRequestSize = longValue       // the max size of request body that can be accessed without using using an InputStream
    config.http.defaultContentType = stringValue //  the default content type
    config.http.asyncTimeout = longValue         // timeout in milliseconds for async requests (0 means no timeout)
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### JettyConfig
{% capture java %}
Javalin.create(config -> {
    config.jetty.server(serverSupplier); // set the Jetty Server for Javalin to run on
    config.jetty.sessionHandler(sessionHandlerSupplier); // set the SessionHandler that Jetty will use for sessions
    config.jetty.contextHandlerConfig(contextHandlerConsumer); // configure the ServletContextHandler Jetty runs on
    config.jetty.wsFactoryConfig(jettyWebSocketServletFactoryConsumer); // configure the JettyWebSocketServletFactory
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.jetty.server(serverSupplier) // set the Jetty Server for Javalin to run on
    config.jetty.sessionHandler(sessionHandlerSupplier) // set the SessionHandler that Jetty will use for sessions
    config.jetty.contextHandlerConfig(contextHandlerConsumer) // configure the ServletContextHandler Jetty runs on
    config.jetty.wsFactoryConfig(jettyWebSocketServletFactoryConsumer) // configure the JettyWebSocketServletFactory
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

#### MultipartConfig
<div class="comment">Keywords for ctrl+f: FileUploadConfig</div>
Javalin uses standard servlet file upload handling to deal with multipart requests. This allows for configuring
the maximum size for each individual file, the maximum size for the entire request, the maximum size of file to
handle via in-memory upload and the cache directory to write uploaded files to if they exceed this limit.

All of these values can be configured through the config as follows

{% capture java %}
Javalin.create(config -> {
  config.jetty.multipartConfig.cacheDirectory("c:/temp"); //where to write files that exceed the in memory limit
  config.jetty.multipartConfig.maxFileSize(100, SizeUnit.MB); //the maximum individual file size allowed
  config.jetty.multipartConfig.maxInMemoryFileSize(10, SizeUnit.MB); //the maximum file size to handle in memory
  config.jetty.multipartConfig.maxTotalRequestSize(1, SizeUnit.GB); //the maximum size of the entire multipart request
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
  config.jetty.multipartConfig.cacheDirectory("c:/temp") //where to write files that exceed the in memory limit
  config.jetty.multipartConfig.maxFileSize(100, SizeUnit.MB) //the maximum individual file size allowed
  config.jetty.multipartConfig.maxInMemoryFileSize(10, SizeUnit.MB) //the maximum file size to handle in memory
  config.jetty.multipartConfig.maxTotalRequestSize(1, SizeUnit.GB) //the maximum size of the entire multipart request
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### RequestLoggerConfig
You can add a HTTP request logger by calling `config.requestLogger.http()`.
The method takes a `Context` and the time in milliseconds it took to finish the request:

{% capture java %}
Javalin.create(config -> {
    config.requestLogger.http((ctx, ms) -> {
        // log things here
    });
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.requestLogger.http { ctx, ms ->
        // log things here
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

You can add a WebSocket logger by calling `config.requestLogger.ws()`. The method takes a the same arguments as a normal `app.ws()` call,
and can be used to log events of all types.
The following example just shows `onMessage`, but `onConnect`, `onError` and `onClose` are all available:

{% capture java %}
app.create(config -> {
    config.requestLogger.ws(ws -> {
        ws.onMessage(ctx -> {
            System.out.println("Received: " + ctx.message());
        });
    });
});
{% endcapture %}
{% capture kotlin %}
app.create { config ->
    config.requestLogger.ws(ws -> {
        ws.onMessage { ctx ->
            println("Received: " + ctx.message());
        }
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}
The logger runs after the WebSocket handler for the endpoint.

### RoutingConfig
{% capture java %}
Javalin.create(config -> {
    config.routing.contextPath = stringValue; // the context path (ex '/blog' if you are hosting an app on a subpath, like 'mydomain.com/blog')
    config.routing.ignoreTrailingSlashes = booleanValue; // treat '/path' and '/path/' as the same path
    config.routing.treatMultipleSlashesAsSingleSlash = booleanValue; // treat '/path//subpath' and '/path/subpath' as the same path
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.routing.contextPath = stringValue // the context path (ex '/blog' if you are hosting an app on a subpath, like 'mydomain.com/blog')
    config.routing.ignoreTrailingSlashes = booleanValue // treat '/path' and '/path/' as the same path
    config.routing.treatMultipleSlashesAsSingleSlash = booleanValue // treat '/path//subpath' and '/path/subpath' as the same path
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### SpaRootConfig
Single page application (SPA) mode is similar to static file handling. It runs after endpoint matching, and after static file handling.
It's basically a very fancy 404 mapper, which converts any 404's into a specified page.
You can define multiple single page handlers for your application by specifying different root paths.

You can enabled single page mode by doing `config.spaRoot.addFile("/root", "/path/to/file.html")`, and/or
`config.spaRoot.addFile("/root", "/path/to/file.html", Location.EXTERNAL)`.

#### Dynamic single page handler
You can also use a `Handler` to serve your single page root (as opposed to a static file):

```java
config.spaRoot.addHandler("/root",  ctx -> {
    ctx.html(...);
});
```

### StaticFileConfig
You can enable static file serving by doing `config.staticFiles.add("/directory", location)`.
Static resource handling is done **after** endpoint matching, meaning your own
GET endpoints have higher priority. The process looks like this:

```txt
run before-handlers
run endpoint-handlers
if no endpoint-handler found
    run static-file-handlers
    if static-file-found
        static-file-handler sends response
    else
        response is 404
run after-handlers
```

For more advanced use cases, Javalin has a `StaticFileConfig` class:

{% capture java %}
Javalin.create(config -> {
  config.staticFiles.add(staticFiles -> {
    staticFiles.hostedPath = "/";                   // change to host files on a subpath, like '/assets'
    staticFiles.directory = "/public";              // the directory where your files are located
    staticFiles.location = Location.CLASSPATH;      // Location.CLASSPATH (jar) or Location.EXTERNAL (file system)
    staticFiles.precompress = false;                // if the files should be pre-compressed and cached in memory (optimization)
    staticFiles.aliasCheck = null;                  // you can configure this to enable symlinks (= ContextHandler.ApproveAliases())
    staticFiles.headers = Map.of(...);              // headers that will be set for the files
    staticFiles.skipFileFunction = req -> false;    // you can use this to skip certain files in the dir, based on the HttpServletRequest
  });
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
  config.staticFiles.add { staticFiles ->
    staticFiles.hostedPath = "/"                    // change to host files on a subpath, like '/assets'
    staticFiles.directory = "/public"               // the directory where your files are located
    staticFiles.location = Location.CLASSPATH       // Location.CLASSPATH (jar) or Location.EXTERNAL (file system)
    staticFiles.precompress = false                 // if the files should be pre-compressed and cached in memory (optimization)
    staticFiles.aliasCheck = null                   // you can configure this to enable symlinks (= ContextHandler.ApproveAliases())
    staticFiles.headers = mapOf(...)                // headers that will be set for the files
    staticFiles.skipFileFunction = { req -> false } // you can use this to skip certain files in the dir, based on the HttpServletRequest
  }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

You can call `config.staticFiles.add(...)` multiple times to set up multiple handlers.
No configuration is shared between handlers.

WebJars can be enabled by calling `config.staticFiles.enableWebjars()`,
they will be available at `/webjars/name/version/file.ext`.
WebJars can be found on [https://www.webjars.org/](https://www.webjars.org/).
Everything available through NPM is also available through WebJars.

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
Read about how to configure sessions in our [session tutorial](/tutorials/jetty-session-handling).

#### Custom jetty handlers
You can configure your embedded jetty-server with a handler-chain
([example](https://github.com/javalin/javalin/blob/master/javalin/src/test/java/io/javalin/TestCustomJetty.kt#L71-L87)),
and Javalin will attach it's own handlers to the end of this chain.
{% capture java %}
StatisticsHandler statisticsHandler = new StatisticsHandler();

Javalin.create(config -> {
    config.server(() -> {
        Server server = new Server();
        server.setHandler(statisticsHandler);
        return server;
    })
});
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
[HelloWorldSecure](https://github.com/javalin/javalin/blob/master/javalin/src/test/java/io/javalin/examples/HelloWorldSecure.java#L22-L30).

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
Javalin's plugin system has two interfaces, `Plugin` and `PluginLifecycleInit`:

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

See the [plugins](/plugins) page for more information about plugins.

## FAQ
Frequently asked questions.

### Request lifecycle
The Javalin request lifecycle is pretty straightforward.
The following snippet covers every place you can hook into:
```java
Javalin#before              // runs first, can throw exception (which will skip any endpoint handlers)
Javalin#get/post/patch/etc  // runs second, can throw exception
Javalin#error               // runs third, can throw exception
Javalin#after               // runs fourth, can throw exception
Javalin#exception           // runs any time a handler throws (cannot throw exception)
JavalinConfig#requestLogger // runs after response is written to client
JavalinConfig#accessManager // wraps all your endpoint handlers in a lambda of your choice
```

---

### Rate limiting
There is a very simple rate limiter included in Javalin.
You can call it in the beginning of your endpoint `Handler` functions:

{% capture java %}
app.get("/", ctx -> {
    NaiveRateLimit.requestPerTimeUnit(ctx, 5, TimeUnit.MINUTES); // throws if rate limit is exceeded
    ctx.status("Hello, rate-limited World!");
});

// you can overwrite the key-function:
RateLimitUti.keyFunction = ctx -> // uses (ip+method+endpointPath) by default
{% endcapture %}
{% capture kotlin %}
app.get("/") { ctx ->
    NaiveRateLimit.requestPerTimeUnit(ctx, 5, TimeUnit.MINUTES) // throws if rate limit is exceeded
    ctx.status("Hello, rate-limited World!")
}

// you can overwrite the key-function:
RateLimitUti.keyFunction = { ctx -> } // uses (ip+method+endpointPath) by default
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Different endpoints can have different rate limits. It works as follows:

* A map of maps holds counter per key.
* On each request the counter for that key is incremented.
* If the counter exceeds the number of requests specified, an exception is thrown.
* All counters are cleared periodically on every timeunit that you specified.

---

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
on another web server (such as Tomcat), you can use Maven or Gradle to exclude Jetty, and attach Javalin as a servlet.

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

<div class="comment">Synonyms for ctrl+f: Async, CompletableFuture, Future, Concurrent, Concurrency</div>
While the default ThreadPool (200 threads) is enough for most use cases,
sometimes slow operations should be run asynchronously. Luckily it's very easy in Javalin, just
pass a `Supplier<CompletableFuture>` to `ctx.future()`. Javalin will automatically switch between sync and async modes to handle the different tasks.

#### Using Futures
Let's look at a real world example. Imagine that we have a random cat fact API that we want to call on behalf of a client.
We'll start by creating a simple method to call the API, which returns a `CompletableFuture<String>` which
will resolve either to a cat fact or an error. This is possible by using Java's native `HttpClient`:

{% capture java %}
private static CompletableFuture<HttpResponse<String>> getRandomCatFactFuture() {
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("https://catfact.ninja/fact"))
        .build();
    return httpClient.sendAsync(request, ofString());
}
{% endcapture %}
{% capture kotlin %}
private fun getRandomCatFactFuture(): CompletableFuture<HttpResponse<String>> {
    val request = HttpRequest.newBuilder()
        .uri(URI.create("https://catfact.ninja/fact"))
        .build()
    return httpClient.sendAsync(request, ofString())
)
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Now we can use this method in our Javalin app to return cat facts to the client asynchronously:

{% capture java %}
app.get("/cat-facts", ctx -> {
    ctx.future(() -> {
        return getRandomCatFactFuture()
            .thenAccept(response -> ctx.html(response.body()).status(response.statusCode()))
            .exceptionally(throwable -> {
                ctx.status(500).result("Could not get cat facts" + throwable.getMessage());
                return null;
            })
    });
});
{% endcapture %}
{% capture kotlin %}
app.get("/cat-facts") { ctx ->
    ctx.future {
        getRandomCatFactFuture()
            .thenAccept { response -> ctx.html(response.body()).status(response.statusCode()) }
            .exceptionally { throwable ->
                ctx.status(500).result("Could not get cat facts: ${throwable.message}")
                null
            }
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

By calling `ctx.future(supplier)` you are not putting Javalin in an async state. It's a simple setter method,
which makes it possible for Javalin to call the given supplier and switch into async mode at an appropriate time.

The `ctx.future()` method works great if you are using a `CompletableFuture` based API, like Java's `HttpClient`, but
if you have long running tasks which aren't `CompletableFuture` based,
you might want to try the `ctx.async(runnable)` (see next section).

#### Executing blocking tasks asynchronously

If you want to execute a blocking task outside of the server ThreadPool, you can use `ctx.async()`.
The snippet below shows the available overloads for the method:

```
async(runnableTask)                               // Javalin's default executor, no timeout or timeout callback
async(timeout, onTimeout, runnableTask)           // Javalin's default executor, custom timeout handling
async(executor, timeout, onTimeout, runnableTask) // custom everything!
```

Javalin will immediately start an async context and run the task on a dedicated executor service.
It will resume the normal request flow (after-handlers, request-logging)
once the task is done.

The snippet belows shows a full example with a custom timeout, timeout handler, and a task:

{% capture java %}
app.get("/async", ctx -> {
    ctx.async(
        1000,                                      // timeout in ms
        () -> ctx.result("Request took too long"), // timeout callback
        () -> ctx.result(someSlowResult)           // some long running task
    );
});
{% endcapture %}
{% capture kotlin %}

app.get("/async") { ctx ->
    ctx.async(
        1000,                                    // timeout in ms
        { ctx.result("Request took too long") }, // timeout callback
        { ctx.result(someSlowResult)             // some long running task
    )
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

---

### Configuring the JSON mapper

To configure the JsonMapper, you need to pass an object which implements the `JsonMapper` interface
to `config.jsonMapper()`.

The `JsonMapper` interface has four optional methods:

```java
String toJsonString(Object obj, Type type) { // basic method for mapping to json
InputStream toJsonStream(Object obj, Type type) { // memory efficient method for mapping to json
<T> T fromJsonString(String json, Type targetType) { // basic method for mapping from json
<T> T fromJsonStream(InputStream json, Type targetType) { // memory efficient method for mapping from json
```

#### GSON example

{% capture java %}
Gson gson = new GsonBuilder().create();
JsonMapper gsonMapper = new JsonMapper() {
    @Override
    public String toJsonString(@NotNull Object obj, @NotNull Type type) {
        return gson.toJson(obj, type);
    }

    @Override
    public <T> T fromJsonString(@NotNull String json, @NotNull Type targetType) {
        return gson.fromJson(json, targetType);
    }
};
Javalin app = Javalin.create(config -> config.jsonMapper(gsonMapper)).start(7070);
{% endcapture %}
{% capture kotlin %}
val gson = GsonBuilder().create()

val gsonMapper = object : JsonMapper {

    override fun <T : Any> fromJsonString(json: String, targetType: Type): T =
        gson.fromJson(json, targetType)

    override fun toJsonString(obj: Any, type: Type) =
        gson.toJson(obj)

}

val app = Javalin.create { it.jsonMapper(gsonMapper) }.start(7070)
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

---

### Adding other Servlets and Filters to Javalin
Javalin is designed to work with other `Servlet` and `Filter` instances running on the Jetty Server.
Filters are pretty straighforward to add, since they don't finish the request. 
If you need to add a serlvet there's an example in the repo:
[/src/test/java/io/javalin/examples/HelloWorldServlet.java#L21-L29](https://github.com/javalin/javalin/blob/master/javalin/src/test/java/io/javalin/examples/HelloWorldServlet.java#L21-L29)

You can also use it to build simple proxy using `AsyncProxyServlet` that is part of Jetty:

```java
// Add org.eclipse.jetty:jetty-proxy to maven/gradle dependencies (e.g Javalin 5.3.2 uses Jetty 11.0.13)
Javalin.create(config -> {
    config.jetty.contextHandlerConfig(sch -> {
	ServletHolder proxyServlet = new ServletHolder(AsyncProxyServlet.Transparent.class);
	proxyServlet.setInitParameter("proxyTo", "https://javalin.io/");
	proxyServlet.setInitParameter("prefix", "/proxy");
	sch.addServlet(proxyServlet, "/proxy/*");
    });
}).start(7000);
```

After opening `http://localhost:7000/proxy/` you will see Javalin site (but with broken styles because of file paths).

---

### Views and Templates
Each Javalin instance has a `FileRenderer` attached to it. The `FileRenderer` interface has one method:

```java
String render(String filePath, Map<String, Object> model, Context context)
```

This method is called when you call `Context#render`.
It can be configured through the config passed to `Javalin.create()`:

{% capture java %}
config.fileRenderer((filePath, model, context) -> "Rendered template");
{% endcapture %}
{% capture kotlin %}
config.fileRenderer { filePath, model, context -> "Rendered template" }
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

The default `FileRenderer` of Javalin is a singleton named `JavalinRenderer`, see
the section below for more information.

### Default implementations
Javalin offers an artifact with several template engines, called `javalin-rendering`,
which follows the same version as the `javalin` artifact.
The template engines look for templates/markdown files in `src/resources`,
and the correct rendering engine is chosen based on the extension of your template.
This artifact currently supports several template engines (see below), as well as markdown.
You can also register your own rendering engine.

Rendering a template:
{% capture java %}
ctx.render("/templateFile.ext", model("firstName", "John", "lastName", "Doe"));
{% endcapture %}
{% capture kotlin %}
ctx.render("/templateFile.ext", mapOf("firstName" to "John", "lastName" to "Doe"))
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Registering a new engine:
{% capture java %}
JavalinRenderer.register(new JavalinPebble(), ".peb", ".pebble");

JavalinRenderer.register((filePath, model, ctx) -> {
    return MyRenderer.render(filePath, model, ctx);
}, ".ext");
{% endcapture %}

{% capture kotlin %}
JavalinRenderer.register(JavalinPebble(), ".peb", ".pebble")

JavalinRenderer.register({ filePath, model, ctx ->
    MyRenderer.render(filePath, model, ctx)
}, ".ext")
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

If you wish to configure a template engine (for example, to set a root directory for your template files),
all `JavalinTemplateEngine.init` methods receive optional parameters with their template engine
configurations:

```kotlin
JavalinFreemarker.init(configuration: Configuration?)
JavalinJte.init(templateEngine: TemplateEngine?, isDevFunction: ((Context) -> Boolean)?)
JavalinMustache.init(mustacheFactory: MustacheFactory?)
JavalinPebble.init(pebbleEngine: PebbleEngine?)
JavalinThymeleaf.init(templateEngine: TemplateEngine?)
JavalinVelocity.init(velocityEngine: VelocityEngine?)
JavalinCommonmark.init(htmlRenderer: HtmlRenderer?, parser: Parser?)
```

Please consult the documentation for that particular template engine to learn how to use
them, these kinds of settings are not handled through Javalin.

If you need to configure settings beyond what's available in `JavalinTemplateEngine.init` (for example,
to set a custom file extension), you have to write your own implementation and register it using
`JavalinRenderer.register`.

Note that if you're using `JavalinRenderer`, these are global settings,
and cannot be configured per instance of Javalin.

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

Javalin will also put path-parameters in the Vue instance,
which you can access like this:

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
get("/messages",        VueComponent("inbox-view"))
get("/messages/{user}", VueComponent("thread-view"))
```

This will give you a lot of the benefits of a modern frontend architecture,
with very few of the downsides.

There are more extensive docs at [/plugins/javalinvue](/plugins/javalinvue), and there is
an in-depth tutorial at [/tutorials/simple-frontends-with-javalin-and-vue](/tutorials/simple-frontends-with-javalin-and-vue).

---

### Jetty debug logs
If you encounter `TimeoutExceptions` and `ClosedChannelExceptions` in your DEBUG logs,
this is nothing to worry about. Typically, a browser will keep the HTTP connection open until the
server terminates it. When this happens is decided by the server's `idleTimeout` setting,
which is 30 seconds by default in Jetty/Javalin. This is not a bug.

---

### Minecraft
<div class="comment">Keywords for ctrl+f: Bukkit, Spigot, BungeeCord, Bungee Cord, WaterFall, Water Fall, Paper</div>

A lot of people use Javalin for Minecraft servers, and they often have issues with Jetty and WebSockets.

Please consider consulting our [Minecraft tutorial](/tutorials/javalin-and-minecraft-servers) if you're working with Javalin and a Minecraft server.

#### Relocation
Use [relocate](https://imperceptiblethoughts.com/shadow/configuration/relocation/) is not required, but it can easily conflict with other plugin dependencies.
If this is a publicly released plugin, this step is recommended to make Javalin work on a different Minecraft Server.

Usually jetty causes the conflict, you can add gradle script to `build.gradle` following after adding the `shadow-jar` gradle plugin:

```groovy
shadowJar {
    relocate 'org.eclipse.jetty', 'shadow.org.eclipse.jetty'
}
```

#### Custom classloader
If you encounter some dependency missing errors such as `java.lang.NoClassDefFoundError` and `java.lang.ClassNotFoundException`, try to solve it by:

```java
ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
Thread.currentThread().setContextClassLoader(RemoteAPI.class.getClassLoader());
Javalin app = Javalin.create().start(PORT);
Thread.currentThread().setContextClassLoader(classLoader);
```

RemoteAPI can usually use the class loader of the main class of the plugin.
On Bukkit and Spigot it is a class extends `org.bukkit.plugin.java#JavaPlugin`, on BungeeCord and WaterFall it is a class extends `net.md_5.bungee.api.plugin#Plugin`.
Get it via `{your plugin's main class}.class.getClassLoader()` .

After switching the class loader, you may still receive a missing dependency error from Javalin. You only need to add the corresponding dependency as prompted in the Javalin log.

#### Relevant issues
* [https://github.com/javalin/javalin/issues/358](https://github.com/javalin/javalin/issues/358) (with solution)
* [https://github.com/javalin/javalin/issues/232](https://github.com/javalin/javalin/issues/232)
* [https://github.com/javalin/javalin/issues/1462](https://github.com/javalin/javalin/issues/1462)

---

### Documentation for previous versions
Docs for 4.6.X (last 4.X version) can be found [here](/archive/docs/v4.6.X.html).\\
Docs for 3.13.X (last 3.X version) can be found [here](/archive/docs/v3.13.X.html).\\
Docs for 2.8.0 (last 2.X version) can be found [here](/archive/docs/v2.8.0.html).\\
Docs for 1.7.0 (last 1.X version) can be found [here](/archive/docs/v1.7.0.html).

---

<div style="height:calc(100vh - 200px)">You've reached the end of the docs, congratulations.</div>
