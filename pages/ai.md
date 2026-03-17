---
layout: default
title: AI coding instructions
rightmenu: false
permalink: /ai
description: "AI coding instructions for Javalin 7. Pre-built rules for Claude Code, Cursor, GitHub Copilot, Windsurf, Codex, and Gemini."
---

<script>{% include ai-page.js %}</script>
<style>{% include ai-page.css %}</style>

<h1 class="no-margin-top">AI Coding Instructions</h1>

<p class="ai-intro">
    Copy pre-built instructions to teach your AI coding assistant about Javalin {{site.javalinversion}}.
    Each block contains the same core knowledge — API patterns, conventions, and common pitfalls — adapted to the format your tool expects.
    Add the instructions to your project's AI config file and your assistant will write better Javalin code immediately.
</p>

{% capture javalin_instructions %}# ╔══════════════════════════════════════════════════════════════╗
# ║              JAVALIN FRAMEWORK INSTRUCTIONS                  ║
# ╚══════════════════════════════════════════════════════════════╝
# Javalin {{site.javalinversion}} — AI Coding Instructions

## Project overview
Javalin is a lightweight web framework for Java and Kotlin, built on Jetty 12.
- Requires Java 17+
- Maven: `io.javalin:javalin:{{site.javalinversion}}`
- Bundle (includes Jackson, Logback, testing): `io.javalin:javalin-bundle:{{site.javalinversion}}`
- SLF4J is the only required dependency — add Logback or another implementation for logging

## Core pattern
All configuration (routes, plugins, lifecycle) goes inside `Javalin.create(config -> { ... })`:

```java
// Java
import io.javalin.Javalin;

void main() {
    var app = Javalin.create(config -> {
        config.routes.get("/", ctx -> ctx.result("Hello World"));
    }).start(7070);
}
```

```kotlin
// Kotlin
import io.javalin.Javalin

fun main() {
    val app = Javalin.create { config ->
        config.routes.get("/") { ctx -> ctx.result("Hello World") }
    }.start(7070)
}
```

## Routing
Routes are defined via `config.routes`:

```java
config.routes.get("/users", ctx -> ctx.json(userDao.getAll()));
config.routes.get("/users/{id}", ctx -> {
    int id = ctx.pathParamAsClass("id", Integer.class).get();
    ctx.json(userDao.getById(id));
});
config.routes.post("/users", ctx -> {
    User user = ctx.bodyAsClass(User.class);
    userDao.create(user);
    ctx.status(201);
});
config.routes.put("/users/{id}", ctx -> {
    int id = ctx.pathParamAsClass("id", Integer.class).get();
    User user = ctx.bodyAsClass(User.class);
    userDao.update(id, user);
});
config.routes.delete("/users/{id}", ctx -> {
    int id = ctx.pathParamAsClass("id", Integer.class).get();
    userDao.delete(id);
});
```

Supported methods: `get`, `post`, `put`, `patch`, `delete`, `query`, `head`, `options`.

Path parameters: `{param}` (no slashes) or `<param>` (allows slashes).
Wildcard: `/path/*` matches anything (but value cannot be extracted — use `<param>` instead).

## Handlers
The `Handler` interface is `ctx -> { ... }` with a void return. Set the response with:
- `ctx.result("text")` — plain text
- `ctx.json(object)` — JSON (requires Jackson or another JSON mapper)
- `ctx.html("<h1>Hi</h1>")` — HTML
- `ctx.status(code)` — HTTP status
- `ctx.redirect("/path")` — redirect
- `ctx.future(completableFuture)` — async

## Before/after handlers
```java
config.routes.before(ctx -> { /* runs before every request */ });
config.routes.after(ctx -> { /* runs after every request */ });
config.routes.beforeMatched(ctx -> { /* only if a route matched */ });
config.routes.afterMatched(ctx -> { /* only if a route matched */ });
config.routes.before("/api/*", ctx -> { /* path-scoped */ });
```

## Validation
```java
// Path parameter validation
int id = ctx.pathParamAsClass("id", Integer.class)
    .check(i -> i > 0, "ID must be positive")
    .get();

// Query parameter validation
int page = ctx.queryParamAsClass("page", Integer.class)
    .getOrDefault(1);

// Body validation
User user = ctx.bodyValidator(User.class)
    .check(u -> u.name != null, "Name required")
    .get();
```

## WebSockets
```java
config.routes.ws("/websocket", ws -> {
    ws.onConnect(ctx -> { /* WsConnectContext */ });
    ws.onMessage(ctx -> { ctx.send("Echo: " + ctx.message()); });
    ws.onClose(ctx -> { /* WsCloseContext */ });
    ws.onError(ctx -> { /* WsErrorContext */ });
});
```

## Server-Sent Events
```java
config.routes.sse("/sse", client -> {
    client.sendEvent("message", "Hello SSE");
    client.onClose(() -> { /* cleanup */ });
    client.keepAlive();
});
```

## Exception and error mapping
```java
config.error.exception(NotFoundException.class, (e, ctx) -> {
    ctx.status(404).result(e.getMessage());
});
config.error.error(404, ctx -> {
    ctx.result("Page not found");
});
```

