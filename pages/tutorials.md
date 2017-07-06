---
layout: default
title: Tutorials
permalink: /tutorials/
---

<h1 class="no-margin-top">Tutorials</h1>

{% assign tutorials = (site.posts | where: "layout" , "tutorial") | sort: 'date' | reverse %}

<div class="tutorials-header" markdown="1">
We recommend starting with either the [Maven setup](maven-setup) or [Gradle setup](gradle-setup) tutorial, then going through the [Kotlin CRUD REST API](/tutorials/simple-kotlin-example) tutorial.
</div>

<div class="tutorial-overview">
    <ul class="tutorial-list">
        {% for tutorial in tutorials %}
        <li class="tutorial-summary">
          <h2><a href="{{ tutorial.url }}">{{ tutorial.summarytitle }}</a></h2>
          <p>{{ tutorial.summary }}</p>
        </li>
        {% endfor %}
    </ul>
</div>
<div class="tutorials-footer" markdown="1">
The tutorials here are written by Javalin users and posted with their permission.
If you have have a tutorial you want to submit, please create a pull request on [GitHub](https://github.com/javalin/javalin.github.io).
</div>
