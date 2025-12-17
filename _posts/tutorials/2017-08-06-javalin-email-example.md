---
layout: tutorial
official: true
title: "Creating a 'Contact us' form that sends emails (via gmail)"
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
date: 2017-08-06
permalink: /tutorials/email-sending-example
github: https://github.com/javalin/javalin-samples/tree/main/javalin5/javalin-email-example
summarytitle: Sending emails from a Javalin backend
summary: Create a 'Contact us' form with email sending (gmail) with a Javalin backend
language: ["java", "kotlin"]
---

## Dependencies

First, we need to create a Maven project with some dependencies: [(→ Tutorial)](/tutorials/maven-setup)

```xml
<dependencies>
    <dependency>
        <groupId>io.javalin</groupId>
        <artifactId>javalin-bundle</artifactId> <!-- For handling http-requests -->
        <version>{{site.javalinSixVersion}}</version>
    </dependency>
    <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-email</artifactId> <!-- For sending emails -->
        <version>1.5</version>
    </dependency>
    <dependency>
        <groupId>com.j2html</groupId>
        <artifactId>j2html</artifactId> <!-- For creating HTML form -->
        <version>1.6.0</version>
    </dependency>
</dependencies>
```

## Setting up the backend
We need three endpoints: `GET '/'`, `POST '/contact-us'` and `GET '/contact-us/success'`:

{% capture java %}
import io.javalin.Javalin;
import org.apache.commons.mail.DefaultAuthenticator;
import org.apache.commons.mail.Email;
import org.apache.commons.mail.SimpleEmail;

import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;
import static j2html.TagCreator.br;
import static j2html.TagCreator.button;
import static j2html.TagCreator.form;
import static j2html.TagCreator.input;
import static j2html.TagCreator.textarea;

public class JavalinEmailExampleApp {

    public static void main(String[] args) {

        Javalin.create(config -> {
            config.router.apiBuilder(() -> {
                get("/", ctx -> ctx.html(
                    form().withAction("/contact-us").withMethod("post").with(
                        input().withName("subject").withPlaceholder("Subject"),
                        br(),
                        textarea().withName("message").withPlaceholder("Your message ..."),
                        br(),
                        button("Submit")
                    ).render()
                ));
                post("/contact-us", ctx -> {
                    Email email = new SimpleEmail();
                    email.setHostName("smtp.googlemail.com");
                    email.setSmtpPort(465);
                    email.setAuthenticator(new DefaultAuthenticator("YOUR_EMAIL", "YOUR_PASSWORD"));
                    email.setSSLOnConnect(true);
                    email.setFrom("YOUR_EMAIL");
                    email.setSubject(ctx.formParam("subject"));
                    email.setMsg(ctx.formParam("message"));
                    email.addTo("RECEIVING_EMAIL");
                    email.send(); // will throw email-exception if something is wrong
                    ctx.redirect("/contact-us/success");
                });
                get("/contact-us/success", ctx -> ctx.html("Your message was sent"));
            });
        }).start(7070);
    }

}
{% endcapture %}
{% capture kotlin %}
import io.javalin.Javalin
import io.javalin.apibuilder.ApiBuilder.get
import io.javalin.apibuilder.ApiBuilder.post
import org.apache.commons.mail.DefaultAuthenticator
import org.apache.commons.mail.SimpleEmail

fun main() {

    Javalin.create { config ->
        config.router.apiBuilder {
            get("/") { ctx ->
                ctx.html(
                    """
                        <form action="/contact-us" method="post">
                            <input name="subject" placeholder="Subject">
                            <br>
                            <textarea name="message" placeholder="Your message ..."></textarea>
                            <br>
                            <button>Submit</button>
                        </form>
                    """.trimIndent()
                )
            }
            post("/contact-us") { ctx ->
                SimpleEmail().apply {
                    setHostName("smtp.googlemail.com")
                    setSmtpPort(465)
                    setAuthenticator(DefaultAuthenticator("YOUR_EMAIL", "YOUR_PASSWORD"))
                    setSSLOnConnect(true)
                    setFrom("YOUR_EMAIL")
                    setSubject(ctx.formParam("subject"))
                    setMsg(ctx.formParam("message"))
                    addTo("RECEIVING_EMAIL")
                }.send() // will throw email-exception if something is wrong
                ctx.redirect("/contact-us/success")
            }
            get("/contact-us/success") { ctx -> ctx.html("Your message was sent") }
        }
    }.start(7070)

}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

In order to get the above code to work, you need to make some changes:

* Change `YOUR_EMAIL` to your gmail account <small>(youremail@gmail.com)</small>
* Change `YOUR_PASSWORD` to your gmail password*
* Change `RECEIVING_ADDRESS` to where you want the email to be sent

<small>**It might be a good idea to create a test-account instead of using your real gmail credentials.*</small>

When you have made the changes to the code, run the program and go to `http://localhost:7000`.
You will see a simple unstyled form with an input field, a textarea and a button.
Fill in the form and click the button to test your email server. After you click the button, your browser
is redirected to `/contact-us/success` (if the email was sent).

Any emails you have sent will show up in your `Sent` folder in the gmail web-interface.
