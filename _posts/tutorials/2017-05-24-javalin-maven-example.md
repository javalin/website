---
layout: tutorial
official: true
title: "Setting up Javalin with Maven"
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
date: 2017-05-24
permalink: /tutorials/maven-setup
summarytitle: Maven setup
summary: Set up a Javalin project using Maven in IntelliJ IDEA, Eclipse, and Visual Studio Code.
language: java
---

## IDE Guides
<a href="#intellij">- Instructions for IntelliJ IDEA</a><br>
<a href="#eclipse">- Instructions for Eclipse</a><br>
<a href="#vscode">- Instructions for Visual Studio Code</a><br>

## About Maven
Maven is a build automation tool used primarily for Java projects.
It addresses two aspects of building software: First,
it describes how software is built, and second, it describes its dependencies.

Maven projects are configured using a
<a href="https://en.wikipedia.org/wiki/Apache_Maven#Project_Object_Model">
Project Object Model</a>, which is stored in a pom.<a href="https://en.wikipedia.org/wiki/XML" target="_blank">xml</a>-file.

Here's a minimal example:

~~~markup
<project>
    <!-- model version - always 4.0.0 for Maven 2.x POMs -->
    <modelVersion>4.0.0</modelVersion>

    <!-- project coordinates - values which uniquely identify this project -->
    <groupId>com.mygroup</groupId>
    <artifactId>my-javalin-project</artifactId>
    <version>1.0.0-SNAPSHOT</version>

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
<dependencies>
    <dependency>
        <groupId>io.javalin</groupId>
        <artifactId>javalin</artifactId>
        <version>{{site.javalinversion}}</version>
    </dependency>
</dependencies>
~~~

Finally, paste the Javalin "Hello World" snippet into a new file, `HelloWorld.java`:

{% include macros/gettingStarted.md %}

Depending on your setup, you might need to explicitly set the language level to Java 11.
This can be done in the in the `pom.xml`. Add the following snippet:

~~~markup
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.10.1</version>
            <configuration>
                <source>11</source>
                <target>11</target>
            </configuration>
        </plugin>
    </plugins>
</build>
~~~

Now everything should be ready for you to run your application. Enjoy!

> ⚠ Note: Due to a bug in the IntelliJ integration with Maven there is a known issue where intelliJ will show an error in the code editor, if this happens, refreshing the project and running the goal `mvn clean package` should fix the issue.

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
        <version>{{site.javalinversion}}</version>
    </dependency>
</dependencies>
~~~

Finally, paste the Javalin "Hello World" snippet into a new file, `HelloWorld.java`:

{% include macros/gettingStarted.md %}

Depending on your setup, you might need to explicitly set the language level to Java 11.
This can be done in the in the `pom.xml`. Add the following snippet:

~~~markup
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.10.1</version>
            <configuration>
                <source>11</source>
                <target>11</target>
            </configuration>
        </plugin>
    </plugins>
</build>
~~~

Depending on your version of eclipse, you might have to
- `Right click on your project` select `Maven` then `Update Project`

Now everything should be ready for you to run your application. Enjoy!

<h2 id="vscode">Instructions for Visual Studio Code</h2>

### Prerequisites

Install the <a href="https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack" target="_blank">Extension Pack for Java</a> from the Visual Studio Code Marketplace. This extension pack includes:
- Language Support for Java by Red Hat
- Debugger for Java
- Maven for Java
- Test Runner for Java
- Project Manager for Java

### Create a Maven Project

* Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) to open the Command Palette
* Type `Java: Create Java Project` and select it
* Select `Maven` from the list
* Choose `maven-archetype-quickstart` as the archetype
* Select a folder where you want to create the project
* Enter your GroupId (e.g., `com.mygroup`)
* Enter your ArtifactId (e.g., `my-javalin-project`)
* Press `Enter` to accept the default version
* Open the project when prompted

### Add Javalin Dependency

Open the `pom.xml` file and add the Javalin dependency in the `<dependencies>` section:

~~~markup
<dependencies>
    <dependency>
        <groupId>io.javalin</groupId>
        <artifactId>javalin</artifactId>
        <version>{{site.javalinversion}}</version>
    </dependency>
</dependencies>
~~~

### Configure Java Version

Depending on your setup, you might need to explicitly set the language level to Java 11 or higher.
This can be done in the `pom.xml`. Add the following snippet in a `<build>` section:

~~~markup
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.10.1</version>
            <configuration>
                <source>11</source>
                <target>11</target>
            </configuration>
        </plugin>
    </plugins>
</build>
~~~

After updating the `pom.xml`, VS Code should automatically detect the changes and update the project configuration.

### Add Application Code

Delete the auto-generated `App.java` file and create a new file named `HelloWorld.java` in `src/main/java/com/yourgroup/` (or your chosen package). Paste the Javalin "Hello World" snippet:

{% include macros/gettingStarted.md %}

### Run and Debug

There are several ways to run your application in VS Code:

1. **Run using CodeLens**: Click the `Run` link that appears above the `main()` method
2. **Run using Command Palette**: Press `F5` or use `Ctrl+Shift+P` and select `Java: Run Java`
3. **Run using Terminal**: Open the integrated terminal and run `mvn compile exec:java -Dexec.mainClass="com.yourgroup.HelloWorld"`

To debug your application:
1. Set breakpoints by clicking in the left margin next to line numbers
2. Press `F5` or click `Run and Debug` in the sidebar
3. Select `Java` when prompted for an environment
4. VS Code will create a `launch.json` configuration automatically

Once the application is running, open your browser and navigate to `http://localhost:7070` to see "Hello World".

### Troubleshooting

**If VS Code doesn't recognize Java classes or shows import errors:**
- Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
- Run `Java: Clean Java Language Server Workspace`
- Restart VS Code

**If Maven commands fail or dependencies aren't resolving:**
- Ensure Maven is properly installed and available in your PATH
- On macOS: `brew install maven`
- On Ubuntu/Debian: `sudo apt install maven`
- Alternatively, VS Code can use Maven Wrapper if present in your project

**If the project structure isn't recognized:**
- Right-click on `pom.xml` and select `Update Project Configuration`
- Or run `Maven: Update Project` from the Command Palette

Now everything should be ready for you to run your application. Enjoy!
