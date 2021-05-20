---
layout: tutorial
title: "Jetty session handling - Persisting, caching and clustering"
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
date: 2018-09-02
permalink: /tutorials/jetty-session-handling
github: https://github.com/tipsy/javalin-jetty-sessions-example
summarytitle: Jetty session handling
summary: The tutorial includes persisting sessions locally and in a database, as well as caching and clustering
language: ["java", "kotlin"]
---

## What you will learn
In this tutorial we'll have at look at Sessions. We'll learn about what they're used for,
as well as different ways of persisting, caching and clustering sessions using Jetty.

## What is a session?
When a user visits a website (or opens a webapp), the server usually creates a `Session` object for the user.
Users are usually linked to their `Session` by cookie with a `sessionId` value.
This `Session` object can be used to store information about the current, well, session, like if the
user is logged in.

The architecture of session management changed significantly in Jetty 9.4, and this tutorial
is intended to get you up to speed. You can view the
[documentation](https://www.eclipse.org/jetty/documentation/jetty-9/index.html#session-management)
on Jetty's website if you need all the details.

## Persisting sessions
By default Jetty will store all its session information in a `HashMap`, which is stored in memory (RAM).
When the Jetty server restarts all of the sessions are cleared. Restarts can happen for example if you're
making changes on localhost, or if you're deploying a new version of your app to your cloud provider.

### Persisting to the file system
The simplest way to persist a `Session` is to store the `Session`s as files on the file system.
This can be done using a `FileSessionDataStore`.

This approach is well suited for a dev environment, since it's easy to set up and has no dependencies.
You need to create a `SessionHandler` with a `SessionCache`, and attach a `FileSessionDataStore`:

{% capture java %}
SessionHandler fileSessionHandler() {
    SessionHandler sessionHandler = new SessionHandler();
    SessionCache sessionCache = new DefaultSessionCache(sessionHandler);
    sessionCache.setSessionDataStore(fileSessionDataStore());
    sessionHandler.setSessionCache(sessionCache);
    sessionHandler.setHttpOnly(true);
    // make additional changes to your SessionHandler here
    return sessionHandler;
}

FileSessionDataStore fileSessionDataStore() {
    FileSessionDataStore fileSessionDataStore = new FileSessionDataStore();
    File baseDir = new File(System.getProperty("java.io.tmpdir"));
    File storeDir = new File(baseDir, "javalin-session-store");
    storeDir.mkdir();
    fileSessionDataStore.setStoreDir(storeDir);
    return fileSessionDataStore;
}
{% endcapture %}
{% capture kotlin %}
fun fileSessionHandler() = SessionHandler().apply { // create the session handler
    sessionCache = DefaultSessionCache(this).apply { // attach a cache to the handler
        sessionDataStore = FileSessionDataStore().apply { // attach a store to the cache
            val baseDir = File(System.getProperty("java.io.tmpdir"))
            this.storeDir = File(baseDir, "javalin-session-store").apply { mkdir() }
        }
    }
    httpOnly = true
    // make additional changes to your SessionHandler here
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

This approach can also work on a remote server, but some cloud providers wipe all files when
you redeploy your service, so be careful. File IO can also be slow, depending on your hardware.
If you want your sessions to be a bit more persistent, and faster, you can use a database.

### Persisting to a database

Programmatically, persisting to a database is not very different from persisting to the file system.
You need to create a `SessionHandler` with a `SessionCache`, but instead of using a `FileSessionDataStore` you
need to use a datastore specific for your database. Here is an example using JDBC:

{% capture java %}
SessionHandler sqlSessionHandler(String driver, String url) {
    SessionHandler sessionHandler = new SessionHandler();
    SessionCache sessionCache = new DefaultSessionCache(sessionHandler);
    sessionCache.setSessionDataStore(
        jdbcDataStoreFactory(driver, url).getSessionDataStore(sessionHandler)
    );
    sessionHandler.setSessionCache(sessionCache);
    sessionHandler.setHttpOnly(true);
    // make additional changes to your SessionHandler here
    return sessionHandler;
}

JDBCSessionDataStoreFactory jdbcDataStoreFactory(String driver, String url) {
    DatabaseAdaptor databaseAdaptor = new DatabaseAdaptor();
    databaseAdaptor.setDriverInfo(driver, url);
    // databaseAdaptor.setDatasource(myDataSource); // you can set data source here (for connection pooling, etc)
    JDBCSessionDataStoreFactory jdbcSessionDataStoreFactory = new JDBCSessionDataStoreFactory();
    jdbcSessionDataStoreFactory.setDatabaseAdaptor(databaseAdaptor);
    return jdbcSessionDataStoreFactory;
}
{% endcapture %}
{% capture kotlin %}
fun sqlSessionHandler(driver: String, url: String) = SessionHandler().apply {
    sessionCache = DefaultSessionCache(this).apply { // create the session handler
        sessionDataStore = JDBCSessionDataStoreFactory().apply { // attach a cache to the handler
            setDatabaseAdaptor(DatabaseAdaptor().apply { // attach a store to the cache
                setDriverInfo(driver, url)
                // setDatasource(myDataSource) // you can set data source here (for connection pooling, etc)
            })
        }.getSessionDataStore(sessionHandler)
    }
    httpOnly = true
    // make additional changes to your SessionHandler here
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

If you want to use MongoDB you can just switch the data store:

{% capture java %}
MongoSessionDataStoreFactory mongoDataStoreFactory(String url, String dbName, String collectionName) {
    MongoSessionDataStoreFactory mongoSessionDataStoreFactory = new MongoSessionDataStoreFactory();
    mongoSessionDataStoreFactory.setConnectionString(url);
    mongoSessionDataStoreFactory.setDbName(dbName);
    mongoSessionDataStoreFactory.setCollectionName(collectionName);
    return mongoSessionDataStoreFactory;
}
{% endcapture %}
{% capture kotlin %}
sessionDataStore = MongoSessionDataStoreFactory().apply {
    connectionString = "..."
    dbName = "..."
    collectionName = "..."
}.getSessionDataStore(sessionHandler)
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Jetty supports JDBC, MongoDB, Inifinspan, Hazelcast, and Google Cloud DataStore.
JDBC is included with in the core jetty-server dependency, while MongoDB and others require
additional dependencies.

If you're using a SQL database, Jetty will create a `jettysessions` table. If you're using MongoDB it will create
a document. They both contain the same data:

```java
{
    "_id": {
        "$oid": "5b858d527d3c0f8722173292"
    },
    "id": "node0j4ii2zxu01i91g5f8odup78c30",
    "accessed": 1535479586876,
    "context": {
        "0_0_0_0:": {
            "__metadata__": {
                "lastNode": "node0",
                "lastSaved": 1535479586879,
                "version": 78
            },
            "signed-in-user": "tipsy" // custom data
        }
    },
    "created": 1535479122617,
    "expiry": 0,
    "lastAccessed": 1535479585053,
    "maxIdle": -1,
    "valid": true
}
```

For performance and security reasons, it's advised to create a separate database (on the database instance)
with credentials unique to Jetty.

## Session cache and clustering
Since database and file systems operations are relatively slow, caching data in memory can increase the performance
of your application. In both the previous examples we attached a `SessionCache` to our `SessionHandler`. There are
two implementations of the `SessionCache` included in Jetty, `DefaultSessionCache` and `NullSessionCache`.

### DefaultSessionCache
We used the `DefaultSessionCache` in our previous examples, and it caches sessions in memory.
This is great if you have one instance of your app running, but it can lead to trouble if you
have two instances behind a load-balancer. Jetty recommends you always use sticky-sessions
with the `DefaultSessionCache`, but even with sticky sessions you can run into inconsistencies.
If an instance goes down or gets overloaded, traffic will be routed to the other instance which won't
have the same session in its cache. This is where the `NullSessionCache` is useful.

### NullSessionCache
The `NullSessionCache` doesn't actually do any caching at all. Every time a `Session` is needed
it's fetched from the `SessionDataStore`. This means that all instances share the same source of truth, and there
won't be any inconsistencies. Jetty recommends this approach for clustering without sticky-sessions, but
it's the safer choice even if sticky-sessions are enabled.

There is a performance penalty to not caching, but if you're running a dedicated database on the same network
with small sessions, it should just be ~10ms per request. Using an external hosted MongoDB such
as [mlab](https://mlab.com/) it seems to be around 40ms.

### SameSite session cookie settings
By default, Jetty uses lenient cookie security settings. In order to harden and to mitigate
cross-site request forgery ([CSRF](https://en.wikipedia.org/wiki/Cross-site_request_forgery)) attacks, it is useful
to set the `SameSite=strict` cookie flag. This is particularly recommended if the `JSESSIONID` cookie is also used
directly or indirectly for authentication purposes.

{% capture java %}
private static Supplier<SessionHandler> customSessionHandlerSupplier() {
final SessionHandler sessionHandler = new SessionHandler();
// [..] add persistence DB etc. management here [..]
sessionHandler.getSessionCookieConfig().setHttpOnly(true);
sessionHandler.getSessionCookieConfig().setSecure(true);
sessionHandler.getSessionCookieConfig().setComment("__SAME_SITE_STRICT__");
return () -> sessionHandler;
}
{% endcapture %}
{% capture kotlin %}
private fun customSessionHandlerSupplier(): SessionHandler = SessionHandler().apply {
// [..] add persistence DB etc. management here [..]
sessionCookieConfig.isHttpOnly = true
sessionCookieConfig.isSecure = true
sessionCookieConfig.comment = "__SAME_SITE_STRICT__"
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Summary
* Session handling in Jetty requires a `SessionHandler`, `SessionCache`, and a `SessionDataStore`
* A `FileSessionDataStore` is well suited for development environments
* The `DefaultSessionCache` works well if you only run one instance of your app
* The `NullSessionCache` is suitable for multiple instances running behind a loadbalancer

## Usage in Javalin
Since you are currently on [javalin.io](/), it should be mentioned how to use this knowledge in your Javalin app.
Since Javalin relies on Jetty for session handling can, you simply pass your `SessionHandler`:

{% capture java %}
Javalin.create(config -> {
    config.sessionHandler(() -> fileSessionHandler());
}).start(7000);
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create {
    it.sessionHandler { fileSessionHandler() }
}.start(7000)
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

As we saw earlier, the `SessionHandler` has a `SessionCache` which again has a `SessionDataStore`,
so no further configuration is required.  All session configuration happens through Jetty classes.

N.B. some browsers (see e.g. [here](https://blog.chromium.org/2020/02/samesite-cookie-changes-in-february.html))
will eventually further restrict cookies to first-party access by default in case the `SameSite` and `secure`
cookie settings are not being set.

### Working with sessions
Sessions are a great way to keep a trusted state for your connected clients.
If you use a session database, values stored in the session store can be retrieved by each of your running instances.

#### Writing values
{% capture java %}
app.get("/write", ctx -> {
    // values written to the session will be available on all your instances if you use a session db
    ctx.sessionAttribute("my-key", "My value");
});
{% endcapture %}
{% capture kotlin %}
app.get("/write") { ctx ->
    // values written to the session will be available on all your instances if you use a session db
    ctx.sessionAttribute("my-key", "My value")
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

#### Reading values
{% capture java %}
app.get("/read", ctx -> {
    // values on the session will be available on all your instances if you use a session db
    String myValue = ctx.sessionAttribute("my-key");
});
{% endcapture %}
{% capture kotlin %}
app.get("/read") { ctx ->
    // values on the session will be available on all your instances if you use a session db
    val myValue = ctx.sessionAttribute<String>("my-key")
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

#### Invalidating sessions
{% capture java %}
app.get("/invalidate", ctx -> {
    // if you want to invalidate a session, jetty will clean everything up for you
    ctx.req.getSession().invalidate();
});
{% endcapture %}
{% capture kotlin %}
app.get("/invalidate") { ctx ->
    // if you want to invalidate a session, jetty will clean everything up for you
    ctx.req.session.invalidate()
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

#### Changing session ids
{% capture java %}
app.get("/change-id", ctx -> {
    // it could be wise to change the session id on login, to protect against session fixation attacks
    ctx.req.changeSessionId();
});
{% endcapture %}
{% capture kotlin %}
app.get("/change-id") { ctx ->
    // it could be wise to change the session id on login, to protect against session fixation attacks
    ctx.req.changeSessionId()
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

#### Access management
Sessions work well with the Javalin [AccessManager](https://javalin.io/documentation#access-manager).
You can check the session store to see if the user is logged in:

{% capture java %}
app.accessManager((handler, ctx, roles) -> {
    String currentUser = ctx.sessionAttribute("current-user"); // retrieve user stored during login
    if (currentUser == null) {
        redirectToLogin(ctx);
    } else if (userHasValidRole(ctx, roles)) {
        handler.handle(ctx);
    } else {
        throw new UnauthorizedResponse();
    }
});
{% endcapture %}
{% capture kotlin %}
app.accessManager { handler, ctx, roles ->
    val currentUser = ctx.sessionAttribute<String?>("current-user") // retrieve user stored during login
    when {
        currentUser == null -> redirectToLogin(ctx)
        currentUser != null && userHasValidRole(ctx, roles) -> handler.handle(ctx)
        else -> throw UnauthorizedResponse()
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

The source code for these examples is available in the
[tutorial repo](https://github.com/tipsy/javalin-jetty-sessions-example/blob/master/src/main/java/app/Main.java).