## Access management
```java
config.accessManager((handler, ctx, routeRoles) -> {
    Role userRole = getUserRole(ctx);
    if (routeRoles.contains(userRole)) {
        handler.handle(ctx);
    } else {
        ctx.status(403).result("Forbidden");
    }
});
```

## Plugin configuration
```java
Javalin.create(config -> {
    // Bundled plugins
    config.bundledPlugins.enableCors(cors -> cors.addRule(it -> it.anyHost()));
    config.bundledPlugins.enableRouteOverview("/routes");
    config.bundledPlugins.enableDevLogging();

    // Static files
    config.staticFiles.add("/public", Location.CLASSPATH);
});
```

Available add-on artifacts: `javalin-rendering-{engine}` (JTE, Thymeleaf, Velocity, Pebble, Mustache, Handlebars), `javalin-micrometer`, `javalin-ssl`.

Custom plugins implement the `Plugin` interface.

## Handler groups
Use `apiBuilder` to group routes by path prefix (requires `import static io.javalin.apibuilder.ApiBuilder.*`):

```java
config.routes.apiBuilder(() -> {
    path("/users", () -> {
        get(UserController::getAllUsers);
        post(UserController::createUser);
        path("/{id}", () -> {
            get(UserController::getUser);
            patch(UserController::updateUser);
            delete(UserController::deleteUser);
        });
    });
});
```

CrudHandler shortcut — maps `getAll`, `getOne`, `create`, `update`, `delete` automatically:
```java
config.routes.apiBuilder(() -> {
    crud("users/{user-id}", new UserCrudHandler());
});
```

## Default HTTP responses
Throw typed exceptions for standard error responses (JSON body if client accepts JSON):
- `throw new BadRequestResponse("message")` — 400
- `throw new UnauthorizedResponse("message")` — 401
- `throw new ForbiddenResponse("message")` — 403
- `throw new NotFoundResponse("message")` — 404
- `throw new MethodNotAllowedResponse("message")` — 405
- `throw new ConflictResponse("message")` — 409
- `throw new GoneResponse("message")` — 410
- `throw new InternalServerErrorResponse("message")` — 500

All extend `HttpResponseException`. You can pass additional details: `new BadRequestResponse("msg", Map.of("detail", "value"))`.

## File uploads
```java
config.routes.post("/upload", ctx -> {
    UploadedFile file = ctx.uploadedFile("myFile");
    // file.filename(), file.content() (InputStream), file.size(), file.contentType()
    FileUtil.streamToFile(file.content(), "upload/" + file.filename());
});
// Multiple files
ctx.uploadedFiles("files"); // List<UploadedFile>
```

## Template rendering
Add a rendering engine artifact, e.g. `io.javalin:javalin-rendering-jte:{{site.javalinversion}}`:

```java
// Register the renderer
config.fileRenderer(new JavalinJte());

// Use in a handler
config.routes.get("/hello", ctx -> {
    ctx.render("hello.jte", Map.of("name", "World"));
});
```

Available engines: `javalin-rendering-jte`, `javalin-rendering-thymeleaf`, `javalin-rendering-velocity`, `javalin-rendering-pebble`, `javalin-rendering-mustache`, `javalin-rendering-handlebars`, `javalin-rendering-freemarker`, `javalin-rendering-commonmark`.
Templates go in `src/main/resources/templates/` by default.

## JSON mapper configuration
Jackson is the default JSON mapper. Customize it:

```java
config.jsonMapper(new JavalinJackson().updateMapper(mapper -> {
    mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
}));
```

Jackson auto-detects these modules if on classpath: `KotlinModule`, `JavaTimeModule`.
To use a different mapper (e.g. Gson), implement the `JsonMapper` interface.

## Lifecycle events
```java
config.events.serverStarting(() -> { /* starting up */ });
config.events.serverStarted(() -> { /* ready to serve */ });
config.events.serverStartFailed(() -> { /* failed to start */ });
config.events.serverStopping(() -> { /* shutting down */ });
config.events.serverStopped(() -> { /* stopped */ });
config.events.handlerAdded(info -> { /* route registered */ });
config.events.wsHandlerAdded(info -> { /* ws route registered */ });
```

## Single page application (SPA) support
Serve a single HTML file for all unmatched paths under a root (for Vue, React, etc.):

```java
config.spaRoot.addFile("/", "/public/index.html");
// or with dynamic handler
config.spaRoot.addHandler("/", ctx -> ctx.html("..."));
```

## JavalinVue
Server-side Vue.js integration — no build pipeline needed:

```java
config.registerPlugin(new JavalinVuePlugin());
config.routes.get("/my-page", new VueComponent("my-page"));
```

Vue files go in `src/main/resources/vue/components/`. Pass server state to Vue:
```java
config.registerPlugin(new JavalinVuePlugin(vue -> {
    vue.stateFunction = ctx -> Map.of("user", getUser(ctx));
}));
// Access in Vue template: {% raw %}{{ $javalin.state.user }}{% endraw %}
```

