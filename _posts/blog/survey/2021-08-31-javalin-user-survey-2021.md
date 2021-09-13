---
layout: blogpost
category: blog
date: 2021-08-31
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
title: Javalin user survey responses, 2021
summary: We ran a user-survey on https://javalin.io for a couple of months
permalink: /blog/javalin-user-survey-2021
---

We collected survey results from ~100 users on [javalin.io](/).
To filter out non-users (first time visitors, etc) the survey link was only shown
to users who had performed at least 8 page loads.
A couple of survey result were still from "non-users", so these have been discarded.

We ran an almost identical survey in 2020. These results are included for comparison.
Results have been rounded to the closest whole number (integer).

## General

### Q: What role best describes you?
<div class="chart-flex">
    <div>
        2021
        <div class="bar-chart">
            <div style="width:62%" data-value="62%">Software engineer / developer</div>
            <div style="width:15%" data-value="15%">Tech lead / manager</div>
            <div style="width:10%" data-value="10%">Hobbyist programmer</div>
            <div style="width:5%" data-value="5%">Teacher</div>
            <div style="width:18%" data-value="8%">Student</div>
        </div>
    </div>
    <div>
        2020
        <div class="bar-chart">
            <div style="width:64%" data-value="64%">Software engineer / developer</div>
            <div style="width:12%" data-value="12%">Tech lead / manager</div>
            <div style="width:7%" data-value="7%">Hobbyist programmer</div>
            <div style="width:7%" data-value="7%">Teacher</div>
            <div style="width:10%" data-value="10%">Student</div>
        </div>
    </div>
</div>

This has stayed remarkably stable, so there's not much to say about it.

### Q: What are you using Javalin for?
<div class="chart-flex">
    <div>
        2021
        <div class="bar-chart">
            <div style="width:88%" data-value="88%">REST APIs</div>
            <div style="width:32%" data-value="32%">WebSockets</div>
            <div style="width:21%" data-value="21%">Webapps w. templates</div>
            <div style="width:11%" data-value="11%">Webapps w. JavalinVue</div>
        </div>
    </div>
    <div>
        2020
        <div class="bar-chart">
           <div style="width:92%" data-value="92%">REST APIs</div>
           <div style="width:33%" data-value="33%">WebSockets</div>
           <div style="width:38%" data-value="38%">Websites</div>
       </div>
    </div>
</div>

REST APIs and WebSockets are basically unchanged since last year. Websites shows a small decline in general,
but a surprising amount of people have adopted JavalinVue, which is neat.

### Q: What language are you using Javalin with?
<div class="chart-flex">
    <div>
        2021
        <div class="bar-chart">
            <div style="width:68%" data-value="68%">Java</div>
            <div style="width:43%" data-value="43%">Kotlin</div>
            <div style="width:1%" data-value="1%">Other</div>
        </div>
    </div>
    <div>
        2020
        <div class="bar-chart">
            <div style="width:78%" data-value="78%">Java</div>
            <div style="width:40%" data-value="40%">Kotlin</div>
            <div style="width:2%" data-value="2%">Other</div>
        </div>
    </div>
</div>

There seems to be a small decrease of Java users relative to Kotlin users.
This doesn't necessarily mean that there are fewer Java users overall though.
The number of downloads is six times higher
when this survey was conducted, compared to the previous survey.

<small markdown="1">
**August 2021**: 130k unique downloads monthly on Maven central, 20k unique website visitors monthly, 4.9k stars on GitHub<br>
**March 2020**: 26k unique downloads monthly on Maven central, 22k unique website visitors monthly, 3.8k stars on GitHub
</small>

### Q: Are you using Javalin in production?
<div class="chart-flex">
    <div>
        2021
        <div class="bar-chart">
            <div style="width:60%" data-value="60%">Yes</div>
            <div style="width:28%" data-value="28%">Soon</div>
            <div style="width:12%" data-value="12%">No</div>
        </div>
    </div>
    <div>
        2020
        <div class="bar-chart">
            <div style="width:33%" data-value="33%">Yes</div>
            <div style="width:47%" data-value="47%">Soon</div>
            <div style="width:20%" data-value="20%">No</div>
        </div>
    </div>
</div>

This is a big change! It's hard to say exactly what has happened here,
maybe all the people who answered "Soon" last year finally go their apps deployed.

## Production usage
Only the users who replied **"Yes"** to *"Are you using Javalin in production"*
(~60 users) were able to answer the next three questions.

