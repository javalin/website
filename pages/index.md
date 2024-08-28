---
layout: default
splash: true
permalink: /
---

<style>{% include landing.css %}</style>

{% include landing/section-1-title-and-get-started.html
    title="<h1>A simple web framework<br>for Java and Kotlin</h1>"
    docs="View documentation"
%}

{% include landing/section-2-small-used-by.html %}

{% include landing/section-3-why-javalin.html
    title="<h1 id='why-javalin'>Why Javalin?</h1>"
    reasonRow1="
        Simple -- Unlike other Java and Kotlin web frameworks, Javalin has very few concepts that you need to learn.
        You never extend classes and you rarely implement interfaces.
        ---
        Lightweight -- Javalin is just a few thousand lines of code on top of Jetty, and
        its performance is equivalent to raw Jetty code. Due to its size, it's
        very easy to reason about the source code.
        ---
        Interoperable -- Other Java and Kotlin web frameworks usually offer one version for each language.
        Javalin is being made with inter-operability in mind, apps are built the same way in both Java and Kotlin.
        ---
        Flexible -- Javalin is designed to be simple and blocking, as this is the easiest programming model to reason about.
        But, if you set a <code>Future</code> as a result, Javalin switches into asynchronous mode.
    "
    reasonRow2="
        Educational -- Visit our <a href='/for-educators'>educators page</a> if you're teaching web programming
        and looking for a web framework which will get out of your way and let you focus on the
        core concepts of your curriculum.
        ---
        OpenAPI -- Many lightweight Java and Kotlin web frameworks don't support OpenAPI, but Javalin does
        (including Swagger UI and ReDoc). Learn more at the <a href='/plugins/openapi'>OpenAPI plugin page</a>.
        ---
        Jetty -- Javalin runs on top of Jetty, one of the most used and stable web-servers on the JVM.
        You can configure the Jetty server fully, including SSL and HTTP3 and everything else
        that Jetty offers.
    "
%}

{% include landing/section-sponsors.html
    title="<h1 id='our-sponsors'>Our<br>sponsors</h1>"
    cta="Your logo here?"
%}

{% include landing/section-4-server-and-api.html
    title="<h1>Declare your server and API<br> in the same file</h1>"
    tutorials="Show me tutorials"
    docs="Show me the docs"
    brag="Creating a REST API has never been easier"
%}

{% include landing/section-5-community.html
    title="<h1 id='an-active-community'>An active community</h1>"
    paragraph="
        Javalin 1.0 was released in 2017, and has been in steady development since.<br><br>
        As of August 2023, the project consists of around 8000 lines of code and 11 000 lines of tests.
        It has almost two hundred contributors, more than five hundred forks, and close to seven thousand stars on GitHub.
        The project has around 400 000 downloads per month, and has been released 132 times in five years
        (about two times per month).
    "
%}

{% include landing/section-6-whos-using-javalin.html
    title="<h1 id='whos-using-javalin'>Who's using Javalin?</h1>"
    paragraph="Are you using Javalin? <a href='https://github.com/javalin/javalin/issues/1676'>Let us know</a>!"
%}
