---
layout: tutorial
title: "Mocking Javalin classes in Mockito"
author: <a href="https://github.com/StuAtGit" target="_blank">Stu S</a>
date: 2019-10-20
permalink: /tutorials/mockito-testing
summarytitle: Mockito Testing
summary: Mocking Javalin objects with Mockito.
language: java
---

## About Mockito
Mockito is an open source unit testing framework for Java. Most notably, it provides the tools you need to generate 
and inspect state of, mock objects that can be passed in to fulfill the dependencies of the system under test. 

## Using Mockito with Javalin
The only caveat to using Mockito with Javalin is that, at least some of, Javalin's classes are final,
however this may be subject to change*. 
One of the first places you'll usually notice this is when you attempt to mock a 
Context object being passed into your http handlers.

Example project: https://gitlab.com/stuAtGit/javalinmockitoexample

## Example error you'll see if you don't enable InlineMockMaker

```
java.lang.NullPointerException
	at io.javalin.http.Context.status(Context.kt:386)
	at com.shareplaylearn.httphandlers.TeapotRequestHandler.handleBrewCoffee(TeapotRequestHandler.java:47)
	at TeapotRequestHandlerTest.handleBrewCoffee(TeapotRequestHandlerTest.java:21)
```
This happens because, although you tried to mock the context object, say by doing this:
```
Context context = mock(Context.class);
```
The Context class is final, so the mock silently fails, and creates a real Context() object, which then fails due
to missing dependencies. _*I think*_

## TLDR
So the TLDR; version of this tutorial is that you can use Mockito (2 or greater) as you would 
with any other framework, but, until the classes are made non-final, you'll need to follow this:
https://github.com/mockito/mockito/wiki/What%27s-new-in-Mockito-2#unmockable
in order to mock them. What the mockito link tells you do do is add the file 
`src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker`
to your source tree (this is assuming a standard maven-like source tree), and place the string:
`mock-maker-inline` in that final. Nothing else should be in that file. 
More details: <a href="#mockmaker">

## Tutorial: a.k.a I've got the time for details!
A basic step-by-step look at how to make this happen:
- First, create a Java project, using your favoured approach. 

- Then, add whatever unit test runner you prefer, as long as it's compatible with Mockito 2. 
I'd suggest JUnit 5 (Jupiter).

- Then, add mockito 2 or greater as a dependency:
```xml
        <!-- https://mvnrepository.com/artifact/org.mockito/mockito-core -->
        <dependency>
            <groupId>org.mockito</groupId>
            <artifactId>mockito-core</artifactId>
            <version>3.1.0</version>
            <scope>test</scope>
        </dependency>
```

- Then, add the file. If you're using Intellij, you can right-click on your test folder, select `New->File`,
and then copy & paste the string `resources/mockito-extensions/org.mockito.plugins.MockMaker` into the dialog box.
Select `Text` as the file type if asked by Intellij.

- Then, open the file you just created. Copy & paste the line `mock-maker-inline` into that file, and save it.

- Now, write your tests as normal. Example test:

```
    @Test
    public void handleBrewCoffee() {
        Context context = mock(Context.class);
        this.teapotRequestHandler.handleBrewCoffee(context);
        verify(context).status(418);
        verify(context).result("I'm a teapot!");
    }
```

- If something didn't work, try looking at this example project as a reference:
https://gitlab.com/stuAtGit/javalinmockitoexample

<h2 id="mockmaker">What does putting this MockMaker file in my source tree do to my code???
The presence of a file with the given
name & content tells the mockito framework to enable a different mock creator factory that can 
create mock objects on final classes:
https://github.com/mockito/mockito/pull/648
The one known caveat to enabling this mock factory is that you can no longer mock native methods.

*Note that this aspect of Javalin may change:
https://github.com/tipsy/javalin/issues/335
