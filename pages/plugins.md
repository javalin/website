---
layout: default
title: Plugin store
rightmenu: false
permalink: /plugins/
---

{% include pluginIcons.html %}

<h1 class="no-margin-top">Plugins</h1>
This page contains an overview of official and unofficial Javalin plugins.
Each plugin can be rated and reviewed on GitHub (via reactions and comments),
and the rating is displayed at the bottom of each card.

{% include pluginCard.html
    title="OpenAPI Annotation Processor"
    description="
        Fill this out
    "
    bundled="false"
    author="dzikoysk"
    docsUrl="/plugins/openapi-annotation-processor"
    ratingIssueNr="133"
%}

{% include pluginCard.html
    title="JavalinVue"
    description="
        JavalinVue let's you create simple Vue frontends without having a frontend build pipeline.
        It uses Vue single-file components with Javalin's server side routing,
        and automatically includes only the Vue code required per route.
        It's ideal for rapid prototyping and creation of websites/web-portals.
    "
    bundled="true"
    author="tipsy"
    docsUrl="/plugins/javalinvue"
    ratingIssueNr="132"
%}

{% include pluginCard.html
    title="SSL Helpers"
    description="
        SSL configuration made easy. This plugin provides a simple way to configure SSL for Javalin, just the same way you would configure Javalin itself. Support for PEM, PKCS12, and JKS formats, as well as HTTP/2.
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
