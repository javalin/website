---
layout: tutorial
official: true
title: "Creating a secure REST API in Javalin"
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
date: 2017-08-24
permalink: /tutorials/auth-example
github: https://github.com/javalin/javalin-samples/tree/main/javalin5/javalin-auth-example
summarytitle: Secure your endpoints!
summary: Learn how to secure your endpoints using Javalin's AccessManager interface
language: ["java", "kotlin"]
---

## Dependencies

First, we need to create a Maven project with some dependencies: [(→ Tutorial)](/tutorials/maven-setup)

~~~markup
<dependencies>
    <dependency>
        <groupId>io.javalin</groupId>
        <artifactId>javalin-bundle</artifactId>
        <version>{{site.javalinversion}}</version>
    </dependency>
</dependencies>
~~~

## Creating controllers
We need something worth protecting.
Let's pretend we have a very important API for manipulating a user database.
We make a controller-object with some dummy data and CRUD operations:

{% capture java %}
import io.javalin.http.Context;
import java.util.*;

public class UserController {
    public record User(String name, String email) {}

    private static final Map<String, User> users;

    static {
        var tempMap = Map.of(
            randomId(), new User("Alice", "alice@alice.kt"),
            randomId(), new User("Bob", "bob@bob.kt"),
            randomId(), new User("Carol", "carol@carol.kt"),
            randomId(), new User("Dave", "dave@dave.kt")
        );
        users = new HashMap<>(tempMap);
    }

    public static void getAllUserIds(Context ctx) {
        ctx.json(users.keySet());
    }

    public static void createUser(Context ctx) {
        users.put(randomId(), ctx.bodyAsClass(User.class));
    }

    public static void getUser(Context ctx) {
        ctx.json(users.get(ctx.pathParam("userId")));
    }

    public static void updateUser(Context ctx) {
        users.put(ctx.pathParam("userId"), ctx.bodyAsClass(User.class));
    }

    public static void deleteUser(Context ctx) {
        users.remove(ctx.pathParam("userId"));
    }

    private static String randomId() {
        return UUID.randomUUID().toString();
    }
}
{% endcapture %}
{% capture kotlin %}
import io.javalin.http.Context
import io.javalin.http.bodyAsClass
import java.util.*

object UserController {

    private data class User(val name: String = "", val email: String = "")

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
        users[randomId()] = ctx.bodyAsClass()
    }

    fun getUser(ctx: Context) {
        ctx.json(users[ctx.pathParam("userId")]!!)
    }

    fun updateUser(ctx: Context) {
        users[ctx.pathParam("userId")] = ctx.bodyAsClass()
    }

    fun deleteUser(ctx: Context) {
        users.remove(ctx.pathParam("userId"))
    }

    private fun randomId() = UUID.randomUUID().toString()

}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

<small><em>We're using `!!` to convert nullables to non-nullables.
If `{user-id}` is missing or `users[id]` returns null, we'll get a NullPointerException
and our application will crash. Handling this is outside the scope of the tutorial.</em></small>

## Creating roles
Now that we have our functionality, we need to define a set of roles for our system.
This is done by implementing the `Role` interface from `io.javalin.security.Role`.
We'll define three roles, one for "anyone", one for permission to read user-data,
and one for permission to write user-data.


{% capture java %}
enum Role implements RouteRole { ANYONE, USER_READ, USER_WRITE }
{% endcapture %}
{% capture kotlin %}
enum class Role : RouteRole { ANYONE, USER_READ, USER_WRITE }
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Setting up the API
Now that we have roles, we can implement our endpoints:

{% capture java %}
import io.javalin.Javalin;
import io.javalin.apibuilder.ApiBuilder.*;

public class Main {

    public static void main(String[] args) {

        Javalin app = Javalin.create(config -> {
            config.accessManager(Auth::accessManager);
        }).routes(() -> {
            get("/", ctx -> ctx.redirect("/users"), Role.ANYONE);
            path("users", () -> {
                get(UserController::getAllUserIds, Role.ANYONE);
                post(UserController::createUser, Role.USER_WRITE);
                path("{userId}", () -> {
                    get(UserController::getUser, Role.USER_READ);
                    patch(UserController::updateUser, Role.USER_WRITE);
                    delete(UserController::deleteUser, Role.USER_WRITE);
                });
            });
        }).start(7070);
    }
}
{% endcapture %}
{% capture kotlin %}
import io.javalin.apibuilder.ApiBuilder.*
import io.javalin.Javalin

