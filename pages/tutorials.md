---
layout: default
title: Tutorials
permalink: /tutorials/
---

<h1 class="no-margin-top">Tutorials</h1>

Tutorials coming soon. There is some work left to be done on the Javalin core,
tutorials will be coming within the next few weeks. Planned tutorials:

* Setting up Javalin with Maven/gradle
* Deploying Javalin to Heroku
* Basic REST API architecture (Java)
* Basic REST API architecture (Kotlin)
* Basic website architecture (Java)
* REST API + Single page app tutorial (Java/Intercooler)

{% assign tutorials = (site.posts | where: "layout" , "tutorial") %}

{% comment %}

<div class="tutorials-header" markdown="1">
We recommend starting with either the [Maven setup](maven-setup) or [Gradle setup](gradle-setup) tutorial, then going through the [Basic webapp structure](application-structure) tutorial.
</div>

<div class="tutorial-overview">
    <ul class="tutorial-list">
        <h2>Tutorials</h2>
        {% for tutorial in tutorials %}
        <li class="tutorial-summary">
          <h2><a href="{{ tutorial.url }}">{{ tutorial.summarytitle }}</a></h2>
          <p>{{ tutorial.summary }}</p>
        </li>
        {% endfor %}
    </ul>
</div>
<div class="tutorials-footer" markdown="1">
The tutorials here are written by Javalin users and reposted with their permission.
If you have have a tutorial you want to submit, please create a pull request on [GitHub](https://github.com/javalin/javalin.github.io), or send us an email.
</div>

{% endcomment %}
