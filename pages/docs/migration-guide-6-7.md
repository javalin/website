---
layout: default
title: Migration guide, v6 to v7
rightmenu: false
permalink: /migration-guide-javalin-6-to-7
---

<h1 class="no-margin-top">Javalin 6 to 7 migration guide</h1>

Javalin 7 brings exciting new features and improvements! This guide will help you migrate from Javalin 6 to 7.
If you find any errors, or if something is missing, please <a href="{{site.repourl}}/blob/master/{{page.path}}">edit this page on GitHub</a>.

## What's new in Javalin 7

### Enhanced endpoint metadata system
Javalin 7 introduces a powerful new metadata system that lets you attach custom metadata to your endpoints!
This opens up many possibilities for documentation generation, API introspection, and custom tooling.

The `Context#endpoint()` method now returns a rich `Endpoint` object with access to the path, method, handler, and custom metadata:

{% capture java %}
// Define custom metadata
public record ApiDoc(String description, String version) implements EndpointMetadata {}

// Add metadata to endpoint
config.router.mount(router -> {
    router.addEndpoint(
        Endpoint.create(HandlerType.GET, "/users")
            .addMetadata(new ApiDoc("Get all users", "v1"))
            .addMetadata(new Roles(Set.of(Role.ADMIN)))
            .handler(ctx -> ctx.result("Users"))
    );
});

// Access metadata in handlers or middleware
config.routes.get("/users", ctx -> {
    ApiDoc doc = ctx.endpoint().metadata(ApiDoc.class);
    String description = doc.description(); // "Get all users"
});
{% endcapture %}
{% capture kotlin %}
// Define custom metadata
data class ApiDoc(val description: String, val version: String) : EndpointMetadata

// Add metadata to endpoint
config.router.mount { router ->
    router.addEndpoint(
        Endpoint.create(HandlerType.GET, "/users")
            .addMetadata(ApiDoc("Get all users", "v1"))
            .addMetadata(Roles(setOf(Role.ADMIN)))
            .handler { ctx -> ctx.result("Users") }
    )
}

