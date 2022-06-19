---
layout: default
title: OpenAPI documentation
rightmenu: true
permalink: /plugins/openapi
---

<div id="spy-nav" class="right-menu" markdown="1">
- [Getting Started](#getting-started)
- [OpenApiOptions](#openapioptions)
- [Documenting Handler](#documenting-handler)
  - [DSL](#dsl)
  - [Annotations](#annotations)
    - [Java quirks](#java-quirks)
      - [OpenAPI metadata matching ambiguities](#openapi-metadata-matching-ambiguities)
      - [OpenAPI metadata on field references to external classes implementing Handler](#openapi-metadata-on-field-references-to-external-classes-implementing-handler)
      - [OpenAPI metadata on static Java methods](#openapi-metadata-on-static-java-methods)
  - [Server-sent events](#server-sent-events)
- [Documenting CrudHandler](#documenting-crudhandler)
  - [DSL](#dsl-1)
  - [Annotations](#annotations-1)
- [Rendering docs](#rendering-docs)
  - [ReDoc](#redoc)
    - [Acknowledgements](#acknowledgements)
</div>

<h1 class="no-margin-top">OpenAPI Plugin</h1>

This plugin allows to generate the [OpenAPI specification](https://swagger.io/docs/specification/about/)
from the application source code. This can be used to [share documentation](https://swagger.io/tools/swagger-ui/)
or [generate client code](https://swagger.io/tools/swagger-codegen/).

## Getting Started

Add the dependency:

```xml
<dependency>
    <groupId>io.javalin</groupId>
    <artifactId>javalin-openapi</artifactId>
    <version>{{site.javalinversion}}</version>
</dependency>
```

<div class="comment">Note that if you're using <code>javalin-bundle</code> the OpenAPI plugin is already included.</div>

Register the plugin:

{% capture java %}
Javalin.create(config -> {
    config.registerPlugin(new OpenApiPlugin(getOpenApiOptions()));
}).start();

private OpenApiOptions getOpenApiOptions() {
    Info applicationInfo = new Info()
        .version("1.0")
        .description("My Application");
    return new OpenApiOptions(applicationInfo).path("/swagger-docs");
}
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.registerPlugin(OpenApiPlugin(getOpenApiOptions()))
}.start()

private fun getOpenApiOptions(): OpenApiOptions {
    val applicationInfo: Info = Info()
            .version("1.0")
            .description("My Application")
    return OpenApiOptions(applicationInfo).path("/swagger-docs")
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

The OpenAPI specification is now available under the `/swagger-docs` endpoint.

## OpenApiOptions
This section contains an overview of all the available open api options.

You can either pass the info object:

{% capture java %}
new OpenApiOptions(new Info().version("1.0").description("My Application"));
{% endcapture %}
{% capture kotlin %}
OpenApiOptions(Info().version("1.0").description("My Application"))
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Or you can pass a lambda, which creates the initial documentation.

Here is an overview of the options:

{% capture java %}
InitialConfigurationCreator initialConfigurationCreator = () -> {
    return new OpenAPI()
        .info(new Info().version("1.0").description("My Application"))
        .addServersItem(new Server().url("http://my-server.com").description("My Server"));
}

new OpenApiOptions(initialConfigurationCreator)
    .path("/swagger-docs") // Activate the open api endpoint
    .roles(roles(new MyRole())) // Require specific roles for the open api endpoint
    .defaultDocumentation(doc -> { doc.json("500", MyError.class); }) // Lambda that will be applied to every documentation
    .activateAnnotationScanningFor("com.my.package") // Activate annotation scanning (Required for annotation api with static java methods)
    .toJsonMapper(JacksonToJsonMapper.INSTANCE) // Custom json mapper
    .modelConverterFactory(JacksonModelConverterFactory.INSTANCE) // Custom OpenAPI model converter
    .swagger(new SwaggerOptions("/swagger").title("My Swagger Documentation")) // Activate the swagger ui
    .reDoc(new ReDocOptions("/redoc").title("My ReDoc Documentation")) // Active the ReDoc UI
    .setDocumentation("/user", HttpMethod.POST, document()) // Override or set some documentation manually
    .ignorePath("/user*", HttpMethod.GET); // Disable documentation
    .includePath("/items/*") // disable documentation for everything except this path
	.responseModifier(new MyOpenApiModifier()) // Modify the OpenAPI model returned with information from the Context on each request.  Defaults to no modification.
	.disableCaching() // Disable caching of the OpenAPI model if changes in the responseModifier are not idempotent.
{% endcapture %}
{% capture kotlin %}
val initialConfigurationCreator = InitialConfigurationCreator {
    OpenAPI()
        .info(Info().version("1.0").description("My Application"))
        .addServersItem(Server().url("http://my-server.com").description("My Server"))
}

OpenApiOptions(initialConfigurationCreator)
    .path("/swagger-docs") // Activate the open api endpoint
    .roles(roles(MyRole())) // Require specific roles for the open api endpoint
    .defaultDocumentation(DefaultDocumentation { doc: OpenApiDocumentation -> doc.json("500", MyError::class.java) }) // Lambda that will be applied to every documentation
    .activateAnnotationScanningFor("com.my.package") // Activate annotation scanning (Required for annotation api with static java methods)
    .toJsonMapper(JacksonToJsonMapper.INSTANCE) // Custom json mapper
    .modelConverterFactory(JacksonModelConverterFactory.INSTANCE) // Custom OpenAPI model converter
    .swagger(SwaggerOptions("/swagger").title("My Swagger Documentation")) // Activate the swagger ui
    .reDoc(ReDocOptions("/redoc").title("My ReDoc Documentation")) // Active the ReDoc UI
    .setDocumentation("/user", HttpMethod.POST, document()) // Override or set some documentation manually
    .ignorePath("/user*", HttpMethod.GET) // Disable documentation for this path
    .includePath("/items/*") // disable documentation for everything except this path
	.responseModifier(MyOpenApiModifier()) // Modify the OpenAPI model returned with information from the Context on each request
	.disableCaching() // Disable caching of the OpenAPI model if changes in the responseModifier are not idempotent.
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Documenting Handler

Because of the dynamic definition of endpoints in Javalin, it is necessary to attach some metadata to the endpoints.
The OpenAPI documentation can be defined via a [DSL](https://en.wikipedia.org/wiki/Domain-specific_language)- and/or
by an [annotations](https://en.wikipedia.org/wiki/Java_annotation)-based approach. Both can be mixed in the same
application. If both approaches are used on the same handler, the DSL documentation will take precedence over annotations.

<!--- alt annotation reference: [oracle annptation documentation](https://docs.oracle.com/javase/7/docs/technotes/guides/language/annotations.html)) --->

### DSL

You can use the `document` method to create the documentation and attach it to
with the `documented` method to a `Handler`.

{% capture java %}
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
{% endcapture %}
{% capture kotlin %}
fun main() {
    // ...
    val createUserDocumentation: OpenApiDocumentation = document()
        .body(User::class.java)
        .json("200", User::class.java)

    app.get("/users", documented(createUserDocumentation) { ctx -> {
        // ...
    }})
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Here is an overview of the dsl api:

{% capture java %}
OpenApiDocumentation userDoc = OpenApiBuilder.document()
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
    .header("my-custom-header", String.class)
    .cookie("my-cookie", String.class)
    .uploadedFile("my-file")
    .uploadedFiles("my-files")
    .formParam("my-form-param", Integer.class, true);

    // Body
    .body(User.class)
    .bodyAsBytes("image/png")

    // Composed body
    .body(anyOf(documentedContent(User.class), documentedContent(Address.class)))

    // Responses
    .json("200", User.class)
    .jsonArray("200", User.class) // For Arrays
    .html("200")
    .result("204") // No Content

    // Composed Responses
    .result("200", oneOf(
         documentedContent(SomeMessage.class),
         documentedContent(User.class, true, "return type description")
     ))

    // Other
    .ignore(); // Hide this endpoint in the documentation
{% endcapture %}
{% capture kotlin %}
val createUserDocumentation2: OpenApiDocumentation = document()

    // Update the OpenApiOperation directly
    .operation {
        it.description("My Operation")
        it.operationId("myOperationId")
        it.summary("My Summary")
        it.deprecated(false)
        it.addTagsItem("user")
    }

    // Parameters
    .pathParam<String>("my-path-param") {
        // You can always attach a lambda to update the OpenApi object directly
        it.description("My Path Parameter")
    }

    .queryParam<Int>("my-query-param")

    .header<String>("my-custom-header")
    .cookie<String>("my-cookie")

    .uploadedFile("my-file") {
        // RequestBody, e.g.
        it.description = "MyFile"
        it.required = true
    }
    .uploadedFiles("my-files") { /* RequestBody */ }
    .formParam<Int>("my-form-param", true)

    // Body
    .body<User>()
    .bodyAsBytes("image/png") // Composed body
    .body(anyOf(documentedContent<User>(), documentedContent<Address>()))

    // Responses
    .json<User>("200")
    .jsonArray<User>("200") // For Arrays
    .html("200") { /* it:ApiResponse handler */ }
    .result<Int>("204") // No Content

    // Composed Responses
    .result("200", oneOf(
        documentedContent<SomeMessage>(),
        documentedContent<User>("return type description", true)
    ))

    // Other
    .ignore(); // Hide this endpoint in the documentation
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Annotations

The OpenAPI metadata can also be declared using the `@OpenApi(...)` annotation attached to a `Handler`. Both, method-
and field-type annotations are supported. This is, for example, useful if the metadata and developers
intention should be documented close to the source code that implements the given `Handler` logic.

{% capture java %}
public class MyApplication {
    public static void main(String[] args) {
        // ...
        UserControllerV0 userController = new UserControllerV0();
        app.post("/v0/users", userControllerV0::createUser);
        app.post("/v1/users", UserControllerV1.createUser);
    }
}

// Handler declared as class method
class UserControllerV0 {
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

// Handler declared as static class field
class UserControllerV1 {
    @OpenApi(
        requestBody = @OpenApiRequestBody(content = @OpenApiContent(from = User.class)),
        responses = {
            @OpenApiResponse(status = "200", content = @OpenApiContent(from = User.class))
        }
    )
    public static final Handler createUser = ctx -> {
        // ...
    };
}
{% endcapture %}
{% capture kotlin %}
object MyApplication {
    @JvmStatic
    fun main(args: Array<String>) {
        // ...
        val userController = UserController()
        app.post("/users") { ctx: Context? -> userController.createUser(ctx) }
        app.post("/users2", UserController2.createUser)
    }
}

// Handler declared as class method
internal class UserController {
    @OpenApi(
        requestBody = OpenApiRequestBody(content = [OpenApiContent(from = User::class)]),
        responses = [
            OpenApiResponse(status = "200", content = [OpenApiContent(from = User::class)])
        ])
    fun createUser(ctx: Context?) {
        // ...
    }
}

// Handler declared as static class field
internal object UserController2 {
    @OpenApi(
        requestBody = OpenApiRequestBody(content = [OpenApiContent(from = User::class)]),
        responses = [
            OpenApiResponse(status = "200", content = [OpenApiContent(from = User::class)])
        ])
    val createUser = Handler {
        // ...
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Here is an overview of the annotation api:
{% capture java %}
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
    formParams = {
        @OpenApiFormParam(name = "my-form-param", type = Integer.class)
    },

    // Body
    requestBody = @OpenApiRequestBody(content = @OpenApiContent(from = User.class)),
    // alt: requestBody = @OpenApiRequestBody(content = @OpenApiContent(from = Byte[].class, type = "image/png")),

    // Composed body
    composedRequestBody = @OpenApiComposedRequestBody(
        oneOf = {
                @OpenApiContent(from = User.class),
                @OpenApiContent(from = Address.class)
        },
        // or
        anyOf = {
                @OpenApiContent(from = User.class),
                @OpenApiContent(from = Address.class)
        },
        required = true,
        contentType = "application/json"
    ),

    // Responses
    responses = {
        // responses with same status and content type will be auto-grouped to the oneOf composed scheme
        @OpenApiResponse(status = "200", content = @OpenApiContent(from = User.class)),
        @OpenApiResponse(status = "200", content = @OpenApiContent(from = User.class, isArray = true)),
        @OpenApiResponse(status = "200", content = @OpenApiContent(type = "text/html")),
        // also compiles to the oneOf composed scheme
        @OpenApiResponse(status = "200", content = {
            @OpenApiContent(from = User.class),
            @OpenApiContent(from = Address.class)
        }),
        @OpenApiResponse(status = "204") // No content
    },

    // Other
    ignore = true // Hide this endpoint in the documentation
)
public void myHandler(Context ctx) {
    // ...
}
{% endcapture %}
{% capture kotlin %}
@OpenApi(
    description = "My Operation",
    operationId = "myOperationId",
    summary = "My Summary",
    deprecated = false,
    tags = ["user"],

    // Parameters
    pathParams = [
        OpenApiParam(name = "my-path-param", description = "My Path Parameter")
    ],
    queryParams = [
        OpenApiParam(name = "my-query-param", type = Integer::class)
    ],
    headers = [
        OpenApiParam(name = "my-custom-header")
    ],
    cookies = [
        OpenApiParam(name = "my-cookie")
    ],
    fileUploads = [
        OpenApiFileUpload(name = "my-file"),
        OpenApiFileUpload(name = "my-files", isArray = true)
    ],
    formParams = [
        OpenApiFormParam(name = "my-form-param", type = Integer::class)
    ],

    // Body
    requestBody = OpenApiRequestBody(content = [OpenApiContent(from = User::class)]),
    // alt: requestBody = OpenApiRequestBody(content = [OpenApiContent(from = ByteArray::class, type = "image/png")]),

    // Composed body
    composedRequestBody = OpenApiComposedRequestBody(
        oneOf = [
            OpenApiContent(from = User::class),
            OpenApiContent(from = Address::class)
        ],
        // or
        anyOf = [
            OpenApiContent(from = User::class),
            OpenApiContent(from = Address::class)
        ],
        required = true,
        contentType = "application/json"
    ),

    // Responses
    responses = [
        // responses with same status and content type will be auto-grouped to the oneOf composed scheme
        OpenApiResponse(status = "200", content = [OpenApiContent(from = User::class)]),
        OpenApiResponse(status = "200", content = [OpenApiContent(from = User::class, isArray = true)]),
        OpenApiResponse(status = "200", content = [OpenApiContent(type = "text/html")]),
        // also compiles to the oneOf ]composed scheme
        OpenApiResponse(status = "200", content = [
            OpenApiContent(from = User::class),
            OpenApiContent(from = Address::class)
        ]),
        OpenApiResponse(status = "204") // No content
    ],

    // Other
    ignore = true // Hide this endpoint in the documentation
)
fun myHandler(ctx: Context?) {
    // ...
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

#### Java quirks

##### OpenAPI metadata matching ambiguities
For Java, in case there are multiple non-statically defined `Handler` field implementations in one class, it may be necessary
to explicitly specify their paths via `@OpenApi(path = "...", /* ... */)` or
`@OpenApi(path = "...", method = <HttpMethod>, /* ... */)` to resove the metadata matching ambiguities. The latter is
only necessary if the given path is the same but HTTP-method differs (e.g. in case of CRUD-type handlers).

```java
class JavaMultipleFieldReferences {
    @OpenApi(
        path = "/test1", // parameter needed to resolve ambiguity
        responses = {@OpenApiResponse(status = "200")})
    public final Handler handler1 = ctx -> { /* custom user code */ };

    @OpenApi(
        path = "/test2", // parameter needed to resolve ambiguity
        responses = {@OpenApiResponse(status = "200")})
    public final static Handler handler2 = ctx -> { /* custom user code */ };

    @OpenApi(
        method = HttpMethod.PUT,
        responses = {@OpenApiResponse(status = "200")})
    public final Handler putHandler = ctx -> { /* custom user code */ };

    @OpenApi(
        method = HttpMethod.DELETE,
        responses = {@OpenApiResponse(status = "200")})
    public final Handler deleteHandler = ctx -> { /* custom user code */ };
}
```

##### OpenAPI metadata on field references to external classes implementing Handler
In case the `Handler` is implemented or wrapped by an _external_ class
(ie. `class CustomOuterClassHandler implements Hander { /* ... */}`) and used as a class field reference, it may
be useful to turn the inner field reference of the externally defined class into an anonymous class by adding a pair
of curly brackets `{}` after the field definitions.

```java
class JavaOuterClassFieldReference {
    @OpenApi(responses = {@OpenApiResponse(status = "200")})
    public final Handler handler = new CustomOuterClassHandler(ctx -> { /*custom user handler*/}){};
    // note curly brackets '{}' to make the external class an inner pseudo-anonymous class
}
```

This scheme is useful, for example, in cases where `CustomOuterClassHandler` is implementing common behaviour for every
handler in a given sub-group but not globally for every handler (e.g. abstracting every 'GET' handler to also implement
an 'SSE' handler). N.B. This work-around is not necessary if the `Handler` implementing class is defined as within as
an inner classes parallel to the class field referencing to it.

##### OpenAPI metadata on static Java methods
To make the annotation api work with static java methods, a few extra steps are necessary. This is only
required for static Java methods. Static Kotlin methods or Java instance methods work by default.

Activate annotation scanning for your package path:

```java
OpenApiOptions openApiOptions = new OpenApiOptions(applicationInfo)
   .activateAnnotationScanningFor("my.package.path")
```

Include the `path` and `method` parameters on the `OpenApi` annotation. N.B. These parameters are
used for annotation scanning only.

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

### Server-sent events
The `app.sse` method for adding a SSE endpoint in Javalin is just a wrapped `app.get` call.
To document your `app.sse` method, you will have to declare a standard `app.get` `Handler` and call the SSE handler manually:

```kotlin
@OpenApi(
    description = "Server Sent Events",
    tags = ["My Tag"]
)
fun sseEvents(ctx: Context) {
    SseHandler(Consumer { sse ->

    }).handle(ctx)
}

app.get("/events", ::sseEvents)
```

## Documenting CrudHandler
The `CrudHandler` ([docs](/documentation#crudhandler)) is an interface with the five main CRUD operations.
This makes it a bit different from the `Handler` interface (which only has one method), but it can still be documented.

### DSL

With the DSL, you can use the `documentCrud` method:

{% capture java %}
OpenApiCrudHandlerDocumentation userDocumentation = OpenApiBuilder.documentCrud()
    .getAll(OpenApiBuilder.document().jsonArray("200", User.class))
    .getOne(OpenApiBuilder.document().pathParam("id", String.class).json("200", User.class))
    .create(OpenApiBuilder.document().body(User.class).json("200", User.class))
    .update(OpenApiBuilder.document().pathParam("id", String.class).body(User.class).result("200", User.class))
    .delete(OpenApiBuilder.document().pathParam("id", String.class).result("200", User.class));

app.routes(() -> {
    ApiBuilder.crud("/users/:id", OpenApiBuilder.documented(userDocumentation, new UserCrudHandler()));
});
{% endcapture %}
{% capture kotlin %}
val userDocumentation: OpenApiCrudHandlerDocumentation = documentCrud()
    .getAll(document().jsonArray<User>("200"))
    .getOne(document().pathParam<String>("id").json<User>("200"))
    .create(document().body<User>().json<User>("200"))
    .update(document().pathParam<String>("id").body<User>().result<User>("200"))
    .delete(document().pathParam<String>("id").result<User>("200"))

app.routes { ApiBuilder.crud("/users/:id", documented(userDocumentation, UserCrudHandler())) }
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Annotations

With the annotation api, you can just annotate the individual methods of the `CrudHandler`.

{% capture java %}
public class MyApplication {
  public static void main(String[] args) {
      // ...
      app.routes(() -> {
          ApiBuilder.crud("/users/:id", new UserCrudHandler());
      });
  }
}

class UserCrudHandler implements CrudHandler {
    @OpenApi(
        responses = @OpenApiResponse(status = "200", content = @OpenApiContent(from = User.class, isArray = true))
    )
    @Override
    public void getAll(@NotNull Context ctx) {
        // ...
    }

    @OpenApi(
        pathParams = @OpenApiParam(name = "id"),
        responses = @OpenApiResponse(status = "200", content = @OpenApiContent(from = User.class))
    )
    @Override
    public void getOne(@NotNull Context ctx, @NotNull String resourceId) {
        // ...
    }

    @OpenApi(
        responses = @OpenApiResponse(status = "200", content = @OpenApiContent(from = User.class))
    )
    @Override
    public void create(@NotNull Context ctx) {
        // ...
    }

    @OpenApi(
        pathParams = @OpenApiParam(name = "id"),
        responses = @OpenApiResponse(status = "200", content = @OpenApiContent(from = User.class))
    )
    @Override
    public void update(@NotNull Context ctx, @NotNull String resourceId) {
        // ...
    }

    @OpenApi(
        pathParams = @OpenApiParam(name = "id"),
        responses = @OpenApiResponse(status = "200", content = @OpenApiContent(from = User.class))
    )
    @Override
    public void delete(@NotNull Context ctx, @NotNull String resourceId) {
        // ...
    }
}
{% endcapture %}
{% capture kotlin %}
class UserCrudHandler : CrudHandler {
    @OpenApi(responses = [OpenApiResponse(status = "200", content = [OpenApiContent(from = User::class, isArray = true)])])
    override fun getAll(@NotNull ctx: Context) {
        // ...
    }

    @OpenApi(pathParams = [OpenApiParam(name = "id")], responses = [OpenApiResponse(status = "200", content = [OpenApiContent(from = User::class)])])
    override fun getOne(@NotNull ctx: Context, @NotNull resourceId: String) {
        // ...
    }

    @OpenApi(responses = [OpenApiResponse(status = "200", content = [OpenApiContent(from = User::class)])])
    override fun create(@NotNull ctx: Context) {
        // ...
    }

    @OpenApi(pathParams = [OpenApiParam(name = "id")], responses = [OpenApiResponse(status = "200", content = [OpenApiContent(from = User::class)])])
    override fun update(@NotNull ctx: Context, @NotNull resourceId: String) {
        // ...
    }

    @OpenApi(pathParams = [OpenApiParam(name = "id")], responses = [OpenApiResponse(status = "200", content = [OpenApiContent(from = User::class)])])
    override fun delete(@NotNull ctx: Context, @NotNull resourceId: String) {
        // ...
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}


## Rendering docs

The OpenAPI plugin supports both [Swagger UI](https://swagger.io/tools/swagger-ui/)
and/or [ReDoc](https://redoc.ly/) for rendering docs.

Enable Swagger UI on your `OpenApiOptions` object:
{% capture java %}
OpenApiOptions openApiOptions = new OpenApiOptions(applicationInfo)
    .path("/swagger-docs")
    .swagger(new SwaggerOptions("/swagger").title("My Swagger Documentation"))
    // ...
{% endcapture %}
{% capture kotlin %}
val openApiOptions = new OpenApiOptions(applicationInfo)
    .path("/swagger-docs")
    .swagger(new SwaggerOptions("/swagger").title("My Swagger Documentation"))
    // ...
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

You can have both Swagger UI and ReDoc enabled at the same time.

### ReDoc

Enable ReDoc on your `OpenApiOptions` object:

{% capture java %}
OpenApiOptions openApiOptions = new OpenApiOptions(applicationInfo)
    .path("/swagger-docs")
    .reDoc(new ReDocOptions("/redoc").title("My ReDoc Documentation"))
    // ...
{% endcapture %}
{% capture kotlin %}
val openApiOptions = new OpenApiOptions(applicationInfo)
    .path("/swagger-docs")
    .reDoc(new ReDocOptions("/redoc").title("My ReDoc Documentation"))
    // ...
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

You can have both ReDoc and Swagger UI enabled at the same time.

#### Acknowledgements

The original version of this plugin and its documentation was written almost
entirely by [Tobias Walle](https://github.com/javalin/javalin/pulls?q=is%3Apr+author%3ATobiasWalle) ([LinkedIn](https://www.linkedin.com/in/tobias-walle/)).

It has later been improved upon by many contributors, most notably:

* [maxemann96](https://github.com/javalin/javalin/pulls?q=is%3Apr+author%3Amaxemann96)
* [sealedtx](https://github.com/javalin/javalin/pulls?q=is%3Apr+author%3Asealedtx)
* [28Smiles](https://github.com/javalin/javalin/pulls?q=is%3Apr+author%3A28Smiles)
* [chsfleury](https://github.com/javalin/javalin/pulls?q=is%3Apr+author%3Achsfleury)
* [RalphSteinhagen](https://github.com/javalin/javalin/pulls?q=is%3Apr+author%3ARalphSteinhagen)