## OpenAPI
API documentation is available via the `javalin-openapi` plugin (separate repository).
See [javalin.io/plugins/openapi](https://javalin.io/plugins/openapi) for setup, `@OpenApi` annotations, and Swagger UI integration.

## Testing with JavalinTest
Use `javalin-testtools` (included in `javalin-bundle`) for integration tests. `JavalinTest.test()` starts a real server and provides an HTTP client:

```java
import io.javalin.testtools.JavalinTest;
import static org.assertj.core.api.Assertions.assertThat;

Javalin app = Javalin.create(config -> {
    config.router.apiBuilder(() -> {
        get("/users", ctx -> ctx.json(userService.getAll()));
        post("/users", ctx -> {
            User user = ctx.bodyAsClass(User.class);
            userService.create(user);
            ctx.status(201);
        });
    });
});

@Test
public void GET_users_returns_200() {
    JavalinTest.test(app, (server, client) -> {
        assertThat(client.get("/users").code()).isEqualTo(200);
    });
}

@Test
public void POST_users_creates_user() {
    JavalinTest.test(app, (server, client) -> {
        var response = client.post("/users", new User("Alice"));
        assertThat(response.code()).isEqualTo(201);
    });
}
```

The `client` supports `get()`, `post()`, `put()`, `patch()`, `delete()` — all return an OkHttp `Response` with `.code()` and `.body().string()`. Each test gets a fresh server instance on a random port.

## Context methods quick reference
Request info:
- `ctx.body()` — request body as string
- `ctx.bodyAsClass(MyClass.class)` — deserialize JSON body
- `ctx.pathParam("id")` — path parameter (e.g., `/users/{id}`)
- `ctx.queryParam("name")` — query parameter (e.g., `?name=alice`)
- `ctx.formParam("field")` — form parameter
- `ctx.header("X-Custom")` — request header
- `ctx.cookie("name")` — cookie value
- `ctx.uploadedFile("file")` — single uploaded file
- `ctx.uploadedFiles("files")` — multiple uploaded files
- `ctx.attribute("key", value)` / `ctx.attribute("key")` — request-scoped attributes (share data between handlers)
- `ctx.sessionAttribute("key")` — session attribute
- `ctx.method()`, `ctx.url()`, `ctx.ip()`, `ctx.contentType()` — request metadata

Response:
- `ctx.result("text")` — set text response
- `ctx.json(myObject)` — serialize to JSON response
- `ctx.html("<h1>Hi</h1>")` — set HTML response
- `ctx.status(201)` — set status code
- `ctx.header("X-Custom", "value")` — set response header
- `ctx.cookie("name", "value")` — set cookie
- `ctx.redirect("/path")` — redirect
- `ctx.render("template.html", model)` — render template
- `ctx.contentType("application/json")` — set content type

## Important Javalin 7 changes (common pitfalls)
1. **Routes MUST be inside `config.routes`** — you cannot add routes after `.start()`. This is the biggest v7 change.
2. **`app.start()` no longer returns `this`** — chain off `Javalin.create()` instead of storing and calling start separately.
3. **Template rendering is modular** — add `javalin-rendering-{engine}` artifacts explicitly (e.g., `javalin-rendering-jte`).
4. **Jetty 12** — if configuring Jetty directly, use Jetty 12 APIs.
5. **Java 17+** is required.
# ╔══════════════════════════════════════════════════════════════╗
# ║          END OF JAVALIN FRAMEWORK INSTRUCTIONS               ║
# ╚══════════════════════════════════════════════════════════════╝{% endcapture %}

{% capture cursor_frontmatter %}---
description: Javalin {{site.javalinversion}} web framework conventions and API patterns
globs: "*.java,*.kt"
---
{% endcapture %}

{% capture claude_content %}{{ javalin_instructions | strip | xml_escape }}{% endcapture %}
{% capture cursor_content %}{{ cursor_frontmatter | strip | xml_escape }}
{{ javalin_instructions | strip | xml_escape }}{% endcapture %}

<div class="jv-card-list">

{% include ai-card.html id="claude" title="Claude Code" content=claude_content setup='Add to your <code>CLAUDE.md</code> in your project root.' filename="CLAUDE.md" %}

{% include ai-card.html id="cursor" title="Cursor" content=cursor_content setup='Save as <code>javalin.mdc</code> in your <code>.cursor/rules/</code> directory.' filename="javalin.mdc" %}

{% include ai-card.html id="copilot" title="GitHub Copilot" content=claude_content setup='Add to your <code>.github/copilot-instructions.md</code>.' filename="copilot-instructions.md" %}

{% include ai-card.html id="windsurf" title="Windsurf" content=claude_content setup='Add to your <code>.windsurfrules</code> in your project root.' filename=".windsurfrules" %}

{% include ai-card.html id="codex" title="Codex / AGENTS.md" content=claude_content setup='Add to your <code>AGENTS.md</code> in your project root.' filename="AGENTS.md" %}

{% include ai-card.html id="gemini" title="Gemini" content=claude_content setup='Add to your <code>GEMINI.md</code> in your project root.' filename="GEMINI.md" %}

</div>
