---
layout: default
category: blog
date: 2019-11-03
title: GitHub actions for Java projects
summary: Moving a JVM project from Travis CI to GitHub actions
permalink: blog/moving-a-jvm-project-from-travis-to-github-actions
---

# Moving from Travis CI to GitHub actions

For the first two years we were very happy Travis CI users. We chose Travis because it had a
dead simple config file and it just worked. Then it didn't anymore.

This short post will show you how to move from a basic Travis CI setup to a GitHub actions setup.

## The old Travis setup

For a long time, this is how the config file looked:

```bash
language: java
jdk:
- openjdk8
- openjdk9
- openjdk10
- openjdk11
- openjdk12
```

This worked great at first, but after a year it started to become very flaky.
When we finally moved away from Travis, this is how our config file looked:

```bash
sudo: required # this became required on 30-08-2018 for unknown reasons
language: java
jdk:
- openjdk8
#- openjdk9
#- openjdk10
- openjdk11
#- openjdk12
cache:
  directories:
    - $HOME/.m2
```

Builds would take up to 30 minutes, and Travis would fail to install some of the JDKs half the time.
As you can see, we had to disable most of the JDKs to mitigate the time spent retriggering builds.

Sometimes Travis would download dependencies at 200 bytes/s. We tried to cache the `.m2` folder
to mitigate this, but it didn't really help too much.

It's not that our needs outgrew Travis, their product just stopped working.

## The new GitHub actions setup

Our GitHub actions setup is a bit more verbose, but it's a lot faster and more deterministic than Travis.\\
Unlike Travis, GitHub actions also supports Windows, so that's nice.\\
Javalin is now built on MacOS, Ubuntu and Windows, for Java 8 to 13.

```bash
name: Java CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        java_version: [1.8, 9, 10, 11, 12, 13]
        os: [windows-latest, macOS-latest, ubuntu-latest]
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      - name: Set up JDK ${{ matrix.java_version }}
        uses: actions/setup-java@v1
        with:
          java-version: ${{ matrix.java_version }}
      - name: Make Maven Wrapper executable
        if: contains(matrix.os, 'win') == false
        run: chmod +x ./mvnw
      - name: Build with Maven
        run: ./mvnw package --file pom.xml
```

That's pretty much it. The only downside to GitHub actions we've seen so far is that you can't retrigger individual builds.
For example, if `macOS-latest jdk13` fails, you need to re-run the entire test matrix.\\
The only failed builds we've seen have been due to our own bad tests though, so it's not really an issue.

If you have a simple Travis setup, we highly recommend the switch.
