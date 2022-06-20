---
layout: default
splash: true
permalink: /
---

<style>{% include landing.css %}</style>

{% include landing/section-1-title-and-get-started.html
    title="<h1>A simple web framework<br>for Java and Kotlin</h1>"
    tutorials="Show me tutorials"
    docs="Show me the docs"
%}

{% include landing/section-2-small-used-by.html %}

{% include landing/section-3-why-javalin.html
    title="<h1>Why Javalin?</h1>"
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
        You can configure the Jetty server fully, including SSL and HTTP2 and everything else
        that Jetty offers.
    "
%}

{% include landing/section-sponsors.html
    title="<h1>Our sponsors</h1>"
    cta="Your logo here?"
%}

{% include landing/section-4-server-and-api.html
    title="<h1>Declare server and API<br> in the same place</h1>"
    tutorials="Show me tutorials"
    docs="Show me the docs"
    brag="Creating a REST API has never been easier"
%}

{% include landing/section-5-community.html
    title="<h1>An active community</h1>"
    paragraph="
        Javalin 1.0 was released in 2017, and has been in steady development since.<br><br>
        As of April 2022, the project consists of less than 7000 lines of code with more than 10 000 lines of tests.
        It has more than a hundred contributors, more than four hundred forks, and more than five thousand stars on GitHub.
        The project has around 300 000 downloads per month, and has has been released 101 times in five years
        (about two times per month).
    "
%}

{% include landing/section-6-whos-using-javalin.html
    title="<h1 id='whos-using-javalin'>Who's using Javalin?</h1>"
    paragraph="Are you using Javalin? <a href='https://github.com/javalin/javalin.github.io/issues/18'>Let us know</a>!"
%}

{% include landing/section-7-survey.html
    title="<h1>What is Javalin used for?</h1>"
    paragraph="
        Check out our recent <a href='/blog/javalin-user-survey-2021'>survey results</a><br>
        to learn more about how people use Javalin.
    "
%}
