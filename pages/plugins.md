---
layout: default
title: Plugin store
rightmenu: false
permalink: /plugins/
---

<script>{% include pluginCard.js %}</script>
<style>{% include pluginCard.css %}</style>

<h1 class="no-margin-top">Plugins</h1>
This page contains an overview of official and unofficial Javalin plugins.
Each plugin can be rated and reviewed on GitHub (via reactions and comments),
and the rating is displayed at the bottom of each card.

{% include pluginCard.html
    title="JavalinVue"
    description="
        JavalinVue let's you create simple Vue frontends without having a frontend build pipeline.
        It uses Vue single-file components with Javalin's server side routing,
        and automatically includes only the Vue code required per route.
        It's ideal for rapid prototyping and creation of websites/web-portals.
    "
    bundled="true"
    author="tipsy,TareqK"
    docsUrl="/plugins/javalinvue"
    ratingIssueNr="132"
%}

{% include pluginCard.html
    title="OpenAPI Annotation Processor"
    description="
        This OpenAPI plugin replaces the old DSL + annotation setup that was
        available before Javalin 5.
        Features:
        <ul>
            <li>Reflection free, does not perform any extra operations at runtime</li>
            <li>Uses @OpenApi to simplify migration from bundled OpenApi implementation</li>
            <li>Supports Java 8 and all further releases of Java and Kotlin (through Kapt)</li>
            <li>Uses internal WebJar handler that works with /* route out of the box</li>
            <li>Provides better projection of OpenAPI specification</li>
            <li>Schema validation through Swagger core module</li>
        </ul>
    "
    bundled="false"
    author="dzikoysk"
    docsUrl="https://github.com/javalin/javalin-openapi#readme"
    ratingIssueNr="133"
%}

{% include pluginCard.html
    title="SSL Helpers"
    description="
        Fill this out
    "
    bundled="false"
    author="zugazagoitia"
    docsUrl="/plugins/ssl-helpers"
    ratingIssueNr="134"
%}

{% include pluginCard.html
    title="RouteOverview"
    description="
        The route overview provides you with a HTML and/or JSON overview of all the routes
        registered on your Javalin application. Perfect for debugging!
    "
    bundled="true"
    author="tipsy"
    docsUrl="/plugins/routeoverview"
    ratingIssueNr="135"
%}

{% include pluginCard.html
    title="DevLogging"
    description="
        The development debugging logger catches most of the interesting stuff about requests
        and responses, and logs it in an easy to read manner. It works both for
        HTTP and WebSocket requests. Only intended for use during development and/or debugging.
    "
    bundled="true"
    author="tipsy"
    docsUrl="/plugins/devlogging"
    ratingIssueNr="139"
%}

{% include pluginCard.html
    title="CORS"
    description="
        The CORS plugin bundles the functionality to set CORS headers for some or all origins
        as required.
    "
    bundled="true"
    author="Playacem"
    docsUrl="/plugins/cors"
    ratingIssueNr="147"
%}
