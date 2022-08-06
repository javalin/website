---
layout: default
title: Plugin store
rightmenu: false
permalink: /plugins/
---

{% include pluginIcons.html %}

{% include pluginCard.html
    title="JavalinVue"
    description="
        JavalinVue let's you create simple Vue frontends without having a frontend build pipeline.
        It uses Vue single-file compoenents with Javalin's server side routing,
        and automatically includes only the Vue code required per route.
        It's ideal for rapid prototyping and creation of websites/web-portals.
    "
    bundled="true"
    author="tipsy"
    created="May 9th, 2019"
    docsUrl="/plugins/javalinvue"
    ratingIssueUrl="https://github.com/javalin/javalin.github.io/issues/132"
%}
