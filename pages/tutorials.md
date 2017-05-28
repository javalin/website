---
layout: default
title: Tutorials
permalink: /tutorials/
---

<h1 class="no-margin-top">Tutorials</h1>

* [Setting up Javalin with Maven](/tutorials/maven-setup)
* [Setting up Javalin with Gradle](/tutorials/gradle-setup)
* [Creating a simple CRUD REST API in Kotlin](/tutorials/simple-kotlin-example)
* [Deploying Javalin to Heroku](/tutorials/heroku)
* [Kotlin + Vue.js single page app](/tutorials/vuejs-example)
* [Basic website example (java)](/tutorials/website-example)

More tutorials coming soon. Planned tutorials:

* REST API architecture (Java)
* REST API architecture (Kotlin)
* REST API + Single page app tutorial (Kotlin + Vue.js)

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
