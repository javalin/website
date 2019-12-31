---
layout: default
title: Tutorials
permalink: /tutorials/
---

{% include notificationBanner.html %}

<h1 class="no-margin-top">Tutorials</h1>

{% assign tutorials = (site.posts | where: "layout" , "tutorial") | sort: 'date' | reverse %}

<div class="posts-header" markdown="1">
Some of the tutorials have code examples in both Kotlin and Java (check the blue tags),
but it should be easy to follow along even if they don't.
</div>

<div class="posts-overview">
     <ul class="post-list tutorials">
            {% for tutorial in tutorials %}
            <li class="post-summary">
                <a href="{{ tutorial.url }}">
                    <h2>{{ tutorial.summarytitle }}</h2>
                    <p>{{ tutorial.summary }}</p>
                    <div class="tutorial-languages">
                        {% for lang in tutorial.language %}
                            <span class="tutorial-language">{{lang}}</span>
                        {% endfor %}
                    </div>
                </a>
            </li>
            {% endfor %}
        </ul>
</div>
<div class="posts-footer" markdown="1">
The tutorials here are written by Javalin users and posted with their permission.
If you have have a tutorial you want to submit, please create a pull request on [GitHub](https://github.com/javalin/javalin.github.io).
</div>
