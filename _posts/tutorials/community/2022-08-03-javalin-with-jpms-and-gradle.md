---
layout: tutorial
official: false
title: "Javalin with Java Platform Module System (JPMS) and Gradle"
author: <a href="https://www.linkedin.com/in/bernhard-baumgartner-ba5a4b80/" target="_blank">Bernhard Baumgartner</a>
date: 2022-08-03
permalink: /tutorials/javalin-with-jpms-and-gradle
github: https://github.com/baumgarb/javalin-with-jpms-and-gradle
summarytitle: Javalin with Java Platform Module System (JPMS) and Gradle
summary: Learn how to create a Javalin application with the Java Platform Module System (JPMS), Gradle and the built-in dependency injection mechanism through Java's ServiceLoader
language: java
---

## What You Will Learn
In this tutorial we will learn how to create a simple RESTful API based on Javalin and the Java Platform Module System (JPMS or Jigsaw) with Gradle for build.

We will use the [Java Platform Module System](https://www.oracle.com/corporate/features/understanding-java-9-modules.html) which among other benefits greatly improves the ability to encapsulate implementation details in big Java projects. Moreover, we will utilize the built-in dependency constructor injection mechanisms which come with JPMS and Java's [ServiceLoader](https://docs.oracle.com/javase/9/docs/api/java/util/ServiceLoader.html). Also, we'll show how to use [Gradle](https://gradle.org) as the underlying build and dependency management tooling to showcase how neat Gradle and JPMS can work together.


## Prerequisites
~~~bash
# 1. Be sure to have Java 9 or above
java -version

# 2. Be sure to have Gradle set up and available on your machine
gradle -v
~~~

## Operating system and IDE
This tutorial provides commands for both Windows and Linux machines. Where necessary, I will provide the commands for each of these operating systems in case they differ. For Windows users, pls note, that I'll only provide commands that work in PowerShell and PowerShell Core. I'll not provide commands for `cmd.exe`, though. 

With regards to IDE, for this tutorial I decided to work as bare bone as possible. You will be able to follow along if you meet all prerequisites mentioned above and if you have a simple text editor on your machine. Feel free, though, to use your favourite IDE.

## 1. Setup project

```bash
# 1. Linux: create a new directory for our project wherever you host your projects
mkdir javalin-with-jpms-and-gradle

# 1. Windows: previous 'mkdir' should also work on Windows by now, but in case not you should be good with
New-Item -Type Directory javalin-with-jpms-and-gradle

# 2. Change to new directory
cd javalin-with-jpms-and-gradle

# 3. Create new project based on Gradle's "basic" template
gradle init --type basic --dsl groovy --project-name javalin-with-jpms-and-gradle
```

The content of the newly initialized project should look something along the lines of

```
javalin-with-jpms-and-gradle/
├── .gitattributes
├── .gitignore
├── .gradle/
├── build.gradle
├── gradle/
├── gradlew
├── gradlew.bat
└── settings.gradle
```

## Create empty directories for subprojects

```bash
# 1. Create directory for models subproject
mkdir -p models/src/main/java/org/example/models

# 2. Create directory for services subproject
mkdir -p services/src/main/java/org/example/services

# 3. Create directory for api subproject
mkdir -p api/src/main/java/org/example/api

# Windows: if 'mkdir' does not work then go with the 'New-Item` pendant for all previous three commands
New-Item -Type Directory <directory tree>
```

## Configure Gradle subprojects and make API runnable application
Open `settings.gradle` in the project's root directory and include the three subprojects:

```groovy
rootProject.name = 'javalin-with-jpms-and-gradle'

// Include the subprojects as follows
include 'models'
include 'services'
include 'api'
```

Now open `build.gradle` in the project's root directory and make sure the contents look as follows:

```groovy
// Let's setup Maven Central as repository for all dependencies of all subprojects
subprojects {
    repositories {
        mavenCentral()
    }
}
```

Now create a new `build.gradle` in the root of both subprojects, `models` and `services` with the following content:

```groovy
plugins {
    id 'java-library'
}
```

Now create a new `build.gradle` in the root of the `api` subproject with the following content:

```groovy
plugins {
    id 'application'
}

application {
    // Don't worry, we're about to create this class in a sec :-)
    mainClass = "org.example.api.MyAPI"
}
```

Now let's create the `MyAPI` class in our `api` subproject with the following content:

```java
package org.example.api;

public class MyAPI {
    public static void main(String[] args) {
        System.out.println("API's kind of alive already :-)");
    }
}
```

The contents of your project's directory should look as follows at this point:

```
javalin-with-jpms-and-gradle/
├── .gitattributes
├── .gitignore
├── .gradle/
├── api/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   ├── org/
│   │   │   │   │   ├── example/
│   │   │   │   │   │   ├── api/
│   │   │   │   │   │   │   └── MyAPI.java           <-- contains static void main where Javalin will be fired up eventually
|   └── build.gradle                                 <-- build.gradle for API
├── build.gradle
├── gradle/
├── gradlew
├── gradlew.bat
├── models/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   ├── org/
│   │   │   │   │   ├── example/
│   │   │   │   │   │   └── models/
|   └── build.gradle                                 <-- build.gradle for models
├── services/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   ├── org/
│   │   │   │   │   ├── example/
│   │   │   │   │   │   └── services/
|   └── build.gradle                                 <-- build.gradle for services
└── settings.gradle
```

At this point you should now be able to run the `api` project via Gradle as follows:

```bash
# Linux: invoke Gradle's 'run' task that comes with the 'application' plugin
./gradlew :api:run

# Windows
.\gradlew.bat :api:run

# You should see an output like
> Task :api:run
API's kind of alive already :-)
```

## Create Javalin API that returns a list of persons (without JPMS for now)

Create a `Person.java` class in package `org.example.models`:

```java
package org.example.models;

public class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}
```

Now create a `PersonReader.java` interface in package `org.example.services.api`:

```java
package org.example.services.api;

