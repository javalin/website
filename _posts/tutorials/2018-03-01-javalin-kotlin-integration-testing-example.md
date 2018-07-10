---
layout: tutorial
title: "Integration testing with khttp"
author: <a href="https://www.linkedin.com/in/kevin-cianfarini-b37807101/" target="_blank">Kevin Cianfarini</a>
date: 2018-03-01
permalink: /tutorials/integration-testing-kotlin
github: https://github.com/kevincianfarini/fastfood
summarytitle: Integration testing with khttp
summary: Learn how to build integration tests for your server
language: kotlin
---

## What You'll Create
In this tutorial, you'll be walked through creating a very limited CRUD app and testing it with JUnit, Khttp, and Javalin. 


## Dependencies 
First, get your workspace set up with gradle. Then you're going to need to add some dependencies to your project. Below are the relevant bits that you should pay attention to. 

```java
repositories {
    mavenCentral()
    jcenter()
}

dependencies {
    compile "org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlin_version"
    compile 'io.javalin:javalin:{{site.javalinversion}}'
    compile "org.slf4j:slf4j-api:1.7.25"
    compile "org.slf4j:slf4j-simple:1.7.25"
    compile "com.fasterxml.jackson.module:jackson-module-kotlin:2.9.+"
    testCompile 'junit:junit:4.12'
    testCompile 'khttp:khttp:0.1.0'
}
```

The library we're going to be using for testing is `khttp`, an extremely lightweight http implementatiton in kotlin. If you've ever used pythons `requests` module, you'll notice a lot of similarities. 

## Getting Started

I set up my file structure in an MVC-like fashion as follows. 

```
src
├── main
│   └── kotlin
│       ├── controllers
│       │   └── FoodItemController.kt
│       ├── Main.kt
│       ├── models
│       │   └── FoodItem.kt
│       └── util
└── test
    └── kotlin
        ├── integration
        │   └── TestIntegration.kt
        └── util
            └── Extensions.kt
```


First and foremost, to be able to test anything we need to be able to start and stop the server from our tests. The way the docs outline how to do this in a functional manner makes it difficult to do this. 
```kotlin
// Main.kt
fun main(args: Array<String>) {
    val app = Javalin.create().start(7000)
    app.get("/") { ctx -> ctx.result("Hello World") }
}
```
A simple workaround for this is wrapping all of that in a dummy class. 

```kotlin
// Main.kt
fun main(args: Array<String>) {

    JavalinApp(8000).init()

}


class JavalinApp(private val port: Int) {

    fun init(): Javalin {

        val app = Javalin.create().apply {
            port(port)
            exception(Exception::class.java) { e, _ -> e.printStackTrace() }
        }.start()

        app.routes { ... }

        return app
    }
}
```

Now that we don't depend on the `main` entrypoint, we can start and stop the server from our test runner. 

```kotlin
// TestIntegration.kt
class TestIntegration : TestCase() {

    private lateinit var app: Javalin
    private val url = "http://localhost:8000/"

    override fun setUp() {
        app = JavalinApp(8000).init()
    }

    override fun tearDown() {
        app.stop()
    }

    fun testDummy() {
        assertEquals(1, 1)
    }
}
```

Awesome, so now you have 1 running test that starts and stops the server too. 

## The Meat Of It

To actually be able to test anything, we need to have something to test!

First we need to have some data to back out API. I'm not going to do anything fancy right now, so let's settle for a data class and a map of some items. 

```kotlin
// FoodItem.kt
data class FoodItem(val name: String, val calories: Int)

val foodItems = hashMapOf(
        0 to FoodItem("Pizza", 1000),
        1 to FoodItem("Soup", 10),
        2 to FoodItem("Apple", 50)
)
```

To serialize your data to JSON, just pass the object to the `context.json(...)` method.

```kotlin
// FoodItemController.kt
class FoodItemController(private val data: Map<Int, FoodItem>) {

    fun getFoodItem(ctx: Context) {
        ctx.param("id")?.toInt().let {
            data[it]?.let { item ->
                ctx.json(item)
                return
            }
            ctx.status(404)
        }
    }
}
```

In the `getFoodItem` method, we yank the `id` off the context object,and query our "database" of Food Items and return a result. If the Food Item with the requested id doesn't exist, we raise a `404`. 

We have most of the wiring done, let's revisit `Main.kt` to add in some stuff I omitted from earlier. 

In your app routes, add the url path for the request and make the call from the controller. 

```kotlin
// Main.kt, class JavalinApp

val controller = FoodItemController(foodItems)

app.routes {
    path("api") {
        path("food") {
            path(":id") {
                get { ctx -> controller.getFoodItem(ctx) }
            }
        }
    }
}
```

Now if you launch your server and make a request to `/api/food/[0-2]` you should see the JSON representation of your object. Finally, it's time to demonstrate testing. 


To make things a bit cleaner for ourselvs, let's create an extension function in our test util package that knows how to deserialize `String`s to objects. 

```kotlin
// Extensions.kt

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue

inline fun <reified T : Any> String.deserialize(): T =
        jacksonObjectMapper().readValue(this)
```


We can leverage our deserialization method in our tests and also take advantage of kotlin data classes free `equals` method here. 

```kotlin
// TestIntegration.kt

import io.javalin.Javalin
import junit.framework.TestCase
import models.FoodItem
import models.foodItems

class TestIntegration : TestCase() {

    private lateinit var app: Javalin
    private val url = "http://localhost:8000/"

    override fun setUp() {
        app = JavalinApp(8000).init()
    }

    override fun tearDown() {
        app.stop()
    }

    fun testGetFoodItemExists() {
        val response = khttp.get(url = url + "api/food/0")
        val food = response.text.deserialize<FoodItem>()
        assertEquals(foodItems[0], food)
        assertEquals(200, response.statusCode)
    }

    fun testGetFoodItemNotExist() {
        val response = khttp.get(url = url + "api/food/-1")
        assertEquals(404, response.statusCode)
    }

}
```

And there we have it! Although this only demonstrates a very limited subset of the REST methods, khttp has them all implemented and Javalin has them documented, so I'm not going to waste your time with the bloat.

I hope you learned something from this!
