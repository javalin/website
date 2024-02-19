---
layout: default
title: Community
rightmenu: false
permalink: /community
---

{% include notificationBanner.html %}

<h1 class="no-margin-top">Community</h1>

This page lists all the places to ask for help or discuss Javalin, in order of relevance.

<div class="community-boxes" markdown="1">
  <div class="community-box">
    <h2>Discord</h2>
    <p>
      Discord is the primary chat server for Javalin. You can click <a href='https://discord.com/invite/sgak4e5NKv'>here</a> join.
      Discord is the best place to ask for help, and it's also where most of the development discussion happens.
      We're a friendly bunch, so please say hello!
    </p>
  </div>
  <div class="community-box">
    <h2>GitHub</h2>
    <p><a href='https://github.com/javalin/javalin'>GitHub</a> is the place for feature request and bug reports.</p>
  </div>
  <div class="community-box">
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
        position: relative;
        color: #444;
        display: block;
        padding: 20px;
        background: #fff;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        margin-top: 20px;
    }

    .community-box h2 {
        font-size: 22px;
        margin-top: 0;
    }

    .community-box p {
        font-size: 14px;
    }
</style>

<h2>Top 15 contributors <small class="total-contributors">(of 161)</small></h2>
<div class="contributors">
  {% for c in site.data.contributors %}
  <a href="https://github.com/{{ c.username }}" class="contributor">
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

    .contributors {
        width: 100%;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
    }

    .contributors .contributor {
        display: flex;
        align-items: center;
        width: calc(33% - 16px); /* 16*3/2 == 24 */
        padding: 16px;
        background: #fff;
        box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        margin-bottom: 16px;
        color: rgba(0, 0, 0, 0.75);
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
        .contributors .contributor {
            width: 100%;
        }
    }
</style>
