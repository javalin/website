---
layout: docs
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

Although the Micrometer plugin is part of the regular Javalin library, it requires
additional dependencies to Micrometer libraries. For one, the `micrometer-core` library
is required, plus an additional library for reporting to a specific monitoring system.
In the following description, an example is given to report to
[Prometheus](https://prometheus.io). Thus, add the following dependencies:

```
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-core</artifactId>
    <version>${io.micrometer.version}</version>
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

	PrometheusMeterRegistry registry = new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);

	Javalin app = Javalin.create(config -> {
		config.registerPlugin(new MicrometerPlugin(registry));
	}).start();

	app.get("/prometheus", ctx -> ctx.contentType(TextFormat.CONTENT_TYPE_004).result(registry.scrape()));
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


PrometheusMeterRegistry registry = new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);

// add a tag to all reported values to simplify filtering in large installations:
registry.config().commonTags("application", "My-Application");

new ClassLoaderMetrics().bindTo(registry);
new JvmMemoryMetrics().bindTo(registry);
new JvmGcMetrics().bindTo(registry);
new JvmThreadMetrics().bindTo(registry);
new UptimeMetrics().bindTo(registry);
new ProcessorMetrics().bindTo(registry);
new DiskSpaceMetrics(new File(System.getProperty("user.dir"))).bindTo(registry);

Javalin app = Javalin.create(config -> {
    config.registerPlugin(new MicrometerPlugin(registry));
}).start();

app.get("/prometheus", ctx -> ctx.contentType(TextFormat.CONTENT_TYPE_004).result(registry.scrape()));
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
