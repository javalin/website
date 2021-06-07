---
layout: default
title: Migration guide, v3 to v4
rightmenu: false
permalink: /migration-guide-javalin-3-to-4
---

<h1 class="no-margin-top">Javalin 3 to 4 migration guide</h1>

## WARNING
Javalin 4 is currently in alpha.
This guide is subject to change as the alpha progresses.

## New Path syntax
The syntax for path parameters has been changed to use curly and angled brackets instead of a double point.
The new syntax allows to mix static with path parameter content and wildcards inside a segment.

Old syntax
{% capture java %}
app.get("/hello/:name", ctx -> {
    ctx.result("Hello: " + ctx.pathParam("name"));
});
{% endcapture %}
{% capture kotlin %}
app.get("/hello/:name") { ctx ->
    ctx.result("Hello: " + ctx.pathParam("name"))
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

New syntax
{% capture java %}
app.get("/hello/{name}", ctx -> {
    ctx.result("Hello: " + ctx.pathParam("name"));
});
{% endcapture %}
{% capture kotlin %}
app.get("/hello/{name}") { ctx ->
    ctx.result("Hello: " + ctx.pathParam("name"))
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

You can replace nearly every occurance of the old syntax with the curly brackets.
One exception: Non sub-path wildcards. You have to add an additional star there to restore the behaviour:

`/path*` and `/path/{param}**`, will match both `/path`+`/path/*` and `/path/{param}`+`/path/{param}/*` respectively.
This is particularly useful when you want to run a `before`/`after` handler for a resource (and all sub-paths of the resource).

TODO: Talk about angle brackets.
