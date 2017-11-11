---
layout: default
title: News
rightmenu: false
permalink: /news/
---

<h1 class="no-margin-top">News</h1>
Javalin is released very frequently (usually twice a month). Follow us on [Twitter](https://twitter.com/javalin_io)
or [Facebook](https://www.facebook.com/javalin.io) to get notified about new releases.

{% assign newsposts = (site.posts | where: "category" , "news") | sort: 'date' | reverse %}

<div class="posts-overview">
    <ul class="post-list">
        {% for post in newsposts %}
            <li class="post-summary">
                <h2>
                    <a href="{{ post.url }}">{{ post.title }}</a>
                    <small>(<time datetime="{{ post.date | date_to_xmlschema }}" itemprop="datePublished">{{ post.date | date: "%b %-d, %Y" }}</time>)</small>
                </h2>
                <p>{{ post.summary }}</p>
            </li>
        {% endfor %}
    </ul>
</div>
