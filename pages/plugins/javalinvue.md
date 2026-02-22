---
layout: default
title: JavalinVue Plugin
rightmenu: true
permalink: /plugins/javalinvue
description: "Server-driven Vue.js component loading in Javalin without a build step, using the JavalinVue plugin."
---

<div id="spy-nav" class="right-menu" markdown="1">
- [How does it work?](#how-does-it-work)
- [Getting Started](#getting-started)
  - [Creating a layout](#creating-a-layout)
  - [Creating a component](#creating-a-component)
  - [Binding to a route](#binding-to-a-route)
- [Configuration](#configuration)
  - [rootDirectory](#rootdirectory)
  - [vueAppName](#vueappname)
  - [isDevFunction](#isdevfunction)
  - [optimizeDependencies](#optimizedependencies)
  - [stateFunction](#statefunction)
  - [cacheControl](#cachecontrol)
  - [enableCspAndNonces](#enablecspandnonces)
- [Layout macros](#layout-macros)
  - [@cdnWebjar](#cdnwebjar)
- [LoadableData](#loadabledata)
- [FAQ](#faq)
  - [File not found](#file-not-found)
- [Good to know](#good-to-know)
  - [Local state](#local-state)
</div>

<h1 class="no-margin-top">JavalinVue Plugin</h1>

The JavalinVue plugin provides a very clever integration with [Vue.js](https://vuejs.org/).
As with most clever programming tricks, you will probably either love it or hate it.
These docs are only valid for the current version of Javalin ({{ site.javalinversion }}).

## How does it work?
The JavalinVue plugin is basically a very specialized templating engine.
It finds `.vue` (and optionally `.js` and `.css`) files and glues them together,
and serves it all as one big HTML file. You start by creating a layout file:

{% capture vue2 %}
<head>
    <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.min.js"></script>
    @componentRegistration <!-- JavalinVue will find required vue files and inline them here -->
</head>
<body>
<main id="main-vue" v-cloak>
    @routeComponent <!-- Your route component will be inlined here (config.routes.get("/my-page", VueComponent("my-page"))) -->
</main>
<script>
    new Vue({el: "#main-vue"});
</script>
</body>
{% endcapture %}
{% capture vue3 %}
<head>
    <script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.min.js"></script>
    <script>const app = Vue.createApp({});</script>
    @componentRegistration <!-- JavalinVue will find required vue files and inline them here -->
</head>
<body>
<main id="main-vue" v-cloak>
    @routeComponent <!-- Your route component will be inlined here (config.routes.get("/my-page", VueComponent("my-page"))) -->
</main>
<script>
    app.mount("#main-vue");
</script>
</body>
{% endcapture %}
{% include macros/vueDocsSnippet.html vue2=vue2 vue3=vue3 %}

When a user tries to access `/my-page` in their browser, JavalinVue will serve the following HTML:

{% capture vue2 %}
<head>
    <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.min.js"></script>
    <!-- <my-page></my-page> component and all of its dependencies -->
</head>
<body>
<main id="main-vue" v-cloak>
    <my-page></my-page> <!-- this was defined in config.routes.get("/my-page", VueComponent("my-page")) -->
</main>
<script>
    new Vue({el: "#main-vue"});
</script>
</body>
{% endcapture %}
{% capture vue3 %}
<head>
    <script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.min.js"></script>
    <script>const app = Vue.createApp({});</script>
    <!-- <my-page></my-page> component and all of its dependencies -->
</head>
<body>
<main id="main-vue" v-cloak>
    <my-page></my-page> <!-- this was defined in config.routes.get("/my-page", VueComponent("my-page")) -->
</main>
<script>
    app.mount("#main-vue");
</script>
</body>
{% endcapture %}
{% include macros/vueDocsSnippet.html vue2=vue2 vue3=vue3 %}

You don't need any frontend build tool (like Webpack, Parcel, Grunt, etc) – JavalinVue takes care of all that.
As a consequence import/export of ES modules is not needed. You can still use native ES modules if you want to,
for example if you want to use a third-party library that is only available as an ES module.

There is a longer tutorial which includes the motivation behind creating this
integration, as well as some discussion about pros and cons:
[/tutorials/simple-frontends-with-javalin-and-vue](/tutorials/simple-frontends-with-javalin-and-vue)

## Getting Started

### Registering the plugin
In Javalin 7, JavalinVue is a plugin and must be registered in the config block:

{% capture java %}
Javalin.create(config -> {
    config.registerPlugin(new JavalinVuePlugin());
    config.routes.get("/my-page", new VueComponent("my-page"));
}).start(7070);
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.registerPlugin(JavalinVuePlugin())
    config.routes.get("/my-page", VueComponent("my-page"))
}.start(7070)
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

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
The snippet below shows all the available macros (`@macroName`), except `@cdnWebjar`:

{% capture vue2 %}
<head>
    <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.min.js"></script>
    <style>@inlineFile("/vue/styles.css")</style> <!-- always included -->
    <script>@inlineFileDev("/vue/scripts-dev.js")</script> <!-- only included in dev -->
    <script>@inlineFileNotDev("/vue/scripts-not-dev.js")</script> <!-- only included in not dev -->
    @componentRegistration <!-- JavalinVue will find required vue files and inline them here -->
</head>
<body>
<main id="main-vue" v-cloak>
    @routeComponent <!-- Your route component will be inlined here (config.routes.get("/my-page", VueComponent("my-page"))) -->
</main>
<script>
    new Vue({el: "#main-vue"});
</script>
</body>
{% endcapture %}
{% capture vue3 %}
<head>
    <script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.min.js"></script>
    <script>const app = Vue.createApp({});</script>
    <style>@inlineFile("/vue/styles.css")</style> <!-- always included -->
    <script>@inlineFileDev("/vue/scripts-dev.js")</script> <!-- only included in dev -->
    <script>@inlineFileNotDev("/vue/scripts-not-dev.js")</script> <!-- only included in not dev -->
    @componentRegistration <!-- JavalinVue will find required vue files and inline them here -->
</head>
<body>
<main id="main-vue" v-cloak>
    @routeComponent <!-- Your route component will be inlined here (config.routes.get("/my-page", VueComponent("my-page"))) -->
</main>
<script>
    app.mount("#main-vue");
</script>
</body>
{% endcapture %}
{% include macros/vueDocsSnippet.html vue2=vue2 vue3=vue3 %}

The `@cdnWebjar` macro is used to include a webjar when running in dev mode,
see [@cdnWebjar](#cdnwebjar) for more information.

### Creating a component
Components will be inlined where the `@componentRegistration` macro is present in your `layout.html`,
which means you have to register them as global Vue components:

{% capture vue2 %}
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
{% endcapture %}
{% capture vue3 %}
<template id="my-component">
    <div>
        <!-- Component code goes here -->
    </div>
</template>
<script>
    app.component("my-component", {
        template: "#my-component"
    });
</script>
{% endcapture %}
{% include macros/vueDocsSnippet.html vue2=vue2 vue3=vue3 %}

This component will now be available to be called from any other component you make,
or as a `@routeComponent`.

### Binding to a route
Routing is done server side, so you bind a component to a route by declaring a GET endpoint in Javalin:

{% capture java %}
config.routes.get("/my-path", new VueComponent("my-component"));
{% endcapture %}
{% capture kotlin %}
config.routes.get("/my-path", VueComponent("my-component"))
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

This means that you can use the same `AccessManager` for frontend routes as you use for your API:

{% capture java %}
config.routes.get("/my-path", new VueComponent("my-component"), roles(Role.LOGGED_IN));
{% endcapture %}
{% capture kotlin %}
config.routes.get("/my-path", VueComponent("my-component"), roles(Role.LOGGED_IN))
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}


## Configuration
{% capture java %}
config.registerPlugin(new JavalinVuePlugin(vue -> {
    vue.rootDirectory        // where JavalinVue should look for files (default: decided based on isDevFunction)
    vue.vueInstanceNameInJs  // the Vue 3 app name (default: null)
    vue.isDevFunction        // a function to determine if request is on localhost (default: checks ctx.url())
    vue.optimizeDependencies // only include required vue files (default: true)
    vue.stateFunction        // a function which runs on every request for transferring state from server (default: null)
    vue.cacheControl         // cache control header (default: "no-cache, no-store, must-revalidate")
    vue.enableCspAndNonces   // will enable csp and tag each component with a nonce (default: false)
}));
{% endcapture %}
{% capture kotlin %}
config.registerPlugin(JavalinVuePlugin { vue ->
    vue.rootDirectory        // where JavalinVue should look for files (default: decided based on isDevFunction)
    vue.vueInstanceNameInJs  // the Vue 3 app name (default: null)
    vue.isDevFunction        // a function to determine if request is on localhost (default: checks ctx.url())
    vue.optimizeDependencies // only include required vue files (default: true)
    vue.stateFunction        // a function which runs on every request for transferring state from server (default: null)
    vue.cacheControl         // cache control header (default: "no-cache, no-store, must-revalidate")
    vue.enableCspAndNonces   // will enable csp and tag each component with a nonce (default: false)
})
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### rootDirectory
By default, JavalinVue will set the root directory based on the first request it serves.

* When `isDev` is true, the root dir will be set to the `src/main/resources/vue` (external location)
* When `isDev` is false, the root dir will be set to `/vue` (classpath location)

This is done to make development fast locally, and requests fast in production.
If you set the root dir explicitly, Javalin won't try to guess what to do:

{% capture java %}
rootDirectory(Path path) // set location with explicit Path object
rootDirectory(String path) // set relative path (classpath by default)
rootDirectory(String path, Location location) // location can be CLASSPATH or EXTERNAL
rootDirectory(String path, Location location, Class resourcesJarClass) // add a class to specify which jar holds the resources
{% endcapture %}
{% capture kotlin %}
rootDirectory(path: Path) // set location with explicit Path object
rootDirectory(path: String) // set relative path (classpath by default)
rootDirectory(path: String, location: Location) // location can be CLASSPATH or EXTERNAL
rootDirectory(path: String, location: Location, resourcesJarClass: Class<*>) // add a class to specify which jar holds the resources
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

The `resourcesJarClass` becomes relevant if you are packing your application as multiple jars.
If you are using a fat-jar/uber-jar, everything is flattened, and Javalin will find the resources automatically.
If you are using something like [distTar](https://docs.gradle.org/current/userguide/distribution_plugin.html), you will need to
point JavalinVue to the Jar which contains your resources. You can do this through `rootDirectory(path = "/path", resourcesJarClass = MyClass::class.java)`.

### vueInstanceNameInJs
This setting is only required if you are using Vue 3:

{% capture java %}
vueInstanceNameInJs = "MyAppName";
{% endcapture %}
{% capture kotlin %}
vueInstanceNameInJs = "MyAppName"
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

This setting should match how you initialize your Vue instance: `const MyAppName = Vue.createApp({});`

### isDevFunction
By default, this `isDevFunction` is set to check if the request host is `"localhost"` or  `"127.0.0.1"`.
This function is called once on the first request JavalinVue sees, and is used to set an `isDev` property,
which is then used to make decisions on how to build the HTML for a request.

{% capture java %}
isDevFunction = ctx -> // your code here
{% endcapture %}
{% capture kotlin %}
isDevFunction { /* Your code here */ }
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### optimizeDependencies
By default, this is set to `true`. If you set it to `false`, every `.vue`
file that JavalinVue finds will be inlined in `@componentRegistration`.
If you leave it as true, only required `.vue` files will be included.

{% capture java %}
optimizeDependencies = true/false;
{% endcapture %}
{% capture kotlin %}
optimizeDependencies = true/false
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### stateFunction
If you want to share state from your server with Vue, you can provide JavalinVue with a state function:

{% capture java %}
stateFunction = ctx -> Map.of("user", getUser(ctx));
{% endcapture %}
{% capture kotlin %}
stateFunction = { mapOf("user" to getUser(it)) }
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

### cacheControl
By default, JavalinVue sets the `"Cache-Control"` header to `"no-cache, no-store, must-revalidate"`.
This can be configured:

{% capture java %}
cacheControl = "cache header string";
{% endcapture %}
{% capture kotlin %}
cacheControl = "cache header string"
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### enableCspAndNonces
This will make Javalin generate a nonce for every script tag in your app, as well as set the CSP header.

{% capture java %}
enableCspAndNonces = true/false;
{% endcapture %}
{% capture kotlin %}
enableCspAndNonces = true/false
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

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

{% capture vue2 %}
<template id="books-component">
    <div>
        <div v-if="books.loading">Loading books ...</div>
        {% raw %}<div v-if="books.loadError">Failed to load books! ({{books.loadError.text}})</div>{% endraw %}
        {% raw %}<div v-if="books.loaded" v-for="book in books.data">{{book}}</div>{% endraw %}
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
{% endcapture %}
{% capture vue3 %}
<template id="books-component">
    <div>
        <div v-if="books.loading">Loading books ...</div>
        {% raw %}<div v-if="books.loadError">Failed to load books! ({{books.loadError.text}})</div>{% endraw %}
        {% raw %}<div v-if="books.loaded" v-for="book in books.data">{{book}}</div>{% endraw %}
    </div>
</template>
<script>
    app.component("books-component", {
        template: "#books-component",
        data: () => ({
            books: new LoadableData("/api/books"),
        }),
    });
</script>
{% endcapture %}
{% include macros/vueDocsSnippet.html vue2=vue2 vue3=vue3 %}

The class automatically caches the request in `localStorage`,
so subsequent requests will appear to load instantly.
All configuration options and methods are shown below:

```javascript
const useCache = true/false;
const errorCallback = error => alert(`An error occurred! Code: ${error.code}, text: ${error.text}`);

// Create a new instance with config options
const loadableData = new LoadableData("/api/books", {cache: useCache, errorCallback: errorCallback});
```

```javascript
// Refresh data
loadableData.refresh();

// Refresh data for other instances which uses the same endpoint
let users = new LoadableData("/users");
let sameUsers = new LoadableData("/users"); // this variable could be in a different component
users.refreshAll(); // sameUsers will also be refreshed, since they share the same URL

// Invalidate cache
loadableData.invalidateCache();
```

The `loadError` object contains the HTTP status and error message,
and is available in both the template and in the error callback function.

## FAQ

### File not found
* If you are using Vue3, it's important that you use the [#vueAppName](#vueappname) config.
* If you are running from an IDE, and your project is not in the root directory,
  you have to include the subdirectory when setting [#rootDirectory](#rootdirectory) (or JavalinVue won't know where to look for files)
* If you are packaging your application with multiple jars, you have to tell JavalinVue
  where your resources are located. You can to this through the [#rootDirectory](#rootdirectory) config option by including a class in your jar.

## Good to know
JavalinVue will also put path-parameters in the Vue instance,
which you can access like this:

```html
<template id="thread-view">
    {% raw %}<div>{{ $javalin.pathParams["user"] }}</div>{% endraw %}
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
config.routes.get("/specific-state", VueComponent("test-component", mapOf("test" to "tast")))
```

Or inside a handler:
```kotlin
config.routes.get("/specific-state") { ctx ->
    val myState = mapOf("test" to "tast")
    VueComponent("test-component", myState).handle(ctx)
}
```

Note that this is something that you CAN do it, not something that you SHOULD do.
Only do this if you have thought hard about it, and it solves a real problem for you.
