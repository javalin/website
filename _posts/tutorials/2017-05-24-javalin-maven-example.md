---
layout: tutorial
title: "Setting up Javalin with Maven"
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
date: 2017-05-24 11:34:52
permalink: /tutorials/maven-setup
summarytitle: Maven setup
summary: Set up a Javalin project using Maven in IntelliJ IDEA and Eclipse.
---

## IDE Guides
<a href="#intellij">- Instructions for IntelliJ IDEA</a><br>
<a href="#eclipse">- Instructions for Eclipse</a><br>
 
## About Maven
Maven is a build automation tool used primarily for Java projects. It addresses two aspects of building software: First, it describes how software is built, and second, it describes its dependencies.

Maven projects are configured using a 
<a href="https://en.wikipedia.org/wiki/Apache_Maven#Project_Object_Model">
    Project Object Model</a>, which is stored in a pom.<a href="https://en.wikipedia.org/wiki/XML" target="_blank">xml</a>-file. <br>Here's a minimal example:

~~~markup
<project>
    <!-- model version - always 4.0.0 for Maven 2.x POMs -->
    <modelVersion>4.0.0</modelVersion>

    <!-- project coordinates - values which uniquely identify this project -->
    <groupId>com.mygroup</groupId>
    <artifactId>my-javalin-project</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    
    <properties>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
    </properties>

    <!-- library dependencies -->
    <dependencies>
        <dependency>
            <groupId>io.javalin</groupId>
            <artifactId>javalin</artifactId>
            <version>{{site.javalinversion}}</version>
        </dependency>
    </dependencies>
</project>
~~~

<h2 id="intellij">Instructions for IntelliJ IDEA</h2>

* Click `File` and select `New project...`
* Select `Maven` on the left hand menu and click `Next`
* Enter GroupId, ArtifactId and Version, and click `Next`
* Give your project a name and click `Finish`:
* Paste the Javalin dependency into the generated pom.xml. If prompted, tell IntelliJ to enable auto-import.

~~~markup
<dependency>
    <groupId>io.javalin</groupId>
    <artifactId>javalin</artifactId>
    <version>{{site.javalinversion}}</version>
</dependency>
~~~

Finally, paste the Javalin "Hello World" snippet into a new file, `Main.java`:

{% include macros/gettingStarted.md %}

Now everything is ready for you to run your main Class. Enjoy!

<small markdown="1">
*If IntelliJ says `Method references are not supported at this language level`, press `alt + enter`*\\
and choose `Set language level to 8 - Lambdas, type annotations, etc`.*
</small>

<h2 id="eclipse">Instructions for Eclipse</h2>

* Click `File` and select `New` then `Other...`
* Expand `Maven` and select `Maven Project`, then click `Next`
* Check the `Create a simple project` checkbox and click `Next`
* Enter GroupId, ArtifactId, Verison, and Name, and click `Finish`
* Open the pom.xml file and click the `pom.xml` tab. Paste the Javalin dependency

~~~markup
<dependencies>
    <dependency>
        <groupId>io.javalin</groupId>
        <artifactId>javalin</artifactId>
        <version>0.0.1</version>
    </dependency>
</dependencies>
~~~

Finally, paste the Javalin "Hello World" snippet into a new file, `Main.java`:

{% include macros/gettingStarted.md %}


Now everything is ready for you to run your main Class. Enjoy!