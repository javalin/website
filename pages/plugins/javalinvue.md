---
layout: default
title: JavalinVue Plugin
rightmenu: true
permalink: /plugins/javalinvue
---

<div id="spy-nav" class="right-menu" markdown="1">
* [How does it work](#how-does-it-work)
* [Getting Started](#getting-started)
  * [Creating a layout](#creating-a-layout)
  * [Creating a component](#creating-a-component)
  * [Binding to a route](#binding-to-a-route)
* [Configuration options](#configuration-options)
  * [rootDirectory](#rootdirectory)
  * [vueVersion](#vueversion)
  * [stateFunction](#statefunction)
  * [isDevFunction](#isdevfunction)
  * [optimizeDependencies](#optimizedependencies)
  * [cacheControl](#cachecontrol)
* [Layout macros](#layout-macros)
* [LoadableData](#loadabledata)
* [Good to know](#good-to-know)
</div>

<h1 class="no-margin-top">JavalinVue Plugin</h1>

The JavalinVue plugin provides a very clever integration with [Vue.js](https://vuejs.org/).
As with most clever programming tricks, you will probably either love it or hate it.
These docs are only valid for Javalin 4.X.

## How does it work?
The JavalinVue plugin is basically a very specialized templating engine.
It finds `.vue` (and optionally `.js` and `.css`) files and glues them together,
and serves it all as one big HTML file. You start by creating a layout file:

```html
<head>
    <script src="/webjars/vue/2.6.10/dist/vue.min.js"></script>
    <style>@inlineFile("/vue/styles.css")</style> <!-- You can inline specific js/css files -->
    @componentRegistration <!-- JavalinVue will find required vue files and inline them here -->
</head>
<body>
<main id="main-vue" v-cloak>
    @routeComponent <!-- Your route component will be inlined here (app.get("/my-page", VueComponent("my-page"))) -->
</main>
<script>
    new Vue({el: "#main-vue"});
</script>
</body>
```

When a user tries to access `/my-page` in their browser, JavalinVue will serve the following HTML:

```html
<head>
    <script src="/webjars/vue/2.6.10/dist/vue.min.js"></script>
    <style>body{background:red}</style> <!-- whatever was in styles.css -->
    <!-- <my-page></my-page> component and all of its dependencies -->
</head>
<body>
<main id="main-vue" v-cloak>
    <my-page></my-page> <!-- this was defined in app.get("/my-page", VueComponent("my-page")) -->
</main>
<script>
    new Vue({el: "#main-vue"});
</script>
</body>
```

You don't need any frontend build tool (like Webpack, Parcel, Grunt, etc) – JavalinVue takes care of all that.
As a consequence import/export of ES modules is not needed (and not supported as of now).

There is a longer tutorial which includes the motivation behind creating this
integration, as well as some discussion about pros and cons:
[/tutorials/simple-frontends-with-javalin-and-vue](/tutorials/simple-frontends-with-javalin-and-vue)

## Getting Started

### Creating a layout

Create a root directory for your vue files and place your `layout.html` in it. 
By default, JavalinVue will look in `src/main/resources/vue`: 

```
src
└───main
    └───resources
        └───vue
            └───layout.html
```

Your `layout.html` file will be responsible for initializing Vue and including all your dependencies.
The snippet below shows all the available macros (`@macroName`):

```html
<head>
    <script src="@cdnWebjar/vue/2.6.10/dist/vue.min.js"></script>
    <style>@inlineFile("/vue/styles.css")</style> <!-- always included -->
    <script>@inlineFileDev("/vue/scripts-dev.js")</script> <!-- only included in dev -->
    <script>@inlineFileNotDev("/vue/scripts-not-dev.js")</script> <!-- only included in not dev -->
    @componentRegistration <!-- JavalinVue will find required vue files and inline them here -->
</head>
<body>
<main id="main-vue" v-cloak>
    @routeComponent <!-- Your route component will be inlined here (app.get("/my-page", VueComponent("my-page"))) -->
</main>
<script>
    new Vue({el: "#main-vue"});
</script>
</body>
```

### Creating a component
Components will be inlined where the `@componentRegistration` macro is present in your `layout.html`,
which means you have to register them as global Vue components:

```html
<template id="my-component">
    <div>
        <!-- Component code goes here -->
    </div>
</template>
<script>
    Vue.component("my-component", {
        template: "#my-component"
    });
</script>
```

This component will now be available to be called from any other component you make,
or as a `@routeComponent`.

### Binding to a route
Routing is done server side, so you bind a component to a route by declaring a GET endpoint in Javalin:

```java
app.get("/my-path", VueComponent("my-component"))
```

This means that you can use the same `AccessManager` for frontend routes as you use for your API:

```java
app.get("/my-path", VueComponent("my-component"), roles(Role.LOGGED_IN))
```

## Configuration options

### rootDirectory

By default, JavalinVue will set the root directory based on the first request it serves.

* When `isDev` is true, the root dir will be set to the `src/main/resources/vue` (external location)
* When `isDev` is false, the root dir will be set to `/vue` (classpath location)

This is done to make development fast locally, and requests fast in production.
If you set the root dir explicitly, Javalin won't try to guess what to do:

{% capture java %}
JavalinVue.rootDirectory(c -> c.classpathPath("/path")); // use the path on the same classpath as Javalin
JavalinVue.rootDirectory(c -> c.classpathPath("/path", MyClass.class)); // use the path on the classpath of provided Class 
JavalinVue.rootDirectory(c -> c.externalPath("/path")); // use an external path
JavalinVue.rootDirectory(c -> c.explicitPath(path)); // use an explicit Path object
{% endcapture %}
{% capture kotlin %}
JavalinVue.rootDirectory { it.classpathPath("/path") } // use the path on the same classpath as Javalin
JavalinVue.rootDirectory { it.classpathPath("/path", MyClass.class) } // use the path on the classpath of provided Class
JavalinVue.rootDirectory { it.externalPath("/path") } // use an external path
JavalinVue.rootDirectory { it.explicitPath(path) } // use an explicit Path object
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### vueVersion

By default, version is set to Vue 2. If you're using Vue 3 you can configure that:

{% capture java %}
JavalinVue.vueVersion(c -> c.vue2());
JavalinVue.vueVersion(c -> c.vue3("VueAppName"));
{% endcapture %}
{% capture kotlin %}
JavalinVue.vueVersion { it.vue2() }
JavalinVue.vueVersion { it.vue3("VueAppName") }
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### stateFunction

If you want to share state from your server with Vue, you can provide JavalinVue with a state function:

{% capture java %}
JavalinVue.stateFunction = ctx -> mapOf("user" to getUser(ctx));
{% endcapture %}
{% capture kotlin %}
JavalinVue.stateFunction = { mapOf("user" to getUser(it)) }
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

This can then be accessed from the `state` variable:

```html
<template id="user-template">
    {% raw %}<div>{{ $javalin.state.user }}</div>{% endraw %}
</template>
```

The function runs for every request, so the state is always up to
date when the user navigates or refreshes the page.

### isDevFunction

By default, this `isDevFunction` is set to check if the request host is `"localhost"` or  `"127.0.0.1"`.
This function is called once on the first request JavalinVue sees, and is used to set an `isDev` property,
which is then used to make decisions on how to build the HTML for a request.

{% capture java %}
JavalinVue.isDevFunction = ctx -> // your code here
{% endcapture %}
{% capture kotlin %}
JavalinVue.isDevFunction { /* Your code here */ }
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### optimizeDependencies

By default, this is set to `true`. If you set it to `false`, every `.vue`
file that JavalinVue finds will be inlined in `@componentRegistration`.
If you leave it as true, only required `.vue` files will be included.

```
JavalinVue.optimizeDependencies = true/false;
```

### cacheControl

By default, JavalinVue sets the `"Cache-Control"` header to `"no-cache, no-store, must-revalidate"`.
This can be configured:

```java
JavalinVue.cacheControl = "...";
```

## Layout macros

```java
@inlineFile("/path/to/file.ext")        // this file will always be inlined
@inlineFileDev("/path/to/file.ext")     // this file will be inlined if JavalinVue.isDev is true
@inlineFileNotDev("/path/to/file.ext")  // this file will be inlined if JavalinVue.isDev is false
@componentRegistration                  // all required components will be inlined here 
@routeComponent                         // the current route component will be inlined here
@cdnWebjar                              // will resolve to webjar path if dev, cdn if not dev
```

### @cdnWebjar
You can reference your WebJars with `@cdnWebjar/` instead of the normal `/webjars/`.
If you do this, the path will resolve to `/webjars/` on when `isDevFunction` returns true, and `https//cdn.jsdelivr.net/.../`
on non-localhost. **Note that this only works with NPM webjars.**

## LoadableData

The JavalinVue plugin includes a small class for making HTTP get-requests
to your backend, it can be used like this:

```html
<template id="books-component">
    <div>
        <div v-if="books.loading">Loading books ...</div>
        <div v-if="books.loadError">Failed to load books! ({{books.loadError.text}})</div>
        <div v-if="books.loaded" v-for="book in books.data">{{book}}</div>
    </div>
</template>
<script>
    Vue.component("books-component", {
        template: "#books-component",
        data: () => ({
            books: new LoadableData("/api/books"),    
        }),
    });
</script>
```

The class automatically caches the request in `localStorage`, 
so subsequent requests will appear to load instantly. 
All configuration options and methods (there's just one) are included below:

```javascript
const useCache = true/false;
const errorCallback = error => alert(`An error occurred! Code: ${error.code}, text: ${error.text}`);

// Create a new instance
const loadableData = new LoadableData("/api/books", useCache, errorCallback);

// Refresh data (can use cache to avoid flickering)
loadableData.refresh(useCache, errorCallback);
```

The `loadError` object contains the HTTP status and error message, 
and is available in both the template and in the error callback function.

## Good to know

JavalinVue will also put path-parameters and query-parameters in the Vue instance,
which you can access like this:

```html
<template id="thread-view">
    {% raw %}<div>{{ $javalin.pathParams["user"] }}</div>{% endraw %}
    {% raw %}<div>{{ $javalin.queryParams["query"][0] }}</div>{% endraw %}
</template>
<script>
    Vue.component("thread-view", {
        template: "#thread-view"
    });
</script>
```

### Local state
This feature came to life because someone was abusing `JavalinVue.stateFunction` 
by overwriting it for every request. If you find yourself doing this, you should 
either rewrite your app to fetch data using `LoadableData` (recommended), or use 
local state for `VueComponent` (usually not recommended).

Every `VueComponent` can take a state object as a second parameter. This state overwrites the state from
`stateFunction`. You can either add it directly in a route declaration:

```kotlin
app.get("/specific-state", VueComponent("test-component", mapOf("test" to "tast")))
```

Or inside a handler:
```kotlin
app.get("/specific-state") { ctx ->
    val myState = mapOf("test" to "tast")
    VueComponent("test-component", myState).handle(ctx)
}
```

Note that this is something that you CAN do it, not something that you SHOULD do. 
Only do this if you have thought hard about it, and it solves a real problem for you.
