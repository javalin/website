---
layout: default
title: Javalin Rendering
rightmenu: false
permalink: /plugins/rendering
---

<h1 class="no-margin-top">Javalin rendering</h1>

The `javalin-rendering` artifact is an optional module for the Javalin web framework that
provides a simple way to render HTML using popular template engines.
The `javalin-rendering` artifact includes default implementations for several template engines,
including JTE, Mustache, Velocity, Pebble, Handlebars, and Thymeleaf, but you 
also have to add the dependency for the template engine you want to use.

## Adding dependencies
<div class="multitab-code dependencies" data-tab="1">
<ul>
    <li data-tab="1">Maven</li>
    <li data-tab="2">Gradle</li>
</ul>
<div data-tab="1" markdown="1">
~~~markup
<dependency>
    <groupId>io.javalin</groupId>
    <artifactId>javalin-rendering</artifactId>
    <version>{{site.javalinversion}}</version>
</dependency>
<dependency>
    <groupId><!-- template engine group --></groupId>
    <artifactId><!-- template engine artifact --></artifactId>
    <version><!-- template engine version --></version>
</dependency>
~~~
</div>

<div data-tab="2" markdown="1">
~~~java
implementation("io.javalin:javalin-rendering:{{site.javalinversion}}")
// template engine dependency
~~~
</div>
</div>

## Using the plugin

All the template engines look for templates/markdown files in `src/resources/templates`,
and the correct rendering engine is chosen based on the extension of your template.
Javalin will automatically initialize the template engine of an included dependency 
for you, but you can also initialize it yourself (if you want to configure it).

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
all `init` methods receive optional parameters with their template engine
configurations:

```kotlin
JavalinFreemarker.init(configuration: Configuration?)
JavalinJte.init(templateEngine: TemplateEngine?, isDevFunction: ((Context) -> Boolean)?)
JavalinMustache.init(mustacheFactory: MustacheFactory?)
JavalinPebble.init(pebbleEngine: PebbleEngine?)
JavalinThymeleaf.init(templateEngine: TemplateEngine?)
JavalinVelocity.init(velocityEngine: VelocityEngine?)
JavalinCommonmark.init(htmlRenderer: HtmlRenderer?, parser: Parser?)
```

### Registering a new engine:
{% capture java %}
JavalinRenderer.register(new JavalinPebble(), ".peb", ".pebble");

JavalinRenderer.register((filePath, model, ctx) -> {
    return MyRenderer.render(filePath, model, ctx);
}, ".ext");
{% endcapture %}

{% capture kotlin %}
JavalinRenderer.register(JavalinPebble(), ".peb", ".pebble")

JavalinRenderer.register({ filePath, model, ctx ->
    MyRenderer.render(filePath, model, ctx)
}, ".ext")
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Good to know
Please consult the documentation for that particular template engine to learn how to use
them, these kinds of settings are not handled through Javalin.

If you need to configure settings beyond what's available in `JavalinTemplateEngine.init` (for example,
to set a custom file extension), you have to write your own implementation and register it using
`JavalinRenderer.register`.

Note that if you're using `JavalinRenderer`, these are global settings,
and cannot be configured per instance of Javalin.
