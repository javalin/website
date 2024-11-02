---
layout: tutorial
official: false
title: Javalin and Hibernate
permalink: /tutorials/javalin-hibernate
summarytitle: Using Javalin with Hibernate ORM
summary: Learn how to make Javalin work with Hibernate.
date: 2024-10-20
author: <a href="https://brucemelo.com">Bruce Melo</a>
language: ["java", "kotlin", "gradle", "hibernate", "sql"]
rightmenu: true
#TODO: Make an example project 
github: https://github.com/brucemelo/students-javalin 
---

## Introduction

I really like the approach of frameworks like Javalin for building web applications in Java/Kotlin. 
I appreciate the focus on simplicity and ease of use. 

In this tutorial, I will explore how to integrate Javalin with [Hibernate ORM](https://hibernate.org/orm/), another one of my favorite frameworks.

### New project

To start, create a new project using [Gradle with the Kotlin DSL](https://docs.gradle.org/current/userguide/kotlin_dsl.html). 

In IntelliJ IDEA, this is typically done by navigating to New -> Project -> Java -> Gradle DSL (Kotlin).

### Gradle (build.gradle.kts)

I simply added the [Javalin bundle](https://javalin.io/download), along with two dependencies for Hibernate and one for PostgreSQL. 

I'm also using Lombok here, but that's not required.

```kotlin
plugins {
    id("java")
}

group = "com.brucemelo.app"

repositories {
    mavenCentral()
}

val javalinVersion = "6.3.0"
val lpmbokVersion = "1.18.34"
val postgresqlVersion = "42.7.3"
val hibernateVersion = "7.0.0.Beta1"
val junitVersion = "5.10.3"

dependencies {
    implementation("io.javalin:javalin-bundle:$javalinVersion")
    compileOnly("org.projectlombok:lombok:$lpmbokVersion")
    annotationProcessor("org.projectlombok:lombok:$lpmbokVersion")
    implementation("org.postgresql:postgresql:$postgresqlVersion")
    implementation("org.hibernate.orm:hibernate-core:$hibernateVersion")
    annotationProcessor("org.hibernate.orm:hibernate-jpamodelgen:$hibernateVersion")
    testImplementation(platform("org.junit:junit-bom:$junitVersion"))
    testImplementation("org.junit.jupiter:junit-jupiter")
}

tasks.test {
    useJUnitPlatform()
}
```

### Docker compose with PostgreSQL

You'll need a docker compose setup to run PostgreSQL locally.

```yaml
version: '3.8'

services:
  postgres:
    container_name: postgres1
    image: postgres:15.7
    environment:
      POSTGRES_USER: sa
      POSTGRES_PASSWORD: sa
      POSTGRES_DB: mydatabase
    ports:
      - "5432:5432"
    restart: unless-stopped
```

### Hibernate Mapping

Define a simple entity class Course using Hibernate annotations.

```java
@Setter @Getter
@Entity
@Table
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;

    public static Course newCourse(String name) {
        var course = new Course();
        course.setName(name);
        return course;
    }

}
```

### Hibernate Configuration/SessionFactory

To use Hibernate, we need to set up its core components: Configuration and [SessionFactory](https://docs.jboss.org/hibernate/orm/7.0/userguide/html_single/Hibernate_User_Guide.html#architecture).
- Configuration: object that loads Hibernate configuration settings. It's also responsible for mapping entity classes.
- SessionFactory: is a thread-safe factory that creates Session/StatelessSession objects. Since it's a heavyweight object to create, we typically instantiate it once.

#### Hibernate Configuration

```java
class AppHibernateConfig {

    static Configuration configuration() {
        var configuration = new Configuration();
        var settings = new Properties();
        settings.put(AvailableSettings.JAKARTA_JDBC_DRIVER, "org.postgresql.Driver");
        settings.put(AvailableSettings.JAKARTA_JDBC_URL, "jdbc:postgresql://localhost:5432/mydatabase");
        settings.put(AvailableSettings.JAKARTA_JDBC_USER, "sa");
        settings.put(AvailableSettings.JAKARTA_JDBC_PASSWORD, "sa");
        settings.put(AvailableSettings.HIGHLIGHT_SQL, true);
        settings.put(AvailableSettings.HBM2DDL_AUTO, Action.ACTION_CREATE);

        configuration.setProperties(settings);
        configuration.addAnnotatedClass(Course.class);
        return configuration;
    }

}
```

#### Hibernate SessionFactory

```java
class AppHibernateSessionFactory {

    private static final Logger logger = LoggerFactory.getLogger(AppHibernateSessionFactory.class);

    private static SessionFactory sessionFactory;

    static SessionFactory getSessionFactory() {
        if (Objects.isNull(sessionFactory)) {
            try {
                var configuration = AppHibernateConfig.configuration();
                var serviceRegistry = new StandardServiceRegistryBuilder()
                        .applySettings(configuration.getProperties())
                        .build();
                sessionFactory = configuration.buildSessionFactory(serviceRegistry);
            } catch (Throwable ex) {
                logger.error("Failed to create session factory", ex);
            }
        }
        return sessionFactory;
    }

}
```

### Hibernate StatelessSession Wrapper

I will use Stateless Session of Hibernate for the following reasons described in the [official documentation](https://docs.jboss.org/hibernate/orm/7.0/introduction/html_single/Hibernate_Introduction.html):
- provides a command-oriented, more bare-metal approach to interacting with the database.
- doesn’t have a first-level cache (persistence context), nor does it interact with any second-level caches, and
- doesn’t implement transactional write-behind or automatic dirty checking, so all operations are executed immediately when they’re explicitly called.

I developed a lightweight wrapper around Hibernate StatelessSession and Transaction that will be the interface for other classes in the project - **AppHibernate**. 

The **AppHibernateConfig** and **AppHibernateSessionFactory** classes are encapsulated and only accessible within the package.


```java
public class AppHibernate {

    public static void inTransaction(Consumer<StatelessSession> consumer) {
        AppHibernateConfig.getSessionFactory().inStatelessTransaction(consumer);
    }

    public static <R> R fromTransaction(Function<StatelessSession, R> function) {
        return AppHibernateConfig.getSessionFactory().fromStatelessTransaction(function);
    }

}

```

### Javalin Handler

Once Hibernate is configured, we can create a CourseHandler to manage HTTP requests related to courses. This handler will utilize Javalin's approach using the Context object.

To interact with the database, CourseHandler will use the **AppHibernate** wrapper. This wrapper simplifies data access by managing Hibernate transactions.

```java
public class CourseHandler {

    public static Handler listAll = (context) -> {
        var result = AppHibernate.fromTransaction(CourseQueries_::getAllCourses);
        context.json(new ResultCourse(result));
    };

    public static Handler save = (context) -> {
        var newCourse = context.bodyAsClass(NewCourse.class);
        var result = AppHibernate.fromTransaction(session -> {
            var insertedId = session.insert(Course.newCourse(newCourse.name()));
            return session.get(Course.class, insertedId);
        });
        context.json(result).status(HttpStatus.CREATED);
    };

}
```

This structure promotes cleaner code by separating concerns: CourseHandler focuses on request handling, while AppHibernate handles the Hibernate transactions. This separation improves code organization and maintainability.


### JavalinApp and Main

Finally, we have both Javalin app config and main class.

```java
public class JavalinApp {

    public static Javalin create() {
        return Javalin.create((var config) -> config.router.apiBuilder(() -> {
            path("/", () -> get(ctx -> ctx.json("Ok")));
            path("/courses", () -> {
                get(CourseHandler.listAll);
                post(CourseHandler.save);
            });
        }));
    }

}

public class Main {

    public static void main(String[] args) {
        JavalinApp.create().start(8080);
    }

}
```

### Tests

Example of test using JUnit 5.

```java
class CoursesTest {

    Javalin app = JavalinApp.create();
    JavalinJackson javalinJackson = new JavalinJackson();

    @Test
    @DisplayName("Should save and list courses")
    void test1() {
        JavalinTest.test(app, (server, client) -> {
            var newCourse = new NewCourse("Course1");
            var postResponse = client.post("/courses", newCourse);
            assertEquals(postResponse.code(), HttpStatus.CREATED.getCode());
            var response = client.get("/courses");
            assertEquals(response.code(), HttpStatus.OK.getCode());
            assertNotNull(response.body());
            ResultCourse result = javalinJackson.fromJsonString(response.body().string(), ResultCourse.class);
            assertNotNull(result.courses());
            var firstCourse = result.courses().stream().findFirst();
            assertTrue(firstCourse.isPresent());
            assertEquals(firstCourse.get().getName(), newCourse.name());
        });
    }

}

```

### Conclusion


We can see that both Javalin and Hibernate integrate seamlessly, allowing an elegant and efficient implementation without unnecessary verbosity.
The combination of Java 21, Javalin and Hibernate 7 offers a powerful and efficient tech stack for building modern web applications. 

For a production-ready setup, it's recommended to configure a robust connection pool such as HikariCP or Agroal.

The complete example, including courses, students, and registration functionality, can be found on [GitHub](https://github.com/brucemelo/students-javalin).