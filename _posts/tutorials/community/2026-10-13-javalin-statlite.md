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

This tutorial adds request counts, HTTP errors, average latency, JVM heap, and
process CPU history to a Javalin application. Javalin's Micrometer plugin records
the metrics; a small JSON adapter exposes them to
[StatLite](https://github.com/PVRLabs/statlite), which stores history in SQLite
and serves a dashboard.

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

The [maintained integration guide](https://github.com/PVRLabs/statlite/blob/main/docs/integrate/java/javalin.md)
provides `StatLiteMetrics.java`; the runnable example already includes it.
For your own application, copy that helper and adjust its package. It sums
Micrometer's HTTP timers into cumulative request, error, and duration counters,
adds available heap and CPU gauges, and emits `statlite-metrics/v1` JSON at
`/statlite/metrics`. It excludes that route from application counters so
monitoring does not create traffic in the dashboard.

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

For normal monitoring, use a polling interval of **30 seconds or longer**.
Save this as `statlite.yaml` in the example directory, replacing the example's
fast demo configuration. It tells StatLite where to poll and store history:

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

For this short demo, create `statlite-demo.yaml` with ten-second polling so the
traffic probe can verify collection within its 15-second wait.

From the same example directory in the second terminal:

```sh
mkdir -p runtime
sed 's/interval: "30s"/interval: "10s"/' statlite.yaml > statlite-demo.yaml
statlite --config statlite-demo.yaml
```

Open <http://127.0.0.1:19087/>. StatLite polls the adapter and serves the
dashboard without additional dashboard configuration.

> **Note:**
> Use **30s or longer for production**. Keep `statlite-demo.yaml` strictly for
> local demos; use `statlite.yaml` for normal monitoring. Shorter intervals
> increase polling work and stored samples.

## Generate traffic and view history

In a third terminal, also in the example directory, run:

```sh
python3 probe.py
```

Each run sends 48 requests: 12 each to `/hello` (200), `/slow` (200 with a
120 ms delay), `/missing` (404), and `/error` (500). The probe checks counter
increases, verifies that metrics polls don't count as application traffic, and
confirms collection in StatLite. Avoid other application traffic while it runs because its counter
checks expect exact increases.

Each run generates roughly five seconds of traffic, then waits for StatLite to
collect the results. Run it several times to build history; the screenshot below
follows six consecutive runs with fresh StatLite storage.

![StatLite dashboard for the Javalin demo, showing request and error counts, average latency, JVM heap and process CPU.](/img/posts/statliteTutorial/dashboard.png)

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
For normal monitoring, start StatLite with `statlite --config statlite.yaml`;
that file retains the recommended 30-second interval.

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
