---
layout: tutorial
official: false
title: "Using Javalin with Kotlin to deploy a simple REST API to a Raspberry Pi"
author: <a href="https://github.com/NickM-27" target="_blank">Nick Mowen</a>
date: 2020-09-05
summarytitle: Deploy Kotlin REST API to Raspberry Pi.
summary: Use Kotlin with Javalin to deploy a REST API to run on a Raspberry Pi"
language: kotlin
---

## What You Will Learn

* Setting up Kotlin with Gradle
* Creating a simple REST API using Javalin
* Deploying and running the API on an embedded Jetty running on a Raspberry Pi

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

First, you will need to change the Kotlin dependency from `implementation` to `compile` which will be necessary later for building the runnable jar.

You will need to add `jcenter` to the respositories that dependencies are included in:

``` groovy
repositories {
    mavenCentral()
    jcenter()
}
```

Then, add these dependencies as well:

``` groovy
compile 'io.javalin:javalin:{{site.javalinThreeVersion}}'
compile 'com.fasterxml.jackson.core:jackson-databind:2.10.3' // Necessary for serializing JSON
compile 'com.fasterxml.jackson.module:jackson-module-kotlin:2.10.3' // Necessary for serializing JSON
compile 'org.slf4j:slf4j-simple:1.7.30' // Necessary to view logging output
```

## Setting Up Javalin

We need to create the Javalin app with the IP address and port to be used on the Raspberry Pi:

``` kotlin
fun main() {
    val ipAddress = "0.0.0.0" // change this to your Raspberry Pi's IP address
    val app = Javalin.create().apply {
        exception(Exception::class.java) { e, _ -> e.printStackTrace() }
    }.start(ipAddress, 8080)
}
```

The error handling isn't necessary but helps when debugging issues that may occur with the RaspberryPi.

## Adding Data To Play Around With

We are going to add a simple data class to test with:

``` kotlin
data class StringData(val id: Long, val data: String)
```

Then create a DAO (Data Access Object) to allow for handling of server data

``` kotlin
class StringDao {

    val strings: MutableList<StringData> = mutableListOf() // Server starts with empty list

    fun addStringData(data: StringData) {
        strings.add(data)
    }

    fun removeStringData(stringId: Long): Boolean = strings.removeIf { it.id == stringId }
}
```

## Creating Simple REST API To Test With

Now we can add the REST API with our app in main:

``` kotlin
fun main() {
    val stringDao = StringDao()

    val ipAddress = "0.0.0.0" // change this to your Raspberry Pi's IP address
    val app = Javalin.create().apply {
        exception(Exception::class.java) { e, _ -> e.printStackTrace() }
    }.start(ipAddress, 8080)

    app.routes {
        get("/strings") { context ->
            context.json(data.strings)
        }

        post("/strings") { context ->
            val stringData = context.body<StringData>()
            stringDao.addStringData(stringData)
            context.status(201)
        }

        delete("/strings/:stringId") { context ->
            stringDao.removeStringData(context.pathParam("stringId").toLongOrNull() ?: -1).let {
                if (it)
                    context.status(204)
                else
                    context.status(400)
            }
        }
    }
}
```

## Building A Fat Jar

A fat jar is a single file which contains all the compiled Java classes and dependencies required to run an application.

To create our fat jar we need to add a custom task at the bottom of our `build.gradle` file:

``` groovy
task fatJar(type: Jar) {
    manifest {
        attributes 'Main-Class': 'com.org.example.MainKt' // Make sure this includes Kt at the end of your main class
    }
    from { configurations.compile.collect { it.isDirectory() ? it : zipTree(it) } }
    with jar
}
```

Notice the `configurations.compile` bit, this is why `compile` was required before, so all dependencies are found and included.

This gradle task can now be run and the fat jar will be built in `YourProject/build/libs/yourproject-yourversion.jar`

## Sending and Running On Raspberry Pi

This part of the tutorial is going to assume that we are running our Raspberry Pi in headless mode (there is no display or control devices connected to it and we are running from a different device. This is also done with a Mac terminal (ZSH) and should be identical on a Linux machine, Windows users will need to find an equivalent in Powershell.

The first step is to get the IP address of your Raspberry Pi from before. Then open a terminal and run `scp yourproject-yourversion.jar pi@your.raspberry.pi.ipaddress/Downloads` which will create an encrypted file transfer to the Downloads folder on your Raspberry Pi. You should then be prompted for a password and the transfer will begin.

Next, SSH into the Raspberry Pi using `ssh pi@your.raspberry.pi.ipaddress` and enter the password. At this point you should make sure that Java has been installed.

`cd` into `Downloads` and run `java -jar yourproject-yourversion.jar` and the server should start running.

## Communicating With the REST API

Open up a separate terminal so that we can send requests to the Raspberry Pi.

To create a string, use:

``` bash
curl --header "Content-Type: application/json" --request POST --data '{ "id": "1", "string": "First String"}' your.raspberry.pi.ipaddress:8080/strings
```

Once that has successfully gone through, you can query the strings by using:

``` bash
curl your.raspberry.pi.ipaddress:8080/strings
```

and the response should be:

`[{"id":1,"string":"First String"}]%`

Finally, deleting a string can be done using:

``` bash
curl --request DELETE your.raspberry.pi.ipaddress:8080/strings/1
```

## Conclusion

I had my Raspberry Pi just sitting around a decided a fun project would be to create a REST API to play around with and learn, there are many other tutorials on this site which can be used to extend this example.
