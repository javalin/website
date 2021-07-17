---
layout: blogpost
category: blog
date: 2021-07-17
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
title: Static methods within lambdas
summary: A quick look at Javalin's unique static-but-not-really-static API
permalink: /blog/static-methods-within-lambdas
---

## Background

Before I started working on Javalin, I was working on the [Sparkjava](https://sparkjava.com/)
framework. For those who don't know, Sparkjava is a very popular static-first DSL for
creating webserver, and the getting-started snippet on the website is:

```java
import static spark.Spark.*;

public class HelloWorld {
    public static void main(String[] args) {
        get("/hello", (req, res) -> "Hello World");
    }
}
```

I believe this simplicity is the main reason for why Sparkjava became so popular.
At the same time, it was also one of the things that caused the most confusion and annoyance for
more advanced users. These users often wanted to create more than one Spark app per JVM, or
they wanted to start and stop multiple Spark apps for tests.

When I started working on Javalin, I didn't want it to have any global static state,
but I also didn't want to lose what made Spark apps so easy to write and read. I needed
to transform Sparkjava's elegant way of building APIs from operating on a global static
class, to operating on an instance.

In Sparkjava, you can declare routes in nested paths:

```java
path("/api", () -> {
    get("/users", UserController::getAll);
    post("/users", UserController::create);
    path("/users", () -> {
        get("/:user-id", UserController::getOne);
        patch("/:user-id", UserController::update);
        delete("/:user-id", UserController::delete);
    });
});
```

The way the `path` method works is by pushing the string `path` onto a stack
(technically a `Deque`), and popping it after the runnable `() -> {}` is finished.
Everything is static, and all the methods inside are prefixed with the paths that
are currently on the stack. Since everything is static, this all works out nicely.

One way to solve this without using statics would be to move everything to a
Javalin instance, in which case you would end up with the following:

```java
Javalin server = Javalin.create();
server.path("/api", () -> {
    server.get("/users", UserController::getAll);
    server.post("/users", UserController::create);
    server.path("/users", () -> {
        server.get("/:user-id", UserController::getOne);
        server.patch("/:user-id", UserController::update);
        server.delete("/:user-id", UserController::delete);
    });
});
```

Here the `Javalin` instance has a path-stack, and things are more or less okay. One downside is that
the Javalin API can't be fluent (we need the `server` reference), and that the `server` prefix is bit noisy.
To make it fluent, we could provide the `Javalin` instance to `path`, but you would quickly run into a problem:

```java
Javalin.create().path("/api", server -> {
    server.get("/users", UserController::getAll);
    server.path("/users", server2 -> { // server is taken, also, which one should we use?
        server.get("/:user-id", UserController::getOne);
    });
});
```

This isn't ideal either. We end up with multiple conflicting names for the same variable. So, now what?

## Static methods inside a lambda?

The way to declare a crud API in Javalin is:

```java
import io.javalin.Javalin;
import static io.javalin.apibuilder.ApiBuilder.*;

Javalin.create(config -> {
    config.enableCorsForAllOrigins();
}).routes(() -> {
    path("users", () -> {
        get(UserController::getAll);
        post(UserController::create);
        path(":user-id", () -> {
            get(UserController::getOne);
            patch(UserController::update);
            delete(UserController::delete);
        });
    });
}).start(port);
```

We're back to using static methods, but they are actually operating on an instance!
These static methods only work in the scope of a `Javalin#routes` call, which works like this:

```java
public Javalin routes(@NotNull EndpointGroup endpointGroup) {
    ApiBuilder.setStaticJavalin(this);
    endpointGroup.addEndpoints();
    ApiBuilder.clearStaticJavalin();
    return this;
}
```

Where `EndpointGroup` is just a fancy name for `Runnable`. The method sets a temporary
static `Javalin`, adds the user-defined routes, and clears the static `Javalin`.
The `ApiBuilder` has a `ThreadLocal<Javalin>` and a `ThreadLocal<Deque<String>>`.
Inside the `ApiBuilder`, the `Javalin` instance is accessed through a getter which throws
`IllegalStateException("The static API can only be used within a routes() call.");`
if the `ApiBuilder` is called incorrectly.

That's pretty much it for this post. We are using static methods, but they all operate on an instance.
They are more like util methods (`Util.get(app, route)`) with a fancy syntax than global state.

This is similar to the functionality you can get from languages like Kotlin,
where you could write:

```kotlin
val server = Javalin.create()
with(server) {
    path("users") {
        get(UserController::getAll)
            ...
        }
    }
}
```

I don't think this is a pattern that is super useful in every day application logic,
but I think it's worth knowing about if you're designing a library. I think not having
to prefix your routes with `server`, `router`, etc, definitely helps with making Javalin
apps more readable.

I've made a [GitHub issue](https://github.com/javalin/javalin.github.io/issues/105)
if anyone wants to discuss this post.