### Q: How many requests does your application serve per day?
<div class="chart-flex">
    <div>
        2021
        <div class="bar-chart">
            <div style="width:23%" data-value="23%">Less than 1k per day</div>
            <div style="width:37%" data-value="37%">1k - 10k per day</div>
            <div style="width:17%" data-value="17%">10k - 100k per day</div>
            <div style="width:15%" data-value="15%">100k - 1m per day</div>
            <div style="width:8%" data-value="8%">More than 1m per day</div>
        </div>
    </div>
    <div>
        2020
        <div class="bar-chart">
            <div style="width:62%" data-value="62%">Less than 1k per day</div>
            <div style="width:31%" data-value="31%">1k - 10k per day</div>
            <div style="width:4%" data-value="4%">10k - 100k per day</div>
            <div style="width:4%" data-value="4%">100k - 1m per day</div>
            <div style="width:0%;background:transparent;" data-value="0%">More than 1m per day</div>
        </div>
    </div>
</div>

There is a huge change here, but that's likely because the question was poorly worded in last year's survey.
The 2020 survey asked "How many users does your application have?", while this year's survey asked
"How many requests does your application serve per day", which is a more interesting metric.

### Q: Approximately how big is your application?
<div class="chart-flex">
    <div>
        2021
        <div class="bar-chart">
            <div style="width:13%" data-value="13%">Less than 1k lines of code</div>
            <div style="width:57%" data-value="57%">Between 1k and 10k lines of code</div>
            <div style="width:30%" data-value="30%">More than 10k lines of code</div>
        </div>
    </div>
    <div>
        2020
        <div class="bar-chart">
            <div style="width:23%" data-value="23%">Less than 1k lines of code</div>
            <div style="width:60%" data-value="60%">Between 1k and 10k lines of code</div>
            <div style="width:20%" data-value="20%">More than 10k lines of code</div>
        </div>
    </div>
</div>

The previous survey revealed that Javalin apps are growing bigger, and the trend continues this year.

### Q: How many people are working on your application?
<div class="chart-flex">
    <div>
        2021
        <div class="bar-chart">
            <div style="width:48%" data-value="48%">1 - 2 people</div>
            <div style="width:32%" data-value="32%">2 - 5 people</div>
            <div style="width:9%" data-value="9%">5 - 10 people</div>
            <div style="width:11%" data-value="11%">10+ people</div>
        </div>
    </div>
    <div>
        2020
        <div class="bar-chart">
            <div style="width:58%" data-value="58%">1 - 2 people</div>
            <div style="width:31%" data-value="31%">2 - 5 people</div>
            <div style="width:8%" data-value="8%">5 - 10 people</div>
            <div style="width:4%" data-value="4%">10+ people</div>
        </div>
    </div>
</div>

There is also a pretty big shift here. Javalin apps are serving more requests,
growing bigger, and being used in bigger teams. It will be interesting to see the results next year.


## Conclusion
Just like the previous surveys, getting people to respond is very difficult.
Since the survey didn't try to be annoying with a popup, it took
around two months and ~40 000 website visitors to gather 100 results,
and a few of those had to be discarded.

Just like last year, the biggest change in usage patterns is that we
have more users working on bigger apps, and working in bigger teams.
One new insight this year, is that way more users have deployed their apps
to production (twice as many as last year).

We'll run the survey again next year with the same questions and see if anything changes.
Thanks for reading!

<style>
    .chart-flex {
        user-select: none;
        margin-top: 16px;
        display: flex;
        justify-content: space-between;
    }
    .chart-flex > * {
        width: calc(50% - 12px);
    }
    .bar-chart {
        border: 1px solid #ddd;
        border-radius: 5px;
        background: #fff;
        padding: 10px 60px 10px 10px;
        font-family: arial, sans-serif;
        position: relative;
    }

    .bar-chart > div {
        height: 28px;
        line-height: 28px;
        padding: 0 10px;
        background: #c7e6f5;
        font-size: 15px;
        border-radius: 3px;
        white-space: nowrap;
    }

    .bar-chart > div + div {
        margin-top: 10px;
    }

    .bar-chart > div::before {
        content: " ";
        position: absolute;
        width: calc(100% - 70px); /* padding x 60 x 10 */
        background: rgba(0, 0, 0, 0.08);
        height: 28px;
        border-radius: 3px;
        left: 10px;
    }

    .bar-chart > div::after {
        content: attr(data-value);
        position: absolute;
        right: 15px;
        color: #008cbb;
    }
</style>
