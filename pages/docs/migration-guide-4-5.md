---
layout: default
title: Migration guide, v4 to v5
rightmenu: false
permalink: /migration-guide-javalin-4-to-5
---

<h1 class="no-margin-top">Javalin 4 to 5 migration guide</h1>
This page attempts to cover all the things you need to know in order to migrate from Javalin 4 to Javalin 5.
If you find any errors, please <a href="{{site.repourl}}/blob/master/{{page.path}}">edit this page on GitHub</a>.

## Jetty 11, Java 11, and Micrometer
The most significant change is that Javalin no longer supports Java 8, with Java 11 being the new minimum version.
This is because Jetty 9 (what Javalin has been running on since 2017) has been end-of-lifed, and later Jetty versions
requires Java 11.

### Micrometer has been removed
Related to the Jetty 11 change, the `MicrometerPlugin` has been removed. This had to be done because
Micrometer does not support Jetty 11:
[https://github.com/micrometer-metrics/micrometer/issues/3234](https://github.com/micrometer-metrics/micrometer/issues/3234)

## Package changes
The `core` package has been removed, flattening the package structure of Javalin.
Some other things have also been moved around.

```java
// core package
import io.javalin.core.compression -> import io.javalin.compression
import io.javalin.core.config -> import io.javalin.config
import io.javalin.core.event -> import io.javalin.event
import io.javalin.core.security -> import io.javalin.security
import io.javalin.core.util -> import io.javalin.util
import io.javalin.core.util.Header -> import io.javalin.http.Header

// plugin package
import io.javalin.plugin.rendering.vue -> import io.javalin.vue
import io.javalin.plugin.json -> import io.javalin.json
```

## Configuration changes
Configuration has been changed significantly. All config options used to be available
directly on the config consumer in `Javalin.create { config }`, but in Javalin 5 most
of the old config options have been moved into subconfigs. You can find the full overview at
[/documentation#configuration](/documentation#configuration).

## OpenAPI
The OpenAPI DSL and annotation processor has been replaced by a
[new project](https://github.com/javalin/javalin-openapi) by a very talented
new Javalin contributor, [@dzikoysk](https://github.com/dzikoysk), who is also the author
of Reposilite ([repo](https://github.com/dzikoysk/reposilite), [website](https://reposilite.com/)).
Reposilite is currently running both
Javalin v5 and Javalin OpenAPI v5 in production.
This new project should have significantly fewer issues than the old module.

## Semi private fields renamed
The `_conf.inner` field has been renamed to `cfg.pvt` (config private) to
further discourage use. It's still okay to use it (if you know what you are doing).

## Context changes
* `Context` is now an interface
* `ctx.req` and `ctx.res` are now `ctx.req()` and `ctx.res()`
* `ctx.cookieStore#` is now `ctx.cookieStore().#`
* `ctx.seekableStream` is now `ctx.writeSeekableStream`
* The reified `xyzAsClass` functions now have to be imported (since `Context` is now an interface)

## JavalinVue
The `JavalinVue` singleton has been removed. Instead of `JavalinVue.configOption = ...`,
you now have to configure Vue through `Javalin.create { config.vue.configOption = ... }`.
