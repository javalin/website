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
    title="JavalinVue"
    description="
        JavalinVue let's you create simple Vue frontends without having a frontend build pipeline.
        It uses Vue single-file components with Javalin's server side routing,
        and automatically includes only the Vue code required per route.
        It's ideal for rapid prototyping and creation of websites/web-portals.
    "
    bundled="true"
    author="tipsy"
    created="May 9th, 2019"
    docsUrl="/plugins/javalinvue"
    ratingIssueUrl="https://github.com/javalin/javalin.github.io/issues/132"
%}
