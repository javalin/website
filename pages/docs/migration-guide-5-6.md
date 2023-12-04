---
layout: default
title: Migration guide, v5 to v6
rightmenu: false
permalink: /migration-guide-javalin-5-to-6
---

<h1 class="no-margin-top">Javalin 5 to 6 migration guide</h1>

This page attempts to cover all the things you need to know in order to migrate from Javalin 5 to Javalin 6.
If you find any errors, or if something is missing, please <a href="{{site.repourl}}/blob/master/{{page.path}}">edit this page on GitHub</a>.

## The AccessManager interface has been removed
This is quite a big internal change, and migrating should be performed with some care.
It's not a difficult migration, but it's important to understand what's going on.

In Javalin 5, the `AccessManager` interface wrapped endpoint-handlers in a lambda,
and allowed you to choose whether to call the wrapped endpoint-handlers.
This meant that the `AccessManager` was not called for static files or before/after handlers, 
it was only called for endpoint handlers. Let's look at an example of an `AccessManager` in Javalin 5:

{% capture java %}
config.accessManager((handler, ctx, routeRoles) -> {
    var userRole = getUserRole(ctx); // some user defined function that returns a user role
    if (routeRoles.contains(userRole)) { // routeRoles are provided through the AccessManager interface
        handler.handle(ctx); // if handler.handle(ctx) is not called, the endpoint handler is not called
    }
});
{% endcapture %}
{% capture kotlin %}
config.accessManager { handler, ctx, routeRoles ->
    val userRole = getUserRole(ctx) // some user defined function that returns a user role
    if (routeRoles.contains(userRole)) { // routeRoles are provided through the AccessManager interface
        handler.handle(ctx) // if handler.handle(ctx) is not called, the endpoint handler is not called
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Now, let's look at a similar example in Javalin 6:

{% capture java %}
app.beforeMatched(ctx -> {
    var userRole = getUserRole(ctx); // some user defined function that returns a user role
    if (!ctx.routeRoles().contains(userRole)) { // routeRoles are provided through the Context interface
        throw new UnauthorizedResponse(); // request will have to be explicitly stopped by throwing an exception
    }
});
{% endcapture %}
{% capture kotlin %}
app.beforeMatched { ctx ->
    val userRole = getUserRole(ctx) // some user defined function that returns a user role
    if (!ctx.routeRoles().contains(userRole)) { // routeRoles are provided through the Context interface
        throw UnauthorizedResponse() // request will have to be explicitly stopped by throwing an exception
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

While this looks similar, there is an important difference. 
As mentioned, in Javalin 5, the `AccessManager` was only called for endpoint handlers, 
this means that the Javalin 5 example would not be called for static files or before/after handlers,
while the Javalin 6 example would be called for **all** requests.
If you want to migrate to a `beforeMatched` in Javalin 6 that has the same behavior as the `AccessManager` in Javalin 5,
you should perform a check for the presence of route roles in the `beforeMatched` handler:

{% capture java %}
app.beforeMatched(ctx -> {
    if (ctx.routeRoles().isEmpty()) { // route roles can only be attached to endpoint handlers
        return; // if there are no route roles, we don't need to check anything
    }
    var userRole = getUserRole(ctx);
    if (!ctx.routeRoles().contains(userRole)) {
        throw new UnauthorizedResponse();
    }
});
{% endcapture %}
{% capture kotlin %}
app.beforeMatched { ctx ->
    if (ctx.routeRoles().isEmpty()) { // route roles can only be attached to endpoint handlers
        return // if there are no route roles, we don't need to check anything
    }
    val userRole = getUserRole(ctx)
    if (!ctx.routeRoles().contains(userRole)) {
        throw UnauthorizedResponse()
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Untyped "app attributes" are now typed "app data"
In Javalin 5, you could attach and access untyped attributes to the Javalin instance, like this:

{% capture java %}
// register a custom attribute
var app = Javalin.create()
app.attribute("my-key", myValue);
// access a custom attribute
var myValue = (MyValue) ctx.appAttribute("my-key");
// call a custom method on a custom attribute
((MyValue) ctx.appAttribute("my-key")).myMethod();
{% endcapture %}
{% capture kotlin %}
// register a custom attribute
val app = Javalin.create()
app.attribute("my-key", myValue)
// access a custom attribute
val myValue = ctx.appAttribute("my-key") as MyValue
// call a custom method on a custom attribute
(ctx.appAttribute("my-key") as MyValue).myMethod()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

In Javalin 6, the `appAttribute` methods have been renamed to `appData`, 
and the data is now typed through the `Key<T>` class.
Data is now registered through the `JavalinConfig`, as opposed to the `Javalin` instance itself:

{% capture java %}
// register a custom attribute
static var myKey = new Key<MyValue>("my-key");
var app = Javalin.create(config -> {
    config.appData(myKey, myValue);
});
// access a custom attribute
var myValue = ctx.appData(myKey); // var will be inferred to MyValue
// call a custom method on a custom attribute
ctx.appData(myKey).myMethod();
{% endcapture %}
{% capture kotlin %}
// register a custom attribute
val myKey = Key<MyValue>("my-key")
val app = Javalin.create { config ->
    config.appData(myKey, myValue)
}
// access a custom attribute
val myValue = ctx.appData(myKey) // val will be inferred to MyValue
// call a custom method on a custom attribute
ctx.appData(myKey).myMethod()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

You don't have to store your keys in a static variable (although it's recommended), so the shortest
migration path would be to just replace `appAttribute` with `appData` and wrap your strings in `Key<T>`
(both when declaring the attribute and when accessing it).

## The Javalin#routes() method has been moved
In Javalin 5, you could attach routes by calling `Javalin#routes(...)`, and then defining the routes
inside the lambda. Since a lot of people did this *after* starting the server, we decided to move
this to the config.

In Javalin 5:
{% capture java %}
var app = Javalin.create().start();
app.routes(() -> {
    get("/hello", ctx -> ctx.result("Hello World"));
});
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create().start()
app.routes {
    get("/hello") { ctx -> ctx.result("Hello World") }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

In Javalin 6:
{% capture java %}
var app = Javalin.create(config -> {
    config.router.apiBuilder(() -> {
        get("/hello", ctx -> ctx.result("Hello World"));
    });
}).start();
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create { config ->
    config.router.apiBuilder {
        get("/hello") { ctx -> ctx.result("Hello World") }
    }
}.start()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Jetty config has been reworked
In Javalin5, you configured Jetty like this:

{% capture java %}
Javalin.create(config -> {
    config.jetty.server(serverSupplier); // set the Jetty Server for Javalin to run on
    config.jetty.sessionHandler(sessionHandlerSupplier); // set the SessionHandler that Jetty will use for sessions
    config.jetty.contextHandlerConfig(contextHandlerConsumer); // configure the ServletContextHandler Jetty runs on
    config.jetty.wsFactoryConfig(jettyWebSocketServletFactoryConsumer); // configure the JettyWebSocketServletFactory
    config.jetty.httpConfigurationConfig(httpConfigurationConsumer); // configure the HttpConfiguration of Jetty
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.jetty.server(serverSupplier) // set the Jetty Server for Javalin to run on
    config.jetty.sessionHandler(sessionHandlerSupplier) // set the SessionHandler that Jetty will use for sessions
    config.jetty.contextHandlerConfig(contextHandlerConsumer) // configure the ServletContextHandler Jetty runs on
    config.jetty.wsFactoryConfig(jettyWebSocketServletFactoryConsumer) // configure the JettyWebSocketServletFactory
    config.jetty.httpConfigurationConfig(httpConfigurationConsumer) // configure the HttpConfiguration of Jetty
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

This has been reworked a bit. We wanted to get rid of the supplier methods, and rather focus on giving users the
option to modify the existing Jetty objects. In particular swapping out the Jetty Server could cause issues,
both with Javalin internals and with Javalin plugins. The new Jetty config in Javalin 6 looks like this:

{% capture java %}
Javalin.create(config -> {
    config.jetty.defaultHost = "localhost"; // set the default host for Jetty
    config.jetty.defaultPort = 1234; // set the default port for Jetty
    config.jetty.threadPool = new ThreadPool(); // set the thread pool for Jetty
    config.jetty.multipartConfig = new MultipartConfig(); // set the multipart config for Jetty
    config.jetty.modifyJettyWebSocketServletFactory(factory -> {}); // modify the JettyWebSocketServletFactory
    config.jetty.modifyServer(server -> {}); // modify the Jetty Server
    config.jetty.modifyServletContextHandler(handler -> {}); // modify the ServletContextHandler (you can set a SessionHandler here)
    config.jetty.modifyHttpConfiguration(httpConfig -> {}); // modify the HttpConfiguration
    config.jetty.addConnector((server, httpConfig) -> new ServerConnector(server)); // add a connector to the Jetty Server
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.jetty.defaultHost = "localhost" // set the default host for Jetty
    config.jetty.defaultPort = 1234 // set the default port for Jetty
    config.jetty.threadPool = ThreadPool() // set the thread pool for Jetty
    config.jetty.multipartConfig = MultipartConfig() // set the multipart config for Jetty
    config.jetty.modifyJettyWebSocketServletFactory { factory -> } // modify the JettyWebSocketServletFactory
    config.jetty.modifyServer { server -> } // modify the Jetty Server
    config.jetty.modifyServletContextHandler { handler -> } // modify the ServletContextHandler (you can set a SessionHandler here)
    config.jetty.modifyHttpConfiguration { httpConfig -> } // modify the HttpConfiguration
    config.jetty.addConnector { server, httpConfig -> ServerConnector(server) } // add a connector to the Jetty Server
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

If you really need to set the Jetty Server, you can do so by accessing it through 
Javalin's private config: `config.pvt.jetty.server`.

## New signature for Context#async
In Javalin 5, the `Context#async` method had the following signature:

{% capture java %}
ctx.async(
    10L, // timeoutMillis
    () -> ctx.result("Timeout"), // onTimeout
    () -> { // task
        Thread.sleep(500L);
        ctx.result("Result");
    }
))
{% endcapture %}
{% capture kotlin %}
ctx.async(
    timeout = 10L,
    onTimeout = { ctx.result("Timeout") },
    task = {
        Thread.sleep(500L)
        ctx.result("Result")
    }
)
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

In Javalin 6, this was changed to a consumer-based signature, similar to many other Javalin APIs:

{% capture java %}
ctx.async(config -> {
    config.timeout = 10L;
    config.onTimeout(timeoutCtx -> timeoutCtx.result("Timeout"));
}, () -> {
    Thread.sleep(500L);
    ctx.result("Result");
});
{% endcapture %}
{% capture kotlin %}
ctx.async({ config ->
    config.timeout = 10L
    config.onTimeout { timeoutCtx -> timeoutCtx.result("Timeout") }
}) {
    Thread.sleep(500L)
    ctx.result("Result")
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Changes to private config
In Javalin 5, you could access Javalin's private config through `app.cfg`, 
this has been change to `app.unsafeConfig()` in Javalin 6, in order to make it clear that it's not
recommended to access/change the config. We have also removed `app.updateConfig()`,
as that also gave the impression that updating the config manually was a safe action.

Most end-users of Javalin should not need to access the private config, if you have a use-case
that requires it, please reach out to us on [Discord](https://discord.com/invite/sgak4e5NKv) or 
[GitHub](https://github.com/javalin/javalin).

## Changes to compression
The `Context` interface now has a `minSizeForCompression()` function, which sets a minimum size for
compression. If no value is set, this is populated from the  current 
`CompressionStrategy` (which is set on the `JavalinConfig`).
This allows you to enable compression for responses of unknown size, by calling `minSizeForCompression(0)`.

We also added a `compressionDecisionMade` flag to `CompressedOutputStream`, to avoid this decision being made
multiple times for the same output stream.

Compression config has also been moved from `config.compression` into `config.http`. In Javalin 5:

{% capture java %}
Javalin.create(config -> {
    config.compression.custom(compressionStrategy);      
    config.compression.brotliAndGzip(gzipLvl, brotliLvl);
    config.compression.gzipOnly(gzipLvl);                
    config.compression.brotliOnly(brotliLvl);            
    config.compression.none();                           
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.compression.custom(compressionStrategy)      
    config.compression.brotliAndGzip(gzipLvl, brotliLvl)
    config.compression.gzipOnly(gzipLvl)                
    config.compression.brotliOnly(brotliLvl)            
    config.compression.none()                           
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

In Javalin 6:
{% capture java %}
Javalin.create(config -> {
    config.http.customCompression(compressionStrategy);      
    config.http.brotliAndGzipCompression(gzipLvl, brotliLvl);
    config.http.gzipOnlyCompression(gzipLvl);                
    config.http.brotliOnlyCompression(brotliLvl);            
    config.http.disableCompression();                           
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.http.customCompression(compressionStrategy)      
    config.http.brotliAndGzipCompression(gzipLvl, brotliLvl)
    config.http.gzipOnlyCompression(gzipLvl)                
    config.http.brotliOnlyCompression(brotliLvl)            
    config.http.disableCompression()                           
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Miscellaneous changes
* We've removed support for jvmbrotli, as it's no longer maintained. Use Brotli4j instead.
* We've added a small API for getting the type of status code a `HttpStatus` is. For example,
  `status.isSuccess()` will return true for all 2xx status codes.
* It's now possible to exclude the Jetty websocket dependency without breaking Javalin.
  This is useful if you want to save a couple of bytes, or have other dependencies that
  conflict with Jetty's websocket dependency.
* Now that Loom is part of the official JDKs, it is no longer opt-in, and therefor no longer enabled by default.  
  You can enable it by calling `config.useVirtualThreads = true`.

## Additional changes
It's hard to keep track of everything, but you can look at the
[full commit log](https://github.com/javalin/javalin/compare/javalin-parent-5.6.3...javalin-parent-6.0.0-beta.2)
between the last 5.x version and 6.0.

If you run into something not covered by this guide, please <a href="{{site.repourl}}/blob/master/{{page.path}}">edit this page on GitHub</a>!

You can also reach out to us on
[Discord](https://discord.com/invite/sgak4e5NKv) or
[GitHub](https://github.com/javalin/javalin).
