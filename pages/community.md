---
layout: default
title: Community
rightmenu: false
permalink: /community
---

{% include notificationBanner.html %}

<h1 class="no-margin-top">Community</h1>

This page lists all the places to ask for help or discuss Javalin, in order of relevance.

<div class="jv-card-list community-boxes" markdown="1">
  <div class="jv-card community-box">
    <h2>Discord</h2>
    <p>
      Discord is the primary chat server for Javalin. You can click <a href='https://discord.com/invite/sgak4e5NKv'>here</a> join.
      Discord is the best place to ask for help, and it's also where most of the development discussion happens.
      We're a friendly bunch, so please say hello!
    </p>
  </div>
  <div class="jv-card community-box">
    <h2>GitHub</h2>
    <p><a href='https://github.com/javalin/javalin'>GitHub</a> is the place for feature request and bug reports.</p>
  </div>
  <div class="jv-card community-box">
    <h2>Misc</h2>
    <ul style="margin:0;">
      <li><strong>Slack</strong>: It's not as lively as Discord, but it is a lot more corporate: <a href='https://join.slack.com/t/javalin-io/shared_invite/zt-1hwdevskx-ftMobDhGxhW0I268B7Ub~w'>javalin-io.slack.com/</a></li>
      <li><strong>X/Twitter</strong>: We don't tweet a lot, but we do retweet and like Javalin related posts: <a href='https://twitter.com/javalin_io'>twitter.com/javalin_io</a></li>
      <li><strong>Stack Overflow</strong>: Javalin has its own <a href='https://stackoverflow.com/questions/tagged/javalin'>tag</a>, but it's not a common place to seek help</li>
    </ul>
  </div>



</div>

<style>
    .community-box {
        padding: 20px;
    }

    .community-box h2 {
        font-size: 22px;
        margin-top: 0;
    }
</style>

<h2>Top 15 contributors <small class="total-contributors">(of 198)</small></h2>
<div class="jv-card-grid contributors">
  {% for c in site.data.contributors %}
  <a href="https://github.com/{{ c.username }}" class="jv-card contributor">
    <img src="{{ c.avatar }}" alt="User avatar">
    <div class="name-and-commit">
      <h4>{{ c.username }}</h4>
      <div class="commits">{{ c.contributions }} commits</div>
    </div>
  </a>
  {% endfor %}
</div>
<style>
    .total-contributors {
        font-weight: 400;
        color: rgba(0, 0, 0, 0.3);
    }

    body.dark-mode .total-contributors {
        color: rgba(255, 255, 255, 0.4);
    }

    .contributors .contributor {
        display: flex;
        align-items: center;
        padding: 16px;
        color: rgba(0, 0, 0, 0.75);
    }

    body.dark-mode .contributors .contributor {
        color: rgba(255, 255, 255, 0.85);
    }

    .contributors .contributor img {
        display: block;
        max-width: 40px;
        border-radius: 40px;
        margin-right: 16px;
    }

    .contributors .contributor h4 {
        font-weight: 500;
        margin: 0;
    }

    .contributors .contributor .name-and-commit {
        width: calc(100% - 56px);
    }

    .contributors .contributor h4,
    .contributors .contributor .commits {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    @media (max-width: 600px) {
        .jv-card-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
