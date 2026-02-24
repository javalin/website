---
layout: default
title: RouteOverview documentation
rightmenu: false
permalink: /plugins/routeoverview
description: "Expose a JSON/HTML overview of all registered routes in a Javalin application using the RouteOverview plugin."
---

<h1 class="no-margin-top">RouteOverview Plugin</h1>

The route-overview shows the verb, the path, the function/field/class handling the request,
and any roles attached to the handler.
If the clients accepts JSON, this is served as JSON. Otherwise it's served as HTML:

<img src="/img/plugins/routeoverview.png" alt="Route overview">

You can enable the route-overview either through the `config.plugins` or by registering it manually:

{% capture java %}
Javalin.create(config -> {
    config.plugins.enableRouteOverview(path);                      // show all routes on specified path
    config.plugins.enableRouteOverview(path, roles);               // show all routes on specified path (with auth)
    config.plugins.register(new RouteOverviewPlugin(path));        // show all routes on specified path
    config.plugins.register(new RouteOverviewPlugin(path, roles)); // show all routes on specified path (with auth)
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.plugins.enableRouteOverview(path)                      // show all routes on specified path
    config.plugins.enableRouteOverview(path, roles)               // show all routes on specified path (with auth)
    config.plugins.register(RouteOverviewPlugin(path))            // show all routes on specified path
    config.plugins.register(RouteOverviewPlugin(path, roles))     // show all routes on specified path (with auth)
}}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}
