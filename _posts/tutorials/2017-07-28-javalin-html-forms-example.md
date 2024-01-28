---
layout: tutorial
official: true
title: "Working with HTML forms and a Javalin backend"
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
date: 2017-07-28
permalink: /tutorials/html-forms-example
github: https://github.com/javalin/javalin-samples/tree/main/javalin5/javalin-html-forms-example
summarytitle: HTML forms & Javalin backend
summary: Learn how to get/post HTML forms to a Javalin backend
language: ["java", "kotlin"]
---

## Dependencies

First, we need to create a project with these dependencies: [(→ Tutorial)](/tutorials/maven-setup)

~~~markup
<dependencies>
    <dependency>
        <groupId>io.javalin</groupId>
        <artifactId>javalin-bundle</artifactId>
        <version>{{site.javalinversion}}</version>
    </dependency>
</dependencies>
~~~

## Setting up the backend

Create a class with the following code:

{% capture java %}{% raw %}
import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;
import io.javalin.util.FileUtil;
import java.util.HashMap;
import java.util.Map;

public class JavalinHtmlFormsExampleApp {

    private static final Map<String, String> reservations = new HashMap<>() {{
        put("saturday", "No reservation");
        put("sunday", "No reservation");
    }};

    public static void main(String[] args) {

        Javalin app = Javalin.create(config -> {
            config.staticFiles.add("/public", Location.CLASSPATH);
        });

        app.post("/make-reservation", ctx -> {
            reservations.put(ctx.formParam("day"), ctx.formParam("time"));
            ctx.html("Your reservation has been saved");
        });

        app.get("/check-reservation", ctx -> {
            ctx.html(reservations.get(ctx.queryParam("day")));
        });

        app.start();

    }

}
{% endraw %}{% endcapture %}
{% capture kotlin %}
import io.javalin.Javalin
import io.javalin.http.staticfiles.Location
import io.javalin.util.FileUtil

private val reservations = mutableMapOf<String?, String?>(
"saturday" to "No reservation",
"sunday" to "No reservation"
)

fun main() {

    val app = Javalin.create {
        it.staticFiles.add("/public", Location.CLASSPATH)
    }

    app.post("/make-reservation") { ctx ->
        reservations[ctx.formParam("day")] = ctx.formParam("time")
        ctx.html("Your reservation has been saved")
    }

    app.get("/check-reservation") { ctx ->
        ctx.html(reservations[ctx.queryParam("day")]!!)
    }

    app.start(7070)

}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

This will create an app which listens on port `7070`,
and looks for static files in your `/src/resources/public` folder.
We have two endpoints mapped, one `post`, which will make a reservation,
and one `get`, which will check your reservation.

## Setting up the HTML forms

Now we have to make two HTML forms for interacting with these endpoints.
We can put these forms in a file `/resources/public/index.html`, which will be
available at `http://localhost:7777/`.

### Make reservation form
```markup
<h2>Make reservation:</h2>
<form method="post" action="/make-reservation">
    Choose day
    <select name="day">
        <option value="saturday">Saturday</option>
        <option value="sunday">Sunday</option>
    </select>
    <br>
    Choose time
    <select name="time">
        <option value="8:00 PM">8:00 PM</option>
        <option value="9:00 PM">9:00 PM</option>
    </select>
    <br>
    <button>Submit</button>
</form>
```

To make a reservation we need to create something on the server
(in this case it's a simple `map.put()`, but usually you'd have a database).
When creating something on the server, you should use the `POST` method,
which can be specified by adding `method="post"` to the `<form>` element.

In our Java code, we have a post endpoint: `app.post("/make-reservation", ctx -> {...}`. We
need to tell our form to use this endpoint with the action attribute: `action="/make-reservation"`.
Actions are relative, so when you click submit, the browser will create a `POST` request
to `http://localhost:7777/make-reservation` with the `day`/`time` values as the request-body.

### Check reservation form
```markup
<h2>Check your reservation:</h2>
<form method="get" action="/check-reservation">
    Choose day
    <select name="day">
        <option value="saturday">Saturday</option>
        <option value="sunday">Sunday</option>
    </select>
    <br>
    <button>Submit</button>
</form>
```

To check a reservation we need to tell the server which day we're interested in.
In this case we're not creating anything, and our action does not change the state
of the server in any way, which makes it a good candidate for a `GET` request.

`GET` requests don't have a request-body so when you click submit the browser
creates a `GET` request to `http://localhost:7777/check-reservation?day=saturday`.
The values of the form are added to the URL as query-parameters.

### HTML form GET vs POST summary
* `POST` requests should be used if the request can change the server state.
* `POST` requests have their information stored in the request-body. In order to extract information from this body you have to use `ctx.formParam(key)` in Javalin.
* Performing a series of `GET` requests should always return the same result (if no other `POST` request was performed in-between).
* `GET` requests have no request-body, and form information is sent as query-parameters in the URL. In order to extract information from this body you have to use `ctx.queryParam(key)` in Javalin.

## File upload example
Let's expand our example a bit to include file uploads.

### Endpoint
{% capture java %}
app.post("/upload-example", ctx -> {
    ctx.uploadedFiles("files").forEach(file -> {
        FileUtil.streamToFile(file.content(), "upload/" + file.filename());
    });
    ctx.html("Upload successful");
});
{% endcapture %}
{% capture kotlin %}
app.post("/upload-example") { ctx ->
    ctx.uploadedFiles("files").forEach {
        FileUtil.streamToFile(it.content, "upload/${it.filename}")
    }
    ctx.html("Upload successful")
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

`ctx.uploadedFiles("files")` gives us a list of files matching the name `files`.
We then save these files to an `upload` folder.

### HTML form

```markup
<h1>Upload example</h1>
<form method="post" action="/upload-example" enctype="multipart/form-data">
    <input type="file" name="files" multiple>
    <button>Submit</button>
</form>
```

When uploading files you need to add `enctype="multipart/form-data"` to your `<form>`.
If you want to upload multiple files, add the `multiple` attribute to your `<input>`.
