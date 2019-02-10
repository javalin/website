---
layout: tutorial
title: "Using Javalin with Java to create a simple CRUD REST API"
author: <a href="https://www.linkedin.com/in/brunolellis" target="_blank">Bruno Lellis</a>
date: 2019-01-27
permalink: /tutorials/simple-java-example
github: https://github.com/brunolellis/javalin-java-example
summarytitle: Java CRUD REST API
summary: Using Javalin with Java to create a simple CRUD REST API.
language: java
---

## What You Will Learn

* Setting up Java with Maven
* Creating a Javalin/Java CRUD REST API (no database)

> Note: this guide is totally based on its [Kotlin version here](/tutorials/simple-java-example).

The instructions for this tutorial will focus on IntelliJ IDEA, as it's made by JetBrains.
We recommend downloading the free [community edition](https://www.jetbrains.com/idea/download) of IDEA while following this tutorial, but you can use any other IDE or editor (do not miss the opportunity to read the [Visual Studio Code for Java: The Ultimate Guide 2019 by Bruno Borges](https://blog.usejournal.com/visual-studio-code-for-java-the-ultimate-guide-2019-8de7d2b59902)).

## Setting up Java with Maven (in IntelliJ IDEA)


 * `File` `->` `New` `->` `Project`
 * `Maven` `->` Skip `Create from archetype` `->` `Next`
 * Follow the instructions and pick a project GroupId and ArtifactId
 * Create `src/main/java/app/Main.java`

<div class="comment">
You'll have to point to the file (not class) containing this main function (not method)
from your pom.xml if you want to build a jar. Doing this is not necessary for this tutorial,
but the code on GitHub demonstrates how to do it for those interested.
</div>

## Using Javalin with Java

Add the dependency:

{% include macros/mavenDep.md %}

And paste the "Hello world" example:

~~~java
package app;
import io.javalin.Javalin;
public class Main {
    public static void main(String[] args) {
        Javalin app = Javalin.create().start(7000);
        app.get("/", ctx -> ctx.result("Hello World"));
    }
}
~~~

## Creating a Javalin/Java CRUD microservice

### Data-classes

Kotlin has a really neat feature called
[Data classes](https://kotlinlang.org/docs/reference/data-classes.html).
To create a data class you just have to write:

We are going to use [Lombok @Value](https://projectlombok.org/features/Value.html) to get similar to Kotlin `val` behavior, like immutable class, toString, equals and hashCode.

Add Lombok dependency:
~~~xml
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.4</version>
            <scope>provided</scope>
        </dependency>
~~~

~~~java
package user;
import lombok.Value;

@Value
public class User {
    private Integer id;
    private String name;
    private String email;
}
~~~

### Initializing some data
Let's initialize our fake user-database with four users:

~~~java
private static final Map<Integer, User> users = new ConcurrentHashMap<>();

static {
        users.put(1, new User(1, "Bruno", "bruno@lellis.com"));
        users.put(2, new User(2, "Steve", "steve@jobs.com"));
        users.put(3, new User(3, "Bill", "bill@gates.com"));    
        users.put(4, new User(4, "John", "john@doe.com"));
}
~~~

### Creating a data access object
We need to be able to read out data somehow, so let's set up some
basic CRUD functionality, with one added function for finding user by email:

~~~java
package user.repository;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import user.User;

public class UserRepository {

    private static final Map<Integer, User> users = new ConcurrentHashMap<>();

    private AtomicInteger lastId;

    static {
        users.put(1, new User(1, "Bruno", "bruno@lellis.com"));
        users.put(2, new User(2, "John", "john@doe.com"));
        users.put(3, new User(3, "Steve", "steve@jobs.com"));
        users.put(4, new User(4, "Bill", "bill@gates.com"));
    }
    
    public UserRepository() {
        lastId = new AtomicInteger(users.size());
    }

    public User save(User user) {
        var id = lastId.incrementAndGet();
        users.put(id, new User(id, user.getName(), user.getEmail()));
        return users.get(id);
    }

    public Collection<User> findAll() {
        return users.values();
    }

    public Optional<User> findById(Integer id) {
        return Optional.ofNullable(users.get(id));
    }

    public Optional<User> findByEmail(String email) {
        return users.values().stream()
                .filter(user -> email.equals(user.getEmail()))
                .findFirst();
    }

    public void update(Integer id, User user) {
        users.put(id, new User(id, user.getName(), user.getEmail()));
    }

    public void delete(Integer id) {
        users.remove(id);
    }

}
~~~

### Creating the REST API

~~~java
package user.api;

import java.util.Optional;

import user.User;
import user.repository.UserRepository;

import io.javalin.Context;
import io.javalin.apibuilder.CrudHandler;

public class UserController implements CrudHandler {

    private UserRepository users;

    public UserController(UserRepository users) {
        this.users = users;
    }

    @Override
    public void create(Context ctx) {
        var user = ctx.bodyAsClass(User.class);
        var newUser = users.save(user);
        ctx.json(newUser);
        ctx.status(201);
    }

    @Override
    public void delete(Context ctx, String id) {
        users.delete(Integer.valueOf(id));
        ctx.status(204);
    }

    @Override
    public void getAll(Context ctx) {
        ctx.json(users.findAll());
    }

    @Override
    public void getOne(Context ctx, String id) {
        Optional<User> user = users.findById(Integer.valueOf(id));
        handleOptionalResponse(ctx, user);
    }

    public void findByEmail(Context ctx, String email) {
        Optional<User> user = users.findByEmail(email);
        handleOptionalResponse(ctx, user);
    }

    private void handleOptionalResponse(Context ctx, Optional<User> user) {
        user.map(ctx::json)
                .orElse(ctx.status(404));
    }

    @Override
    public void update(Context ctx, String id) {
        var user = ctx.bodyAsClass(User.class);
        users.update(Integer.valueOf(id), user);
        ctx.status(204);
    }

}
~~~

And finally, let's change the Main App to bootstrap Javalin:

~~~java
package app;

import io.javalin.Javalin;
import user.api.UserController;
import user.repository.UserRepository;

import static io.javalin.apibuilder.ApiBuilder.crud;
import static io.javalin.apibuilder.ApiBuilder.get;

public class Main {
    public static void main(String[] args) {
        var users = new UserRepository();

        Javalin app = Javalin.create().start(7000);
        app.routes(() -> {
            UserController usersHandler = new UserController(users);

            crud("/users/:user-id", usersHandler);

            get("/users/email/:email", ctx -> {
                usersHandler.findByEmail(ctx, ctx.pathParam("email"));
            });
        });

        app.get("/", ctx -> ctx.result("Hello World"));
    }
}
~~~

And that's the final `pom.xml` dependencies to wrap everything up:

~~~xml
    <dependencies>
        <dependency>
            <groupId>io.javalin</groupId>
            <artifactId>javalin</artifactId>
            <version>2.6.0</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.9.8</version>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-simple</artifactId>
            <version>1.7.25</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.4</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
~~~

## Testing

Commands using [httpie](https://www.cheatography.com/clucinvt/cheat-sheets/httpie/) to test the REST api:

- return all users: `http localhost:7000/users`
- return specific user: `http localhost:7000/users/1`
- return specific user by its email: `http localhost:7000/users/email/bruno@bruno.com`
- create user: `http POST localhost:7000/users "name=Ayrton Senna" email=ayrton@senna.com`
- update user: `http PATCH localhost:7000/users/3 "name=Steve Jobs"`
- delete user: `http DELETE localhost:7000/users/5`

## Full version

You can check the complete project [here](https://github.com/brunolellis/javalin-java-example)
