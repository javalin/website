---
layout: default
title: Javalin Rendering
rightmenu: false
permalink: /plugins/rendering
---

<h1 class="no-margin-top">Javalin rendering</h1>

The `javalin-rendering` module provides optional template engine support for Javalin.
Each template engine has its own artifact that bundles the engine dependency, so you only
need to add one dependency to get started.

## Adding dependencies

Pick the artifact for the template engine you want to use:

<div class="multitab-code dependencies" data-tab="1">
<ul>
    <li data-tab="1">Maven</li>
    <li data-tab="2">Gradle</li>
</ul>
<div data-tab="1" markdown="1">
~~~markup
<dependency>
    <groupId>io.javalin</groupId>
    <artifactId>javalin-rendering-{engine}</artifactId>
    <version>{{site.javalinversion}}</version>
</dependency>
~~~
</div>

<div data-tab="2" markdown="1">
~~~kotlin
implementation("io.javalin:javalin-rendering-{engine}:{{site.javalinversion}}")
~~~
</div>
</div>

### Available modules
Replace `{engine}` with the name of the template engine you want to use:

| --- | --- |
| `javalin-rendering-commonmark` | &nbsp;➜&nbsp; [https://github.com/commonmark/commonmark-java](https://github.com/commonmark/commonmark-java) |
| `javalin-rendering-freemarker` | &nbsp;➜&nbsp; [https://freemarker.apache.org](https://freemarker.apache.org) |
| `javalin-rendering-handlebars` | &nbsp;➜&nbsp; [https://github.com/jknack/handlebars.java](https://github.com/jknack/handlebars.java) |
| `javalin-rendering-jte`        | &nbsp;➜&nbsp; [https://jte.gg/](https://jte.gg) |
| `javalin-rendering-mustache`   | &nbsp;➜&nbsp; [https://github.com/spullara/mustache.java](https://github.com/spullara/mustache.java) |
| `javalin-rendering-pebble`     | &nbsp;➜&nbsp; [https://pebbletemplates.io/](https://pebbletemplates.io) |
| `javalin-rendering-thymeleaf`  | &nbsp;➜&nbsp; [https://www.thymeleaf.org/](https://www.thymeleaf.org) |
| `javalin-rendering-velocity`   | &nbsp;➜&nbsp; [https://velocity.apache.org/](https://velocity.apache.org) |

## Using the plugin
All the template engines look for templates/markdown files in `src/resources/templates`.
To enable a template engine, you have to register it on the Javalin config:

{% capture java %}
Javalin.create(config -> {
    config.fileRenderer(new JavalinMustache());
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.fileRenderer(JavalinMustache())
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

You can also register your own rendering engine.

### Rendering a template
Once you have added the dependencies for the template engine you want to use,
all you have to do is call `ctx.render()` with the path to your template file (and optionally a model):
{% capture java %}
ctx.render("/templateFile.ext", model("firstName", "John", "lastName", "Doe"));
{% endcapture %}
{% capture kotlin %}
ctx.render("/templateFile.ext", mapOf("firstName" to "John", "lastName" to "Doe"))
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Configuring a template engine
If you wish to configure a template engine (for example, to set a root directory for your template files),
all constructors have optional parameters with their template engine configurations:

{% capture java %}
Javalin.create(config -> {
    config.fileRenderer(new JavalinVelocity(myVelocityEngine));
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.fileRenderer((JavalinVelocity(myVelocityEngine)
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

The configuration classes are not from Javalin, but from the template engine you are using,
so please consult the documentation for that particular template engine to learn how to use them.
