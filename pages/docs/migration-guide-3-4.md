---
layout: default
title: Migration guide, v3 to v4
rightmenu: false
permalink: /migration-guide-javalin-3-to-4
---

<h1 class="no-margin-top">Javalin 3 to 4 migration guide</h1>
This page attempts to cover all the things you need to know in order to migrate from Javalin 3 to Javalin 4.
If you find any errors, please <a href="{{site.repourl}}/blob/master/{{page.path}}">edit this page on GitHub</a>.

## Routing and path parameters
The path parameter syntax has changed from `:param` to `{param}`. A new `<param>` syntax has
also been introduced, which allows for path parameters to accept slashes. A single path
segment can now include both static and dynamic parts, and multiple path params:

```java
get("/:param", ...) // old
get("/{param}", ...) // new

get("/:param-suffix", ...) // invalid
get("/{param}-suffix", ...) // new

get("/files/:filename.:extension", ...) // invalid
get("/files/{filename}.{extension}", ...) // new

get("/root/:subpaths/leaf") // old (will only match /root/1/leaf)
get("/root/<subpaths>/leaf") // new (will match /root/1/2/3/leaf)
```

The `ctx.splat(index)` method has been removed in favor of the new `ctx.pathParam(key)`
method, since this method now supports multiple subpaths.

## Static files configuration
Static file handling in Javalin 3 was an adventure. You could declare static file handlers like:

```java
config.addStaticFiles(path);
config.addStaticFiles(path, location);
config.addStaticFiles(path, location, hostedPath);
```

You could also configure some global options:

```java
config.precompressStaticFiles = true/false;
config.aliasCheckForStaticFiles = ContextHandler.AliasCheck;
```

And in addition, there was special handling if you put files in a folder called `immutable`.

In Javalin 4, you can add handlers like this:
```java
config.addStaticFiles(path, location); // location is now required, default is gone
config.addStaticFiles(staticFileConfig);
```

The `StaticFileConfig` class has the following options:

```kotlin
var hostedPath: String = "/",
var directory: String = "/public",
var location: Location = Location.CLASSPATH,
var precompress: Boolean = false,
var aliasCheck: AliasCheck? = null,
var headers: Map<String, String> = mapOf(Header.CACHE_CONTROL to "max-age=0")
```
The global options have been removed, so all options are now per static file handler.
These options can be configure in a familiar Javalin way:

```java
config.addStaticFiles(staticFiles ->
    staticFiles.aliasCheck = ContextHandler.AliasCheck((path, resource) -> !path.endsWith(".txt"));
    staticFiles.directory = "src/test/external/";
    staticFiles.location = Location.EXTERNAL;
}
```

## Roles
Routes used to accept a `Set<Role>`, but they now accept a `RouteRole...` (varargs):

```java
get("/path", controller::method, roles(MyRole.ROLENAME)) // old, using util-method
get("/path", controller::method, new HashSet<>(Arrays.asList(MyRole.ROLENAME));) // old, no util method
get("/path", controller::method, Role.ROLENAME) // new
```

The marker interface was renamed from `Role` to `RouteRole`, both because it's clearer
in the internal code what a `RouteRole` is, and because it's tempting for end-users to
name their role enum `Role`.

## Validation rework
* Validation has been reworked from having a `Validator<T>` and a `BodyValidator<T>`, to also include
  a `BaseValidator<T>` and a `NullableValidator<T>`.
* You can convert from a `Validator` to a `NullableValidator` by calling `Validator#allowNullable`.
* A `Validator#getOrDefault` method has been added.
* Validation errors are available as `BaseValidator#errors`, which all validators inherit.

The `check` method can now take a map of arguments, which is useful for localization:

```kotlin
ctx.queryParamAsClass<Int>("age")
    .check({ it >= 18 }, ValidationError("AGE_TOO_LOW", args = mapOf("minAge" to 18)))
    .get()
```

Validation errors are now provided as a map:
```javascript
{"age": [{"message":"NULLCHECK_FAILED", "args":{}, "value": null}]} // POST /age-check
{"age": [{"message":"AGE_TOO_LOW", "args": {"minAge": 18}, "value": 16}]} // POST /age-check?age=16
```

