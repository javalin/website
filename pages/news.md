---
layout: default
title: News
rightmenu: false
permalink: /news/
---

<h1 class="no-margin-top">News</h1>
Most Javalin releases are very small, most of these links are not worth the click. \\
Pre `1.0.0`, the `0.X` releases are probably the only ones worth clicking.

{% assign newsposts = (site.posts | where: "category" , "news") | sort: 'date' | reverse %}

<div class="tutorial-overview">
    <ul class="tutorial-list">
        {% for post in newsposts %}
            <li class="tutorial-summary">
                <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
                <p>{{ post.summary }}</p>
            </li>
        {% endfor %}
    </ul>
</div>
