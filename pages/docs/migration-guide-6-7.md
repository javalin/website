---
layout: default
title: Migration guide, v6 to v7
rightmenu: false
permalink: /migration-guide-javalin-6-to-7
---

<h1 class="no-margin-top">Javalin 6 to 7 migration guide</h1>

This guide will help you migrate from Javalin 6 to 7.
If you find any errors, or if something is missing, please <a href="{{site.repourl}}/blob/master/{{page.path}}">edit this page on GitHub</a>.

## Breaking changes

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

### ctx.matchedPath() replaced with ctx.endpoint().path()
The `Context#matchedPath()` method has been replaced with `Context#endpoint()`.

**Migration:** `ctx.matchedPath()` becomes `ctx.endpoint().path()`

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
* `javalin-rendering-handlebars`

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

### Kotlin standard library dependencies removed
Javalin 7 no longer includes `kotlin-stdlib-jdk8` and `kotlin-reflect` as transitive dependencies.
If your project relies on these, you'll need to add them explicitly to your build file.

### JavalinConfig split into JavalinConfig and JavalinState
Javalin's internal configuration has been split into two classes:
- **JavalinConfig**: Used during application setup (in `Javalin.create()`)
- **JavalinState**: The runtime state after configuration is complete

If you were accessing Javalin's internal config through `app.unsafe` (previously `app.unsafeConfig()` in Javalin 6), you now get a `JavalinState` instance instead of `JavalinConfig`.

**Migration:** Update references from `app.unsafeConfig().pvt` to `app.unsafe`:

In Javalin 6:
{% capture java %}
var app = Javalin.create().start();
var jetty = app.unsafeConfig().pvt.jetty;
var jsonMapper = app.unsafeConfig().pvt.jsonMapper;
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create().start()
val jetty = app.unsafeConfig().pvt.jetty
val jsonMapper = app.unsafeConfig().pvt.jsonMapper
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

In Javalin 7:
{% capture java %}
var app = Javalin.create().start();
var jetty = app.unsafe.jetty;
var jsonMapper = app.unsafe.jsonMapper;
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create().start()
val jetty = app.unsafe.jetty
val jsonMapper = app.unsafe.jsonMapper
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

**Note:** Some properties have moved to subconfigs. For example:
- `app.unsafeConfig().pvt.compressionStrategy` → `app.unsafe.http.compressionStrategy`
- `app.unsafeConfig().pvt.jetty.server` → `app.unsafe.jettyInternal.server`

**Plugin developers:** If you're writing custom plugins, the `Plugin.onStart()` method now receives `JavalinState` instead of `JavalinConfig`:

In Javalin 6:
{% capture java %}
@Override
public void onStart(JavalinConfig config) {
    config.jetty.addConnector(...);
}
{% endcapture %}
{% capture kotlin %}
override fun onStart(config: JavalinConfig) {
    config.jetty.addConnector(...)
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

In Javalin 7:
{% capture java %}
@Override
public void onStart(JavalinState state) {
    state.jetty.addConnector(...);
}
{% endcapture %}
{% capture kotlin %}
override fun onStart(state: JavalinState) {
    state.jetty.addConnector(...)
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Other changes

### Major dependency updates
* **Jetty**: 11 → 12 (see breaking changes above)
* **Kotlin**: 1.9.25 → 2.0.21
* **Pebble** (rendering module): 3.x → 4.0.0

### Other changes
* `HandlerType` is now a record instead of an enum
* The JavalinTest client now uses JDK's native HttpClient instead of OkHttp
* Removed support for Conscrypt ALPN from SSL Plugin (use standard JDK ALPN instead)

## Additional changes
It's hard to keep track of everything, but you can look at the
[full commit log](https://github.com/javalin/javalin/compare/javalin-parent-{{site.javalinSixVersion}}...javalin-parent-7.0.0-alpha.4)
between the last 6.x version and 7.0.0.

If you run into something not covered by this guide, please <a href="{{site.repourl}}/blob/master/{{page.path}}">edit this page on GitHub</a>!

You can also reach out to us on
[Discord](https://discord.com/invite/sgak4e5NKv) or
[GitHub](https://github.com/javalin/javalin).