How validation errors are handled can be changed by overriding the `ValidationException`:
```kotlin
app.exception(ValidationException::class.java) { e, ctx ->
    e.errors // do stuff with errors
}
```

## Reified methods on `Context`
The reified methods on `Context` and `WsContext` have been renamed from `ctx.queryParam<Int>` to `ctx.queryParamAsClass<Int>("key")`.
This change was necessary because mocking libraries were confused by the seemingly identical signatures of
`queryParam(key): String` and `reified queryParam(key): T`

## `JavalinJson` moves to `config.jsonMapper(jsonMapper)`
The `JavalinJson` has been replaced by a `JsonMapper`
interface, which has four optional methods:

```java
default String toJsonString(@NotNull Object obj) { // basic method for mapping to json
default InputStream toJsonStream(@NotNull Object obj) { // memory efficient method for mapping to json
default <T> T fromJsonString(@NotNull String json, @NotNull Class<T> targetClass) { // basic method for mapping from json
default <T> T fromJsonStream(@NotNull InputStream json, @NotNull Class<T> targetClass) { // memory efficient method for mapping from json
```

You only have to implement the methods you will be using. If you implement `fromJsonStream`,
Javalin will pick this automatically over `fromJsonString` when deserializing a request body to an object,
but `toJsonStream` needs to be called explicitly by doing `ctx.json(obj, useStreamingMapper = true)`.
This is because it uses an extra thread, and will only be beneficial for bigger JSON objects
(unless you are using Project Loom).

To configure Javalin to use your `JsonMapper`, do `config.jsonMapper(myJsonMapper)`.

## Future rework
In Javalin 3, we had `ctx.json(future)` and `ctx.result(future)`.
In Javalin 4 we have `ctx.future(future)`, and `ctx.future(future, callback)`.
The default callback is implemented as:

```kotlin
when (result) {
    is InputStream -> result(result)
    is String -> result(result)
    is Any -> json(result)
}
```

Meaning it will be set as a result if it's an `InputStream` or a `String`,
and it will be transformed into JSON if it's any other type of object.
If you need custom handling, you can now define this easily:

```kotlin
ctx.future(myFuture) { result ->
    if (result != null) {
        ctx.status(200)
        ctx.json(result)
    } else {
        ctx.status(404)
    }
}
```

This should provide a lot more flexibility when working with futures in Javalin.

## `maxRequestSize` replaces `requestCacheSize`
The old `requestCacheSize` has been removed, and `maxRequestSize` is now set to 1mb by default.
This means that requests up to 1mb will be cached when you call `ctx.body()`. Requests larger
than 1mb require you to use `ctx.bodyAsInputStream()` in order to read them (unless you adjust `maxRequestSize`).

## `compressionStrategy` replaces `dynamicGzip`
The old `dynamicGzip = true/false` has been replaced by `config.compressionStrategy(Brotli(level), Gzip(level))`.
To disable compression, do `config.compressionStrategy(CompressionStrategy.NONE)`.

## A `RateLimiter` reality check
The `RateLimiter` in Javalin is very naive, and in Javalin 4 we decided to be a bit more
aggressive in letting people know this. The `RateLimiter` is now called `NaiveRateLimiter`.

## Cookie overwrites
Multiple calls to `ctx.cookie(name)` will now only result in one cookie being set.
In Javalin 3 this method functioned as `addCookie`, but in Javalin 4 this has been fixed
so it behaves like `setCookie`.

## Internal `config` is now `_conf`
The internal `config` is `public` for advanced users, but we noticed a lot of beginners
using it accidentally. It's been renamed to `_conf` to discourage (mis)use.

## WebSocket renaming
* The `WsHandlerController` class has been renamed to `WsConnection`
* The `WsHandler` class has been renamed to `WsConfig`

## App attributes signatures
The `Javalin#attribute(class, value)` method is now `Javalin#attribute(string, value)`.

## Default port 8080
The default port was changed from `7000` to `8080` to conform with other JVM frameworks.
