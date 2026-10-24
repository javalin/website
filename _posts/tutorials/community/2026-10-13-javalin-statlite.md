---
layout: tutorial
official: false
title: Monitoring a Javalin application with StatLite
permalink: /tutorials/javalin-statlite
summarytitle: Monitoring Javalin with StatLite
summary: Add HTTP and JVM metrics history to a Javalin application using Micrometer and StatLite.
date: 2026-10-13
author: <a href="https://github.com/ejboy">Ted Kupolov</a>
language: ["java"]
rightmenu: true
github: https://github.com/PVRLabs/experiments/tree/main/statlite/javalin-micrometer
---

This tutorial shows how to monitor a Javalin application with
[StatLite](https://github.com/PVRLabs/statlite), an open-source monitoring tool
I developed. It covers request counts, HTTP errors, average latency, JVM heap,
and process CPU history.

The flow is **Javalin → Micrometer → JSON adapter → StatLite**.

The [complete runnable example](https://github.com/PVRLabs/experiments/tree/main/statlite/javalin-micrometer)
contains the application, adapter, configuration, and traffic probe used here.
You need Java 17 or newer, Maven, Python 3 for the probe, and a
[StatLite binary](https://github.com/PVRLabs/statlite/blob/main/docs/install.md)
on your PATH. This walkthrough was checked with Javalin 7.2.3 and StatLite v0.6.0.

## Dependencies

The example uses these Maven dependencies:

```xml
<dependency>
    <groupId>io.javalin</groupId>
    <artifactId>javalin</artifactId>
    <version>7.2.3</version>
</dependency>
<dependency>
    <groupId>io.javalin</groupId>
    <artifactId>javalin-micrometer</artifactId>
    <version>7.2.3</version>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.22.1</version>
</dependency>
```

Keep the Micrometer plugin at the same version as Javalin. It supplies the
Micrometer API; no separate Micrometer version or Prometheus server is needed.
The standalone example also includes `slf4j-simple` for logging; its
[pom.xml](https://github.com/PVRLabs/experiments/blob/main/statlite/javalin-micrometer/pom.xml)
contains the full build setup.

Jackson Databind enables Javalin's default JSON mapper for `ctx.json()`.
Without it or another configured mapper, the metrics endpoint can return HTTP 500.
If your application already configures a JSON mapper, reuse it and its
dependencies.

## Register the meters and endpoint

The example creates a cumulative registry and binds the JVM memory and CPU
meters once:

```java
import io.javalin.Javalin;
import io.javalin.micrometer.MicrometerPlugin;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.binder.jvm.JvmMemoryMetrics;
import io.micrometer.core.instrument.binder.system.ProcessorMetrics;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.util.concurrent.atomic.AtomicReference;

// Inside main; StatLiteMetrics is the adapter linked below.
MeterRegistry registry = new SimpleMeterRegistry();
new JvmMemoryMetrics().bindTo(registry);
new ProcessorMetrics().bindTo(registry);
AtomicReference<String> health = new AtomicReference<>("UP");

Javalin app = Javalin.create(config -> {
    config.jetty.host = "127.0.0.1";
    config.registerPlugin(new MicrometerPlugin(plugin -> plugin.registry = registry));
    config.routes.get(StatLiteMetrics.PATH, ctx -> {
        ctx.header("Cache-Control", "no-store");
        ctx.json(StatLiteMetrics.snapshot(registry, health.get()));
    });
    // Register your application routes here, before start().
}).start(18087);

Runtime.getRuntime().addShutdownHook(new Thread(() -> {
    app.stop();
    registry.close();
}));
```

The core of `StatLiteMetrics.snapshot` sums Micrometer's HTTP timers into
cumulative request, error, and duration counters:

```java
// Inside snapshot; Timer is io.micrometer.core.instrument.Timer.
// The helper defines EXCLUDED_URIS = Set.of(PATH).
double requests = 0, notFound = 0, clientErrors = 0, serverErrors = 0, seconds = 0;
for (Timer timer : registry.find("http.server.requests").timers()) {
    String uri = timer.getId().getTag("uri");
    if (uri != null && EXCLUDED_URIS.contains(uri)) {
        continue;
    }
    long count = timer.count();
    requests += count;
    seconds += timer.totalTime(java.util.concurrent.TimeUnit.SECONDS);
    String code = timer.getId().getTag("status");
    if ("404".equals(code)) {
        notFound += count;
    }
    if (code != null && code.startsWith("4")) {
        clientErrors += count;
    }
    if (code != null && code.startsWith("5")) {
        serverErrors += count;
    }
}

Map<String, Object> metrics = new LinkedHashMap<>();
metrics.put("requests_total", requests);
metrics.put("responses_404_total", notFound);
metrics.put("responses_4xx_total", clientErrors);
metrics.put("responses_5xx_total", serverErrors);
metrics.put("request_duration_seconds_total", seconds);
```

These totals are cumulative; StatLite derives changes between polls rather
than resetting the timers.

The [full helper](https://github.com/PVRLabs/statlite/blob/main/docs/integrate/java/javalin.md)
also adds heap and CPU gauges and wraps the metrics in `statlite-metrics/v1`
JSON with application status and JVM start time. The runnable example includes
it; for your own application, copy the helper and adjust its package.

Reuse an existing cumulative registry and JVM meters when available. A step
registry reports interval values and does not suit these cumulative counters.
If you expose additional monitoring routes, add their route templates to the
helper's exclusions.

The `health` value belongs to the application. Here it starts at `UP`; in an
existing app, update it from your readiness signal. Serving the endpoint
successfully does not by itself establish readiness.

## Start the application and StatLite

Clone the examples repository, then run the application from its demo directory:

```sh
git clone https://github.com/PVRLabs/experiments.git
cd experiments/statlite/javalin-micrometer
mvn compile exec:java
```

The app binds to `127.0.0.1:18087`. In another terminal, check its endpoint:

```sh
curl -i http://127.0.0.1:18087/statlite/metrics
```

Expect HTTP 200 and JSON containing `schema: statlite-metrics/v1`, `status`,
`started_at`, and a `metrics` object. The HTTP counters start at zero.

The example's `statlite.yaml` tells StatLite where to poll and store history.
Use a polling interval of **30 seconds or longer**:

```yaml
server:
  listen: "127.0.0.1:19087"
storage:
  sqlite_path: "runtime/statlite.sqlite"
polling:
  interval: "30s"
targets:
  - name: javalin-demo
    type: statlite-metrics
    url: http://127.0.0.1:18087/statlite/metrics
```

From the same example directory in the second terminal:

```sh
mkdir -p runtime
statlite --config statlite.yaml
```

Open <http://127.0.0.1:19087/>. StatLite polls the adapter and serves the
dashboard without additional dashboard configuration.

## Generate traffic and view history

In a third terminal, also in the example directory, run:

```sh
python3 probe.py
```

Each run sends 48 requests: 12 each to `/hello` (200), `/slow` (200 with a
120 ms delay), `/missing` (404), and `/error` (500). The probe checks counter
increases, verifies that metrics polls don't count as application traffic, and
waits for the expected metrics to appear in StatLite, allowing up to 90 seconds
each for initial collection and collection after traffic. Avoid other application
traffic while it runs because its counter checks expect exact increases.

Run it several times to build history. The screenshot below shows six
consecutive runs with fresh StatLite storage.

![StatLite dashboard for the Javalin demo, showing request and error counts, average latency, JVM heap and process CPU.](/img/posts/statliteTutorial/dashboard.webp)

The request and error charts show changes between collected samples. Across
the six runs, the app handled 288 requests, including 72 404 responses and 72
500 responses. The 404, 4xx, and 5xx lines overlap in this workload: every 4xx
is a 404, and each batch contains equal numbers of 404 and 500 responses.
The 404 count is already included in 4xx.

Average latency is around 31 ms for this mix of fast and delayed requests.
It is the average for each collection interval, not p95. Runtime memory shows
JVM heap used, not Java process RSS; heap can fall after garbage collection.
Process CPU comes from the JVM's CPU measurement. These demo observations are
not performance guarantees.

“DB health: Not reported” is expected; we omitted it for simplicity. For
database-health reporting or a native Javalin integration, see the
[Javalin integration guide](https://github.com/PVRLabs/statlite/blob/main/docs/integrate/java/javalin.md#references-and-future-first-class-support).

Stop the app and StatLite with Ctrl-C in their respective terminals when finished.
History remains in `runtime/statlite.sqlite`.

## Apply it to your application

Keep your existing routes, JSON mapper, listen address, and cumulative registry.
Add the plugin, missing JVM meters, and adapter endpoint before starting Javalin,
then point a `statlite-metrics` target at that process's endpoint. Poll an
individual process rather than a load-balanced URL across independent JVMs.
The adapter includes JVM start time so StatLite can separate runs after a restart.

Keep the demo on loopback. For a deployed app, restrict the metrics endpoint
with network or firewall rules, or source restrictions at a reverse proxy.
This target does not send Basic or Bearer authentication credentials.
Readiness and optional database health should use authoritative, inexpensive
or cached signals; a database check on every metrics poll is unnecessary.

For the optional health-control and restart demonstration, follow the
[example README](https://github.com/PVRLabs/experiments/tree/main/statlite/javalin-micrometer#health-and-restarts).
Use the [integration guide](https://github.com/PVRLabs/statlite/blob/main/docs/integrate/java/javalin.md)
for the maintained adapter and setup details.
