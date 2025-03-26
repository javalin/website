---
layout: tutorial
official: true
title: "Documenting endpoints with OpenAPI 3"
permalink: /tutorials/openapi-example
summarytitle: Documenting endpoints with OpenAPI 3
summary: Learn how to document endpoints using OpenAPI 3, and how to render interactive docs using Swagger UI and ReDoc
date: 2020-01-03
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
language: ["java", "kotlin"]
github: https://github.com/javalin/javalin-samples/tree/main/javalin5/javalin-openapi-example
---

## What you will learn

This tutorial will teach you how to use the [Javalin OpenAPI plugin](/plugins/openapi)
to create an OpenAPI spec (previously known as a "Swagger spec"). The OpenAPI spec is
an API description format for REST APIs, which is readable for both humans and machines.
A spec can be used to generate web based documentation and API clients for all major languages,
saving a lot of time for API consumers.

We will build a `User` CRUD API with five operations and generate an OpenAPI spec for it.
The example snippets contain both Java and Kotlin code,
and a project for each language is available on
[GitHub](https://github.com/javalin/javalin-samples/tree/main/javalin5/javalin-openapi-example).

## Dependencies

First, we need to create a Maven project with our dependencies: [(→ Tutorial)](/tutorials/maven-setup)

~~~xml
<dependencies>
     <dependency>
         <groupId>io.javalin</groupId>
         <artifactId>javalin-bundle</artifactId>
         <version>{{site.javalinversion}}</version>
     </dependency>
     <dependency>
         <groupId>io.javalin.community.openapi</groupId>
         <artifactId>javalin-openapi-plugin</artifactId>
         <version>{{site.javalinversion}}</version>
     </dependency>
     <dependency>
         <groupId>io.javalin.community.openapi</groupId>
         <artifactId>javalin-swagger-plugin</artifactId>
         <version>{{site.javalinversion}}</version>
     </dependency>
     <dependency>
         <groupId>io.javalin.community.openapi</groupId>
         <artifactId>javalin-redoc-plugin</artifactId>
         <version>{{site.javalinversion}}</version>
     </dependency>
</dependencies>
~~~

The `javalin-bundle` dependency includes Javalin, Jackson and a logger.

We also need to add a build section for the Open API annotations:

~~~xml
<build>
    <sourceDirectory>src/main/kotlin</sourceDirectory>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.10.1</version>
            <configuration>
                <source>11</source>
                <target>11</target>
                <annotationProcessorPaths>
                    <annotationProcessorPath>
                        <groupId>io.javalin.community.openapi</groupId>
                        <artifactId>openapi-annotation-processor</artifactId>
                        <version>${javalin.version}</version>
                    </annotationProcessorPath>
                </annotationProcessorPaths>
            </configuration>
        </plugin>
    </plugins>
</build>
~~~

You can view the full POM on
[GitHub](https://github.com/javalin/javalin-samples/tree/main/javalin6/javalin-openapi-example).

## Building the API

Let's define our Main class. This is where we will be putting our server and our OpenAPI config:

{% capture java %}
package io.javalin.example.java;

import io.javalin.Javalin;
import io.javalin.example.java.user.UserController;
import io.javalin.openapi.plugin.OpenApiConfiguration;
import io.javalin.openapi.plugin.OpenApiPlugin;
import io.javalin.openapi.plugin.redoc.ReDocConfiguration;
import io.javalin.openapi.plugin.redoc.ReDocPlugin;
import io.javalin.openapi.plugin.swagger.SwaggerConfiguration;
import io.javalin.openapi.plugin.swagger.SwaggerPlugin;

import static io.javalin.apibuilder.ApiBuilder.*;

public class Main {

    public static void main(String[] args) {
        Javalin.create(config -> {
            config.registerPlugin(new OpenApiPlugin(pluginConfig -> {
                pluginConfig.withDefinitionConfiguration((version, definition) -> {
                    definition.withInfo(info -> info.setTitle("Javalin OpenAPI example"));
                });
            }));
            config.registerPlugin(new SwaggerPlugin());
            config.registerPlugin(new ReDocPlugin());
            config.router.apiBuilder(() -> {
                path("users", () -> {
                    get(UserController::getAll);
                    post(UserController::create);
                    path("{userId}", () -> {
                        get(UserController::getOne);
                        patch(UserController::update);
                        delete(UserController::delete);
                    });
                });
            });
        }).start(7002);

        System.out.println("Check out ReDoc docs at http://localhost:7002/redoc");
        System.out.println("Check out Swagger UI docs at http://localhost:7002/swagger");
    }

}
{% endcapture %}
{% capture kotlin %}
package io.javalin.example.kotlin

import io.javalin.Javalin
import io.javalin.apibuilder.ApiBuilder.delete
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.apibuilder.ApiBuilder.patch
import io.javalin.apibuilder.ApiBuilder.path
import io.javalin.apibuilder.ApiBuilder.post
import io.javalin.example.kotlin.user.UserController
import io.javalin.openapi.OpenApiInfo
import io.javalin.openapi.plugin.OpenApiPlugin
import io.javalin.openapi.plugin.redoc.ReDocPlugin
import io.javalin.openapi.plugin.swagger.SwaggerPlugin

fun main() {

    Javalin.create { config ->
        config.registerPlugin(OpenApiPlugin { pluginConfig ->
            pluginConfig.withDefinitionConfiguration { version, definition ->
                definition.withOpenApiInfo { info: OpenApiInfo ->
                    info.title = "Javalin OpenAPI example"
                }
            }
        })
        config.registerPlugin(SwaggerPlugin())
        config.registerPlugin(ReDocPlugin())
        config.router.apiBuilder {
            path("users") {
                get(UserController::getAll);
                post(UserController::create);
                path("{userId}") {
                    get(UserController::getOne);
                    patch(UserController::update);
                    delete(UserController::delete);
                }
            }
        }
    }.start(7001)

    println("Check out ReDoc docs at http://localhost:7001/redoc")
    println("Check out Swagger UI docs at http://localhost:7001/swagger")

}
{% endcapture %}
{% include macros/docsSnippetKotlinFirst.html java=java kotlin=kotlin %}

We enable the OpenAPI plugin by calling `config.plugins.register`,
and we do all our configuration in that method. As mentioned earlier, we will register
both ReDoc and Swagger UI (to generate web UIs for our API),
but you'll most likely only use one of these in production.

The API definition in the snippet above references something called `UserController`,
which doesn't exist. Let's create a skeleton:

{% capture java %}
package io.javalin.example.java.user;

import io.javalin.http.Context;

public class UserController {

    public static void create(Context ctx) {
    }

    public static void getAll(Context ctx) {
    }

    public static void getOne(Context ctx) {
    }

    public static void update(Context ctx) {
    }

    public static void delete(Context ctx) {
    }

}
{% endcapture %}
{% capture kotlin %}
package io.javalin.example.kotlin.user

import io.javalin.http.Context

object UserController {

    fun create(ctx: Context) {
    }

    fun getAll(ctx: Context) {
    }

    fun getOne(ctx: Context) {
    }

    fun update(ctx: Context) {
    }

    fun delete(ctx: Context) {
    }

}
{% endcapture %}
{% include macros/docsSnippetKotlinFirst.html java=java kotlin=kotlin %}

This defines a simple CRUD API for `User` objects.

## Adding annotations

To improve the documentation we can add annotations to the handlers.

Let's start with `Get users`:

{% capture java %}
@OpenApi(
    summary = "Get all users",
    operationId = "getAllUsers",
    path = "/users",
    methods = HttpMethod.GET,
    tags = {"User"},
    responses = {
        @OpenApiResponse(status = "200", content = {@OpenApiContent(from = User[].class)})
    }
)
public static void getAll(Context ctx) {
    ctx.json(UserService.getAll());
}
{% endcapture %}
{% capture kotlin %}
@OpenApi(
    summary = "Get all users",
    operationId = "getAllUsers",
    tags = ["User"],
    responses = [OpenApiResponse("200", [OpenApiContent(Array<User>::class)])],
    path = "/users",
    methods = [HttpMethod.GET]
)
fun getAll(ctx: Context) {
    ctx.json(UserService.getAll())
}
{% endcapture %}
{% include macros/docsSnippetKotlinFirst.html java=java kotlin=kotlin %}

<div class="comment" markdown="1">
We've created a `UserService` and a `User` class.
This is not too relevant for OpenAPI, so we're not showing them in the tutorial,
but everything is available on [GitHub](https://github.com/tipsy/javalin-openapi-example).
</div>

Let's go through the different properties:

* **summary** - Will be used as a title, both in web docs and in client docs
* **operationId** - If you generate a client from the OpenAPI spec, this will be the method name
* **tags** - Used to group endpoints
* **responses** - Describes the status codes and data models the endpoint can respond with.
  This particular endpoint can only answer with an array of `User` objects.

Let's see what our docs look like if we start the server:

<img src="/img/posts/openapi/one-annotation.png" alt="OpenAPI screenshot" class="bordered-image">

Cool! We have a `User` category and a Schema for `User`.
We can explore the `Get all users` endpoint further by clicking on it:

<img src="/img/posts/openapi/get-users-endpoint.png" alt="OpenAPI screenshot" class="bordered-image">

We see that it takes no parameters, and that it will respond with a 200 and an array of `User` objects.

If you've cloned the repo, you can try clicking the `Try it out` button now,
which will give you an array of four users.

Let's document the `Update user` endpoint, which takes some input and has multiple responses:

{% capture java %}
@OpenApi(
    summary = "Update user by ID",
    operationId = "updateUserById",
    path = "/users/:userId",
    methods = HttpMethod.PATCH,
    pathParams = {@OpenApiParam(name = "userId", type = Integer.class, description = "The user ID")},
    tags = {"User"},
    requestBody = @OpenApiRequestBody(content = {@OpenApiContent(from = NewUserRequest.class)}),
    responses = {
        @OpenApiResponse(status = "204"),
        @OpenApiResponse(status = "400", content = {@OpenApiContent(from = ErrorResponse.class)}),
        @OpenApiResponse(status = "404", content = {@OpenApiContent(from = ErrorResponse.class)})
    }
)
{% endcapture %}
{% capture kotlin %}
@OpenApi(
    summary = "Update user by ID",
    operationId = "updateUserById",
    tags = ["User"],
    pathParams = [OpenApiParam("userId", Int::class, "The user ID")],
    requestBody = OpenApiRequestBody([OpenApiContent(NewUserRequest::class)]),
    responses = [
        OpenApiResponse("204"),
        OpenApiResponse("400", [OpenApiContent(ErrorResponse::class)]),
        OpenApiResponse("404", [OpenApiContent(ErrorResponse::class)])
    ],
    path = "/users/{userId}",
    methods = [HttpMethod.PUT]
)
{% endcapture %}
{% include macros/docsSnippetKotlinFirst.html java=java kotlin=kotlin %}

Compared to the endpoint we documented earlier, this one has two more properties:

* **pathParams** - These define Javalin path-parameters. There is also `queryParams` and `formParams`.
* **requestBody** - This endpoint expects a JSON object as the request body

This endpoint also has two more responses:
* If you provide an invalid `userId` or `NewUserRequest` object you will get a 400.
* If you try to update a non-existent user you will get a 404.

## That's pretty much it!

The [example repo](https://github.com/javalin/javalin-samples/tree/main/javalin6/javalin-openapi-example)
contains a fully working API, so if you clone it you can play around with the `Try it out`
button for each endpoint.

## Addendum

Since we now have a OpenAPI spec it's easy to generate clients, and this addendum will show you how.
Client generation works the same for Kotlin, Java, or any other languages. Simply add a Maven plugin:

```xml
<plugin>
    <groupId>org.openapitools</groupId>
    <artifactId>openapi-generator-maven-plugin</artifactId>
    <version>4.2.2</version>
    <executions>
        <execution>
            <goals>
                <goal>generate</goal>
            </goals>
            <configuration>
                <inputSpec>${project.basedir}/src/main/resources/api.json</inputSpec>
                <language>kotlin</language>
                <configOptions>
                    <sourceFolder>src/gen/java/main</sourceFolder>
                </configOptions>
            </configuration>
        </execution>
    </executions>
</plugin>
```

You will have to download and save your spec somewhere, and depending on what options you use (language, serializer, etc)
and how your project is set up, you will have to add dependencies to your POM.

I only generated a client for Kotlin since the clients have different dependencies,
but you can just switch `kotlin` to `java` in the plugin config above to get a Java client.

Using the client is very straightforward in Kotlin:

```kotlin
package io.javalin.example.kotlin.client

import org.openapitools.client.apis.UserApi
import org.openapitools.client.infrastructure.ClientException
import org.openapitools.client.infrastructure.ServerException
import org.openapitools.client.models.NewUserRequest

// This file uses a client which is auto-generated from OpenAPI spec.
// To use it, first start Main.kt so the server is running.

private val apiInstance = UserApi("http://localhost:7001")

fun main() {

    try {
        apiInstance.getAllUsers().forEach { println(it) }
    } catch (e: ServerException) {
        println("5xx response calling UserApi#getAllUsers")
    }

    try {
        val newUserRequest = NewUserRequest("Elaine", "Elaine@elaine.kt")
        apiInstance.createUser(newUserRequest)
        println("Added new user: ${newUserRequest.name}")
        apiInstance.getAllUsers().forEach { println(it) }
    } catch (e: ClientException) {
        println("4xx response calling UserApi#createUser")
    } catch (e: ServerException) {
        println("5xx response calling UserApi#createUser")
    }

}
```

That's it. The OpenAPI generator
([https://github.com/OpenAPITools/openapi-generator](https://github.com/OpenAPITools/openapi-generator))
supports a ton of different languages, and will generate markdown docs for the clients too.

Have fun!
