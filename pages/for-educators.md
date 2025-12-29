---
layout: default
title: For educators
rightmenu: false
permalink: /for-educators
---

<h1 class="no-margin-top">For educators</h1>
Javalin is well suited for programming courses and for demos/prototypes. This page explains why.

## Simple setup and configuration
A lot of universities still use application servers such as Glassfish or Tomcat when teaching Java web development.
Setting up and configuring these servers for each student requires a lot of effort, and that effort
could be spent teaching students about HTTP and programming instead.

Javalin runs on an embedded Jetty server, and you only need to add the dependency
and write a few lines of code to create and start a server. A full "Hello World" app looks like this:

{% include macros/gettingStarted.md %}

This app can be packaged and launched with `java -jar hello-world.jar`, no further configuration required.
This lets you focus your classes on core principles rather than specifics for setting up an application server.

## Small and unopinionated
Javalin is just a couple of thousands lines of code running on top of Jetty. There is very little magic,
making it easy to fully understand the control-flow of your program.

* No annotations
* No global static state
* No reflection
* No configuration files
* Servlet based

Javalin doesn't care how you build your app, so any knowledge obtained while working
with a Javalin project should transfer easily to other (non Javalin) projects.

## API discoverability
Javalin’s API is built with discoverability in mind.
The configuration object is organized into logical sub-objects,
and the context object has everything needed for handling HTTP requests.

All configuration in Javalin follows a `Consumer<Config>` pattern, which means students can explore
configuration options simply by typing the config object name and letting their IDE's autocomplete
guide them through available options:

```java
Javalin.create(config -> {
    config.           // reveals configuration categories like http, router, jetty
    config.http.      // shows HTTP settings like asyncTimeout, generateEtags, maxRequestSize
    config.routes.    // provides access to attach HTTP method handlers like get(...), post(...), put(...), etc
    config.router.    // exposes routing options like ignoreTrailingSlashes, caseInsensitiveRoutes
});
```

The `Context` object contains everything needed for handling requests and responses:

```java
ctx.pathParam(...)    // extract path parameters from the URL
ctx.queryParam(...)   // extract query parameters from the URL
ctx.body()            // get the request body
ctx.header(...)       // get or set headers
ctx.result(...)       // set the response body
ctx.json(...)         // serialize an object to JSON and set as response
ctx.status(...)       // set the HTTP status code
ctx.contentType(...)  // set the content type
```

This organized structure makes learning intuitive and self-guided, as students can discover features
by exploring the API with their IDE's autocomplete.

## Good documentation and tutorials
Javalin's documentation is example-based rather than technical, which allows new users to copy snippets and experiment with them.
Javalin also has tutorials for most common tasks that developers have to solve when starting web-programming.

## Stable and actively maintained
Javalin has been in active development since 2017, with a strong focus on backwards compatibility.
The framework is stable and production-ready, while still being actively maintained with regular updates.
Pull requests and issues are reviewed swiftly, ensuring the framework stays current with the Java ecosystem.
