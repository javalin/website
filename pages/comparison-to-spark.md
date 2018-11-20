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
javalin.get("/path", ctx -> ctx.result("Hello, World!"));
javalin.after("/path", ctx -> ctx.result("Actually, nevermind..."));
```

Spark on the other hand has `Route`s and `Filter`s. Both `Route` and `Filter` in Spark take
`(Request, Response)` as input. `Route` has a return value (`Object`), while `Filter` is void.

`Request` and `Response` wrap `HttpServletRequest` and `HttpServletResponse`, respectively.

```java
Spark.get("/path", (req, res) -> "Hello, World!");
Spark.after("/path", (req, res) -> res.body("Actually, nevermind..."));
```

Javalin has all the features that Spark has (except the static API), and adds a lot of new functionality:

* Fully configurable Jetty (HTTP2)
* Async responses
* Lambda WebSockets with routing
* Session handling
* Input validation
* Default responses
* Role management
* Error mapping (status code)
* Lifecycle events
* Extensions
* Handler groups
* Simplified uploads
