---
layout: tutorial
official: true
title: "Setting up Javalin with Bazel & Kotlin using a template"
author: <a href="https://www.linkedin.com/in/fagerjord/" target="_blank">Jørund B. Fagerjord</a>
github: https://github.com/jorunfa/kotlin-javalin-bazel-starter
date: 2022-11-30
permalink: /tutorials/bazel
summarytitle: Bazel setup
summary: Run your Javalin app with Bazel, from a template project
language: kotlin
---

## About Bazel

[Bazel](https://bazel.build/) is a build tool that was created by Google. It's fast and correct, and it supports multiple languages. See [Why Bazel](https://bazel.build/about/why).

## What do you need?

- [Bazelisk](https://github.com/bazelbuild/bazelisk): A user-friendly launcher for Bazel. It will download the correct version of Bazel for you.
  - macOS: `brew install bazelisk`
- [git](https://git-scm.com/): To clone the project
  - macOS: `brew install git`
- <https://github.com/jorunfa/kotlin-javalin-bazel-starter>: In this tutorial we'll use *kotlin-javalin-bazel-starter* project on GitHub. Follow the steps below to get started.

## Steps

### 1. Use the template project

```bash
git clone git@github.com:jorunfa/kotlin-javalin-bazel-starter my-javalin-app
cd my-javalin-app
```

### 2. Run the application

```bash
bazel run //:server
```

Should output something like:

```text
Starting local Bazel server and connecting to it...
INFO: Invocation ID: 84c2e9f4-6392-427c-ad4b-22f4fcd3010a
INFO: Analyzed target //:server (61 packages loaded, 1022 targets configured).
INFO: Found 1 target...
Target //:server up-to-date:
  bazel-bin/server.jar
  bazel-bin/server
INFO: Elapsed time: 5.741s, Critical Path: 4.47s
INFO: 85 processes: 10 internal, 69 darwin-sandbox, 6 worker.
INFO: Build completed successfully, 85 total actions
INFO: Running command line: bazel-bin/server
[main] INFO io.javalin.Javalin - Starting Javalin ...
[main] INFO org.eclipse.jetty.server.Server - jetty-11.0.15; built: 2023-04-11T18:37:53.775Z; git: 5bc5e562c8d05c5862505aebe5cf83a61bdbcb96; jvm 20+36
[main] INFO org.eclipse.jetty.server.session.DefaultSessionIdManager - Session workerName=node0
[main] INFO org.eclipse.jetty.server.handler.ContextHandler - Started i.j.j.@304bb45b{/,null,AVAILABLE}
[main] INFO org.eclipse.jetty.server.AbstractConnector - Started ServerConnector@7dc0f706{HTTP/1.1, (http/1.1)}{0.0.0.0:7070}
[main] INFO org.eclipse.jetty.server.Server - Started Server@2f465398{STARTING}[11.0.15,sto=0] @267ms
[main] INFO io.javalin.Javalin -
       __                  ___          ______
      / /___ __   ______ _/ (_)___     / ____/
 __  / / __ `/ | / / __ `/ / / __ \   /___ \
/ /_/ / /_/ /| |/ / /_/ / / / / / /  ____/ /
\____/\__,_/ |___/\__,_/_/_/_/ /_/  /_____/

       https://javalin.io/documentation

[main] INFO io.javalin.Javalin - Listening on http://localhost:7070/
[main] INFO io.javalin.Javalin - You are running Javalin 5.6.1 (released June 22, 2023. Your Javalin version is 143 days old. Consider checking for a newer version.).
[main] INFO io.javalin.Javalin - Javalin started in 180ms \o/
```

### 3. Open the application in your browser

In a new terminal window, run:

```bash
open http://localhost:7070
```

Or just open <http://localhost:7070> in your browser.

Which should produce the following output:

```html
Hello World
```

## Conclusion

In this tutorial, we have:

1. Used a template project to get started with Javalin, Kotlin and Bazel
2. Run the application with Bazel
3. Opened the application in our browser
