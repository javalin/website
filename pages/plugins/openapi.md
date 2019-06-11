---
layout: default
title: OpenAPI documentation
rightmenu: true
permalink: /plugins/openapi
---

<div id="spy-nav" class="right-menu" markdown="1">
* [Getting Started](#getting-started)
* [Api](#api)
* [Heading 3](#heading-3)
* [Heading 4](#heading-4)
</div>

<h1 class="no-margin-top">OpenAPI Plugin</h1>

This plugin allows to generate the [OpenApi specification](https://swagger.io/docs/specification/about/) 
from the application source code. This can be used to [share documentation](https://swagger.io/tools/swagger-ui/)
 or [generate client code](https://swagger.io/tools/swagger-codegen/).

{% capture java %}
    // Java version goes here
{% endcapture %}
{% capture kotlin %}
    // Kotlin version goes here
{% endcapture %}
{% include macros/docsSnippetKotlinFirst.html java=java kotlin=kotlin %}

## Getting Started

Add the dependencies:

```xml
<dependency>
    <groupId>io.swagger.core.v3</groupId>
    <artifactId>swagger-models</artifactId>
    <version>2.0.8</version>
</dependency>
<dependency>
    <groupId>cc.vileda</groupId>
    <artifactId>kotlin-openapi3-dsl</artifactId>
    <version>0.20.1</version>
</dependency>
```

Register the plugin:

```java
Javalin.create(config -> {
    Info applicationInfo = new Info()
        .version("1.0")
        .description("My Application");

    OpenApiOptions openApiOptions = new OpenApiOptions(applicationInfo)
        .path("/swagger-docs");

    config.registerPlugin(new OpenApiPlugin(openApiOptions));
}).start();
```

The OpenApi specification is now available under the "/swagger-docs" endpoint.

## Swagger UI/ReDoc
To activate an [Swagger UI](https://swagger.io/tools/swagger-ui/) 
and/or [ReDoc](https://redoc.ly/) endpoint, you first need to install
the corresponding dependency:

Swagger UI:

```xml
<dependency>
    <groupId>org.webjars</groupId>
    <artifactId>swagger-ui</artifactId>
    <version>3.22.2</version>
</dependency>
```

ReDoc:

```xml
<dependency>
    <groupId>org.webjars.npm</groupId>
    <artifactId>redoc</artifactId>
    <version>2.0.0-rc.2</version>
</dependency>
```

Then you need to activate the related option:

```java
new OpenApiOptions(applicationInfo)
        .path("/swagger-docs")
        // Activate this option for Swagger UI
        .swagger(new SwaggerOptions("/swagger").title("My Swagger Documentation"))
        // Activate this option for ReDoc
        .reDoc(new ReDocOptions("/redoc").title("My ReDoc Documentation"))
```

## Document endpoints

Because of the dynamic definition of endpoints in Javalin, it is necessary to 
attach some metadata to the endpoints:

```java
public class MyApplication {
  public static void main(String[] args) {
      // ...
      OpenApiDocumentation createUserDocumentation = OpenApiBuilder.document()
          .body(User.class)
          .json("200", User.class);

      app.post("/users", OpenApiBuilder.documented(createUserDocumentation, ctx -> {
          // ...
      }));
  }
}
```

There is also an annotation api:

```java
public class MyApplication {
  public static void main(String[] args) {
      // ...
      UserController userController = new UserController();
      app.post("/users", userController::createUser);
  }
}

class UserController {
    @OpenApi(
        requestBody = @OpenApiRequestBody(content = @OpenApiContent(from = User.class)),
        responses = {
            @OpenApiResponse(status = "200", content = @OpenApiContent(from = User.class))
        }
    )
    public void createUser(Context ctx) {
        // ...
    }
}
```

Here is an overview of the dsl api:

```java
OpenApiBuilder.document()
    // Update the OpenApiOperation directly
    .operation(openApiOperation -> {
        openApiOperation.description("My Operation");
        openApiOperation.operationId("myOperationId");
        openApiOperation.summary("My Summary");
        openApiOperation.deprecated(false);
        openApiOperation.addTagsItem("user");
    })

    // Parameters
    .pathParam("my-path-param", String.class, openApiParam -> {
        // You can always attach a lambda to update the OpenApi object directly
        openApiParam.description("My Path Parameter");
    })
    .queryParam("my-query-param", Integer.class)
    .header("my-custom-header")
    .cookie("my-cookie")
    .uploadedFile("my-file")
    .uploadedFiles("my-files")

    // Body
    .body(User.class)
    .bodyAsBytes("image/png")

    // Responses
    .json("200", User.class)
    .jsonArray("200", User.class) // For Arrays
    .html("200")
    .result("204") // No Content

    // Other
    .ignore(); // Hide this endpoint in the documentation
```

Here is an overview of the annotation api:
```java
@OpenApi(
    description = "My Operation",
    operationId = "myOperationId",
    summary = "My Summary",
    deprecated = false,
    tags = {"user"},

    // Parameters
    pathParams = {
        @OpenApiParam(name = "my-path-param", description = "My Path Parameter")
    },
    queryParams = {
        @OpenApiParam(name = "my-query-param", type = Integer.class)
    },
    headers = {
        @OpenApiParam(name = "my-custom-header")
    },
    cookies = {
        @OpenApiParam(name = "my-cookie")
    },
    fileUploads = {
        @OpenApiFileUpload(name = "my-file"),
        @OpenApiFileUpload(name = "my-files", isArray = true)
    },
    
    // Body
    requestBody = @OpenApiRequestBody(content = @OpenApiContent(from = User.class)),
    requestBody = @OpenApiRequestBody(content = @OpenApiContent(from = Byte[].class, type = "image/png")),
    
    // Responses
    responses = {
        @OpenApiResponse(status = "200", content = @OpenApiContent(from = User.class)),
        @OpenApiResponse(status = "200", content = @OpenApiContent(from = User.class, isArray = true)),
        @OpenApiResponse(status = "200", content = @OpenApiContent(type = "text/html")),
        @OpenApiResponse(status = "204") // No content
    },
    
    // Other
    ignore = true // Hide this endpoint in the documentation
)
public void myHandler(Context ctx) {
}
```

## Static Java Methods

To make the annotation api work with static java method, a few extra steps are necessary. This is only
required with static Java methods. Static Kotlin methods or instance methods work by default.

1. Install the ClassGraph dependency:

```xml
<dependency>
    <groupId>io.github.classgraph</groupId>
    <artifactId>classgraph</artifactId>
    <version>4.8.34</version>
</dependency>
```

2. Activate annotation scanning for your package path:

```java
new OpenApiOptions(applicationInfo)
        .activateAnnotationScanningFor("my.package.path")
        // ...
```

3. Include the the `path` and `method` parameter on the `OpenApi` annotation. These parameter are only 
used for annotation scanning.


```java
public class MyApplication {
  public static void main(String[] args) {
      // ...
      app.post("/users", UserController::createUser);
  }
}

class UserController {
    @OpenApi(
        path = "/users",
        method = HttpMethod.POST,
        // ...
    )
    public static void createUser(Context ctx) {
        // ...
    }
}
```

## Options

Here is an overview of all the available open api options:

```java
// You can either pass the info object
new OpenApiOptions(new Info().version("1.0").description("My Application"));
// Or you can pass a lambda which creates the initial documentation
new OpenApiOptions(() -> new OpenAPI()
            .info(new Info().version("1.0").description("My Application"))
            .addServersItem(new Server().url("http://my-server.com").description("My Server")))

            .path("/swagger-docs") // Activate the open api endpoint
            .roles(roles(new MyRole())) // Require specific roles for the open api endpoint
            .defaultDocumentation(doc -> { doc.json("500", MyError.class); }) // Lambda that will be applied to every documentation
            .swagger(new SwaggerOptions("/swagger").title("My Swagger Documentation")) // Activate the swagger ui
            .reDoc(new ReDocOptions("/redoc").title("My ReDoc Documentation")) // Active the ReDoc UI
            .activateAnnotationScanningFor("com.my.package") // Activate annotation scanning (Required for annotation api with static java methods)
            .toJsonMapper(JacksonToJsonMapper.INSTANCE) // Custom json mapper
            .modelConverterFactory(JacksonModelConverterFactory.INSTANCE); // Custom OpenApi model converter
```
