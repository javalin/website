---
layout: default
title: News
rightmenu: false
permalink: /news/
---

<h1 class="no-margin-top">News</h1>
Most Javalin releases are very small, so the majority of these links are not worth the click. \\
Pre `1.0.0`, the `0.X` releases are probably the only ones worth reading about.

{% assign newsposts = (site.posts | where: "category" , "news") | sort: 'date' | reverse %}
{% assign firstpost = (site.posts | first %}

<div class="posts-overview">
    <ul class="post-list">
        {% for post in newsposts %}
            <li class="post-summary">
                <h2>
                    <a href="{{ post.url }}">{{ post.title }}</a>
                    {% if post.url != firstpost.url %}
                        <small>(<time datetime="{{ post.date | date_to_xmlschema }}" itemprop="datePublished">{{ post.date | date: "%b %-d, %Y" }}</time>)</small>
                    {% else %}
                        <small>(upcoming release)</small>
                    {% endif %}
                </h2>
                <p>{{ post.summary }}</p>
            </li>
        {% endfor %}
    </ul>
</div>
