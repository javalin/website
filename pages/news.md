---
layout: default
title: News
rightmenu: false
permalink: /news
---

<h1 class="no-margin-top">News</h1>

Release notes for minor releases will be posted here.

{% comment %}
<div id="spy-nav" class="right-menu" markdown="1">
* [Major API changes](#major-api-changes)
* [Kotlin Rewrite](#kotlin-rewrite)
* [Hello world!](#hello-world)
</div>
{% endcomment %}

## Major API changes {#major-api-changes}
Javalin 0.3.0 changes the core API from dealing with `request`/`response` pairs, to just dealing with
a single `context`(or `ctx`) object. This context-object contains all the methods that belonged
to `request` and `response` previously, with a few adjustments:

Comparison:
{% capture java %}
app.get("/", ctx -> ctx.result("Hello World")); // new syntax
app.get("/", (req, res) -> res.body("Hello World")); // old syntax
{% endcapture %}
{% capture kotlin %}
app.get("/") { ctx -> ctx.result("Hello World") } // new syntax
app.get("/") { req, res -> res.body("Hello World") } // old syntax
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Most getters (`body()`, `header(name)`, `cookie(name)`, etc) operate on the underlying request,
while all setters (`result(content)`, `header(name, value)`, `cookie(name, value)`, etc) operate on the underlying response.
Since `request` and `response` don't share any methods, this approach seems to work well.

## Kotlin rewrite {#kotlin-rewrite}
Most of Javalin was re-written to Kotlin in version 0.2.0. The SAM interfaces were left
as Java, as well as the main Javalin-class which has method-declarations with SAM parameters.
This had to be done due to limitations in Kotlin itself ([https://youtrack.jetbrains.com/issue/KT-14151](https://youtrack.jetbrains.com/issue/KT-14151),
[https://devnet.jetbrains.com/thread/461516](https://devnet.jetbrains.com/thread/461516))\\
The rest of the library will be ported to Kotlin if this issue is resolved, or and alternative solution is discovered.


## Hello world! {#hello-world}
The first Javalin version is now available (0.0.1).
Javalin will try to follow semantic versioning, but be prepared for breaking changes.
