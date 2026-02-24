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

You can see a list of all available modules on [https://search.maven.org/search?q=g:io.javalin](https://search.maven.org/search?q=g:io.javalin)

## Manual downloads
You can get prebuilt jars from [Maven Central](https://repo1.maven.org/maven2/io/javalin/javalin/).\\
You can get the source on [GitHub](https://github.com/javalin/javalin), or [download it as a zip](https://github.com/javalin/javalin/archive/master.zip).