import org.example.models.Person;

import java.util.List;

public interface PersonReader {
    List<Person> getAll();
}
```

Now create `InMemoryPersonReader.java` implementation of this interface in `org.example.services.inmemory`:

```java
package org.example.services.inmemory;

import org.example.models.Person;
import org.example.services.api.PersonReader;

import java.util.List;

public class InMemoryPersonReader implements PersonReader {
    @Override
    public List<Person> getAll() {
        return List.of(
            new Person("Vincent Vega", 73),
            new Person("Jules Winnfield", 12)
        );
    }
}
```

In order for this to work you will have to add a dependency of the `services` subproject to `models` in `services/build.gradle` as follows:

```groovy
plugins {
    id 'java-library'
}

dependencies {
    implementation project(":models")            // <-- add dependency to models subproject
}
```

Now open `api/build.gradle` and add the following dependencies:

```groovy
plugins {
    id 'application'
}

dependencies {
    implementation project(":models")     // We need this dependency for serializing persons to JSON
    implementation project(":services")   // We'll make use of the InMemoryPersonReader soon
    
    implementation group: 'io.javalin', name: 'javalin', version: '4.6.4'                             // Pulling in Javalin
    implementation group: 'com.fasterxml.jackson.core', name: 'jackson-databind', version: '2.13.3'   // For JSON serialization of persons 
    implementation group: 'org.slf4j', name: 'slf4j-simple', version: '1.7.36'                        // To see some Javalin logging
}

application {
    mainClass = "org.example.api.MyAPI"
}
```

Now open up `MyAPI.java` and put the following content in there:

```java
package org.example.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.Javalin;
import org.example.services.inmemory.InMemoryPersonReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MyAPI {
    private static Logger logger = LoggerFactory.getLogger(MyAPI.class);
    private static short port = 7312;

    public static void main(String[] args) {
        var personReader = new InMemoryPersonReader();
        var objMapper = new ObjectMapper();
        var result = objMapper.valueToTree(personReader.getAll());

        logger.info("API: found {} people.", personReader.getAll().size());

        var app = Javalin.create().start(port);
        app.get("/ping", ctx -> ctx.result("pong"));
        app.get("/persons", ctx -> ctx.json(result));

        logger.info("API's alive for real :-)))");
    }
}
```

Your project directory should now look like:

```
javalin-with-jpms-and-gradle/
├── .gitattributes
├── .gitignore
├── .gradle/
├── api/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   ├── org/
│   │   │   │   │   ├── example/
│   │   │   │   │   │   ├── api/
│   │   │   │   │   │   │   └── MyAPI.java           
|   └── build.gradle                                 
├── build.gradle
├── gradle/
├── gradlew
├── gradlew.bat
├── models/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   ├── org/
│   │   │   │   │   ├── example/
│   │   │   │   │   │   └── models/
│   │   │   │   │   │   │   └── Person.java                       <-- new class
|   └── build.gradle                                 
├── services/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   ├── org/
│   │   │   │   │   ├── example/
│   │   │   │   │   │   ├── services/
│   │   │   │   │   │   │   ├── api                               <-- new package
│   │   │   │   │   │   │   │   └── PersonReader.java             <-- new interface
│   │   │   │   │   │   │   ├── services                          <-- new package
│   │   │   │   │   │   │   │   └── InMemoryPersonReader.java     <-- new class
|   └── build.gradle                                 
└── settings.gradle
```

If so, then you should now be able to run the API again and you should be able to query the API from another shell / command line window:

```bash
# Linux: invoke Gradle's 'run' task that comes with the 'application' plugin
./gradlew :api:run

