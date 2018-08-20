---
layout: default
title: Comparison to SparkJava
rightmenu: false
permalink: /comparisons/sparkjava
---

<h1 class="no-margin-top">SparkJava and Javalin comparison</h1>
People often ask about the differences between Spark and Javalin. This page shows some of them.
It's not intended to tell you which library is better, just to highlight the differences.

## Handlers vs Routes and Filters
Javalin has the concept of a `Handler`. A `Handler` is void and takes a `Context` (which wraps `HttpServletRequest` and `HttpServletResponse`),
and you operate on both the request and response through this `Context`.

```java
app.get("/path", ctx -> ctx.result("Hello, World!"));
app.after("/path", ctx -> ctx.result("Actually, nevermind..."));
```

Spark on the other hand has `Route`s and `Filter`s. Both `Route` and `Filter` in Spark take
(`Request`, `Response`) as input. `Route` has a return value (`Object`), while `Filter` is void.

`Request` and `Response` wrap `HttpServletRequest` and `HttpServletResponse`, respectively.

```java
app.get("/path", (req, res) -> "Hello, World!");
app.after("/path", (req, res) -> res.body("Actually, nevermind..."));
```

Some other differences:

* Spark can run on an application server. Javalin can only run on the included embedded Jetty server.
* Javalin supports a lot of configuration options (HTTP2, Jetty Handler chains, fully customizable Jetty `Server`, CORS, default values). Spark has sane defaults, but limited configuration options.
* Spark has a static API and an instance API. Javalin only has an instance API.
* Javalin focuses on Java/Kotlin interoperability and behaves the same in both languages. Spark has Kotlin DSL (spark-kotlin) built on top of itself with "Kotlin only" features.
* Javalin supports regex routes. Spark doesn't.
* Javalin has a lambda based WebSocket API which supports path-params (and other things). Spark uses an annotation based API which proxies directly to Jetty.
* Spark has a redirect DSL `redirect.get("/fromPath", "/toPath");`. Javalin doesn't.
* Javalin has async support for long running tasks via `CompletableFuture`. Spark doesn't.
* Javalin supports context extensions (`ctx.extension(MyExt.class).myMethod()`). Spark doesn't.
* Spark supports route mapping based on accepts/content type. Javalin doesn't.
* Javalin has an `AccessManager` interfaces with role-support. Spark doesn't.
* Spark is written in Java. Javalin is written in Kotlin.
* Javalin has [lifecycle events](/documentation#lifecycle-events). Spark doesn't.
