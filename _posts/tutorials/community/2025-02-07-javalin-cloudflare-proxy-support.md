---
layout: tutorial
official: false
title: Javalin Cloudflare Proxy Support
permalink: /tutorials/javalin-cloudflare-proxy-support
summarytitle: Using Javalin with Cloudflare
summary: Learn how to make Javalin work with Cloudflare.
date: 2025-02-07
author: <a href="https://github.com/AoElite">AoElite</a>
language: ["java"]
rightmenu: true
---

## Introduction

When using Cloudflare to proxy requests to your Javalin application, it's important to configure Javalin to correctly
to handle Cloudflare's headers, along with configuring your environment to only allow traffic from Cloudflare to your
application.

## Configuring Javalin to resolve real IP addresses
To configure Javalin to resolve real IP addresses, you can use the `contextResolver.ip` configuration option to provide
a function that resolves the IP address from the request.

Here's how to configure it to use Cloudflare's headers to
resolve the IP address:
```java
Javalin javalin = Javalin.create(config -> config.contextResolver.ip = (Function1<Context, String>) ctx -> {
            String cfHeader = ctx.header("CF-Connecting-IP");
            return (cfHeader != null && !cfHeader.isBlank()) ? cfHeader : ctx.req().getRemoteAddr(); // fallback if blank
        }).start();
```

Now when invoking the `ip()` method from a `Context` instance, it will return the actual IP address of the client.

## Only allowing traffic from Cloudflare
It's important to only allow traffic to your application from Cloudflare, otherwise the headers could be forged.

There's a few ways you can do this:

### Using UFW Firewall rules
You can find instructions and a script to automatically configure Cloudflare IP addresses with UFW in
[this GitHub repository](https://github.com/Paul-Reed/cloudflare-ufw).

### Docker and Cloudflare Tunnels
You can configure the port that Javalin uses to be bound to a local interface within docker, and then use a Cloudflare
Tunnel to proxy requests to that port so that only Cloudflare can access it. You can find more information about
Cloudflare Tunnels on [Cloudflare's website](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/).

### Configuring Javalin to only allow traffic from Cloudflare (not recommended)
You can also configure Javalin to only allow traffic from Cloudflare IPs by checking the remote address before resolving
the header; however, this would still open up your application to DDOS attacks.