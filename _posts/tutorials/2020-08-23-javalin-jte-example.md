---
layout: tutorial
title: Rendering jte templates in Javalin
permalink: /tutorials/jte
summarytitle: Rendering jte templates in Javalin
summary: Learn how to do type-safe server side rendering using jte.
date: 2020-08-23
author: <a href="https://github.com/casid" target="_blank">Andreas Hager</a>
language: ["kotlin", "java"]
github: https://github.com/casid/jte-javalin-tutorial
---

## Introduction
Even in the age of reactive web apps, server-side rendering is still the way to go if SEO is a requirement.
[jte](https://jte.gg/) is a modern, type-safe template engine, that glues HTML and Java with as little extra syntax as possible.
In this tutorial you will learn how to use jte in Javalin.

To begin, you'll need to have a Maven project configured [(→ Tutorial)](/tutorials/maven-setup).

## Project setup
To use jte, you need to add the library as dependency:
```xml
<dependency>
    <groupId>gg.jte</groupId>
    <artifactId>jte</artifactId>
    <version>1.0.0</version>
</dependency>
```

The Javalin jte extension comes with Javalin 3.10.0, so make sure to use the latest Javalin version:
```xml
<dependency>
    <groupId>io.javalin</groupId>
    <artifactId>javalin</artifactId>
    <version>{{site.javalinversion}}</version>
</dependency>
```

In case you use IntelliJ, I'd highly recommend to install the [jte plugin](https://plugins.jetbrains.com/plugin/14521-jte).
It offers full completion and refactoring support and it is what makes working with jte so much fun!

<img alt="jte in IntelliJ" src="https://github.com/casid/jte/raw/master/jte-intellij.gif" width="696" /><br>

Let's try to render our first template.
Create the directory `src/main/jte` in your project.
In this directory create a file `hello.jte` and enter the following:

```html
Hello jte!
```

{% capture java %}
package app;

public class App {
    public static void main(String[] args) {
        Javalin app = Javalin.create().start(7000);

        app.get("/", ctx -> ctx.render("hello.jte"));
    }
}

{% endcapture %}
{% capture kotlin %}
package app

object TutorialKotlin {
    @JvmStatic
    fun main(args: Array<String>) {
        val app = Javalin.create().start(7000)

        app.get("/") { ctx -> ctx.render("hello.jte") }
    }
}
{% endcapture %}
{% include macros/docsSnippetKotlinFirst.html java=java kotlin=kotlin %}

Fire up your browser and open [http://localhost:7000](http://localhost:7000).
You should see `Hello jte!` displayed. 

With the server still running, change the content of `hello.jte` to this:

```html
Hello jte!
The current timestamp is ${System.currentTimeMillis()}.
```

Refresh the page in your browser and you should see something like this:

```html
Hello jte! The current timestamp is 1598159163249.
```

jte supports hot reloading of templates out of the box \o/


## Error handling
jte does everything to pass meaningful error messages to the developer.

Let's try to call a method that does not exist and see what happens.

```html
Hello jte!
The current timestamp is ${System.currentTimeMillis1337()}.
```

Once you refresh the page, Javalin will show you an internal server error.
If you look at the log, you will notice a `TemplateException` telling you what went wrong.

```
gg.jte.TemplateException: Failed to compile template, error at hello.jte:2
/Users/casid/javalin/javalin/jte-classes/gg/jte/generated/JtehelloGenerated.java:8: error: cannot find symbol
		jteOutput.writeUserContent(System.currentTimeMillis1337());
		                                 ^
  symbol:   method currentTimeMillis1337()
  location: class System
1 error

	at gg.jte.internal.ClassFilesCompiler.runCompiler(ClassFilesCompiler.java:35)
    ...
```

In the first line you see where exactly in the template the error happened: `error at hello.jte:2`

Let's provoke a runtime exception in our template.
Ever had a NPE in a JSP telling you NullPointerException in generated class at line 18000?
jte does better than that!

```html
Hello jte!
The current timestamp is ${System.currentTimeMillis()}.
${1 / 0}
```

Again, Javalin will show you an internal server error.
If you look at the log, you will notice a `TemplateException` telling you what went wrong:

`Failed to render hello.jte, error at hello.jte:3`

jte always shows you the exact line in the template where an exception happened.
If you scroll down to the cause, you see the `ArithmeticException` that caused the exception:

```
Caused by: java.lang.ArithmeticException: / by zero
	at gg.jte.generated.JtehelloGenerated.render(JtehelloGenerated.java:11)
```

## Passing parameters

Let's pass some data to our template.
Create a data class:

{% capture java %}
package app;

public class HelloPage {
    public String userName;
    public int userKarma;
}

{% endcapture %}
{% capture kotlin %}
package app

class HelloPage {
    @JvmField var userName: String? = null
    @JvmField var userKarma = 0
}
{% endcapture %}
{% include macros/docsSnippetKotlinFirst.html java=java kotlin=kotlin %}

Now, let's populate that page object and pass it to jte:

{% capture java %}
package app;

public class App {
    public static void main(String[] args) {
        Javalin app = Javalin.create().start(7000);

        app.get("/", App::renderHelloPage);
    }

    private static void renderHelloPage(Context ctx) {
        HelloPage page = new HelloPage();
        page.userName = "admin";
        page.userKarma = 1337;
        ctx.render("hello.jte", Collections.singletonMap("page", page));
    }
}

{% endcapture %}
{% capture kotlin %}
package app

object App {
    @JvmStatic
    fun main(args: Array<String>) {
        val app = Javalin.create().start(7000)

        app.get("/", this::renderHelloPage)
    }

    private fun renderHelloPage(ctx: Context) {
        val page = HelloPage()
        page.userName = "admin"
        page.userKarma = 1337
        ctx.render("hello.jte", Collections.singletonMap("page", page))
    }
}

{% endcapture %}
{% include macros/docsSnippetKotlinFirst.html java=java kotlin=kotlin %}

Now we can use the page object in our template:

```html
@param app.HelloPage page

<html lang="en">
<body>
    <p>Hello visitor!</p>
    <p>The <b>user of the day</b> is ${page.userName} (karma: ${page.userKarma})!</p>
</body>
</html>
```

You now need to restart the server, since we added Kotlin/Java signatures.
Once you refresh the page, you should see the new output in your browser. 

> Why the page object and no map? jte allows multiple params in a template, so you could as well pass a map to the template without creating a page object if you like. However you will lose completion and refactoring support for those parameter names.

## Output escaping

Let's assume the user of the day is a hacker with an evil user name.
Change the user name to `<script>alert('xss')</script>`.

After recompiling, when you refresh the page, you will see the following output:

<pre>
Hello visitor!

The <b>user of the day</b> is &lt;script&gt;alert('xss')&lt;/script&gt; (karma: 1337)!
</pre>

The output is escaped and no alert is displayed.
This is because jte understands the HTML structure in templates and does context-sensitive output escaping at compile time.
No surprising XSS attacks, no manual escaping needs to be done.  

In case you want to prevent output escaping, you can use the `$unsafe{}` keyword. Let's try it for the user name and see what happens.

```html
<p>The <b>user of the day</b> is $unsafe{page.userName} (karma: ${page.userKarma})!</p>
```

When you refresh the page now, you will see an `xss` alert. So be very careful with the `$unsafe{}` keyword! 

## Localization

Let's add some localization to our page.

Create the file `src/main/resources/localization.properties`:

```properties
hello.visitor=Hello visitor!
hello.user-of-the-day=The <b>user of the day</b> is {0} (karma: {1})!
```

And add a very basic localizer class:

{% capture java %}
package app;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.ResourceBundle;

public class Localizer {

    private final ResourceBundle bundle;

    public Localizer(Locale locale) {
        bundle = ResourceBundle.getBundle("localization", locale);
    }

    public String localize(String key) {
        return bundle.getString(key);
    }

    public String localize(String key, Object ... params) {
        return MessageFormat.format(localize(key), params);
    }
}

{% endcapture %}
{% capture kotlin %}
package app

import java.text.MessageFormat
import java.util.*

class Localizer(locale: Locale) {
    private val bundle: ResourceBundle = ResourceBundle.getBundle("localization", locale)

    fun localize(key: String): String {
        return bundle.getString(key)
    }

    fun localize(key: String, vararg params: Any?): String {
        return MessageFormat.format(localize(key), *params)
    }
}

{% endcapture %}
{% include macros/docsSnippetKotlinFirst.html java=java kotlin=kotlin %}

In the app, we need to pass the localizer to the template:

{% capture java %}
private static void renderHelloPage(Context ctx) {
    HelloPage page = new HelloPage();
    page.userName = "<script>alert('xss')</script>";
    page.userKarma = 1337;
    ctx.render("hello.jte", Map.of("page", page, "localizer", new Localizer(Locale.US)));
}

{% endcapture %}
{% capture kotlin %}
private fun renderHelloPage(ctx: Context) {
    val page = HelloPage()
    page.userName = "<script>alert('xss')</script>"
    page.userKarma = 1337
    ctx.render("hello.jte", mapOf("page" to page, "localizer" to Localizer(Locale.US)))
}

{% endcapture %}
{% include macros/docsSnippetKotlinFirst.html java=java kotlin=kotlin %}

```html
@param app.HelloPage page
@param app.Localizer localizer

<html lang="en">
<body>
    <p>${localizer.localize("hello.visitor")}</p>
    <p>${localizer.localize("hello.user-of-the-day", page.userName, page.userKarma)}</p>
</body>
</html>
```

Now, if we restart the server and look at the output, it is slightly disappointing:

```
Hello visitor!

The <b>user of the day</b> is <script>alert('xss')</script> (karma: 1.337)!
```

Since we receive a `String` from the localizer, jte cannot determine what part of it comes from the resource file and what part comes from the user data.
Even worse, if we use `$unsafe{...}`, the bold tag is rendered, but also the XSS in the user name!

jte has a built-in solution for this, the `LocalizationSupport` interface. Let's change our localizer to implement it:

{% capture java %}
package app;

import gg.jte.support.LocalizationSupport;
import java.util.*;

public class Localizer implements LocalizationSupport {

    private final ResourceBundle bundle;

    public Localizer(Locale locale) {
        bundle = ResourceBundle.getBundle("localization", locale);
    }

    @Override
    public String lookup(String key) {
        return bundle.getString(key);
    }
}

{% endcapture %}
{% capture kotlin %}
package app

import gg.jte.support.LocalizationSupport
import java.util.*

class Localizer2(locale: Locale) : LocalizationSupport {
    private val bundle: ResourceBundle = ResourceBundle.getBundle("localization", locale)

    override fun lookup(key: String): String {
        return bundle.getString(key)
    }
}

{% endcapture %}
{% include macros/docsSnippetKotlinFirst.html java=java kotlin=kotlin %}

If we now run the app, we get the desired output!

<pre>
Hello visitor!

The <b>user of the day</b> is &lt;script&gt;alert('xss')&lt;/script&gt; (karma: 1337)!
</pre>

`LocalizationSupport` returns `gg.jte.Content` instead of `String`.
`gg.jte.Content` is lazily rendered and `LocalizationSupport` knows what to escape and what not.
Feel free to take a look if you're interested, `gg.jte.Content` is really powerful! 


## Precompiling templates

If you run jte on a non-dev environment, it usually is a good idea to precompile all templates.

This way your build process fails in case there are any jte compilation errors.

Plus, template rendering is slightly faster, since on each render there is no check required if the template needs a hot reload.

The Javalin jte extension allows to customize the used jte engine:

{% capture java %}
public static void main(String[] args) {
    JavalinJte.configure(createTemplateEngine());
    
    Javalin app = Javalin.create().start(7000);

    app.get("/", TutorialJava::renderHelloPage);
}

private static TemplateEngine createTemplateEngine() {
    if (isDevSystem) {
        DirectoryCodeResolver codeResolver = new DirectoryCodeResolver(Path.of("src", "main", "jte"));
        return TemplateEngine.create(codeResolver, ContentType.Html);
    } else {
        return TemplateEngine.createPrecompiled(Path.of("jte-classes"), ContentType.Html);
    }
}

{% endcapture %}
{% capture kotlin %}
@JvmStatic
fun main(args: Array<String>) {
    JavalinJte.configure(createTemplateEngine())
    
    val app = Javalin.create().start(7000)

    app.get("/", this::renderHelloPage)
}

private fun createTemplateEngine(): TemplateEngine {
    return if (isDevSystem) {
        val codeResolver = DirectoryCodeResolver(Path.of("src", "main", "jte"))
        TemplateEngine.create(codeResolver, ContentType.Html)
    } else {
        TemplateEngine.createPrecompiled(Path.of("jte-classes"), ContentType.Html)
    }
}

{% endcapture %}
{% include macros/docsSnippetKotlinFirst.html java=java kotlin=kotlin %}

`ìsDevSystem` would be some boolean that determines if you are running a dev system or not.
While developing, jte needs a way to resolve the jte template files. 
This is what the `DirectoryCodeResolver` does.
When running with precompiled templates, this is not needed.
Instead, we need to pass the directory containing all precompiled jte classes.

Next, we need to ensure that all jte templates are compiled on the maven build.
This is what the jte maven plugin does.
Add the following to your pom.xml:

```xml
<!-- Precompile jte templates -->
<plugin>
    <groupId>gg.jte</groupId>
    <artifactId>jte-maven-plugin</artifactId>
    <version>1.0.0</version>
    <configuration>
        <sourceDirectory>${basedir}/src/main/jte</sourceDirectory>
        <targetDirectory>${basedir}/jte-classes</targetDirectory>
        <contentType>Html</contentType>
    </configuration>
    <executions>
        <execution>
            <phase>process-classes</phase>
            <goals>
                <goal>precompile</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

When you run maven install, you will see a line like this in the output:

`Successfully precompiled 1 jte file in 0s to ...`

When you open the `jte-classes` directory, you will see the generated Java classes.

## Conclusion

Hopefully this tutorial has given you an idea how jte can be useful for server side rendering with Javalin.
For more information about jte, have a look at the [syntax documentation](https://github.com/casid/jte/blob/master/DOCUMENTATION.md).
For a complete website built with Javalin and jte, have a look at [this GitHub repo](https://github.com/casid/jte-javalin-tutorial), it contains a jte port of the [Javalin Library App](https://javalin.io/tutorials/website-example).
