---
layout: default
title: GraphQL documentation
rightmenu: true
permalink: /plugins/graphql
description: "Add a GraphQL endpoint to a Javalin application using the GraphQL plugin."
---

<div id="spy-nav" class="right-menu" markdown="1">
- [Getting Started](#getting-started)
- [Create Query](#create-query)
- [Create Command](#create-command)
- [Create Subscription](#create-subscription)
- [Pass context](#pass-context)
  - [TODO](#todo)
</div>

<h1 class="no-margin-top">GraphQL Plugin</h1>

This plugin allows implementing the [GraphQL specification](https://graphql.org)
with some easy steps.

## Getting Started

Add the dependencies:

```xml
<dependency>
    <groupId>io.javalin</groupId>
    <artifactId>javalin-graphql</artifactId>
    <version>{{site.javalinversion}}</version>
</dependency>
```

Register the plugin:

```kotlin
val app = Javalin.create {
    val graphQLOption = GraphQLOptions("/graphql", ContextExample())
            .addPackage("io.javalin.examples")
            .register(QueryExample(message))
            .register(MutationExample(message))
            .register(SubscriptionExample())
            .context()
    it.registerPlugin(GraphQLPlugin(graphQLOption))
}

app.start()
```

The GraphQL is now available under the `/graphql` endpoint.

## Create Query

This section contains an overview of all the available to create queries.

```kotlin
@GraphQLDescription("Query Example")
class QueryExample : QueryGraphql {
    fun hello(): String = "Hello world"

    fun demoData(@GraphQLDescription("awesome input") data: DemoData): DemoData = data
}
```

After creating this class is necessary to register the class at the start of the plugin.

## Create Command

This section contains an overview of all the available to create commands.

```kotlin
@GraphQLDescription("Command Example")
class CommandExample : CommandGraphql {
    fun hello(): String = "Hello world"

    fun demoData(@GraphQLDescription("awesome input") data: DemoData): DemoData = data
}
```

After creating this class is necessary to register the class at the start of the plugin.

## Create Subscription

This section contains an overview of all the available to create a subscription.

```kotlin
@GraphQLDescription("Subscription Example")
class SubscriptionExample: SubscriptionGraphql {
    fun counter(): Flux<Int> = Flux.interval(Duration.ofMillis(100)).map { 1 }
}
```

After creating this class is necessary to register the class at the start of the plugin.

## Pass context

Sometimes it is necessary to pass the context in the method. You can create this context with this class.

```kotlin
class ContextExample {
    val globalEnvironment = "globalEnvironment"
}
```

After creating this class is necessary to register the class at the start of the plugin.

Then is possible to access this context with this annotation @GraphQLContext.

```kotlin
class QueryExample() : QueryGraphql {
    fun context(@GraphQLContext context: ContextExample): ContextExample {
        return context
    }
}
```

### TODO

- Pass the kotlin context inside the Context class.
- Create middleware for OAuth in graphql path.
- Create subscription by Server Sent Event
