---
layout: tutorial
official: true
title: "Advertising a Javalin server on the local network with mDNS"
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
date: 2026-06-19
permalink: /tutorials/mdns
github: https://github.com/javalin/javalin-samples/tree/main/javalin7/javalin-mdns-example
summarytitle: mDNS service discovery
summary: Advertise your Javalin server over mDNS so it's reachable at a custom name.local address.
language: ["java", "kotlin"]
---

## What is mDNS (and why would I want it)?

mDNS (multicast DNS, also known as Zeroconf or Bonjour) lets a machine claim a `name.local`
hostname on the local network without any DNS server, static IP, or router config.\\
Instead of asking a central server "what's the IP for this name?", a device shouts the question
onto the LAN over multicast, and whoever owns the name answers directly.

This is exactly what you want for a server running on your laptop, a Raspberry Pi, or some box on
the office network: instead of telling people "go to `http://192.168.1.42`" you can tell them
"go to `http://javalin-demo.local`" and it just works, as long as everyone is on the same network.

We're going to wire [JmDNS](https://github.com/jmdns/jmdns) straight into Javalin's lifecycle, so the
hostname is published when the server starts and cleaned up when it stops.

## Dependencies

First, we need a Maven project with Javalin and JmDNS: [(→ Tutorial)](/tutorials/maven-setup)

```xml
<dependencies>
    <dependency>
        <groupId>io.javalin</groupId>
        <artifactId>javalin-bundle</artifactId>
        <version>{{site.javalinversion}}</version>
    </dependency>
    <dependency>
        <groupId>org.jmdns</groupId>
        <artifactId>jmdns</artifactId>
        <version>3.6.3</version>
    </dependency>
</dependencies>
```

If you're on Gradle instead, it's the same two dependencies:

```kotlin
implementation("io.javalin:javalin-bundle:{{site.javalinversion}}")
implementation("org.jmdns:jmdns:3.6.3")
```

## Publishing the hostname

The interesting part of JmDNS is the two-argument `JmDNS.create(address, hostname)` call:\\
the `hostname` is what becomes `<hostname>.local`, and the `address` tells JmDNS which network
interface to multicast on. Once we have a `JmDNS` instance we register an `_http._tcp` service so
HTTP clients (and service browsers) can discover us:

