---
layout: blogpost
category: blog
date: 2020-03-20
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
title: Javalin user survey responses, 2020
summary: We ran a user-survey on https://javalin.io for a couple of months
permalink: /blog/javalin-user-survey-2020
---

We collected survey results from ~100 users on [javalin.io](/).
To filter out non-users (first time visitors, etc) the survey link was only shown
to users who had performed at least 8 page loads. A couple of survey result were still from non-users, so these have been discarded.

We ran an identical survey in around June 2018. These results will be included for comparison.
Results have been rounded to the closest whole number (integer).

## General

### Q: What role best describes you?
<div class="chart-flex">
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
    <div>
        2018
        <div class="bar-chart">
            <div style="width:68%" data-value="68%">Software engineer / developer</div>
            <div style="width:16%" data-value="16%">Tech lead / manager</div>
            <div style="width:7%" data-value="7%">Hobbyist programmer</div>
            <div style="width:0%;background:transparent;" data-value="0%">Teacher</div>
            <div style="width:10%" data-value="10%">Student</div>
        </div>
    </div>
</div>

This has stayed surprisingly stable. When the first survey was conducted,
Javalin had only been out for a few months, so no teachers using it made sense.
As of 2020, Javalin is used in several universities and colleges,
such as John Hopkins University, the Norwegian University for Science and Technology, Rice University, etc.
We believe that the simplicity of the API makes Javalin a great tool for teaching.

### Q: What are you using Javalin for?
<div class="chart-flex">
    <div>
        2020
        <div class="bar-chart">
           <div style="width:92%" data-value="92%">REST APIs</div>
           <div style="width:33%" data-value="33%">WebSockets</div>
           <div style="width:38%" data-value="38%">Websites</div>
       </div>
    </div>
    <div>
        2018
        <div class="bar-chart">
            <div style="width:86%" data-value="86%">REST APIs</div>
            <div style="width:34%" data-value="34%">WebSockets</div>
            <div style="width:39%" data-value="39%">Websites</div>
        </div>
    </div>
</div>

Nothing too surprising about this. REST APIs will probably always be the main reason why people use Javalin, but
the relatively high percentage of WebSocket and Website users makes it clear that the effort spent making
these things work well isn't wasted.

### Q: What language are you using Javalin with?
<div class="chart-flex">
    <div>
        2020
        <div class="bar-chart">
            <div style="width:78%" data-value="78%">Java</div>
            <div style="width:40%" data-value="40%">Kotlin</div>
            <div style="width:2%" data-value="2%">Other</div>
        </div>
    </div>
    <div>
        2018
        <div class="bar-chart">
            <div style="width:57%" data-value="57%">Java</div>
            <div style="width:61%" data-value="61%">Kotlin</div>
            <div style="width:2%" data-value="2%">Other</div>
        </div>
    </div>
</div>

This is quite the difference! When the first survey was conducted, Javalin was still very new
and had little mainstream adaption. Since then Javalin has been featured in several Java newsletter
and in Java Magazine (published by Oracle), which has probably contributed to a pickup among Java developers.

The number of users overall is significantly higher compared to when the previous survey was conducted (~10x),
so it's not that we have fewer Kotlin users now, but that he number of Java users is growing faster than the number of Kotlin users.

<small markdown="1">
**March 2020**: 26k unique downloads monthly on Maven central, 22k unique website visitors monthly, 3.8k stars on GitHub<br>
**June 2018**: 2.8k unique downloads monthly on Maven central, 8k unique website visitors monthly, 1.4k stars on GitHub
</small>

### Q: Are you using Javalin in production?
<div class="chart-flex">
    <div>
        2020
        <div class="bar-chart">
            <div style="width:33%" data-value="33%">Yes</div>
            <div style="width:47%" data-value="47%">Soon</div>
            <div style="width:20%" data-value="20%">No</div>
        </div>
    </div>
    <div>
        2018
        <div class="bar-chart">
            <div style="width:30%" data-value="30%">Yes</div>
            <div style="width:45%" data-value="45%">Soon</div>
            <div style="width:25%" data-value="25%">No</div>
        </div>
    </div>
</div>

It is a bit surprising that the "Yes" column hasn't grown more since 2018, especially considering the answers in the next section.

## Production usage
Only the users who replied yes to `Are you using Javalin in production` (~30 users) were able to answer the next three questions.

### Q: How many users does your application have?
<div class="chart-flex">
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
    <div>
        2018
        <div class="bar-chart">
            <div style="width:63%" data-value="63%">Less than 1k per day</div>
            <div style="width:22%" data-value="22%">1k - 10k per day</div>
            <div style="width:5%" data-value="5%">10k - 100k per day</div>
            <div style="width:10%" data-value="10%">100k - 1m per day</div>
            <div style="width:0%;background:transparent;" data-value="0%">More than 1m per day</div>
        </div>
    </div>
</div>

Nothing has change too much here, Javalin is still mostly used for low-traffic apps.

### Q: Approximately how big is your application?
<div class="chart-flex">
    <div>
        2020
        <div class="bar-chart">
            <div style="width:23%" data-value="23%">Less than 1k lines of code</div>
            <div style="width:60%" data-value="60%">Between 1k and 10k lines of code</div>
            <div style="width:20%" data-value="20%">More than 10k lines of code</div>
        </div>
    </div>
    <div>
        2018
        <div class="bar-chart">
            <div style="width:37%" data-value="37%">Less than 1k lines of code</div>
            <div style="width:63%" data-value="63%">Between 1k and 10k lines of code</div>
            <div style="width:0%;background:transparent;" data-value="0%">More than 10k lines of code</div>
        </div>
    </div>
</div>

Apparently Javalin applications have gotten significantly bigger since the last survey. It might be connected to the fact that
more of the survey respondents are writing their applications in Java now, or that their applications have been around for a while now
(is Javalin legacy?).

### Q: How many people are working on your application?
<div class="chart-flex">
    <div>
        2020
        <div class="bar-chart">
            <div style="width:58%" data-value="58%">1 - 2 people</div>
            <div style="width:31%" data-value="31%">2 - 5 people</div>
            <div style="width:8%" data-value="8%">5 - 10 people</div>
            <div style="width:4%" data-value="4%">10+ people</div>
        </div>
    </div>
    <div>
        2018
        <div class="bar-chart">
            <div style="width:79%" data-value="79%">1 - 2 people</div>
            <div style="width:21%" data-value="21%">2 - 5 people</div>
            <div style="width:0%;background:transparent;" data-value="0%">5 - 10 people</div>
            <div style="width:0%;background:transparent;" data-value="0%">10+ people</div>
        </div>
    </div>
</div>

This is also a pretty big shift, and is like the previous result probably related to the project "going mainstream".
At the time of the previous survey Javalin was more a niche framework for Kotlin developers that most people didn't know about,
while now it's usually included when you see articles about Java and JVM web frameworks.

## Conclusion
Like the last survey, getting people to respond is very difficult.
Since the survey didn't try to be annoying with a popup, it took
more than two months and ~40 000 website visitors to gather 100 results,
and a few of those had to be discarded.

The biggest change from the last year is that we have more Java users working on bigger Javalin apps, and working in bigger teams.

Hopefully this survey provides some insight.
We'll run it again next year with the same questions and see if anything changes. Thanks for reading!

<style>
    .chart-flex {
        user-select: none;
        margin-top: 16px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
    }
    .chart-flex > * {
        width: calc(50% - 12px);
    }
    @media (max-width: 700px) {
        .chart-flex > * {
            width: 100%
        }
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
