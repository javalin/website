---
layout: default
title: Tutorials
permalink: /tutorials/
description: "Javalin tutorials — step-by-step guides for REST APIs, WebSockets, testing, authentication, and more."
---

{% include notificationBanner.html %}

<h1 class="no-margin-top">Tutorials</h1>

{% assign tutorials = site.posts | where: "layout" , "tutorial" | sort: 'date' | reverse %}
{% assign communityTuts = tutorials | where: "official", false %}
{% assign officialTuts = tutorials | where: "official", true %}

<div class="posts-header" markdown="1">
Some of the tutorials have code examples in both Kotlin and Java (check the blue tags),
but it should be easy to follow along even if they don't. The official tutorials are simple and
mainly focus on one core concept at the time, while the community tutorials are usually more complex.
</div>

<div class="all-tutorials">
    <div class="tutorial-tabs">
        <div class="tutorial-tab" data-tutorial-tab="official">Official tutorials</div>
        <div class="tutorial-tab" data-tutorial-tab="community">Community tutorials</div>
    </div>
    <div class="tutorial-content">
        <div data-tutorial-content="official">
            {% include macros/tutorialPost.html tutorials=officialTuts %}
        </div>
        <div data-tutorial-content="community">
            <div class="notification">
                These community tutorials are written by Javalin users and posted at their request and/or
                with their permission. If you have have a tutorial you want to submit,
                please create a pull request on <a href="https://github.com/javalin/website">GitHub</a>.
            </div>
            {% include macros/tutorialPost.html tutorials=communityTuts %}
        </div>
    </div>
</div>
