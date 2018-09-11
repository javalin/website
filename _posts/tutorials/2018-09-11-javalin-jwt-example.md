---
layout: tutorial
title: "Using JWT with a Javalin application"
author: <a href="https://github.com/kmehrunes" target="_blank">Khaled Y.M.</a>
date: 2017-09-22
permalink: /tutorials/websocket-example
github: https://github.com/tipsy/javalin-websocket-example
summarytitle: WebSockets chat application
summary: Learn how to create a simple chat-app with WebSockets in Java
language: java
---

This is a simple tutorial on how to integrate JWT into a Javalin application. 
It relies on an extension which can be found [here](https://github.com/kmehrunes/javalin-jwt).

## What You Will Learn
In this tutorial we will introduce the extension and what it provides, then we will 
show a basic use, and finally we will go a bit deeper and use some components 
provided by the extension. The tutorial assumes that you know what JWTs are. If you 
do not, then you can check [this post](https://jwt.io/introduction/) for an easy but 
quite thorough introduction.

## Dependencies
Currently there is no Maven dependency to get the extension directly; you need to 
pull the source code. There should be one ready soon, and this tutorial will be 
updated accordingly.

The extension itself depends on [Auth0 Java JWT library](https://github.com/auth0/java-jwt).

## The Extension
**Note: it is recommended that you familiarize yourself with Auth0 Java JWT first**
The extension itself is quite small, and it provides three things:
- Helper functions for Javalin Context to make working with JWTs easier, 
includes: extracting tokens from authorization headers, adding/getting tokens 
to/from cookies, and adding decoded JWT objects to contexts for future handlers 
to use

- Decode helpers which take care of extracting, validating, and adding decoded 
objects to the context for you

- An access manager

There is no requirement to use all parts of the extension, you can use only 
the parts you need for your particular case.

## Preliminary Steps
For any use of the extension, we need what we call a JWT provider (for lack of
a better word). A provider is a somewhat convient way of working with JWT which 
wraps a generator and a verifier. Where A generator implements the functional 
interface JWTGeneratr, and a verifier which is the normal Auth0 JWTVerifier.

Before being able to create a provider, we first need to have: a user class,
a generator, and a verifier. For the sake of this tutorial we will assume the 
following class as our user class:
```java
class MockUser {
    String name;
    String level;

    MockUser(String name, String level) {
        this.name = name;
        this.level = level;
    }
}
```

Now we can create our JWT provider as follows:
```java
//1.
Algorithm algorithm = Algorithm.HMAC256("very_secret");

//2.
JWTGenerator<MockUser> generator = (user, alg) -> {
            JWTCreator.Builder token = JWT.create()
                    .withClaim("name", user.name)
                    .withClaim("level", user.level);
            return token.sign(alg);
        };

//3.
JWTVerifier verifier = JWT.require(algorithm).build();

//4.
JWTProvider provider = JWTProvider(algorithm, generator, verifier);
```
1) First we initialize the algorithm we are going to use. In our 
case we chose HMAC256 but feel free to try other variants. Tip: 
if you are separating the application into services where only 
one service will issue the tokens then consider using an asymetric 
algorithm like RSA.

2) In the second step we create our JWT generator. It implements 
a function which takes an object and algorithm to generate a token 
with a set of claims and returns the token signed.

3) In the third step we create a verifier using the builder 
provided by Auth0. In our case we only have the algorithm 
but there are many more to be added depending on your case.

4) We finally create our provider which we will use throughout the 
rest of this tutorial.

## Basic Example
Now that we have everything ready, we can finally start using 
the provider in our application. We will create a simple application 
which only has two routes: */generate* and */validate*.

```java
//
// .. create your Javalin app ...
//
Handler generateHandler = context -> {
    MockUser mockUser = new MockUser("Mocky McMockface", "user");
    String token = provider.generateToken(mockUser);
    context.json(new JWTResponse(token));
};

Handler validateHandler = context -> {
    Optional<DecodedJWT> decodedJWT = JavalinJWT.getTokenFromHeader(context)
                                                  .flatMap(provider::validateToken);

    if (!decodedJWT.isPresent()) {
        context.status(401).result("Missing or invalid token");
    }
    else {
        context.result("Hi " + decodedJWT.get().getClaim("name").asString());
    }
};

app.get("/generate", generateHandler);
app.get("/validate", validateHandler);
```

Now if you visit /generate, you'll get a JWT for the created user. Then you 
need to put that token in an authorization header with "Bearer" scheme and 
issue a request to /validate.
