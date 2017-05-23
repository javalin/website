---
layout: default
title: Download
rightmenu: false
permalink: /download
---

<h1 class="no-margin-top">A Lightweight REST API library</h1>

Javalin is a true micro Java REST API library and has no required external dependencies 
other than the embedded web-server. It has optional dependencies for Jackson and GSON, 
in order to provide out-of-the-box object mapping support (`response.json(object)`).
To use this feature you need to have either Jackson or GSON included in 
your dependencies.

## Download Javalin
{% include macros/mavenDep.md %}

{% comment %}
## Download source manually
Clone the repo from [GitHub](https://github.com/tipsy/javalin).\\
If you really want to, you can also download Javalin as a [ZIP (from GitHub)](https://github.com/tipsy/javalin/archive/master.zip)
{% endcomment %}