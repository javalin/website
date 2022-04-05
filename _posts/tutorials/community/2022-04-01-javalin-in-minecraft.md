---
layout: tutorial
official: false
title: Javalin in Minecraft
permalink: /tutorials/javalin-in-minecraft
summarytitle: Using Javalin with Bukkit, Spigot, Paper, BungeeCord, or Waterfall !
summary: Learn how to make Javalin work with most modern Minecraft servers.
date: 2022-04-01
author: <a href="https://github.com/hanbings" target="_blank">hanbings</a>
language: ["java"]
github: https://github.com/javalin/javalin-in-minecraft-example
---

## Introduction

Libraries like Javalin do not work properly due to the interference of custom class loaders of plugins or mods. This tutorial will provide a solution for switching class loaders and using Spigot's dependency manager or Gradle Shadow's dependency packaging plan.

The tutorial assumes you will create a basic Gradle and have some understanding of creating a Bukkit and Bungeecord plugin. If you don't know, you can click the link to see [Gradle](https://gradle.org/), [Spigot](https://www.spigotmc.org/wiki/spigot-plugin-development/), [Bungeecord](https://www.spigotmc.org/wiki/bungeecord-plugin-development/).

Someone else had provided the same solution before this tutorial, but it was not organized into a tutorial, this tutorial refers to their article, thank them !

Here are the relevant links:
[Using Javalin in a Spigot or Bungeecord Plugin](https://gist.github.com/tipsy/5f793c8ce76272fa3630ba71f2001fab)

## Bukkit / Spigot / Paper

This tutorial will use [Bukkit](https://dev.bukkit.org/) to refer to [Spigot](https://www.spigotmc.org/) [Paper](https://papermc.io/) in general, because Paper is actually a fork of Spigot, and Spigot is based on Bukkit, they are compatible with each other, and the way this tutorial is applicable to most other servers that fork Spigot or Paper.

## BungeeCord / WaterFall

Using BungeeCord to refer to BungeeCord and WaterFall, BungeeCord's solution is the same as Bukkit's solution, just need to deal with their differences in dependencies and plugin API usage.

## Dependencies

Add the necessary dependencies, Spigot API (which also includes Bukkit) or BungeeCord API, Javalin and two runtime dependencies for Javalin.

Add the statement to the Gradle configuration file build.gradle.

### Bukkit / Spigot / Paper
```groovy
repositories {
    mavenCentral()
    maven { url 'https://hub.spigotmc.org/nexus/content/repositories/snapshots/' }
}
```

```groovy
dependencies {
    // https://hub.spigotmc.org/nexus/content/repositories/snapshots/
    compileOnly 'org.spigotmc:spigot-api:1.16.5-R0.1-SNAPSHOT'

    // https://mvnrepository.com/artifact/io.javalin/javalin
    implementation 'io.javalin:javalin:4.4.0'
    // https://mvnrepository.com/artifact/org.slf4j/slf4j-simple
    implementation 'org.slf4j:slf4j-simple:1.7.36'
    // https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-databind
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.13.2'
}
```

### BungeeCord / WaterFall

```groovy
repositories {
    mavenCentral()
    maven { url 'https://oss.sonatype.org/content/repositories/snapshots' }
}
```

```groovy
dependencies {
    compileOnly 'net.md-5:bungeecord-api:1.16-R0.5-SNAPSHOT'

    // https://mvnrepository.com/artifact/io.javalin/javalin
    implementation 'io.javalin:javalin:4.4.0'
    // https://mvnrepository.com/artifact/org.slf4j/slf4j-simple
    implementation 'org.slf4j:slf4j-simple:1.7.36'
    // https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-databind
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.13.2'
}
```

## Plugin Main Class

As described earlier, Bukkit uses custom class loaders that interfere with Javalin-dependent class loading, causing exceptions like as `java.lang.NoClassDefFoundError` and `java.lang.ClassNotFoundException` to be thrown.

As shown in the following code, you need to temporarily switch the class loader to the main class loader of the current plugin, and then switch to the default class loader after Javalin is instantiated. At this time, the Javalin instance can already be in the context of the default class loader used in.

```java
// org.bukkit.plugin.java.JavaPlugin is the plugin interface of Bukkit, BungeeCord should be changed to net.md_5.bungee.api.plugin.Plugin.
// BungeeCord: public class JavalinPlugin extends Plugin
public class JavalinPlugin extends JavaPlugin {
    @Override
    public void onEnable() {
        // Temporarily switch the plugin classloader to load Javalin.
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        // BungeeCord:  Thread.currentThread().setContextClassLoader(this.getClass().getClassLoader());
        Thread.currentThread().setContextClassLoader(this.getClassLoader());
        // Create a Javalin instance.
        Javalin app = Javalin.create().start(8080);
        // Restore default loader.
        Thread.currentThread().setContextClassLoader(classLoader);
        // The created instance can be used outside the class loader.
        app.get("/", ctx -> ctx.result("Hello World!"));
        // log
        getLogger().info("JavalinPlugin is enabled");
    }

    @Override
    public void onDisable() {
        getLogger().info("JavalinPlugin is disabled");
    }
}
```

**Note your plugin interface, Bukkit and BungeeCord are slightly different, already marked in the comments.**

`Thread.currentThread().getContextClassLoader()` Default class loader for getting context, keep it for switching after load.

`Thread.currentThread().setContextClassLoader(this.getClassLoader())` is to switch the class loader to the class loader of the current plugin. **In other classes**, you can use `{{your main class}}.class.getClassLoader()` or `{{your main class}}.getClass().getClassLoader()` replace `this.getClassLoader()`

After instantiating Javalin, use `setContextClassLoader(classLoader)` to reset the context class loader to the default class loader.

Wait, don't go ! One more step to finish ! :D

## Use Gradle Shadow for packaging.

You also need to package Javalin into the plugin and handle possible dependency conflicts, this method **works for all versions of Bukkit and BungeeCord**.

Add the statement to the Gradle configuration file build.gradle.

```groovy
plugins {
    id 'java'
    id 'com.github.johnrengelman.shadow' version '7.1.2'
}
```

[Relocation](https://imperceptiblethoughts.com/shadow/configuration/relocation/) in the shadowJar configuration node is to prevent conflicts with the same dependencies carried by other plugins. This step is not required, **but is recommended if your plugin plans to release it into the public domain to prevent incompatibilities**.

A common practice is to relocation the entire dependent library.

```groovy
shadowJar {
    relocate 'io.javalin:javalin:4.4.0', 'shadow.io.javalin'
    relocate 'org.slf4j:slf4j-simple:1.7.36', 'shadow.org.slf4j'
    relocate 'com.fasterxml.jackson.core:jackson-databind:2.13.2', 'shadow.com.fasterxml.jackson.core'
}
```

For more information on the Gradle Shadow plugin see https://imperceptiblethoughts.com/shadow/

## Using the plugin dependency manager

**This method only works with Spigot / Paper plugins higher than 1.17.**

**No need** to change build.gradle , just add in plugin description file plugin.yml .

```yaml
libraries:
  - "io.javalin:javalin:4.4.0"
  - "org.slf4j:slf4j-simple:1.7.36"
  - "com.fasterxml.jackson.core:jackson-databind:2.13.2"
```

It has the same format as the Gradle dependency url short format, like "Group Id:Artifact Id:Version". It should be noted that **only** the dependencies of the Maven central repository are supported.

## Build

Run Gradle tasks with Gradle Shadow: `./gradlew shadowJar`

Run Gradle tasks with plugin dependency manager: `./gradlew build`