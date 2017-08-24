---
layout: tutorial
title: "Creating a secure REST API in Javalin"
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
date: 2017-08-24
permalink: /tutorials/auth-example
github: https://github.com/tipsy/javalin-auth-example
summarytitle: Secure your endpoints!
summary: Learn how to secure your endpoints using Javalin's built-in AccessManager
language: kotlin
---

## Dependencies

First, create a new Gradle project with the following dependencies: [(→ Tutorial)](/tutorials/gradle-setup)

~~~java
dependencies {
    compile "org.jetbrains.kotlin:kotlin-stdlib-jre8:$kotlin_version"
    compile "io.javalin:javalin:{{site.javalinversion}}"
    compile "com.fasterxml.jackson.module:jackson-module-kotlin:2.8.4"
    compile "org.slf4j:slf4j-simple:1.7.22"
}
~~~

## Creating controllers
We need something worth protecting.
Let's pretend we have a very important API for manipulating a user database.
We make a controller-object with some dummy data and CRUD operations:
```kotlin
import io.javalin.Context
import java.util.*

object UserController {

    private data class User(val name: String, val email: String)

    private val users = hashMapOf(
            randomId() to User(name = "Alice", email = "alice@alice.kt"),
            randomId() to User(name = "Bob", email = "bob@bob.kt"),
            randomId() to User(name = "Carol", email = "carol@carol.kt"),
            randomId() to User(name = "Dave", email = "dave@dave.kt")
    )

    fun getAllUserIds(ctx: Context) {
        ctx.json(users.keys)
    }

    fun createUser(ctx: Context) {
        users[randomId()] = ctx.bodyAsClass(User::class.java)
    }

    fun getUser(ctx: Context) {
        ctx.json(users[ctx.param(":user-id")!!]!!)
    }

    fun updateUser(ctx: Context) {
        users[ctx.param(":user-id")!!] = ctx.bodyAsClass(User::class.java)
    }

    fun deleteUser(ctx: Context) {
        users.remove(ctx.param(":user-id")!!)
    }

    private fun randomId() = UUID.randomUUID().toString()

}
```

<small><em>
Making controllers with robust error handling is outside of the scope of this tutorial,
but try to avoid `!!` in Kotlin unless you're sure about what you're doing.
</em></small>

## Creating roles
Now that we have our functionality, we need to define a set of roles for our system.
This is done by implementing the `Role` interface from `io.javalin.security.Role`.
We'll define three roles, one for "anyone", one for permission to read user-data,
and one for permission to write user-data.

```kotlin
enum class ApiRole : Role { ANYONE, USER_READ, USER_WRITE }
```

## Setting up the API
Now that we have roles, we can implement our endpoints:

```kotlin
import io.javalin.ApiBuilder.*
import io.javalin.Javalin
import io.javalin.security.Role.roles

fun main(vararg args: String) {

    val app = Javalin.create().apply {
        accessManager(Auth::accessManager)
    }.start();

    app.routes {
        path("users") {
            get(UserController::getAllUserIds, roles(ApiRole.ANYONE))
            get(UserController::createUser, roles(ApiRole.USER_WRITE))
            path(":user-id") {
                get(UserController::getUser, roles(ApiRole.USER_READ))
                patch(UserController::updateUser, roles(ApiRole.USER_WRITE))
                delete(UserController::deleteUser, roles(ApiRole.USER_WRITE))
            }
        }
    }

}
```

A role has now been given to every endpoint:
* `ANYONE` can `getAllUserIds`
* `USER_READ` can `getUser`
* `USER_WRITE` can `createUser`, `updateUser` and `deleteUser`

Now, all that remains is to implement the access-manager (`Auth::accessManager`).

## Implementing auth

The `AccessManager` interface in Javalin is pretty simple.
It takes a `Handler` a `Context` and a list of `Role`s.
The idea is that you implement code to run the handler
based on what's in the context, and what roles are set for the endpoint.

The rules for our access manager are also simple:
* When endpoint has `ApiRole.ANYONE`, all requests will be handled
* When endpoint has another role set and the request has matching credentials, the request will be handled
* Else we ignore the request and send `401 Unauthorized` back to the client

This translates nicely into Kotlin:
```kotlin
fun accessManager(handler: Handler, ctx: Context, permittedRoles: List<Role>) {
    when {
        permittedRoles.contains(ApiRole.ANYONE) -> handler.handle(ctx)
        ctx.userRoles.any { it in permittedRoles } -> handler.handle(ctx)
        else -> ctx.status(401).json("Unauthorized")
    }
}
```

We're not done though. There is no `ctx.userRoles` concept in Javalin,
so we need to implement a way of getting user-roles from the context.
We'll create a `Pair<String, String>, List<Role>` map where the `Pair` contains the
username and password in cleartext (please don't do this for a real service). Then we'll
get the username/password from the [Basic-auth-header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#Basic_authentication_scheme)
and use them as a key to access roles from our map:


```kotlin
private val userRoleMap = hashMapOf(
        Pair("alice", "weak-password") to listOf(ApiRole.USER_READ),
        Pair("bob", "better-password") to listOf(ApiRole.USER_READ, ApiRole.USER_WRITE)
)

private val Context.userRoles: List<ApiRole>
    get() = try {
        val credentials = String(Base64.getDecoder().decode(this.header("Basic")!!.removePrefix("Basic "))).split(":")
        userRoleMap[Pair(credentials[0], credentials[1])] ?: listOf()
    } catch (e: Exception) {
        listOf()
    }
```