fun main() {

    Javalin.create{
        it.accessManager(Auth::accessManager)
    }.routes {
        get("/", { ctx -> ctx.redirect("/users") }, Role.ANYONE)
        path("users") {
            get(UserController::getAllUserIds, Role.ANYONE)
            post(UserController::createUser, Role.USER_WRITE)
            path("{userId}") {
                get(UserController::getUser, Role.USER_READ)
                patch(UserController::updateUser, Role.USER_WRITE)
                delete(UserController::deleteUser, Role.USER_WRITE)
            }
        }
    }.start(7070)

}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

A role has now been given to every endpoint:
* `ANYONE` can `getAllUserIds`
* `USER_READ` can `getUser`
* `USER_WRITE` can `createUser`, `updateUser` and `deleteUser`

Now, all that remains is to implement the access-manager (`Auth::accessManager`).

## Implementing auth

The `AccessManager` interface in Javalin is pretty simple.
It takes a `Handler` a `Context` and a set of `Role`s.
The idea is that you implement code to run the handler
based on what's in the context, and what roles are set for the endpoint.

The rules for our access manager are also simple:
* When endpoint has `ApiRole.ANYONE`, all requests will be handled
* When endpoint has another role set and the request has matching credentials, the request will be handled
* Else we ignore the request and send `401 Unauthorized` back to the client

This translates nicely into code:
{% capture java %}
public static void accessManager(Handler handler, Context ctx, Set<RouteRole> permittedRoles) {
    if (permittedRoles.contains(Role.ANYONE)) {
        handler.handle(ctx);
        return;
    }
    if (ctx.userRoles().stream().anyMatch(permittedRoles::contains)) {
        handler.handle(ctx);
        return;
    }   
    ctx.header(Header.WWW_AUTHENTICATE, "Basic");
    throw new UnauthorizedResponse();
}
{% endcapture %}
{% capture kotlin %}
fun accessManager(handler: Handler, ctx: Context, permittedRoles: Set<RouteRole>) {
    when {
        permittedRoles.contains(Role.ANYONE) -> handler.handle(ctx)
        ctx.userRoles.any { it in permittedRoles } -> handler.handle(ctx)
        else -> {
            ctx.header(Header.WWW_AUTHENTICATE, "Basic")
            throw UnauthorizedResponse();
        }
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Extracting user-roles from the context
There is no `ctx.userRoles` concept in Javalin, so we need to implement it.
First we need a user-table. We'll create a `map(Pair<String, String>, Set<Role>)` where keys are
username+password in cleartext (please don't do this for a real service), and values are user-roles:

{% capture java %}
public record Pair(String user, String password) {}
private static final Map<Pair, List<Role>> userRolesMap = Map.of(
    new Pair("alice", "weak-1234"), List.of(Role.USER_READ),
    new Pair("bob", "weak-123456"), List.of(Role.USER_READ, Role.USER_WRITE)
);
{% endcapture %}
{% capture kotlin %}
private val userRolesMap = mapOf(
    Pair("alice", "weak-1234") to listOf(Role.USER_READ),
    Pair("bob", "weak-123456") to listOf(Role.USER_READ, Role.USER_WRITE)
)
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Now that we have a user-table, we need to authenticate the requests.
We do this by getting the username+password from the [Basic-auth-header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#Basic_authentication_scheme)
and using them as keys for the `userRoleMap`:

{% capture java %}
public static List<Role> getUserRoles(Context ctx) {
    return Optional.ofNullable(ctx.basicAuthCredentials())
        .map(credentials -> userRolesMap.getOrDefault(new Pair(credentials.getUsername(), credentials.getPassword()), List.of()))
        .orElse(List.of());
}
{% endcapture %}
{% capture kotlin %}
private val Context.userRoles: List<Role>
    get() = this.basicAuthCredentials()?.let { (username, password) ->
        userRolesMap[Pair(username, password)] ?: listOf()
    } ?: listOf()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

<small><em>
When using basic auth, credentials are transferred as plain text (although base64-encoded).
**Remember to enable SSL if you're using basic-auth for a real service.**
</em></small>

## Conclusion
This tutorial showed one possible way of implementing an `AccessManager` in Javalin, but
the interface is very flexible and you can really do whatever you want:
```kotlin
app.accessManager(handler, ctx, permittedRoles) -> {
    when {
        ctx.host().contains("localhost") -> handler.handle(ctx)
        Math.random() > 0.5 -> handler.handle(ctx)
        dayOfWeek == Calendar.SUNDAY -> handler.handle(ctx)
        else -> ctx.status(401).json("Unauthorized")
    }
};
```
