---
layout: default
title: Migration guide, v4 to v5
rightmenu: false
permalink: /migration-guide-javalin-4-to-5
---

<h1 class="no-margin-top">Javalin 4 to 5 migration guide</h1>
This page attempts to cover all the things you need to know in order to migrate from Javalin 4 to Javalin 5.
If you find any errors, or if something is missing, please <a href="{{site.repourl}}/blob/master/{{page.path}}">edit this page on GitHub</a>.

## Jetty 11 and Java 11
The most significant change is that Javalin no longer supports Java 8, with Java 11 being the new minimum version.
This is because Jetty 9 (what Javalin has been running on since 2017) has been end-of-lifed, and later Jetty versions
require Java 11. Jetty 11 is the latest stable version of Jetty.

## Repository change
Javalin used to live as a personal project at `github.com/tipsy/javalin`, but it has now been moved into an
organization at `github.com/javalin/javalin`. All old links/remotes redirect, everything works as before.

## Package changes
The `core` package has been removed, flattening the package structure of Javalin.
Some other things have also been moved around.

```java
// core package
import io.javalin.core.compression -> import io.javalin.compression
import io.javalin.core.config -> import io.javalin.config
import io.javalin.core.event -> import io.javalin.event
import io.javalin.core.security -> import io.javalin.security
import io.javalin.core.util -> import io.javalin.util
import io.javalin.core.util.Header -> import io.javalin.http.Header

// plugin package
import io.javalin.plugin.rendering.vue -> import io.javalin.vue
import io.javalin.plugin.json -> import io.javalin.json
```

## Configuration changes
Configuration has been changed significantly. All config options used to be available
directly on the config consumer in `Javalin.create { config }`, but in Javalin 5 most
of the old config options have been moved into subconfigs. You can find the full overview at
[/documentation#configuration](/documentation#configuration).

## Context changes
* `Context` is now an interface (you can get access to internal functionality by casting to `JavalinServletContext`)
* `ctx.req` and `ctx.res` are now `ctx.req()` and `ctx.res()`
* `ctx.cookieStore#` is now `ctx.cookieStore()#`
* `ctx.seekableStream()` is now `ctx.writeSeekableStream()`
* `ctx.resultString()` is now `ctx.result()`, `ctx.resultStream()` is now `ctx.resultInputStream()`
* `ctx.resultFuture()` has been removed (see more in the "Future rework" section)
* In Kotlin, the reified `xyzAsClass` functions now have to be imported (since `Context` is now an interface)

## Future rework
In Javalin 4 we had `Context#future(future, callback)`,
which has been changed to `Context#future(futureSupplier)`. The recommended
way to use futures in Javalin 5 is to lean on the `CompletableFuture` API and
call Javalin's `Context` methods in those callbacks:

{% capture java %}
app.get("/", ctx ->
    ctx.future(() -> myFuture
        .thenAccept(result -> ctx.result(result))
        .exceptionally(error -> ctx.result("Error: " + error))
    );
});
{% endcapture %}
{% capture kotlin %}
app.get("/") { ctx ->
    ctx.future {
        myFuture.thenAccept { ctx.result(it) }
        myFuture.exceptionally { ctx.result("Error: " + it) }
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## SSE changes
In Javalin 4, connections to SSE clients needed to be closed manually, this resulted in SSE client leaking when clients were not properly closed.
But in Javalin 5 we're no longer blocking connections by default for SSE clients, so you have to explicitly enable it using `SseClient#keepAlive()`.

{% capture java %}
ArrayList<SseClient> clients = new ArrayList<>();

app.sse("/sse", client -> {
    clients.add(client);
    client.keepAlive();
});
{% endcapture %}
{% capture kotlin %}
val clients = mutableListOf<SseClient>() 

app.sse("/sse") { client -> 
    clients.add(client) 
    client.keepAlive() 
} 
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Semi private fields renamed
The `_conf.inner` field has been renamed to `cfg.pvt` (config private) to
further discourage use. It's still okay to use it (if you know what you are doing).

## Modules and packages moving out of the core
The main `javalin/javalin` repo has been on a diet, and a lot of things have been moved out.
A few things have been removed altogether.

### New OpenAPI project
The OpenAPI DSL and annotation processor (`javalin-openapi`) has been replaced by a
[new project](https://github.com/javalin/javalin-openapi) by a very talented
new Javalin contributor, [@dzikoysk](https://github.com/dzikoysk), who is also the author
of Reposilite ([repo](https://github.com/dzikoysk/reposilite), [website](https://reposilite.com/)).
Reposilite is currently running both
Javalin v5 and Javalin OpenAPI v5 in production.
This new OpenAPI plugin should have significantly fewer issues than the old module!

### Template engines moved to separate artifact
All template engines have been moved to a separate `javalin-rendering` artifact.
To use template engines in Javalin 5 you have to add this dependency, and call `MyTemplateEngine.init()`,
which will make the template engine register itself on `JavalinRenderer` with the proper extension.
You could also call `JavalinRender.register(engine, extension...)` manually.

### Micrometer has been removed
Related to the Jetty 11 change, the `MicrometerPlugin` has been removed. This had to be done because
Micrometer does not support Jetty 11:
[https://github.com/micrometer-metrics/micrometer/issues/3234](https://github.com/micrometer-metrics/micrometer/issues/3234)

It will hopefully return (to the core) soon!

### Other modules
* The `javalin-graphql` artifact *might* be re-released under `community` sub-group in the future.
* The `javalin-without-jetty` artifact hopefully won't return, but if it does... it will be under the `community` sub-group)
* The `javalin-osgi` artifact can return to the core as soon as someone makes a PR.

## JavalinVue
The `JavalinVue` singleton has been removed. Instead of `JavalinVue.configOption = ...`,
you can now configure Vue through `Javalin.create { config.vue.configOption = ... }`.

## CORS plugin

The CORS plugin has been completely rewritten to be more flexible. Instead of the two methods
`enableCorsForAllOrigins()` and `enableCorsForOrigin(@NotNull String... origins)` on the config object you now pass a
lambda to `config.plugins.enableCors()` to configure CORS.

{% capture java %}
Javalin.create(config -> {
config.plugins.enableCors(cors -> {
    cors.add(corsConfig -> {
        // replacement for enableCorsForOrigin(@NotNull String... origins)
        corsConfig.allowHost(/* add your origins here */);
        //replacement for enableCorsForAllOrigins()
        corsConfig.anyHost();
    });
});

}).start();
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
config.plugins.enableCors { cors ->
    cors.add { corsConfig ->
        //replacement for enableCorsForOrigin(@NotNull String... origins)
        corsConfig.allowHost(/* add your origins here */)
        //replacement for enableCorsForAllOrigins()
        corsConfig.anyHost()
    }
}
}.start()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Check out the [CORS plugin page](/plugins/cors) for more details on the rewritten CORS plugin and its capabilities.


## Additional changes
It's hard to keep track of everything, but you can look at the
[full commit log](https://github.com/javalin/javalin/compare/de573edb60927b21e4e54831a465202e764cf925...49aa806af8199bc4c1ef01dee927f8268226ea1e)
between the last 4.x version and 5.0.

If you run into something not covered by this guide, please <a href="{{site.repourl}}/blob/master/{{page.path}}">edit this page on GitHub</a>!

You can also reach out to us on
[Discord](https://discord.com/invite/sgak4e5NKv) or
[GitHub](https://github.com/tipsy/javalin).
