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

### Included template engines
The `javalin-rendering` artifact includes default implementations for several template engines:

| --- | --- |
| **Freemarker** | &nbsp;➜&nbsp; [https://freemarker.apache.org](https://freemarker.apache.org) |
| **JTE**        | &nbsp;➜&nbsp; [https://jte.gg/](https://jte.gg) |
| **Mustache**   | &nbsp;➜&nbsp; [https://github.com/spullara/mustache.java](https://github.com/spullara/mustache.java) |
| **Pebble**     | &nbsp;➜&nbsp; [https://pebbletemplates.io/](https://pebbletemplates.io) |
| **Thymeleaf**  | &nbsp;➜&nbsp; [https://www.thymeleaf.org/](https://www.thymeleaf.org) |
| **Velocity**   | &nbsp;➜&nbsp; [https://velocity.apache.org/](https://velocity.apache.org) |
| **Commonmark** | &nbsp;➜&nbsp; [https://github.com/commonmark/commonmark-java](https://github.com/commonmark/commonmark-java) |

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

## Recreating the old JavalinRenderer
Older versions of Javalin had a `JavalinRenderer` class that was used to render templates.
This class was able to render templates based on the file extension.

You can recreate this class like this:

{% capture java %}
class JavalinRenderer implements FileRenderer {
    private Map<String, FileRenderer> renderers = new HashMap<>();
    public JavalinRenderer register(String extension, FileRenderer renderer) {
        renderers.put(extension, renderer);
        return this;
    }

    @Override
    public String render(String filePath, Map<String, ? extends Object> model, Context context) {
        String extension = filePath.substring(filePath.lastIndexOf(".") + 1);
        return renderers.get(extension).render(filePath, model, context);
    }
}
{% endcapture %}
{% capture kotlin %}
class JavalinRenderer : FileRenderer {
    private val renderers = HashMap<String, FileRenderer>()
    fun register(extension: String, renderer: FileRenderer): JavalinRenderer {
        renderers[extension] = renderer
        return this
    }


    override fun render(filePath: String, model: Map<String, Any?>, context: Context): String {
        val extension = filePath.substring(filePath.lastIndexOf(".") + 1)
        return renderers[extension]!!.render(filePath, model, context)
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

You can then register it like any other renderer:

{% capture java %}
Javalin.create(config -> {
    config.fileRenderer(
        new JavalinRenderer()
            .register("mustache", new JavalinMustache())
            .register("jte", new JavalinJte())
    );
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.fileRenderer(
        JavalinRenderer()
            .register("mustache", JavalinMustache())
            .register("jte", JavalinJte())
    )
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}
