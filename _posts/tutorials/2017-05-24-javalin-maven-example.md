---
layout: tutorial
official: true
title: "Setting up Javalin with Maven"
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
date: 2017-05-24
permalink: /tutorials/maven-setup
summarytitle: Maven setup
summary: Set up a Javalin project using Maven in IntelliJ IDEA, Eclipse, and VS Code.
language: java
---

## IDE Guides
<a href="#intellij">- Instructions for IntelliJ IDEA</a><br>
<a href="#eclipse">- Instructions for Eclipse</a><br>
<a href="#vscode">- Instructions for VS Code</a><br>

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

<h2 id="vscode">Instructions for VS Code</h2>

### Prerequisites

Before creating a Maven project, ensure you have the following installed:

* **Maven** - Required for building the project. Install it using:
  ~~~bash
  # macOS (using Homebrew)
  brew install maven

  # macOS/Linux (using SDKMAN)
  sdk install maven

  # Linux (Debian/Ubuntu)
  sudo apt install maven
  ~~~

* **Extension Pack for Java** - This extension pack includes essential Java development tools and the Maven for Java extension. Install it from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack) or by searching for "Extension Pack for Java" in the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`).

### Creating a New Maven Project

* Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
* Type `Java: Create Java Project` and select it
* Select `Maven` as the project type
* Select `maven-archetype-quickstart` as the archetype
* Select the latest version of the archetype
* Enter the GroupId (e.g., `com.mygroup`)
* Enter the ArtifactId (e.g., `my-javalin-project`)
* Select a folder to create the project in
* When prompted in the terminal:
  * Press `Enter` to accept the default version (`1.0-SNAPSHOT`)
  * Type `Y` and press `Enter` to confirm the properties configuration

> ⚠ **macOS/Linux Users**: If you encounter errors with the Maven wrapper (`mvnw`), ensure Maven is installed on your system (see Prerequisites above). The Java extension will automatically detect and use the system-installed Maven.

### Adding Javalin Dependency

Open the generated `pom.xml` file and add the Javalin dependency inside the `<dependencies>` section:

~~~markup
<dependency>
    <groupId>io.javalin</groupId>
    <artifactId>javalin</artifactId>
    <version>{{site.javalinversion}}</version>
</dependency>
~~~

Your `<dependencies>` section should now include both JUnit (added by the archetype) and Javalin.

### Configuring Java Version

Update the `maven-compiler-plugin` configuration in your `pom.xml` to use Java 11 (or higher):

~~~markup
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.13.0</version>
            <configuration>
                <source>11</source>
                <target>11</target>
            </configuration>
        </plugin>
    </plugins>
</build>
~~~

### Creating the Application

Create a new file `HelloWorld.java` in `src/main/java/` (note: at the root of the java source folder, not inside a package):

~~~java
import io.javalin.Javalin;

public class HelloWorld {
    public static void main(String[] args) {
        var app = Javalin.create(/*config*/)
            .get("/", ctx -> ctx.result("Hello World"))
            .start(7070);
    }
}
~~~

> 💡 **Note**: We use the traditional `public static void main(String[] args)` syntax for better compatibility with VS Code's debugger. Java 21's implicit class syntax (`void main()`) may cause issues with debugging.

### Running the Application

There are several ways to run your Javalin application:

1. **Using Maven (Recommended for first run)**: Open the integrated terminal in VS Code (`` Ctrl+` `` / `` Cmd+` ``) and run:
   ~~~bash
   mvn compile exec:java -Dexec.mainClass="HelloWorld"
   ~~~

   Add the exec plugin to your `pom.xml` inside `<plugins>` for easier execution:
   ~~~markup
   <plugin>
       <groupId>org.codehaus.mojo</groupId>
       <artifactId>exec-maven-plugin</artifactId>
       <version>3.1.0</version>
       <configuration>
           <mainClass>HelloWorld</mainClass>
       </configuration>
   </plugin>
   ~~~

2. **Using the Run button**: Open `HelloWorld.java` and click the `Run` button (▶) above the `main` method.

3. **Using Debug Configuration (F5)**: For debugging support, create the following VS Code configuration files:

   Create `.vscode/settings.json`:
   ~~~json
   {
       "java.project.sourcePaths": ["src/main/java"],
       "java.project.outputPath": "target/classes",
       "java.configuration.updateBuildConfiguration": "automatic"
   }
   ~~~

   Create `.vscode/tasks.json`:
   ~~~json
   {
       "version": "2.0.0",
       "tasks": [
           {
               "label": "mvn compile",
               "type": "shell",
               "command": "mvn",
               "args": ["compile"],
               "group": {
                   "kind": "build",
                   "isDefault": true
               },
               "problemMatcher": "$mvn"
           }
       ]
   }
   ~~~

   Create `.vscode/launch.json`:
   ~~~json
   {
       "version": "0.2.0",
       "configurations": [
           {
               "type": "java",
               "name": "Run HelloWorld",
               "request": "launch",
               "mainClass": "HelloWorld",
               "projectName": "my-javalin-project",
               "preLaunchTask": "mvn compile"
           }
       ]
   }
   ~~~

   Then press `F5` or go to `Run` → `Start Debugging`.

> 💡 **Tip**: If VS Code doesn't recognize the Javalin imports, try:
> * Right-click on `pom.xml` → select `Maven` → `Reload project`
> * Or run `Maven: Reload Projects` from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
> * If issues persist, run `Java: Clean Java Language Server Workspace` from the Command Palette

> ⚠ **Troubleshooting "ClassNotFoundException"**: If you see `Error: Could not find or load main class HelloWorld`:
> 1. Ensure Maven is installed: run `mvn -version` in terminal
> 2. Compile the project first: run `mvn compile` in terminal
> 3. Reload VS Code window: `Cmd+Shift+P` → `Developer: Reload Window`

Now everything should be ready for you to run your application. Enjoy!
