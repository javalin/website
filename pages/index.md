---
layout: default
rightmenu: false
permalink: /
---

<h1 class="no-margin-top">Simple REST APIs for Java and Kotlin</h1>

Get your REST API up and running in seconds.
Add the <a id="dependency-modal-link" href="/download">dependency</a> and copy the example:

{% include macros/gettingStarted.md %}

## REST API simplicity
Javalin started as a fork of the Java and Kotlin web framework [Spark](http://sparkjava.com), but quickly
turned into a ground-up rewrite influenced by [koa.js](http://koajs.com/#application).
Both of these web frameworks are inspired by the modern micro web framework
grandfather: [Sinatra](http://www.sinatrarb.com/), so if you're coming from Ruby then
Javalin shouldn't feel *too* unfamiliar.

Like Sinatra, Javalin is not aiming to be a full web framework, but rather
just a lightweight REST API library (or a micro framework, if you must). There is no concept of MVC,
but there is support for template engines, WebSockets, and static file serving for convenience.
This allows you to use Javalin for both creating your RESTful API backend, as well as serving
an `index.html` with static resources (in case you're creating an SPA). This is practical
if you don't want to deploy an apache or nginx server in addition to your Javalin service.
If you wish to use Javalin to create a more traditional website instead of a REST APIs,
there are several template engine wrappers available for a quick and easy setup.

Javalin is both a Kotlin web framework and a Java web framework, meaning the API is 
being developed with focus on great interoperability between the two languages.
Switch between the languages in the next section for an example.

## Fluent and readable API
All the methods on the Javalin instance return `this`, making the API fully fluent. 
This will let you create a declarative and predictive REST API, 
that will be very easy to reason about for new developers joining your project.

Javalin is at its best when you declare the application config and the REST API together:

{% capture java %}
Javalin app = Javalin.create()
    .enableStaticFiles("/public")
    .enableStandardRequestLogging()
    .port(port)
    .start();

app.routes(() -> {
    path("users", () -> {
        get(UserController::getAllUserIds);
        post(UserController::createUser);
        path(":user-id", () -> {
            get(UserController::getUser);
            patch(UserController::updateUser);
            delete(UserController::deleteUser);
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
application in Javalin, and deploy it as a fat jar.

<div id="dependency-modal">
    <span class="close">✖</span>
    {% include macros/mavenDep.md %}
</div>
