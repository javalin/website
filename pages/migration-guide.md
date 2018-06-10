---
layout: default
title: Migration guide
rightmenu: false
permalink: /migration-guide-javalin-1-to-2
---

<h1 class="no-margin-top">Javalin 1 to 2 migration guide</h1>

## Package structure
Javalin 2 has some changes to the package structure.
The `embeddedserver` package is gone, and things have been moved into `core`: 

* `io.javalin.embeddedserver.jetty.websocket` `->` `io.javalin.core.websocket`
* `io.javalin.embeddedserver.Location` `->` `io.javalin.core.staticfiles.Location`
* `io.javalin.embeddedserver.CachedResponseWrapper` `->` `io.javalin.core.CachedResponseWrapper`
* `io.javalin.embeddedserver.CachedRequestWrapper` `->` `io.javalin.core.CachedRequestWrapper`
* `` `->` ``

## Server customization
```java
app.embeddedServer(new EmbeddedJettyFactory(() -> new Server())) // v1
app.server(() -> new Server()) // v2
```

## WebSockets
It was possible to defined WebSockets using Jetty annotations in v1 of Javalin.
These Jetty WebSockets have limited functionality compared to the Javalin lambda WebSockets,
which is why they have been removed.

## Default values
