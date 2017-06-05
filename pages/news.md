---
layout: default
title: News
rightmenu: false
permalink: /news
---

<h1 class="no-margin-top">News</h1>

Release notes for minor releases will be posted here.

{% comment %}
<div id="spy-nav" class="right-menu" markdown="1">
* [Kotlin Rewrite](#kotlin-rewrite)
* [Hellow world!](#hello-world)
</div>
{% endcomment %}

## Kotlin rewrite {#kotlin-rewrite}
Most of Javalin was re-written to Kotlin in version 0.2.0. The SAM interfaces were left
as Java, as well as the main Javalin-class which has method-declarations with SAM parameters.
This had to be done due to limitations in Kotlin itself ([https://youtrack.jetbrains.com/issue/KT-14151](https://youtrack.jetbrains.com/issue/KT-14151),
[https://devnet.jetbrains.com/thread/461516](https://devnet.jetbrains.com/thread/461516))\\
The rest of the library will be ported to Kotlin if this issue is resolved, or and alternative solution is discovered.


## Hello world! {#hello-world}
The first Javalin version is now available (0.0.1).
Javalin will try to follow semantic versioning, but be prepared for breaking changes.
