---
layout: default
title: Download
rightmenu: false
permalink: /download
description: "Download Javalin. Maven and Gradle dependency snippets for the latest version."
---

{% include notificationBanner.html %}

<h1 class="no-margin-top">A lightweight REST API library</h1>

Javalin is a true microframework with only one required dependency: SLF4J (logging).
By default Javalin also depends on Jetty, but you can exclude 
if you want to use a different Webserver (like Tomcat, etc).
Javalin also has plugins for JSON mapping, template rendering, and OpenAPI (Swagger), but they're
optional dependencies that you have to add manually.
See the [plugins](/plugins) page for more information.

## Download Javalin
{% include macros/mavenDep.md %}

## Javalin modules

Javalin is published as a small core artifact with a set of optional satellite modules.
Add only the ones you need. All modules track the same version as the `javalin` core artifact.

| --- | --- |
| `javalin`              | the core framework |
| `javalin-bundle`       | `javalin` + Jackson, Logback and test tools, in one dependency |
| `javalin-bom`          | Bill of Materials &mdash; pins a single version across all modules (see below) |
| `javalin-micrometer`   | Micrometer metrics integration |
| `javalin-ssl`          | SSL/TLS helper plugin |
| `javalin-testtools`    | `JavalinTest` and helpers for integration testing |
| `javalin-rendering-{engine}` | template rendering &mdash; see [/plugins/rendering](/plugins/rendering) |

You can also browse every published artifact on
[Maven Central](https://search.maven.org/search?q=g:io.javalin).

## BOM (Bill of Materials)

The `javalin-bom` module lets you declare the Javalin version in one place and have every
`io.javalin:*` artifact (core, rendering engines, micrometer, ssl, &hellip;) resolve to the same
version automatically. Import it once, then depend on any Javalin module without repeating its version.

<div class="multitab-code dependencies" data-tab="1">
<ul>
    <li data-tab="1">Maven</li>
    <li data-tab="2">Gradle</li>
</ul>

<div data-tab="1" markdown="1">
~~~markup
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.javalin</groupId>
            <artifactId>javalin-bom</artifactId>
            <version>{{site.javalinversion}}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
~~~
</div>

<div data-tab="2" markdown="1">
~~~kotlin
dependencies {
    implementation(platform("io.javalin:javalin-bom:{{site.javalinversion}}"))

    // Javalin modules can now be declared without a version:
    implementation("io.javalin:javalin")
    implementation("io.javalin:javalin-rendering-jte")
}
~~~
</div>
</div>

## Manual downloads
You can get prebuilt jars from [Maven Central](https://repo1.maven.org/maven2/io/javalin/javalin/).\\
You can get the source on [GitHub](https://github.com/javalin/javalin), or [download it as a zip](https://github.com/javalin/javalin/archive/master.zip).