{% capture java %}
private static JmDNS startMdns() {
    try {
        InetAddress address = selectAddress();
        JmDNS jmdns = JmDNS.create(address, HOSTNAME);
        log.info("mDNS hostname published: {}.local -> {}", HOSTNAME, address.getHostAddress());
        ServiceInfo service = ServiceInfo.create("_http._tcp.local.", HOSTNAME, PORT, "path=/");
        jmdns.registerService(service);
        log.info("mDNS service registered: {} (_http._tcp) on port {}", HOSTNAME, PORT);
        return jmdns;
    } catch (Exception e) {
        log.warn("Failed to start mDNS responder", e);
        return null;
    }
}
{% endcapture %}
{% capture kotlin %}
private fun startMdns(): JmDNS? = try {
    val address = selectAddress()
    val jmdns = JmDNS.create(address, HOSTNAME)
    log.info("mDNS hostname published: {}.local -> {}", HOSTNAME, address.hostAddress)
    val service = ServiceInfo.create("_http._tcp.local.", HOSTNAME, PORT, "path=/")
    jmdns.registerService(service)
    log.info("mDNS service registered: {} (_http._tcp) on port {}", HOSTNAME, PORT)
    jmdns
} catch (e: Exception) {
    log.warn("Failed to start mDNS responder", e)
    null
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

When we stop, we need to undo all of that, otherwise the name lingers on the network until the
records time out. JmDNS makes this a two-liner:

{% capture java %}
private static void stopMdns(JmDNS jmdns) {
    if (jmdns == null) return;
    try {
        jmdns.unregisterAllServices();
        jmdns.close();
    } catch (Exception e) {
        log.warn("Failed to stop mDNS responder", e);
    }
}
{% endcapture %}
{% capture kotlin %}
private fun stopMdns(jmdns: JmDNS?) {
    if (jmdns == null) return
    try {
        jmdns.unregisterAllServices()
        jmdns.close()
    } catch (e: Exception) {
        log.warn("Failed to stop mDNS responder", e)
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Wiring it to the Javalin lifecycle

Now that we have start/stop functions, we need to call them at the right time. Javalin has lifecycle
events on `config.events`, so we hook `serverStarted` to publish and `serverStopping` to clean up.\\
We keep the `JmDNS` instance in a single field so both callbacks can reach it, and we bind on a fixed
`PORT` so the advertised address stays predictable:

{% capture java %}
private static final int PORT = 80;
private static JmDNS jmdns;

public static void main(String[] args) {
    Javalin app = Javalin.create(config -> {
        config.routes.get("/", ctx -> ctx.result("mDNS demo server is running. Served by " + HOSTNAME + ".local"));
        config.events.serverStarted(() -> jmdns = startMdns());
        config.events.serverStopping(() -> stopMdns(jmdns));
    });
    app.start(PORT);
}
{% endcapture %}
{% capture kotlin %}
private const val PORT = 80
private var jmdns: JmDNS? = null

fun main() {
    val app = Javalin.create { config ->
        config.routes.get("/") { it.result("mDNS demo server is running. Served by $HOSTNAME.local") }
        config.events.serverStarted { jmdns = startMdns() }
        config.events.serverStopping { stopMdns(jmdns) }
    }
    app.start(PORT)
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Binding on a fixed port keeps the advertised address predictable, but there are still a few gotchas
worth understanding.

## Three gotchas

There are a handful of things that will silently break mDNS if you get them wrong. They're all small,
but they're the difference between "works" and "works on my machine".

**1. Pick a non-loopback, site-local interface.**\\
The convenient `InetAddress.getLocalHost()` often resolves to `127.0.0.1`, and multicast on the
loopback interface won't reach anyone else on the LAN. So we walk the real interfaces and pick the
first up, non-virtual IPv4 site-local address (your `192.168.x.x` / `10.x.x.x` address), falling back
to `getLocalHost()` only if there's nothing better:

{% capture java %}
// Pick a real LAN interface; InetAddress.getLocalHost() can resolve to loopback, which breaks mDNS multicast.
private static InetAddress selectAddress() throws Exception {
    for (NetworkInterface ni : Collections.list(NetworkInterface.getNetworkInterfaces())) {
        if (!ni.isUp() || ni.isLoopback() || ni.isVirtual() || ni.isPointToPoint()) continue;
        for (InetAddress addr : Collections.list(ni.getInetAddresses())) {
            if (addr instanceof Inet4Address && addr.isSiteLocalAddress()) return addr;
        }
    }
    InetAddress fallback = InetAddress.getLocalHost();
    if (fallback.isLoopbackAddress()) {
        log.warn("No non-loopback site-local interface found; mDNS bound to {} and multicast may not work", fallback.getHostAddress());
    }
    return fallback;
}
{% endcapture %}
{% capture kotlin %}
// Pick a real LAN interface; InetAddress.getLocalHost() can resolve to loopback, which breaks mDNS multicast.
private fun selectAddress(): InetAddress {
    val siteLocal = NetworkInterface.getNetworkInterfaces().asSequence()
        .filter { it.isUp && !it.isLoopback && !it.isVirtual && !it.isPointToPoint }
        .flatMap { it.inetAddresses.asSequence() }
        .firstOrNull { it is Inet4Address && it.isSiteLocalAddress }
    if (siteLocal != null) return siteLocal
    val fallback = InetAddress.getLocalHost()
    if (fallback.isLoopbackAddress) {
        log.warn("No non-loopback site-local interface found; mDNS bound to {} and multicast may not work", fallback.hostAddress)
    }
    return fallback
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

For simplicity this example filters strictly for IPv4 (`Inet4Address`). A fully production-grade setup would also scan for and advertise on IPv6 link-local addresses (`fe80::/10`).

**2. Don't let mDNS take down your server.**\\
mDNS is a nice-to-have, not a hard dependency. If the responder can't start (no network, a firewall,
a permissions prompt), your HTTP server should still serve requests. That's why `startMdns` catches
everything, logs a warning, and returns `null` instead of throwing.

**3. Fail fast on a blank hostname.**\\
A blank hostname produces a broken, un-resolvable `.local` name. In this example the hostname is a
constant, but if you make it configurable, validate it up front rather than publishing garbage onto
the network.

## Trying it out

Run the `main` method (the Java and Kotlin versions do the same thing). Because the server binds on
port 80, browsers drop the `:80`, so you can just open `http://javalin-demo.local` with no port at
all, and `http://localhost` works from this machine too.

Binding to port 80 needs elevated privileges, so run it with `sudo` (or from an IDE or terminal that
already has the rights). The `.local` address works from this machine and from any other machine on
the same network. It resolves natively from iPhones, iPads, Macs, and other laptops on the same Wi-Fi, with no IP needed. (Android supports mDNS at the OS level, but Android browsers like Chrome often fail to resolve `.local` without extra tooling.)

Note: `.local` resolution needs a local mDNS resolver: built-in on macOS, Avahi on Linux (usually preinstalled), and native on modern Windows (10 and 11). Older Windows versions may need Bonjour.

## OS-level vs app-level mDNS

Before reaching for JmDNS, consider whether an OS-level mDNS daemon (like
[Avahi](https://avahi.org/) on Linux) would be a better fit. Since mDNS is directly tied to the
underlying host and network stack, running it at the OS level is often simpler and more robust:

{% capture mdnsTable %}
| Scenario | Recommendation |
|----------|---------------|
| **Linux server you control** | Use **Avahi** — simpler, more efficient, and keeps service discovery separate from application logic. |
| **Portable Java application** | Use **JmDNS** — works when you can't assume Avahi is installed, and behaves consistently across operating systems. |
| **Containers** | Prefer **host-level mDNS** — run Avahi on the host and advertise the container's exposed port. JmDNS inside a container may advertise container-internal IPs instead of LAN IPs, and mDNS often behaves poorly on Docker bridge networks. Only use JmDNS inside a container if you're using host networking and want the application to manage discovery itself. |
{% endcapture %}
{% include macros/basicInfoTable.html content=mdnsTable %}

The JmDNS approach shown in this tutorial is the right choice when you need a self-contained,
cross-platform solution with no external dependencies. For a dedicated Linux server or a
containerized deployment, configuring Avahi at the host level will usually give you fewer surprises.

## When *not* to use this (and other caveats)

mDNS is wonderful for the same-LAN, zero-config case, and a poor fit for everything else:

* **It's link-local only.** It doesn't cross subnets, doesn't route over the internet, and won't help
  you in a typical cloud deployment. If you need a name that resolves from anywhere, you want real
  DNS, not mDNS.
* **Router isolation can block it.** If your router has "AP Isolation" or "Client Isolation" turned on, or drops multicast (common on guest Wi-Fi), the mDNS packets never reach other devices and the name won't resolve.
* **The client needs an mDNS resolver.** macOS has one built in, Linux uses Avahi (usually
  preinstalled), and modern Windows (10 and 11) resolves `.local` natively. Older Windows versions may need Bonjour.
* **macOS Local Network privacy can block it.** On recent macOS (15 and 26), an app needs Local
  Network permission before it can multicast. Until that is granted, sends fail with `EHOSTUNREACH` /
  "No route to host". This often looks like macOS refusing to bind to a real network interface, but the
  cause is the privacy layer, not the interface, and binding to loopback is not the fix (multicast
  cannot leave `lo0`). Grant the app permission under System Settings → Privacy & Security → Local
  Network instead. Even once granted, recent macOS can be inconsistent and occasionally drop multicast.
* **Names auto-rename on conflict.** If `javalin-demo.local` is already taken, JmDNS will happily
  publish you as `javalin-demo-2.local` instead, so don't assume the name you asked for is the name
  you got.

That's it! A few dozen lines and your Javalin server has a friendly name on the local network.\\
The full runnable example (Java and Kotlin) is on [GitHub]({{page.github}}).
