---
layout: tutorial
official: false
title: "Javalin with Bpdbi: A Pipelining-first Postgres Client in Kotlin"
permalink: /tutorials/javalin-bpdbi-kotlin
summarytitle: Using Javalin with Bpdbi (Kotlin)
summary: Build a REST API with Javalin and Bpdbi — a lightweight, pipelining-first Postgres driver that bypasses JDBC for better performance and a simpler stack.
date: 2026-03-26
author: <a href="https://github.com/cies">Cies Breijs</a>
language: ["kotlin", "gradle", "postgres", "sql"]
rightmenu: true
github: https://github.com/bpdbi/bpdbi
---

## Why Javalin + Bpdbi?

Javalin and Bpdbi share the same philosophy: **do one thing well, stay lightweight, and get out of your way.**

Javalin gives you a simple HTTP layer without the ceremony of a full framework.
Bpdbi gives you a simple database layer without the ceremony of JDBC + a connection pool library + a query abstraction library (like Jdbi, Spring JDBC Template, etc.).

Together they make for an exceptionally lightweight stack:

- **No JDBC** — Bpdbi speaks the Postgres wire protocol directly, which unlocks pipelining and binary-for-all encoding
- **No Netty** — plain `java.net.Socket`, no event loop, no reactive machinery
- **No reflection** — the `bpdbi-kotlin` module uses `kotlinx.serialization` for row mapping, which does not use the reflection API
- **Simplicity of code** — since Bpdbi used the good old blocking paradigm the code is very readable 

The total dependency footprint for the database side is under 200KB — compare that to JDBC driver + HikariCP + Jdbi (several MB) or Hibernate (~15MB).

## What is pipelining?

Pipelining sends multiple SQL statements to the database in a single network write and reads all responses back at once. This reduces the number of round-trips, which is especially valuable when:

- You need to run setup statements before your actual query (e.g. `BEGIN`, `SET`, RLS configuration)
- You need results from multiple independent queries in a single request
- You're inserting or updating multiple rows

For example, a typical "start transaction + query" that takes 2 round-trips with JDBC can be done in 1 round-trip with Bpdbi:

```kotlin
conn.enqueue("BEGIN")
conn.enqueue("SET LOCAL statement_timeout TO '5s'")
val result = conn.sql("SELECT * FROM users WHERE id = :id")
    .bind("id", userId)
    .query()
// All three statements sent in a single network write
```

In benchmarks with 1ms simulated network latency, pipelining gives a **2-17x speedup** depending on the scenario.

## Project setup

### Gradle (build.gradle.kts)

```kotlin
plugins {
    kotlin("jvm") version "2.1.20"
    kotlin("plugin.serialization") version "2.1.20"
    application
}

group = "com.example"

repositories {
    mavenCentral()
}

application {
    mainClass.set("com.example.AppKt")
}

val javalinVersion = "6.6.0"
val bpdbiVersion = "0.1.0"

dependencies {
    implementation("io.javalin:javalin-bundle:$javalinVersion")
    implementation(platform("io.github.bpdbi:bpdbi-bom:$bpdbiVersion"))
    implementation("io.github.bpdbi:bpdbi-pg-client")
    implementation("io.github.bpdbi:bpdbi-pool")
    implementation("io.github.bpdbi:bpdbi-kotlin")
}
```

The `bpdbi-bom` aligns all module versions. The three modules we use:

- **bpdbi-pg-client** — the Postgres driver (speaks wire protocol directly)
- **bpdbi-pool** — a lightweight connection pool
- **bpdbi-kotlin** — Kotlin extensions and `kotlinx.serialization`-based row mapping

### Docker Compose with Postgres

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: demo
      POSTGRES_PASSWORD: demo
      POSTGRES_DB: demo
    ports:
      - "5432:5432"
```

Start it with `docker compose up -d`.

## Data model

Define a simple `tasks` table. We'll create it on app startup:

```kotlin
private fun initSchema(pool: ConnectionPool) {
    pool.withConnection { conn ->
        conn.query("""
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                done BOOLEAN NOT NULL DEFAULT false
            )
        """)
    }
}
```

And a Kotlin data class to map rows into, using `kotlinx.serialization`:

```kotlin
import kotlinx.serialization.Serializable

@Serializable
data class Task(val id: Int, val title: String, val done: Boolean)
```

That's it — no reflection configuration, no code generation, no runtime dependencies. The `kotlinx.serialization` compiler plugin handles everything at compile time.

## Connection pool

Set up the pool once at application startup:

```kotlin
import io.github.bpdbi.pg.PgConnection
import io.github.bpdbi.pool.ConnectionPool
import io.github.bpdbi.pool.PoolConfig

fun createPool(): ConnectionPool {
    return ConnectionPool(
        { PgConnection.connect("localhost", 5432, "demo", "demo", "demo") },
        PoolConfig()
            .maxSize(10)
            .connectionTimeoutMillis(5000)
    )
}
```

The pool is virtual-thread friendly: blocking on `acquire()` is cheap when Javalin dispatches requests to virtual threads.

## Handlers

Now we wire up the HTTP handlers. Bpdbi's `sql()` builder with named parameters (`:name`) and `.bind()` makes the code very readable:

```kotlin
import io.github.bpdbi.kotlin.deserializeFirst
import io.github.bpdbi.kotlin.deserializeFirstOrNull
import io.github.bpdbi.kotlin.deserializeToList
import io.javalin.http.Context
import io.javalin.http.HttpStatus

