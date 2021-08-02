---
layout: blogpost
category: blog
date: 2021-08-02
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
title: Number of imports and library usability
summary: Can you use the number of imports a library requires to measure its usability?
permalink: /blog/number-of-imports-and-library-usability
---

## Background

When I was working on the first version Javalin, I was hanging out in the Kotlin Slack,
where I got talking to the Ktor Developers
(Ktor is Jetbrains' official server/client library for Kotlin).

We were discussing API design, and I mentioned how I didn't like setting up a Ktor server, simply
because of how many imports there where. This statement was met with confusion and bafflement in
the Slack channel, so I thought it could make for an interesting blogpost.

## What's wrong with imports?
Well, let's just use Ktor as example. If you visit https://ktor.io,
you will see the following snippet:

```kotlin
fun main() {
	embeddedServer(Netty, port = 8000) {
		routing {
			get ("/") {
				call.respondText("Hello, world!")
			}
		}
	}.start(wait = true)
}
```

This code doesn't compile, since the imports have been omitted (maybe they took up too much space?).
Let's find an example, with imports, that can serialize JSON.

```kotlin
import com.ryanharter.ktor.moshi.moshi
import io.ktor.application.call
import io.ktor.application.install
import io.ktor.features.ContentNegotiation
import io.ktor.response.respond
import io.ktor.routing.get
import io.ktor.routing.routing
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty

val someData = setOf<String>()

fun main(args: Array<String>) {
  val server = embeddedServer(Netty, 8080) { // create server
    install(ContentNegotiation) {
      moshi
    }
    routing { // attach endpoint
      get("/data") { // attach endpoint
        call.respond(someData) // send json
      }
    }
  }
  server.start(wait = true) // start server
}
```

So, that's a lot of imports (nine, to be exact). That in and of itself isn't necessarily bad,
*but how is the developer supposed to know about these functions?*
How does someone find out that there is a `call`, a `Netty`, a `routing`, and an `embeddedServer`?
The only real way is by looking at the docs and examples
(where in Ktor's case, imports are usually omitted - I wasn't actually able to find a
complete example like this in Ktor's docs, I had to search through GitHub).

## What's the alternative?
Let's compare the previous snippet to declaring a JSON endpoint in Javalin:

```kotlin
import io.javalin.Javalin

val someData = setOf<String>()

fun main() {
    Javalin.create() // create server
        .get("/") { ctx -> ctx.json(someData) } // attach endpoint that serves json
        .start(7000) // start server
}
```

Just one import! Javalin operates with two main objects, `Javalin` (your app), and
`Context` (your context for each HTTP request).
If a Javalin user wants to configure a custom server,
(like in the Ktor example above), they can do it through

```kotlin
Javalin.create { config ->
    config.server { ... }
}
```

In my opinion, there is no need to require the user to import a specific
method for each configuration option. If you hit `CTRL+SPACE` on a `JavalinConfig`
object, you'll be able to see all the possible config options Javalin offers.
If you're looking for `server`, you'll also notice the other config options,
thereby learning about features you aren't even using yet.

Similarly, if a user wants to send some JSON, they do it through `Context#json`.
While finding this method, they are likely to notice the other options available
on `Context`, like `status`, `queryParam`, etc.

## So, what's better?
The point of this post isn't to say that Javalin is "better" simply because
it has few imports, but it does make it easier to get started with writing code.
The fewer concepts a library throws at a developer, the faster the developer can become productive.
If a library has high discoverability, developers are unlikely to need to consult the docs;
they can instead rely on their IDE (which again increases productivity).

From Javalin's [yearly-ish survey](https://javalin.io/blog/javalin-user-survey-2020), I've learned
that the library is widely used for teaching programming. There is a freeform section of the
survey where respondents can write what they think is the best and worst part of Javalin,
and professors who teach programming often highlight the simplicity of Javalin apps, which
let's the them focus on teaching their curriculum, instead of teaching Javalin specific concepts.

Javalin is also often used for interview assignments and getting-started examples, most
likely for the same reason. It gets out of your way and let's you focus on your
application logic.

I think this way of thinking also carries over to the enterprise world. When you're building
a service, you really shouldn't have to marry the web library you are using - it
should be easy to swap it out with something else (at least if you're using a
[hexagonal architecture](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software))).

## Conclusion
Hopefully this gave you something to think about. Developer experience and library usability
are often overlooked in software development, and I Javalin's focus on these
aspects is the primary reason for it's success.

I've made a [GitHub issue](https://github.com/javalin/javalin.github.io/issues/109)
if anyone wants to discuss this post.
