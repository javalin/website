---
layout: default
rightmenu: false
permalink: /
---

<h1 class="no-margin-top">Simple REST APIs for Java and Kotlin</h1>

Get your REST API up and running in seconds.
Add the [dependency](/download) and copy example:

{% include macros/gettingStarted.md %}

## REST API Simplicity
Javalin started as a fork of the [Spark](http://sparkjava.com) Java and Kotlin web framework but quickly
turned into a ground-up rewrite influenced by [express.js](https://expressjs.com/) and [koa.js](http://koajs.com/).
All of these web frameworks are inspired by the modern micro web framework
grandfather: [Sinatra](http://www.sinatrarb.com/), so if you're coming from Ruby then
Javalin shouldn't feel *too* unfamiliar.

Javalin is currently not aiming to be a full web framework, but rather
just a very lightweight REST API library. There is no websocket support or concept of MVC,
but there is support for template engines and static file serving for convenience.
This allows you to use Javalin for both creating your RESTful API backend, as well as serving
an `index.html` with static resources (in case you're creating an SPA). This is practical
if you don't want to deploy to apache or nginx in addition to your Javalin service.
If you wish to use Javalin to create web-pages instead of just REST APIs,
there are some simple template engine wrappers available for a quick and easy setup.

If you need a more feature rich Java web framework, you could try [Spark](https://github.com/perwendel/spark).
If you want a more feature rich Kotlin web framework, you can try the [Spark Kotlin Wrapper](https://github.com/perwendel/spark-kotlin).

## Fluent and readable API
All the methods on the Javalin instance return `this`, making the API fully fluent. 
This will let you create a declarative and predictive REST API, 
that will be very easy to reason about for new developers joining your project. Javalin
is at its best when you declare the application config and the REST API
together:

{% capture java %}
Javalin app = Javalin.create()
    .enableStaticFiles("/public")
    .enableStandardRequestLogging()
    .port(port)
    .start();

app.routes(() -> {
    path("users"(() -> {
        get(UserController::getAllUserIds)
        post(UserController::createUser)
        path(":user-id"(() -> {
            get(UserController::getUser)
            patch(UserController::updateUser)
            delete(UserController::deleteUser)
        });
    });
});
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create().apply {
    enableStaticFiles("/public")
    enableStandardRequestLogging()
    port(port)
}.start()

app.routes {
    path("users") {
        get(UserController::getAllUserIds)
        post(UserController::createUser)
        path(":user-id") {
            get(UserController::getUser)
            patch(UserController::updateUser)
            delete(UserController::deleteUser)
        }
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Works well with both Java and Kotlin
The name Javalin comes from <b>Java</b> and Kot<b>lin</b>, and is meant 
to be used with both Java and Kotlin. The library itself is written primarily in Kotlin, but has a few
core classes written in Java to achieve the best interoperability between the two languages.
Javalin is intended as a "foot in the door" to Kotlin development for companies
that already write a lot of Java, and anyone can easily set up a microservice REST API in
Kotlin and try it out.  
Go through the [Kotlin REST API tutorial](/tutorials/simple-kotlin-example)
to see how to setup Kotlin with Maven, and how to use it with Javalin.

## Embedded Web-server
Javalin runs on a fully configurable embedded web-server (jetty). This means that you can write your entire
application in Javalin, and deploy it as a fat jar.\\
Pull requests for other embedded servers would be welcome (netty, undertow, etc).
