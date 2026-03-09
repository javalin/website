---
layout: tutorial
official: false
title: Javalin Cloudflare Proxy Support
permalink: /tutorials/javalin-cloudflare-proxy-support
summarytitle: Using Javalin with Cloudflare
summary: Learn how to make Javalin work with Cloudflare.
date: 2026-02-07
author: <a href="https://github.com/AoElite">AoElite</a>
language: ["java", "kotlin"]
rightmenu: true
---

## Introduction

When using Cloudflare to proxy requests to your Javalin application, it's important to configure Javalin to correctly
handle Cloudflare's headers, and to restrict your environment so that only Cloudflare can reach your application.

## Configuring Javalin to resolve real IP addresses

You can use the `contextResolver.ip` configuration option to provide a function that extracts the
real client IP from Cloudflare's `CF-Connecting-IP` header:

{% capture java %}
Javalin.create(config -> {
    config.contextResolver.ip = ctx -> {
        String cfHeader = ctx.header("CF-Connecting-IP");
        return cfHeader != null && !cfHeader.isBlank() ? cfHeader : ctx.req().getRemoteAddr();
    };
}).start();
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.contextResolver.ip = { ctx ->
        ctx.header("CF-Connecting-IP")?.takeIf { it.isNotBlank() } ?: ctx.req().remoteAddr
    }
}.start()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

After this, calling `ctx.ip()` will return the actual client IP address.

## Only allowing traffic from Cloudflare

It's important to only allow traffic to your application from Cloudflare; otherwise, the `CF-Connecting-IP` header could be forged.

There are a few ways to do this:

### Using UFW firewall rules

You can find instructions and a script to automatically configure Cloudflare IP addresses with UFW in
[this GitHub repository](https://github.com/Paul-Reed/cloudflare-ufw).

### Docker and Cloudflare Tunnels

You can bind Javalin's port to a local interface within Docker, then use a
[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)
to proxy requests to that port so that only Cloudflare can reach it.

### Configuring Javalin to only allow traffic from Cloudflare (not recommended)
You can also configure Javalin to only allow traffic from Cloudflare IPs by checking the remote address before resolving
the header; however, this would still leave your application exposed to DDoS attacks since the remote address check
happens at the application level rather than at the network level.