---
layout: default
splash: true
permalink: /
---

<style>{% include landing.css %}</style>

<div class="landing bluepart">
    <h1>A simple web framework<br>for Java and Kotlin</h1>
    {% include macros/gettingStarted.md %}
    <div class="center">
        <a class="landing-btn" href="/documentation">Show me the docs</a>
        <a class="landing-btn" href="/tutorials">Show me tutorials</a>
    </div>
</div>

<div class="landing whitepart">
    <h1>Why Javalin?</h1>
    <div class="boxes">
        <div class="box">
            <h3>Simple</h3>
            <p>
                Unlike other Java and Kotlin web frameworks, Javalin has very few concepts that the end-user needs to learn.
                You never have to extend a class and you rarely have to implement an interface.
            </p>
        </div>
        <div class="box">
            <h3>Lightweight</h3>
            <p>
                Javalin is just a few thousand lines of code on top of Jetty, which
                means its performance is almost equivalent to pure Jetty. It also means it's
                very easy to reason about the source code.
            </p>
        </div>
        <div class="box">
            <h3>Active</h3>
            <p>
                A new version of Javalin has been released twice a month (on average) since the first version.
                Don't worry though, every version is backwards compatible.
                PRs and issues are reviewed swiftly, normally every week.
            </p>
        </div>
        <div class="box">
            <h3>Interoperable</h3>
            <p>
                Other Java and Kotlin web frameworks offer separate version for each language.
                Javalin is being developed with interoperability in mind, so apps are built the same way in both Java and Kotlin.
            </p>
        </div>
        <div class="box">
            <h3>Flexible</h3>
            <p>
                Javalin is designed to be simple and blocking, as this is the easiest programming model to reason about.
                However, if you set a <code>Future</code> as a result, Javalin switches into asynchronous mode.
            </p>
        </div>
        <div class="box">
            <h3>Educational</h3>
            <p>
                Visit our <a href="/for-educators">educators page</a> if you're teaching web programming
                and looking for a web framework which will get out of your way and let you focus on the
                core concepts of your curriculum.
            </p>
        </div>
    </div>
</div>

<div class="landing bluepart">
<h1>Declare your server and API<br> all in one file</h1>
{% capture java %}
import io.javalin.ApiBuilder.*
import io.javalin.Javalin;

Javalin app = Javalin.create()
    .enableStandardRequestLogging()
    .enableDynamicGzip()
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
import io.javalin.ApiBuilder.*
import io.javalin.Javalin;

val app = Javalin.create().apply {
    enableStandardRequestLogging()
    enableDynamicGzip()
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

<p>Creating a REST API has never been easier</p>

<div class="center">
    <a class="landing-btn" href="/documentation">Show me the docs</a>
    <a class="landing-btn" href="/tutorials">Show me tutorials</a>
</div>
</div>

<div class="landing whitepart">
    <h1>Built on a solid foundation</h1>
    <div class="boxes">
        <div class="box">
            <h3>Jetty</h3>
            <p>
                Javalin runs on top of Jetty, one of the most used and stable web-servers on the JVM.
                You can configure the Jetty server fully, so you can easily get SSL and HTTP2 and everything else
                that Jetty has to offer.
            </p>
        </div>
        <div class="box">
            <h3>SparkJava and Koa.js</h3>
            <p>
                Javalin started as a fork of the Java and Kotlin web framework SparkJava,
                but quickly turned into a ground-up rewrite influenced by the Javascript framework koa.js.
                Javalin implements lessons learned from working extensively with both of these frameworks.
            </p>
        </div>
    </div>
</div>
