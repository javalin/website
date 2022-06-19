---
layout: tutorial
official: false
title: Using Javalin as a simulator for HTTP-based APIs
author: <a href="https://twitter.com/lsoares" target="_blank">Luís Soares</a>
date: 2021-07-11
permalink: /tutorials/using-javalin-as-http-simulator
github: https://github.com/lsoares/clean-architecture-sample
summarytitle: Javalin as a simulator for HTTP-based APIs
summary: Let's learn how you can test that your app is properly consuming an external REST API making use of Javalin as
  a simulator of HTTP APIs that your app depends upon.
language: kotlin
---

_This tutorial was first published on
[Medium.com](https://medium.com/@lsoares/unit-testing-a-gateway-with-javalin-24e3b7e88ef2)
and adapted by its author._

My proposal is to use Javalin as the test double - fake gateway, thereby replacing some depended-on external API. We’ll
launch Javalin acting as the real API but running in *localhost* so that the gateway client
(the test subject) can’t tell the difference. We’ll confirm the tests validity by asserting the calls made to the test
double.

Let's imagine a client that talks to some external HTTP API service - in our case some "User Profile API". We’ll have
two examples of (unit) testing `ProfileGateway`: a query and a command, according to the
[command/query](https://martinfowler.com/bliki/CommandQuerySeparation.html) separation:

- **query**: check that it properly consumes a GET response from an external party; we’ll assert the output of a method;

- **command**: check that a POST call was made as expected; we’ll assert a consequence, namely the posted body.

Before starting, make sure you have Javalin in your Gradle file. If you’re using Javalin as your app web server, you
won’t add extra libraries for testing. Otherwise, you need to include it only for the tests. Also, let's
add [JSONassert](https://github.com/skyscreamer/JSONassert) library to make JSON comparison easier, although that's not
mandatory as we could compare it in other ways.

```kotlin
testImplementation("io.javalin:javalin:3.+")
testImplementation("org.skyscreamer:jsonassert:1.+")
```

Let's start with a boilerplate that guarantees that Javalin stops per every test (or tests will start to influence each
other due to used ports):

```kotlin
class ProfileGatewayTest {

    private lateinit var fakeProfileApi: Javalin

    @AfterEach
    fun `after each`() {
        fakeProfileApi.stop()
    }
}
```

Don’t worry as this won’t make your tests slow; Javalin is extremely fast booting up
(hundreds of start/stops in a second).

I won't include the implementations because this tutorial is focused on testing. If you're curious, you can find them at
a [sample project](https://github.com/lsoares/clean-architecture-sample) I have for experiments (search
for `profilegateway`).

## Example #1: testing a GET to an API

Let’s say your app depends on an external API to fetch the user’s profile — a query. We need to test
that `ProfileGateway` handles it well, namely the parsing and proper transformation of data.

```kotlin
@Test
fun `gets a user profile by id`() {
    fakeProfile = Javalin.create().get("profile/abc") {
        it.json(mapOf("id" to "abc", "email" to "x123@gmail.com"))
    }.start(1234)
    val profileGateway = ProfileGateway(apiUrl = "http://localhost:1234")

    val result = profileGateway.fetchProfile("abc")

    assertEquals(Profile(id = "abc", email = "x123@gmail.com".toEmail()), result)
}
```

### General recipe

Notice that we have [three parts](http://wiki.c2.com/?ArrangeActAssert) in the code above:

- **arrange**: prepare Javalin with a single handler only to simulate your external API endpoint; inside the handler,
  write a stubbed response as if you were the API owner;
- **act**: call the subject method that fetches the data;
- **assert**: test that your subject correctly parsed the stubbed response (API JSON → your domain representation);
  optionally, you can check the number of calls and HTTP details (e.g. if you sent the proper headers).

## Example #2: testing a POST to an API

Now we’ll see an example of a command — there’s a side-effect to be tested. In this case, we need to assert that the
data was properly prepared and posted to the third party by the `ProfileGateway`. The HTTP call details can be tested as
well.

```kotlin
@Test
fun `posts a user profile`() {
    var postedBody: String? = null
    var contentType: String? = null
    fakeProfileApi = Javalin.create().post("profile") {
        postedBody = it.body()
        contentType = it.contentType()
        it.status(201)
    }.start(1234)
    val profileGateway = ProfileGateway(apiUrl = "http://localhost:1234")

    profileGateway.saveProfile(
        Profile(id = "abc", email = "john.doe@gmail.com".toEmail())
    )

    JSONAssert.assertEquals(
        """ { "id": "abc", "email": "johndoe@gmail.com" } """,
        postedBody, true
    )
    assertEquals("application/json", contentType)
}
```

### General recipe

- **arrange**: prepare Javalin with a single handler only to simulate your external API endpoint; inside the handler,
  store what you want to assert later, like path, headers, and body;
- **act**: call the subject method that executes the side-effect;
- **assert**: test that the stored values in the handler are correct; for example, the body must have been properly
  converted to the external API (your domain representation → API JSON).

⚠️ Whatever you do, never do assertions inside the Javalin test `Handler`. Why? Because JUnit works by throwing exceptions,
and Javalin `Handler`s are wrapped in an exception-handler (Javalin returns a HTTP 500 error for uncaught exceptions). This means
that JUnit exceptions will be transformed into HTTP 500 errors, which JUnit considers a success!
Always do the assertions in the end, hence following the Arrange, Act, Assert pattern.

## Making it generic

Notice that we have the server as a global variable (bad practice), we have to start it in every test, and stop it after
each. If you think you'll do more that just a few test variations, it's worth getting rid of that boilerplate code.
Let's create a reusable utility that starts the fake gateway and initializes our test subject:

```kotlin
fun testProfileGateway(testBody: (Javalin, ProfileGateway) -> Unit) {
    val server = Javalin.create().start(0)
    val gatewayClient = ProfileGateway(apiUrl = "http://localhost:${server.port()}")
    testBody(server, gatewayClient)
    server.stop()
}
```

Let's make use of it:

```kotlin
@Test
fun `gets a user profile by id`() = testProfileGateway { server, gatewayClient ->
    server.get("profile/abc") {
        it.json(mapOf("id" to "abc", "email" to "x123@gmail.com"))
    }

    val result = gatewayClient.fetchProfile("abc")

    assertEquals(Profile(id = "abc", email = "x123@gmail.com".toEmail()), result)
}

@Test
fun `posts a user profile`() = testProfileGateway { server, profileGateway ->
    var postedBody: String? = null
    var contentType: String? = null
    server.post("profile") {
        postedBody = it.body()
        contentType = it.contentType()
        it.status(201)
    }

    profileGateway.saveProfile(Profile(id = "abc", email = "x123@gmail.com".toEmail()))

    JSONAssert.assertEquals(
        """ { "id": "abc", "email": "x123@gmail.com"}  """,
        postedBody, true
    )
    assertEquals("application/json", contentType)
}
```

Another benefit of this approach is that we hide some low-level details like startup of the fake server and its base URL
and port. We focus our test on what really matters.

ℹ️ This approach in inspired by [javalin-testtools](https://github.com/javalin/javalin/tree/master/javalin-testtools),
which will be available in Javalin 4.

## Alternative approaches

It’s important to mention alternatives to the Javalin proposal. The decision depends on your testing strategy.

- 🛑 **Mocking the HTTP client** (e.g., with Mockito, MockK, HttpClientMock)
  You’d be mocking what you don’t own; would you mock a database driver? Mocking a REST client would be as bad. You’d
  couple the test with the HTTP client, which is an implementation detail. With Javalin, it doesn’t matter which REST
  client you use in your implementation (Java HTTP client, Apache HTTP Client, Retrofit, etc).
- **Mocking a wrapper around the HTTP client**
  You’re creating just an additional pass-through layer. Also, you’re not emulating HTTP anyway. Finally, you’re not
  abstracting the external party data model. Using Javalin, you have the (localhost) network involved, so it’s much more
  realistic. For example, it’s trivial to simulate network errors (e.g., 401 Unauthorized) to see how your system
  handles them.
- **Using a simulator for HTTP-based APIs** (e.g., MockServer or WireMock)
  The same technique as the Javalin proposal but with a dedicated library with a built-in DSL. I tried both and ended up
  replacing them with Javalin because I didn’t want to learn their DSL. I was already using Javalin in my app anyway. In
  addition, when a test fails, Javalin makes it easier to fix it.
- **Integration, system, contract, and end-to-end testing**. These are complementary to unit testing and they do not
  replace it.