class TaskController(private val pool: ConnectionPool) {

    fun getAll(ctx: Context) {
        val tasks = pool.withConnection { conn ->
            conn.sql("SELECT id, title, done FROM tasks ORDER BY id")
                .query()
                .deserializeToList<Task>()
        }
        ctx.json(tasks)
    }

    fun getOne(ctx: Context) {
        val id = ctx.pathParam("id").toInt()
        val task = pool.withConnection { conn ->
            conn.sql("SELECT id, title, done FROM tasks WHERE id = :id")
                .bind("id", id)
                .query()
                .deserializeFirstOrNull<Task>()
        }
        if (task != null) ctx.json(task)
        else ctx.status(HttpStatus.NOT_FOUND)
    }

    fun create(ctx: Context) {
        val body = ctx.bodyAsClass<CreateTask>()
        val task = pool.withConnection { conn ->
            conn.sql("INSERT INTO tasks (title) VALUES (:title) RETURNING id, title, done")
                .bind("title", body.title)
                .query()
                .deserializeFirst<Task>()
        }
        ctx.json(task).status(HttpStatus.CREATED)
    }

    fun update(ctx: Context) {
        val id = ctx.pathParam("id").toInt()
        val body = ctx.bodyAsClass<UpdateTask>()
        val task = pool.withConnection { conn ->
            conn.sql("UPDATE tasks SET title = :title, done = :done WHERE id = :id RETURNING id, title, done")
                .bind("title", body.title)
                .bind("done", body.done)
                .bind("id", id)
                .query()
                .deserializeFirstOrNull<Task>()
        }
        if (task != null) ctx.json(task)
        else ctx.status(HttpStatus.NOT_FOUND)
    }

    fun delete(ctx: Context) {
        val id = ctx.pathParam("id").toInt()
        pool.withConnection { conn ->
            conn.sql("DELETE FROM tasks WHERE id = :id")
                .bind("id", id)
                .query()
        }
        ctx.status(HttpStatus.NO_CONTENT)
    }
}

@Serializable
data class CreateTask(val title: String)

@Serializable
data class UpdateTask(val title: String, val done: Boolean)
```

Notice how there's no `ResultSet` iteration, no `try/catch (SQLException)`, no `RowMapper` boilerplate.
Named parameters (`:title`, `:id`) are more readable than positional `$1, $2` placeholders, and the `deserializeToList<Task>()` / `deserializeFirst<Task>()` extensions handle mapping using the `@Serializable` annotation — all at compile time.

Of course you can move the db queries to a separate namespace, in a Model View Controller kind of fashion.
But that's beyond the scope of this tutorial.

## Pipelining in action

Here's where Bpdbi really shines. Suppose you need to fetch a task and its related comments in a single request:

```kotlin
fun getTaskWithComments(ctx: Context) {
    val id = ctx.pathParam("id").toInt()
    pool.withConnection { conn ->
        val taskQx = conn.sql("SELECT id, title, done FROM tasks WHERE id = :id")
            .bind("id", id).enqueue()
        val commentsQx = conn.sql("SELECT id, body, created_at FROM comments WHERE task_id = :taskId")
            .bind("taskId", id).enqueue()
        val results = conn.flush()

        val task = results[taskQx].deserializeFirstOrNull<Task>()
        val comments = results[commentsQx].deserializeToList<Comment>()

        if (task != null) {
            ctx.json(mapOf("task" to task, "comments" to comments))
        } else {
            ctx.status(HttpStatus.NOT_FOUND)
        }
    }
}
```

Two queries, **one network round-trip**. With JDBC, this would always be two round-trips — there's no way around it.

## Putting it all together

```kotlin
import io.javalin.Javalin
import io.javalin.apibuilder.ApiBuilder.*

fun main() {
    val pool = createPool()
    initSchema(pool)

    val tasks = TaskController(pool)

    val app = Javalin.create { config ->
        config.router.apiBuilder {
            path("/tasks") {
                get(tasks::getAll)
                post(tasks::create)
                path("/{id}") {
                    get(tasks::getOne)
                    put(tasks::update)
                    delete(tasks::delete)
                }
            }
        }
    }.start(7070)

    Runtime.getRuntime().addShutdownHook(Thread {
        app.stop()
        pool.close()
    })
}
```

Run it with `./gradlew run`, then test with curl:

```bash
# Create a task
curl -X POST http://localhost:7070/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Write tutorial"}'

# List all tasks
curl http://localhost:7070/tasks

# Mark as done
curl -X PUT http://localhost:7070/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Write tutorial", "done": true}'
```

## Conclusion

Javalin and Bpdbi make for a remarkably lean stack: a simple HTTP server talking directly to Postgres over the binary wire protocol, with compile-time row mapping and first-class pipelining. No JDBC, no Netty, no reflection, no heavyweight frameworks.

The full Bpdbi documentation and source code can be found on [GitHub](https://github.com/bpdbi/bpdbi).
