---
layout: default
title: Migration guide, v5 to v6
rightmenu: false
permalink: /migration-guide-javalin-5-to-6
---

<h1 class="no-margin-top">Javalin 5 to 6 migration guide</h1>

This page attempts to cover all the things you need to know in order to migrate from Javalin 5 to Javalin 6.
If you find any errors, or if something is missing, please <a href="{{site.repourl}}/blob/master/{{page.path}}">edit this page on GitHub</a>.

## The AccessManager interface has been removed

This is quite a big internal change, and migrating should be performed with some care.
It's not a difficult migration, but it's important to understand what's going on.

In Javalin 5, the `AccessManager` interface wrapped endpoint-handlers in a lambda,
and allowed you to choose whether to call the wrapped endpoint-handlers.
This meant that the `AccessManager` was not called for static files or before/after handlers, 
it was only called for endpoint handlers. Let's look at an example of an `AccessManager` in Javalin 5:

{% capture java %}
config.accessManager((handler, ctx, routeRoles) -> {
    var userRole = getUserRole(ctx); // some user defined function that returns a user role
    if (routeRoles.contains(userRole)) { // routeRoles are provided through the AccessManager interface
        handler.handle(ctx); // if handler.handle(ctx) is not called, the endpoint handler is not called
    }
});
{% endcapture %}
{% capture kotlin %}
config.accessManager { handler, ctx, routeRoles ->
    val userRole = getUserRole(ctx) // some user defined function that returns a user role
    if (routeRoles.contains(userRole)) { // routeRoles are provided through the AccessManager interface
        handler.handle(ctx) // if handler.handle(ctx) is not called, the endpoint handler is not called
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Now, let's look at a similar example in Javalin 6:

{% capture java %}
app.beforeMatched(ctx -> {
    var userRole = getUserRole(ctx); // some user defined function that returns a user role
    if (!ctx.routeRoles().contains(userRole)) { // routeRoles are provided through the Context interface
        throw new UnauthorizedResponse(); // request will have to be explicitly stopped by throwing an exception
    }
});
{% endcapture %}
{% capture kotlin %}
app.beforeMatched { ctx ->
    val userRole = getUserRole(ctx) // some user defined function that returns a user role
    if (!ctx.routeRoles().contains(userRole)) { // routeRoles are provided through the Context interface
        throw UnauthorizedResponse() // request will have to be explicitly stopped by throwing an exception
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

While this looks similar, there is an important difference. 
As mentioned, in Javalin 5, the `AccessManager` was only called for endpoint handlers, 
this means that the Javalin 5 example would not be called for static files or before/after handlers,
while the Javalin 6 example would be called for **all** requests.
If you want to migrate to a `beforeMatched` in Javalin 6 that has the same behavior as the `AccessManager` in Javalin 5,
you should perform a check for the presence of route roles in the `beforeMatched` handler:

{% capture java %}
app.beforeMatched(ctx -> {
    if (ctx.routeRoles().isEmpty()) { // route roles can only be attached to endpoint handlers
        return; // if there are no route roles, we don't need to check anything
    }
    var userRole = getUserRole(ctx);
    if (!ctx.routeRoles().contains(userRole)) {
        throw new UnauthorizedResponse();
    }
});
{% endcapture %}
{% capture kotlin %}
app.beforeMatched { ctx ->
    if (ctx.routeRoles().isEmpty()) { // route roles can only be attached to endpoint handlers
        return // if there are no route roles, we don't need to check anything
    }
    val userRole = getUserRole(ctx)
    if (!ctx.routeRoles().contains(userRole)) {
        throw UnauthorizedResponse()
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Additional changes
It's hard to keep track of everything, but you can look at the
[full commit log](https://github.com/javalin/javalin/compare/javalin-parent-5.6.3...javalin-parent-6.0.0-beta.2)
between the last 5.x version and 6.0.

If you run into something not covered by this guide, please <a href="{{site.repourl}}/blob/master/{{page.path}}">edit this page on GitHub</a>!

You can also reach out to us on
[Discord](https://discord.com/invite/sgak4e5NKv) or
[GitHub](https://github.com/javalin/javalin).
