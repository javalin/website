---
layout: tutorial
title: "Setting up Javalin with Maven"
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
date: 2015-04-02 11:34:52
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
    <groupId>com.mycompany.app</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0</version>
    
    <properties>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
    </properties>

    <!-- library dependencies -->
    <dependencies>
        <dependency>
            <groupId>io.javalin</groupId>
            <artifactId>javalin</artifactId>
            <version>2.5</version>
        </dependency>
    </dependencies>
</project>
~~~

<h2 id="intellij">Instructions for IntelliJ IDEA</h2>

<br>Click "File" and select "New project...":
<img src="/img/posts/mavenTut/idea1.png" alt="">

<br>Select "Maven" on the left hand menu and click "Next":
<img src="/img/posts/mavenTut/idea2.png" alt="">

<br>Enter GroupId, ArtifactId and Verison, and click "Next":
<img src="/img/posts/mavenTut/idea3.png" alt="">

<br>Give your project a name and click "Finish":
<img src="/img/posts/mavenTut/idea4.png" alt="">

<br>Paste the Javalin dependency into the generated pom.xml. If prompted, tell IntelliJ to enable auto-import.
<img src="/img/posts/mavenTut/idea5.png" alt="">
~~~markup
<dependencies>
    <dependency>
        <groupId>io.javalin</groupId>
        <artifactId>javalin</artifactId>
        <version>0.0.1</version>
    </dependency>
</dependencies>
~~~

Finally, paste the Javalin "Hello World" snippet:

~~~java
import static javalin.Javalin.*;

public class Main {
    public static void main(String[] args) {
        Javalin app = Javalin.create().port(7000);
        app.get("/hello", (req, res) -> res.body("Hello World"));
    }
}
~~~

<br>Into a new Class, "Main.java":
<img src="/img/posts/mavenTut/idea6.png" alt="">

<br>Now everything is ready for you to run your main Class. Enjoy!


<em>
    If IntelliJ says <samp>"Method references are not supported at this language level"</samp>,
    <br> 
    press <b>alt+enter</b> and choose <samp>"Set language level to 8 - Lambdas, type annotations, etc."</samp>.
</em>



<h2 id="eclipse">Instructions for Eclipse</h2>

<br>Click "File" and select "New" then "Other...":
<img src="/img/posts/mavenTut/eclipse1.png" alt="">

<br>Expand "Maven" and select "Maven Project", then click "Next":
<img src="/img/posts/mavenTut/eclipse2.png" alt="">

<br>Check the "Create a simple project" checkbox and click "Next":
<img src="/img/posts/mavenTut/eclipse3.png" alt="">

<br>Enter GroupId, ArtifactId, Verison, and Name, and click "Finish":
<img src="/img/posts/mavenTut/eclipse4.png" alt="">

<br>Open the pom.xml file and click the "pom.xml" tab. Paste in the Javalin dependency:
<img src="/img/posts/mavenTut/eclipse5.png" alt="">
~~~markup
<dependencies>
    <dependency>
        <groupId>io.javalin</groupId>
        <artifactId>javalin</artifactId>
        <version>0.0.1</version>
    </dependency>
</dependencies>
~~~

Finally, paste the Javalin "Hello World" snippet:

~~~java
import static javalin.Javalin.*;

public class Main {
    public static void main(String[] args) {
        Javalin app = Javalin.create().port(7000);
        app.get("/hello", (req, res) -> res.body("Hello World"));
    }
}
~~~

<br>Into a new Class, "Main.java":
<img src="/img/posts/mavenTut/eclipse6.png" alt="">

<br>Now everything is ready for you to run your main Class. Enjoy!


<style>#intellij, #eclipse {padding-top: 100px;}</style>