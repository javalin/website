---
layout: default
title: Micrometer documentation
rightmenu: true
permalink: /plugins/micrometer
---

<div id="spy-nav" class="right-menu" markdown="1">
- [Getting Started](#getting-started)
- [Provided Metrics](#provided-metrics)
- [Custom Meters](#custom-meters)
</div>

<h1 class="no-margin-top">Micrometer Plugin</h1>

This plugin allows reporting metrics using [Micrometer](https://micrometer.io).

## Getting Started

The Micrometer plugin is available on Maven Central as a separate artifact, but in order to use the plugin an additional library for reporting to a specific monitoring system is required.
In the following description, an example is given to report to
[Prometheus](https://prometheus.io). Thus, add the following dependencies:

```xml
<dependency>
    <groupId>io.javalin</groupId>
    <artifactId>javalin-micrometer</artifactId>
    <version>{{site.javalinversion}}</version>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
    <version>${io.micrometer.version}</version>
</dependency>
```


Create a registry, register the plugin, and provide a route:

```java
public static void main(String[] args) {
    PrometheusMeterRegistry prometheusMeterRegistry = new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);

    MicrometerPlugin micrometerPlugin = new MicrometerPlugin(micrometerPluginConfig -> micrometerPluginConfig.registry = prometheusMeterRegistry);
    Javalin app = Javalin.create(config -> config.registerPlugin(micrometerPlugin)).start(8080);

    String contentType = "text/plain; version=0.0.4; charset=utf-8";
    app.get("/prometheus", ctx -> ctx.contentType(contentType).result(prometheusMeterRegistry.scrape()));
}
```

With this setup, Javalin will report several Jetty-related metrics (for example accessed
endpoints and returned status codes) at the specified endpoint, suitable for being
ingested by Prometheus.

## Provided Metrics

The Micrometer library comes with a number of useful metrics provider, which can be
easily added:

```java
import io.micrometer.core.instrument.binder.jvm.*;
import io.micrometer.core.instrument.binder.system.*;


PrometheusMeterRegistry prometheusMeterRegistry = new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);


// add a tag to all reported values to simplify filtering in large installations:
registry.config().commonTags("application", "My-Application");

new ClassLoaderMetrics().bindTo(registry);
new JvmMemoryMetrics().bindTo(registry);
new JvmGcMetrics().bindTo(registry);
new JvmThreadMetrics().bindTo(registry);
new UptimeMetrics().bindTo(registry);
new ProcessorMetrics().bindTo(registry);
new DiskSpaceMetrics(new File(System.getProperty("user.dir"))).bindTo(registry);

MicrometerPlugin micrometerPlugin = new MicrometerPlugin(micrometerPluginConfig -> micrometerPluginConfig.registry = prometheusMeterRegistry);

Javalin app = Javalin.create(config -> config.registerPlugin(micrometerPlugin)).start(8080);

String contentType = "text/plain; version=0.0.4; charset=utf-8";
app.get("/prometheus", ctx -> ctx.contentType(contentType).result(prometheusMeterRegistry.scrape()));
```

## Custom Meters

It's also easy to provide custom meters, reporting application-specific values, for
example the length of a job-queue, the number of logged in users, or other values.
In the following example, just a random number is returned:

```java
import io.micrometer.core.instrument.Gauge;

Gauge
  .builder("myapp_random", () -> (int) (Math.random() * 1000))
  .description("Random number from My-Application.")
  .strongReference(true)
  .register(registry);
```
