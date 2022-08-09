---
layout: default
title: RouteOverview documentation
rightmenu: false
permalink: /plugins/routeoverview
---

<h1 class="no-margin-top">RouteOverview Plugin</h1>

The route-overview shows the verb, the path, the function/field/class handling the request,
and any roles attached to the handler.
If the clients accepts JSON, this is served as JSON. Otherwise it's served as HTML:

<img src="/img/news/route-overview.png" alt="Route overview">

You can enable the route-overview either through the `config.plugins` or by registering it manually:

```java
Javalin.create(config -> {
    config.plugins.enableRouteOverview(path);                      // show all routes on specified path
    config.plugins.enableRouteOverview(path, roles);               // show all routes on specified path (with auth)
    config.plugins.register(new RouteOverviewPlugin(path));        // show all routes on specified path
    config.plugins.register(new RouteOverviewPlugin(path, roles)); // show all routes on specified path (with auth)
});
```
