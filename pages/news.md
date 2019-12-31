---
layout: default
title: News
rightmenu: false
permalink: /news/
---

{% include notificationBanner.html %}

<h1 class="no-margin-top">News</h1>
Javalin is released frequently (once or twice a month). Please follow us on [Twitter](https://twitter.com/javalin_io)
or [Facebook](https://www.facebook.com/javalin.io) to get notified about new releases.

{% assign newsposts = (site.posts | where: "category" , "news") | sort: 'date' | reverse %}

<div class="posts-overview">
    <ul class="post-list">
        {% for post in newsposts %}
            <li class="post-summary">
                <a href="{{ post.url }}">
                    <h2>Javalin {{ post.version }} - {{ post.title }}</h2>
                    <span class="date">
                        <time datetime="{{ post.date | date_to_xmlschema }}" itemprop="datePublished">{{ post.date | date: "%b %-d, %Y" }}</time>
                    </span>
                    <p>{{ post.summary }}</p>
                </a>
            </li>
        {% endfor %}
    </ul>
</div>