// Access metadata in handlers or middleware
config.routes.get("/users") { ctx ->
    val doc = ctx.endpoint().metadata(ApiDoc::class.java)
    val description = doc.description // "Get all users"
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Zstandard compression support
Javalin 7 now supports Zstandard compression alongside Gzip and Brotli! Zstandard offers better compression ratios
and faster decompression than Gzip, making your API responses even more efficient.

### Custom HTTP methods
You can now use custom HTTP methods beyond the standard GET, POST, PUT, DELETE, etc. This is useful for
implementing custom protocols or working with APIs that use non-standard methods.

### Other improvements
* Jetty 12 brings significant performance improvements
* Better async timeout configuration for long-running requests
* Static files can now have route roles for access control
* Built on Java 17 and Kotlin 2.0.21

## Breaking changes and migration steps

### Routing is now configured upfront
Routes are now defined in the config block, ensuring all routes are registered before the server starts.
This makes your application configuration more explicit and reliable.

In Javalin 6:
{% capture java %}
var app = Javalin.create().start();
app.get("/hello", ctx -> ctx.result("Hello World"));
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create().start()
app.get("/hello") { ctx -> ctx.result("Hello World") }
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

In Javalin 7:
{% capture java %}
var app = Javalin.create(config -> {
    config.routes.get("/hello", ctx -> ctx.result("Hello World"));
}).start();
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create { config ->
    config.routes.get("/hello") { ctx -> ctx.result("Hello World") }
}.start()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

You can also use the `apiBuilder` syntax:
{% capture java %}
var app = Javalin.create(config -> {
    config.routes.apiBuilder(() -> {
        get("/hello", ctx -> ctx.result("Hello World"));
    });
}).start();
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create { config ->
    config.routes.apiBuilder {
        get("/hello") { ctx -> ctx.result("Hello World") }
    }
}.start()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Lifecycle events are now configured upfront
Like routes, lifecycle events are now configured in the config block for consistency and clarity.

In Javalin 6:
{% capture java %}
var app = Javalin.create();
app.events(event -> {
    event.serverStarting(() -> System.out.println("Server is starting"));
    event.serverStarted(() -> System.out.println("Server is started"));
});
app.start();
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create()
app.events { event ->
    event.serverStarting { println("Server is starting") }
    event.serverStarted { println("Server is started") }
}
app.start()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

In Javalin 7:
{% capture java %}
var app = Javalin.create(config -> {
    config.events.serverStarting(() -> System.out.println("Server is starting"));
    config.events.serverStarted(() -> System.out.println("Server is started"));
}).start();
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create { config ->
    config.events.serverStarting { println("Server is starting") }
    config.events.serverStarted { println("Server is started") }
}.start()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### The createAndStart() method has been removed
The `createAndStart()` convenience method has been removed. Use `create().start()` instead.

In Javalin 6:
{% capture java %}
var app = Javalin.createAndStart(config -> {
    config.jetty.defaultPort = 8080;
});
{% endcapture %}
{% capture kotlin %}
val app = Javalin.createAndStart { config ->
    config.jetty.defaultPort = 8080
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

In Javalin 7:
{% capture java %}
var app = Javalin.create(config -> {
    config.jetty.defaultPort = 8080;
}).start();
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create { config ->
    config.jetty.defaultPort = 8080
}.start()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Richer endpoint information with ctx.endpoint()
The `Context#matchedPath()` method has been replaced with `Context#endpoint()`, which returns a rich
`Endpoint` object with much more information about the matched route.

**Simple migration:** `ctx.matchedPath()` becomes `ctx.endpoint().path()`

In Javalin 6:
{% capture java %}
app.get("/users/{id}", ctx -> {
    String path = ctx.matchedPath(); // "/users/{id}"
});
{% endcapture %}
{% capture kotlin %}
app.get("/users/{id}") { ctx ->
    val path = ctx.matchedPath() // "/users/{id}"
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

In Javalin 7:
{% capture java %}
config.routes.get("/users/{id}", ctx -> {
    String path = ctx.endpoint().path(); // "/users/{id}"
});
{% endcapture %}
{% capture kotlin %}
config.routes.get("/users/{id}") { ctx ->
    val path = ctx.endpoint().path() // "/users/{id}"
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

**Bonus:** The `Endpoint` object gives you access to much more information:

{% capture java %}
config.routes.get("/users/{id}", ctx -> {
    Endpoint endpoint = ctx.endpoint();
    String path = endpoint.path();           // "/users/{id}"
    HandlerType method = endpoint.method();  // GET
    Handler handler = endpoint.handler();    // the handler function
    // Access custom metadata (see below)
});
{% endcapture %}
{% capture kotlin %}
config.routes.get("/users/{id}") { ctx ->
    val endpoint = ctx.endpoint()
    val path = endpoint.path()           // "/users/{id}"
    val method = endpoint.method()       // GET
    val handler = endpoint.handler()     // the handler function
    // Access custom metadata (see below)
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

The same change applies to WebSocket contexts:

{% capture java %}
config.routes.ws("/chat/{room}", ws -> {
    ws.onConnect(ctx -> {
        String path = ctx.endpoint().path(); // "/chat/{room}"
    });
});
{% endcapture %}
{% capture kotlin %}
config.routes.ws("/chat/{room}") { ws ->
    ws.onConnect { ctx ->
        val path = ctx.endpoint().path() // "/chat/{room}"
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### JavalinVue is now a plugin
JavalinVue configuration has been moved to a bundled plugin for better modularity.

In Javalin 6:
{% capture java %}
var app = Javalin.create(config -> {
    config.vue.vueAppName = "my-app";
});
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create { config ->
    config.vue.vueAppName = "my-app"
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

In Javalin 7:
{% capture java %}
var app = Javalin.create(config -> {
    config.registerPlugin(new JavalinVuePlugin(vue -> {
        vue.vueAppName = "my-app";
    }));
});
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create { config ->
    config.registerPlugin(JavalinVuePlugin { vue ->
        vue.vueAppName = "my-app"
    })
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Template rendering is now modular
The `javalin-rendering` module has been split into separate modules for each template engine.

**Migration:** Replace `javalin-rendering` with `javalin-rendering-{engine}` in your build file, and remove the template engine dependency (it's now bundled).

Available modules:
* `javalin-rendering-velocity`
* `javalin-rendering-freemarker`
* `javalin-rendering-thymeleaf`
* `javalin-rendering-mustache`
* `javalin-rendering-pebble`
* `javalin-rendering-commonmark`
* `javalin-rendering-jte`

Your code doesn't need to change - the template renderer classes (`JavalinVelocity`, `JavalinFreemarker`, etc.) remain in the same package and work the same way.

### Multipart configuration improvements
Multipart configuration is now part of the Jetty config instead of a global singleton, giving you more flexibility.
If you were using `MultipartUtil.preUploadFunction`, configure multipart settings through `config.jetty.multipartConfig` instead.

### Jetty 12 upgrade
If you're using Jetty-specific APIs directly, note that:
* Package names have changed from `javax.servlet.*` to `jakarta.servlet.*`
* Some Jetty APIs have been updated or deprecated

### Java 17 required
Javalin 7 requires Java 17 or higher (previously Java 11).

## Additional improvements
* Kotlin upgraded from 1.9.25 to 2.0.21
* `HandlerType` is now a record instead of an enum
* HTTP 405 responses now include the `Allow` header
* Better handling of invalid URL encoding in form parameters
* Support for quoted charset in content-type header
* The JavalinTest client now uses JDK's native HttpClient instead of OkHttp
* Removed support for Conscrypt ALPN from SSL Plugin (use standard JDK ALPN instead)

## Additional changes
It's hard to keep track of everything, but you can look at the
[full commit log](https://github.com/javalin/javalin/compare/javalin-parent-6.7.0...javalin-parent-7.0.0-alpha.1)
between the last 6.x version and 7.0.

If you run into something not covered by this guide, please <a href="{{site.repourl}}/blob/master/{{page.path}}">edit this page on GitHub</a>!

You can also reach out to us on
[Discord](https://discord.com/invite/sgak4e5NKv) or
[GitHub](https://github.com/javalin/javalin).

