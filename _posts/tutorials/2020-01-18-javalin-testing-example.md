---
layout: tutorial
official: true
title: Testing Javalin Applications
permalink: /tutorials/testing
summarytitle: Testing Javalin Applications
summary: Learn how to run different kinds of tests in Javalin. Unit tests, functional/integration tests, UI/end-to-end tests.
date: 2020-01-18
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
language: ["java", "kotlin"]
github: https://github.com/tipsy/javalin-testing-example
---

## Introduction
Since Javalin is a library, there are no requirements for how tests must be written.
This guide will outline a few common approaches. None of the approaches are better
than the others, you just have to find something that works for you.

To begin, you'll need to have a Maven project configured [(→ Tutorial)](/tutorials/maven-setup).

## Unit tests
Unit tests are tests for the smallest and most isolated part of an application.
In Javalin, this means testing anything that implements the `Handler` interface.
Unit tests are very fast and cheap to run, and they usually require
[mocking](https://en.wikipedia.org/wiki/Mock_object) of objects.
To begin, we will need to add a Mocking library.

For Java the most popular choice is [Mockito](https://site.mockito.org/):
```xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>3.2.4</version>
    <scope>test</scope>
</dependency>
```

For Kotlin, the most poplar choice is [MockK](https://mockk.io/):
```xml
<dependency>
    <groupId>io.mockk</groupId>
    <artifactId>mockk</artifactId>
    <version>1.9.3</version>
    <scope>test</scope>
</dependency>
```

Once we have the mocking library added, we'll mock the Javalin `Context`, since
the `Context` class is responsible for input and output in Javalin `Handler`s.
We're using a static/singleton controller in this example for simplicity, but
how you structure that code is entirely up to yourself.

{% capture java %}
public class UnitTest {

    private Context ctx = mock(Context.class); // "mock-maker-inline" must be enabled

    @Test
    public void POST_to_create_users_gives_201_for_valid_username() {
        when(ctx.queryParam("username")).thenReturn("Roland");
        UserController.create(ctx); // the handler we're testing
        verify(ctx).status(201);
    }

    @Test(expected = BadRequestResponse.class)
    public void POST_to_create_users_throws_for_invalid_username() {
        when(ctx.queryParam("username")).thenReturn(null);
        UserController.create(ctx); // the handler we're testing
    }

}

{% endcapture %}
{% capture kotlin %}
class UnitTest {

    private val ctx = mockk<Context>(relaxed = true)

    @Test
    fun `POST to create users gives 201 for valid username`() {
        every { ctx.queryParam("username") } returns "Roland"
        UserController.create(ctx) // the handler we're testing
        verify { ctx.status(201) }
    }

    @Test(expected = BadRequestResponse::class)
    fun `POST to create users throws for invalid username`() {
        every { ctx.queryParam("username") } returns null
        UserController.create(ctx) // the handler we're testing
    }

}
{% endcapture %}
{% include macros/docsSnippetKotlinFirst.html java=java kotlin=kotlin %}

<div class="comment" markdown="1">
In Java, in order to mock **Context** using Mockito, **mock-maker-inline** must be enabled.
This is done by adding a file **/resources/mockito-extensions/org.mockito.plugins.MockMaker**
with the content **mock-maker-inline**. [Read more](https://stackoverflow.com/a/40018295/7916291).
</div>

In the first test, we instruct the `Context` mock to return `"Roland"` when
`queryParam("username")` is called. After that, we call the `Handler` (`UserController.create(ctx)`), and then we verify
that `ctx.status(201)` was called. We could also have mocked the `UserController`
to verify that the user was added.

In the second test, we return `null` for the `username`, and we make sure
to *expect* a `BadRequestResponse`.

The code for `UserController.create(ctx)` looks like this:

{% capture java %}
public static void create(Context ctx) {
    String username = ctx.queryParam("username");
    if (username == null || username.length() < 5) {
        throw new BadRequestResponse();
    } else {
        users.add(username);
        ctx.status(201);
    }
}
{% endcapture %}
{% capture kotlin %}
fun create(ctx: Context) {
    val username = ctx.queryParam("username")
    if (username == null || username.length < 5) {
        throw BadRequestResponse()
    } else {
        users.add(username)
        ctx.status(201)
    }
}
{% endcapture %}
{% include macros/docsSnippetKotlinFirst.html java=java kotlin=kotlin %}

The two tests cover the branches of the if/else. There isn't a lot more to say about mocking that's specific to Javalin.
You can follow any general mocking tutorial for your favorite language and library.

## Functional/integration tests
Functional tests are "black box" tests, and only focus on the business requirements of an application.
In the unit tests (in the previous section), we mocked the `Context` object and called `verify`
to ensure that `ctx.status(201)` was called inside the `UserController.create(ctx)` `Handler`.
In functional tests, we just verify that we get the expected output for the provided input.
The easiest way of writing this type of test in Javalin is to use
a HTTP library and asserting on the response. We'll use
[Unirest](https://kong.github.io/unirest-java/)
and [AssertJ](https://joel-costigliola.github.io/assertj/):

```xml
<dependency>
    <groupId>com.konghq</groupId>
    <artifactId>unirest-java</artifactId>
    <version>3.4.00</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.assertj</groupId>
    <artifactId>assertj-core</artifactId>
    <version>3.11.1</version>
    <scope>test</scope>
</dependency>
```

{% capture java %}
public class FunctionalTest {

    private JavalinApp app = new JavalinApp(); // inject any dependencies you might have
    private String usersJson = JavalinJson.toJson(UserController.users);

    @Test
    public void GET_to_fetch_users_returns_list_of_users() {
        app.start(1234);
        HttpResponse response = Unirest.get("http://localhost:1234/users").asString();
        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(usersJson);
        app.stop();
    }

}
{% endcapture %}
{% capture kotlin %}
class FunctionalTest {

    private val app = JavalinApp() // inject any dependencies you might have
    private val usersJson = JavalinJson.toJson(UserController.users)

    @Test
    fun `GET to fetch users returns list of users`() {
        app.start(1234)
        val response: HttpResponse<String> = Unirest.get("http://localhost:1234/users").asString()
        assertThat(response.status).isEqualTo(200)
        assertThat(response.body).isEqualTo(usersJson)
        app.stop()
    }

}
{% endcapture %}
{% include macros/docsSnippetKotlinFirst.html java=java kotlin=kotlin %}

In Javalin's test suite, almost all of the tests are written like this.
I personally prefer this approach for tests, as each test touches the whole system, and you don't
risk making mistakes while manually specifying expected behavior (mocking). Javalin's test
suite starts and stops more than 400 Javalin instances, and running all the tests takes about ten seconds total
(most of those ten seconds is spent waiting for a WebSocket test and starting Chrome for browser tests).

## End-to-end/UI/scenario tests
Like functional tests, end-to-end tests focus on input and output, but typically describe a
longer scenario. For example, a user visiting a website, clicking on a link, filling in a form,
and submitting. These types of tests are usually written with Selenium in Java/Kotlin. Selenium
requires you to have the browser that you want to use installed, but it's also possible to
install that browser on demand. We'll need to add two dependencies:
[Selenium](https://selenium.dev/documentation/en/) and [WebDriverManager](https://github.com/bonigarcia/webdrivermanager):

```xml
<dependency>
    <groupId>org.seleniumhq.selenium</groupId>
    <artifactId>selenium-chrome-driver</artifactId>
    <version>3.141.59</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>io.github.bonigarcia</groupId>
    <artifactId>webdrivermanager</artifactId>
    <version>3.6.2</version>
    <scope>test</scope>
</dependency>
```

{% capture java %}
public class EndToEndTest {

    private JavalinApp app = new JavalinApp(); // inject any dependencies you might have

    @Test
    public void UI_contains_correct_heading() {
        app.start(1234);
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");
        options.addArguments("--disable-gpu");
        WebDriver driver = new ChromeDriver(options);
        driver.get("http://localhost:1234/ui");
        assertThat(driver.getPageSource()).contains("<h1>User UI</h1>");
        driver.quit();
        app.stop();
    }

}
{% endcapture %}
{% capture kotlin %}
class EndToEndTest {

    private val app = JavalinApp() // inject any dependencies you might have

    @Test
    fun `UI contains correct heading`() {
        app.start(1234)
        WebDriverManager.chromedriver().setup()
        val driver: WebDriver = ChromeDriver(ChromeOptions().apply {
            addArguments("--headless")
            addArguments("--disable-gpu")
        })
        driver.get("http://localhost:1234/ui")
        assertThat(driver.pageSource).contains("<h1>User UI</h1>")
        driver.quit()
        app.stop()
    }

}
{% endcapture %}
{% include macros/docsSnippetKotlinFirst.html java=java kotlin=kotlin %}

In this example, we just do `assertThat(driver.pageSource).contains("<h1>User UI</h1>")`, since writing
proper Selenium tests is outside of the scope of this guide.
You can use Selenium to simulate any type of user behavior. Have a look at the
[Selenium docs](https://selenium.dev/documentation/en/) for details.
The [WebDriverManager docs](https://github.com/bonigarcia/webdrivermanager) includes an example of
how to re-use your driver between multiple tests.


## Conclusion

Hopefully this brief guide has given you some ideas on how to test your Javalin application.
Since Javalin is just a library, you're more or less free to test however you like;
there is no "Javalin way" of testing.