# Windows
.\gradlew.bat :api:run

# You should see an output like
[main] INFO org.example.api.MyAPI - API: found 2 people.
[main] INFO io.javalin.Javalin - Listening on http://localhost:7312/
[main] INFO io.javalin.Javalin - Javalin started in 315ms \o/
[main] INFO org.example.api.MyAPI - APIs alive for real :-)))

# Invoking the API in another window via
curl http://localhost:7312/persons

# should print 
[{"name":"Vincent Vega","age":73},{"name":"Jules Winnfield","age":12}]
```

Congrats, Javalin's up and running 🥳 But now let's get started with Java Modules and JPMS for real :-)

## Introducing Java modules

Create a module descriptor `models/src/main/java/java-module.info` with the following content:

```java
module org.example.models {
    // We're exporting the only package we have in this subproject
    exports org.example.models;
}
```

Create another module descriptor in the `services` subproject `services/src/main/java/java-module.info` with the following content:

```java
module org.example.services {
    // Export both packages api and inmemory for now
    exports org.example.services.api;
    exports org.example.services.inmemory;

    // Since we're using the Person class we're requiring the org.example.models module
    requires org.example.models;}
```

And create another module descriptor in the `api` subproject `api/src/main/java/java-module.info` with the following content:

```java
module org.example.api {
    // For Javalin, the ObjectMapper and the Logger & LoggerFactory to work we need to add these require statements
    requires io.javalin;
    requires com.fasterxml.jackson.databind;
    requires org.slf4j;

    // And since we're working with the InMemoryPersonReader we have to add this require statement as well
    requires org.example.services;
}
```

Your project directory should now look like:

```
javalin-with-jpms-and-gradle/
├── .gitattributes
├── .gitignore
├── .gradle/
├── api/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   ├── org/
│   │   │   │   │   ├── example/
│   │   │   │   │   │   ├── api/
│   │   │   │   │   │   │   └── MyAPI.java   
│   │   │   │   └── module-info.java                              <-- new module descriptor           
|   └── build.gradle                                 
├── build.gradle
├── gradle/
├── gradlew
├── gradlew.bat
├── models/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   ├── org/
│   │   │   │   │   ├── example/
│   │   │   │   │   │   └── models/
│   │   │   │   │   │   │   └── Person.java                       
│   │   │   │   └── module-info.java                              <-- new module descriptor           
|   └── build.gradle                                 
├── services/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   ├── org/
│   │   │   │   │   ├── example/
│   │   │   │   │   │   ├── services/
│   │   │   │   │   │   │   ├── api                               
│   │   │   │   │   │   │   │   └── PersonReader.java             
│   │   │   │   │   │   │   ├── services                          
│   │   │   │   │   │   │   │   └── InMemoryPersonReader.java     
│   │   │   │   └── module-info.java                              <-- new module descriptor           
|   └── build.gradle                                 
└── settings.gradle
```

You should now be able to fire up the API again by running

```bash
# Linux
./gradlew :api:run

# Windows
.\gradlew.bat :api:run
```

## Decouple API from services by introducing ServiceLoader

Let's be honest, the fact that `MyAPI` instantiates the `InMemoryPersonReader` directly is fairly ugly and a huge code smell. It's an implementation detail no other module should be bothered with. To decouple the `api` from implementation details in the `services` module we're introducing the `ServiceLoader` and we'll make use of the `provides` directives in the module descriptor of the `services` module.

Open `services/src/main/java/module-info.java` and change the content as follows:

```java
import org.example.services.api.PersonReader;
import org.example.services.inmemory.InMemoryPersonReader;

module org.example.services {
    exports org.example.services.api;

    requires org.example.models;

    // We're telling the ServiceLoader that the InMemoryPersonReader provides the implementation for the PersonReader interface
    provides PersonReader with InMemoryPersonReader;
}
```

Note also, we're no longer exporting the package `org.example.services.inmemory`. If you were to try to build the API now you'd get a compilation error saying something along the lines of 

```
error: package org.example.services.inmemory is not visible
import org.example.services.inmemory.InMemoryPersonReader;
                           ^
  (package org.example.services.inmemory is declared in module org.example.services, which does not export it)
1 error
```

Now let's fix that. Go ahead and open `MyAPI.java` again and change its content as follows:

```java
package org.example.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.Javalin;
import org.example.services.api.PersonReader;        // <-- this is one is new, and we're no longer importing the InMemoryPersonReader
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ServiceLoader;                      // <-- importing the ServiceLoader

public class MyAPI {
    private static Logger logger = LoggerFactory.getLogger(MyAPI.class);
    private static short port = 7312;

