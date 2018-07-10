---
layout: default
title: Migration guide
rightmenu: false
permalink: /migration-guide-javalin-1-to-2
---

<h1 class="no-margin-top">Javalin 1 to 2 migration guide</h1>

## Package structure
Javalin 2 has some changes to the package structure:

* `io.javalin.embeddedserver.jetty.websocket` `->` `io.javalin.websocket`
* `io.javalin.embeddedserver.Location` `->` `io.javalin.staticfiles.Location`
* `io.javalin.translator.json.JavalinJsonPlugin` `->` `io.javalin.json.JavalinJson`
* `io.javalin.translator.json.JavalinJacksonPlugin` `->` `io.javalin.json.JavalinJackson`
* `io.javalin.translator.template.JavalinXyzPlugin` `->` `io.javalin.rendering.JavalinXyz`
* `io.javalin.security.Role.roles` `->` `io.javalin.security.SecurityUtil.roles`

## Server customization/defaults
```java
app.embeddedServer(new EmbeddedJettyFactory(() -> new Server())) // v1
app.server(() -> new Server()) // v2
```
* The static method `Javalin.start(port)` has been removed. `Javalin.create().start(0);` is now required.
* Dynamic gzip is now enabled by default, turn it off with `disableDynamicGzip()`
* Request-caching is now limited to 4kb by default
* Server now has a `LowResourceMonitor` attached by default
* `defaultCharset()` method has been removed

## WebSockets
It was possible to defined WebSockets using Jetty annotations in v1 of Javalin.
These Jetty WebSockets have limited functionality compared to the Javalin lambda WebSockets,
which is why they have been removed.

## AccessManager 
* Use `Set` instead of `List`
* The AccessManager now runs for every single request, but the default-implementation does nothing. This might break some implementations that relied on un-managed routes.

## Context
* The `CookieBuilder` class has been removed, use `Cookie` directly.
* `ctx.uri()` has been removed, it was a duplicate of `ctx.path()`
* Things that used to return `Array<T>` now return `List<T>`
* Nullable collections are now empty collections instead
* `ctx.param()` is now `ctx.pathParam()`
* `ctx.xyzOrDefault("key")` methods have been change into `ctx.xyz("key", "default")`
* `ctx.next()` has been removed
* Kotlin users can now do `ctx.body<MyClass>()` to deserialize json
* `ctx.request()` is now `ctx.req`
* `ctx.response()` is now `ctx.res`
* All `ctx.renderXyz` methods are now just `ctx.render()` (correct engine is chosen based on extension)
* `ctx.charset()` has been removed

## Events
* Event handlers no longer take `Event` as an argument (they now take nothing)
* `io.javalin.event.EventType` is now `io.javalin.JavalinEvent` 

## Misc
* The CookieBuilder class has been removed, use the normal Java Cookie class directly.
* Reverse routing has been removed (will come back, but better)
* `HaltException` now requires a status, and the default body is an empty string.
