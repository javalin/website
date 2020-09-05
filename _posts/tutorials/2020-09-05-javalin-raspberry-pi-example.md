---
layout: tutorial
title: "Using Javalin with Kotlin to deploy a simple REST API to a Raspberry Pi"
author: <a href="https://github.com/NickM-27" target="_blank">Nick Mowen</a>
date: 9/5/2020
summarytitle: Deploy Kotlin REST API to Raspberry Pi.
summary: Use Kotlin with Javalin to deploy a REST API to run on a Raspberry Pi"
language: Kotlin
---

## What You Will Learn

* Setting up Kotlin with Gradle
* Creating a simple REST API using Javalin
* Deploying and running the API on an embedded Jetty runner on a Raspberry Pi

The instructions for this tutorial will be used with IntelliJ IDEA. It is recommended to download the free community edition of IDEA.

## Setting up Kotlin with Gradle (in IntelliJ IDEA)

* `File` `->` `New` `->` `Project`
* `Gradle` `->` `Kotlin/JVM`
* Set the project name and other attributes of the project
* Create `src/main/kotlin/com/org/example/Main.kt`

Kotlin offers a `main` with and without args, in our case we don't need args so we can define main as:

``` kotlin
fun main() {

}
```

## Setting Up Javalin Dependencies

First, you will need to change the kotlin dependency from `implementation` to `compile` which will be necessary later for building the runnable jar.

You will need to add `jcenter` to the respositories that dependencies are included in:

``` groovy
repositories {
    mavenCentral()
    jcenter()
}
```

Then, add these dependencies as well:

``` groovy
compile 'io.javalin:javalin:3.10.1'
compile 'com.fasterxml.jackson.core:jackson-databind:2.10.3' // Necessary to be included for running on Raspberry Pi
compile 'com.fasterxml.jackson.module:jackson-module-kotlin:2.10.3' // Necessary to be included for running on Raspberry Pi
compile 'org.slf4j:slf4j-simple:1.7.30' // Necessary to be included for running on Raspberry Pi
```