    public static void main(String[] args) {
        var personReader = ServiceLoader.load(PersonReader.class).findFirst().get();     // <-- Getting an implementation for the PersonReader interface from the ServiceLoader
        var objMapper = new ObjectMapper();
        var result = objMapper.valueToTree(personReader.getAll());

        logger.info("API: found {} people.", personReader.getAll().size());

        var app = Javalin.create().start(port);
        app.get("/ping", ctx -> ctx.result("pong"));
        app.get("/persons", ctx -> ctx.json(result));

        logger.info("API's alive for real :-)))");
    }
}
```

At this point your build would work fine, but if you were to run this application you'd end up with the following error:

```
Exception in thread "main" java.util.NoSuchElementException: No value present
        at java.base/java.util.Optional.get(Optional.java:143)
        at org.example.api.MyAPI.main(MyAPI.java:16)
```

Of course, we could (or rather should) improve the error handling around the `Optional<PersonReader>` that is returned by the `findFirst()` method. Even though this clearly needs to be improved, it will not solve the underlying issue. Instead, we have to tell Gradle's `application` plugin that there's a `mainModule` we want to run besides a `mainClass`. Therefore, open `api/build.gradle` and change the `application` plugin definition as follows:

```groovy
application {
    mainClass = "org.example.api.MyAPI"
    mainModule = "org.example.api"      // <-- add this line
}
```

Another try to run this application will again end up in an error, but a different one this time:

```
Exception in thread "main" java.util.ServiceConfigurationError: org.example.services.api.PersonReader: module org.example.api does not declare `uses`
```

We need to make the `api` module a service consumer module by explicitly stating that we're consuming a service of type `PersonReader`. For that, open `api/src/main/java/module-info.java` and add the following line:

```java
module org.example.api {
    requires io.javalin;
    requires com.fasterxml.jackson.databind;
    requires org.slf4j;

    requires org.example.services;

    uses org.example.services.api.PersonReader;    // <-- add this line
}
```

If you try to run the application again you will unfortunately end up in another error. It will say something along the lines of 

```
[main] INFO org.example.api.MyAPI - API: found 2 people.
Exception in thread "main" java.lang.NoClassDefFoundError: kotlin/NoWhenBranchMatchedException
        at io.javalin@4.6.4/io.javalin.core.JavalinConfig$Inner.<init>(JavalinConfig.java:77)
        at io.javalin@4.6.4/io.javalin.core.JavalinConfig.<init>(JavalinConfig.java:67)
        at io.javalin@4.6.4/io.javalin.Javalin.<init>(Javalin.java:54)
        at io.javalin@4.6.4/io.javalin.Javalin.create(Javalin.java:91)
        at io.javalin@4.6.4/io.javalin.Javalin.create(Javalin.java:78)
        at org.example.api/org.example.api.MyAPI.main(MyAPI.java:22)
Caused by: java.lang.ClassNotFoundException: kotlin.NoWhenBranchMatchedException
        at java.base/jdk.internal.loader.BuiltinClassLoader.loadClass(BuiltinClassLoader.java:641)
        at java.base/jdk.internal.loader.ClassLoaders$AppClassLoader.loadClass(ClassLoaders.java:188)
        at java.base/java.lang.ClassLoader.loadClass(ClassLoader.java:520)
        ... 6 more
```

Javalin itself is not modularized and does not make use of JPMS at all. Because of that, the module system makes Javalin an automatic module and it infers a ton of `requires` statements automatically based on dependencies. You can dive into the module resolution by passing on the `--show-module-resolution` to the Java runtime and you will then realize that the module system does not infer a dependency on the `kotlin.stdlib`. And this is the module we're missing here. You can simply fix this issue by changing the `api`'s module-descriptor as follows:

```java
module org.example.api {
    requires io.javalin;
    requires com.fasterxml.jackson.databind;
    requires org.slf4j;
    requires kotlin.stdlib;                // <-- add this line

    requires org.example.services;

    uses org.example.services.api.PersonReader;
}
```

Try runnning the application again:

```bash
# Linux
./gradlew :api:run

# Windows
.\gradlew.bat :api:run

# You should see an output like
[main] INFO org.example.api.MyAPI - API: found 2 people.
[main] INFO io.javalin.Javalin - Listening on http://localhost:7312/
[main] INFO io.javalin.Javalin - Javalin started in 315ms \o/
[main] INFO org.example.api.MyAPI - APIs alive for real :-)))

# Invoking the API in another window via
curl http://localhost:7312/persons

# should print 
[{"name":"Vincent Vega","age":73},{"name":"Jules Winnfield","age":12}]
```

Congrats, Javalin's up and running in a modularized project which fully leverages JPMS and its baked in dependency injection mechanism through Java's `ServiceLoader` 🥳
