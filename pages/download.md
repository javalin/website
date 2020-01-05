---
layout: default
title: Download
rightmenu: false
permalink: /download
---

{% include notificationBanner.html %}

<h1 class="no-margin-top">A lightweight REST API library</h1>

Javalin is a true microframework with only two dependencies:
the embedded web-server (Jetty) and a logging facade (SLF4J).

Javalin has plugins for JSON mapping, template rendering, and OpenAPI (Swagger), but they're
optional dependencies that you have to add manually.

You can exclude the Jetty dependency if you want to run Javalin on a different servlet container.

## Download Javalin
{% include macros/mavenDep.md %}

### Manual downloads
You can get the prebuilt jar from [Maven Central](https://repo1.maven.org/maven2/io/javalin/javalin/).\\
You can get the source on [GitHub](https://github.com/tipsy/javalin), or [download it as a zip](https://github.com/tipsy/javalin/archive/master.zip).
