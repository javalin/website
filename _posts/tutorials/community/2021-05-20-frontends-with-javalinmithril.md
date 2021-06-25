---
layout: tutorial
official: false
title: Simple Frontends With Mithril.js
author: <a href="https://www.linkedin.com/in/tareq-kirresh" target="_blank">Tareq Kirresh</a>
date: 2021-05-20
permalink: /tutorials/frontends-with-javalinmithril
github: https://github.com/TareqK/javalinmithril-example
summarytitle: Frontends With Mithril and Javalin
summary: This tutorial shows how to use the JavalinMithril plugin for simplified frontend development
language: java
---

In this tutorial you'll learn how to create simple frontends with Javalin and Mithril.js.
The tutorial is only an intro, but covers the import and package system in the plugin, basic mithril.js components,
application layouts, and state sharing between server and client.

JavalinMithril is still in its infancy, but I belive that it has a place in your application - the main benefit of using it vs JavalinVue is that it gives you the ability to make frontends with more files and better Namespacing, instead of relying on component names that are unique in an application, allowing for more complex frontends.
The background section dives into the idea behind JavalinMithril and how it is used,  but if you're just here to learn how to use JavalinMithril(Or morbid curiousity, I don't judge), you can skip ahead to [setup](#setup) section.

## Background

I'm a DevOps engineer by trade, but have worked several roles in the Software Industry in the last 5 years(even working as a teacher once, a story for another time). I started off in networking, then moved to Java EE(And also hardware integrations in java), then to Javalin. I always had a certain attraction to lesser used and known libraries and frameworks, simply because I like the way they solved a certain problem. In my very illustrious(read : not fun and dont like it) front end career, i tended to gravitate towards hyperscript-based frameworks(such as RE:DOM, and Mithril.js) rather than pure DOM manipulation or template based frameworks. I have configured a dozen or so projects with npm and yarn, but it always felt kind of contrary to the simple nature and spirit of the web(at least front ends) to have complex build systems, so I tend to stick close to "bare" metal.

I came across JavalinVue a year or so ago, I absolutely loved the simplicity, so much so that I have contributed to it,  and the performance and quick development time have been key to the success of my projects and initatives(also a story for another time). This Plugin is inspired by JavalinVue(and a dare), and adresses the only shortcoming I found in it : you need to manage your component ids to be unique, otherwise it doesnt work correctly.

In this tutorial, we will go over the main workflow in JavalinMithril, and explain some choices along the way. There is no build system for the front end, But there is a well defined namespace(package) and class system that we need to stick to to get the results we want.

## Setup
Our backend will be Java, and we'll be using Maven to build.
We need to bring in Javalin (web library), Jackson (JSON serializer), and JavalinMithril (front end). We also need the Webjar for Mithril.js\\
We'll also add Vue (view library) for our frontend:

```xml
<dependency>
    <groupId>io.javalin</groupId>
    <artifactId>javalin</artifactId>
    <version>{{site.javalinThreeVersion}}</version>
    <type>jar</type>
</dependency>
<dependency>
    <groupId>io.github.javalin</groupId>
    <artifactId>javalinmithril</artifactId>
    <version>0.1.0</version>
    <type>jar</type>
</dependency>
<dependency>
    <groupId>org.webjars.npm</groupId>
    <artifactId>mithril</artifactId>
    <version>2.0.4</version>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.10.3</version>
</dependency>
```
<div class="comment" markdown="1">
You can add all frontend dependencies as [Webjars](https://www.webjars.org/), which can be built directly from NPM.
If something is available on NPM, it's also available as a Webjar, but as a prebuilt dist version (it has no dependencies).
To view the full POM, please go to [GitHub](https://github.com/TareqK/javalinmithril-example/blob/master/pom.xml).
</div>

Now that we have all our dependencies in order, we need to configure our web server. Lets start off with 2 classes : the `Main` class, and the `App` class.

Starting off, our Main class, in `/src/main/java/io/javalinmithril/demo/Main.java`, is just a wrapper class that calls and starts our App:

```java
import io.javalin.Javalin
package io.javalin.javalinmithril.demo;

public class Main {

    public static void main(String[] args){
        new App().start();
    }
}
```

Our App class, which has the start method, looks like this

```java
/*package and imports*/
private Javalin app;

public void start(){
    app = Javalin.create();
    app.config.enableWebjars();
    JavalinMithril.configure(config -> {
            config.isDev(true)
                    .stateFunction((ctx) -> singletonMap("currentUser", currentUser(ctx)));
    });
    ...
    app.start(7000);
}
...

```
Notice the `JavalinMithirl.configure` method. We are basically telling the plugin to work in dev mode, and giving it the state function that will be injected into each component - in this case, its the name of the logged in user(We will get back to this in a bit).

We also need an HTML file to load our dependencies and to initialize Mithril. \\
Let's create `/src/main/resources/mithril/layout.html`:

```markup
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf8"/>
        <script src="@cdnWebjar/mithril/2.0.4/mithril.min.js"></script>
        <style>
            <!-- Your style here -->
        </style>
        @componentRegistration
    </head>
    <body>

    </body>
    <script>
        m.mount(document.body, {view:()=>@routeComponent})
    </script>
</html>
```

There are two JavalinMithril specific things here: `@componentRegistration` and `@routeComponent`. The JavalinMithril plugin will scan your `/resources/mithril` folder and put all the dependencies you have imported in your current component into `@componentRegistration`, similar to how libraries are loaded via `<script>` tags. It will also will also let you choose one component to mount based on the current URL, this is the `@routeComponent`.

<div class="comment" markdown="1">
Its important to note that there are differences between `m.mount` and `m.render`, but this is something you can refer to the mithril.js docs to figure out.
</div>

## Hello World

Now that we have a layout file, let's create `/resources/mithril/hello-world.js`:

```javascript
/*
 @package io.javalin.mithril.demo;
 */
class HelloWorld {
    constructor() {

    }

    view(vnode) {
        return m("div",[
                m("h1.hello-world", "Hello World !"),
                m("a", {href: "/users"}, "View user Overview"),
            ]
        )
    }
}
```

Here we are telling JavlainMithril that we are declaring a `HelloWorld` class. Notice the `@package` directive, which tells us that this class is in the package `io.javalin.mithril.demo`. Also Notice that there is no CSS here, The CSS can be put in multiple places, such as in a `<style/>` block of the header file, or imported using Javalin Static files, or imported via CDN. You can put these directives in a block comment(notice the space above and below the directives), if your IDE or editor is giving you issues, and they work fine there.

To display our component to the user, we need to tell Javalin when to show it. Lets add a new route to our application

```java
import io.javalin.Javalin
import io.javalin.plugin.rendering.mithril.JavalinMithril;
import io.javalin.plugin.rendering.mithril.MithrilComponent;

public void start(){
    app = Javalin.create();
    app.config.enableWebjars();
    JavalinMithril.configure(config -> {
            config.isDev(true);
    });

    app.get("/", new MithrilComponent("io.javalin.mithril.demo.HelloWorld"));
}
```

The `@routeComponent` that we added in `layout.html` earlier will be replaced by the Class we supplied inside of `MithrilComponent`.
This means a call to `/` will load the layout and display our `HelloWorld` component.

Restart the server, go to `http://localhost:7000/`, and you'll see `Hello, World!` in a nice goldenrod color.

<div class="comment" markdown="1">
Note that you don't have to restart the server when making changes to `.js` files,Javalin will pick up on those automatically.\\
The reason we needed to restart now was because we added a new route in the `start` function.
</div>

## Importing and Nesting
So now we are all setup, for the sake of consistency, lets create an app frame. Create a file `/resources/mithril/app-frame.js`
```javascript
/*
 @package io.javalin.mithril.demo;
 */
class AppFrame {
    constructor(content) {
    }

    view(vnode) {
        return m("div.app-frame", [
            m("header", [
                m("span", "Javalin Mithril Demo App")
                ]),
            vnode.attrs.content
            ]
        )
    }
}

```
Look at the `vnode.attrs.content` access here - this lets us access what attributes were passed into this component, which can be any javascript object(More about this in the Mithril docs). In our case, we are going to pass in the current view's `content`, so our `HelloWorld` class looks like this now :

```javascript
/*
 @package io.javalin.mithril.demo;
 @import io.javalin.mithril.demo.AppFrame;
 */
class HelloWorld {
    constructor() {

    }

    view(vnode) {
        return m(AppFrame, {content: [
                m("h1.hello-world", "Hello World !"),
                m("a", {href: "/users"}, "View user Overview"),
            ]
        })
    }
}
```
Take note of the `@import` directive We are also telling it that we are importing the `io.javalin.mithril.demo.AppFrame` class, which we are using  as the page template.


## Routing and error handling

Now that we know how to create components, let's look at a very common scenario:
creating an admin interface. Our admin interface should be able to display an overview
of users, and also additional details for one specific user.
This will require two views, and we should probably also include a 404 page.

Let's change the server by adding the following lines:

```java
app.get("/", new MithrilComponent("io.javalin.mithril.demo.HelloWorld"));
app.get("/users", new MithrilComponent("io.javalin.mithril.demo.UserOverview"));
app.get("/users/:user-id", new MithrilComponent("io.javalin.mithril.demo.UserProfile"));
app.error(404, "html", new MithrilComponent("io.javalin.mithril.demo.NotFound");
app.get("/api/users", UserController::getAll);
app.get("/api/users/:user-id", UserController::getOne);
```

We've referenced `UserController` in the previous snippet, and you can see the source for that - more or less its just a Controller that deals with some data in an in-memory set, So i will spare you the details. you can look at `/src/main/java/io/javalinmithril/demo/controller/UserController.java` to see what is up there.

Now lets move back to the frontend. We Want 3 views here : user-overview, user-profile, and not-found.
This completes our backend, let's move on to the frontend. We want three views (user-overview, user-profile, and not-found), so
we should create three separate files in `/src/main/resources/mithril/views`. We also need a model, since that is the Mithirl convention\\
Lets start off with `/src/main/resources/mithril/user-model.js`

```javascript
/*
 @package io.javalin.mithril.demo;
 */

class UserModel {

}

UserModel.list = [];
UserModel.current = null;
UserModel.fetch = function () {
    m.request("/api/users").then(function (result) {
        UserModel.list = result;
    })
};

UserModel.fetchOne = function (id) {
    m.request(`/api/users/${id}`).then(function (result) {
        UserModel.current = result;
    })
};
```
Both instance and static methods work here, But you need to declare a class so JavalinMithril picks it up. This class is just a View-Model to simplify our work. \\
Next, Let's create `/src/main/resources/mithril/user-overview.js`:

```javascript
/*
 @package io.javalin.mithril.demo;
 @import io.javalin.mithril.demo.AppFrame;
 @import io.javalin.mithril.demo.UserModel;
 */

class UserOverview {
    constructor(vnode) {
    }
    oninit(vnode) {
        return UserModel.fetch();
    }

    view(vnode) {
        return m(AppFrame, {content:
            m("ul.user-overview-list",
                UserModel.list.map(function (user) {
                    return m("li",
                        m("a", {href: `/users/${user.id}`}, `${user.name} (${user.email})`))
                    }
                )
             )
        })
    }
}
```
This component will start off by fetching our Users from the server, then loops through the array, and creates a list of links we can click for more info. This is all pure JS. infact, all of your mithril classes are pure JS, your CSS can be wherever you prefer.

Open `http://localhost:7000/users/` to view the list of users. If you click on one, a blank page will show.\\
Let's fix this by creating `/src/main/resources/mithril/views/user-profile.js`:

```javascript
/*
 @package io.javalin.mithril.demo;
 @import io.javalin.mithril.demo.AppFrame;
 @import io.javalin.mithril.demo.UserModel;
 */
class UserProfile {
    constructor(vnode) {
    }
    oninit(vnode) {
        return UserModel.fetchOne(window.javalin.pathParams["user-id"]);
    }

    view(vnode) {
        return m(AppFrame,
            {content:
                UserModel.current ? m("dl", [
                    m("dt", "User ID"),
                    m("dd", UserModel.current.id),
                    m("dt", "User Name"),
                    m("dd", UserModel.current.name),
                    m("dt", "Email"),
                    m("dd", UserModel.current.email),
                    m("dt", "Birthday"),
                    m("dd", UserModel.current.userDetails.dateOfBirth),
                    m("dt", "Salary"),
                    m("dd", UserModel.current.userDetails.salary)
                ]) : null
            }
        )
    }
}
```

This is pretty similar to our user-overview, but since this is a dynamic route,
we use the `window.javalin` object to get the matched `user-id` in the route.

Let's finish up our views with `/src/main/resources/mithril/views/not-found.js`:

```javascript
/*
 @package io.javalin.mithril.demo;
 @import io.javalin.mithril.demo.AppFrame;
 */
class NotFound {
    constructor() {

    }

    view(vnode) {
        return m(AppFrame, {
            content: m("h1", "Page Not Found (error 404)")
        })
    }
}
```
Great, we have all our views ready!

## Server Side State
Now that we can log users in, it would be nice if the client knew the current user.Our server knows, so we need to transfer this knowledge somehow.
We need to modify our `JavalinMithril` config to do this injection. It looks something like this

```java
JavalinMithril.configure(config -> {
        config.isDev(true);
        config.stateFunction((ctx) -> singletonMap("currentUser", currentUser(ctx)));
});
```

This line of code sets a function that will run for every `MithrilComponent`, so all components will now
have access to the current user (if there is one). Since basic-auth works per directory, the frame will only
show the current user for `http://localhost:7000/users/` (the user-overview) and its subpaths (the individual profiles).
Let's add it to `app-frame.js`:

```javascript
/*
 @package io.javalin.mithril.demo;
 */
class AppFrame {
    constructor(content) {
    }

    view(vnode) {
        return m("div.app-frame", [
            m("header", [
                m("span", "Javalin Mithril Demo App"),
                    window.javalin.state.currentUser ? m("span", `Current User : '${window.javalin.state.currentUser}'`) : null,
                ]),
            vnode.attrs.content
            ]
        )
    }
}

```

## Conclusion
We've created a fully working (but pretty limited) admin interface with only a few files.
* `App.java` contains the server config (routes, error handlers, access management)
* `UserController.java` contains the list of fake users, and methods to get them (getAll, getOne)
* `layout.html` loads the frontend dependencies and initializes Mithril
* `app-frame.js` has a header and some global styling which is included in all components
* `user-overview.js` displays a list of users
* `user-profile.js` displays additional details for one user (requires login)
* `not-found.js` displays a 404 error page
* `user-model.js` contains the ViewModel for users
* `pom.xml` contains all our dependencies

Since our frontend dependencies are prepacked WebJars, we don't need NPM, and we don't need to
manage any frontend libraries manually. The project structure is very clean:

<div class="compressed-code" markdown="1">
```java
javalinvue-example
├───src
│   └─── main
│       └───java
│       |   ├───io/javalinmithril/demo
│       |        └───'Java Source Code'
│       └───resources/mihtril
│               └───app-frame.js
│               └───not-found.js
│               └───user-overview.js
│               └───user-profile.js
|               └───user-model.js
│               └───layout.html
└───pom.xml
```
<style>.compressed-code .highlighter-rouge pre code { line-height: 1.2; }</style>
</div>

That's about it. The Afterword contains a bit more discussion about this technique,
but similarly to the Background section you can skip it if you're not that interested. **Thanks for reading**!

### Afterword
The Library is still in its early days. However, there is a lot of potential here for growing front-ends without the associated tool-chain complexities, keeping a small overhead/request - and keeping that overhead consistent, even as your application grows in features and complexity. While Mithril.js is designed around single-page applications, it just offers so much out of the box that when we were considering the hyperscript framework to use for this plugin (trust me when I say, it was even more bonkers than it is right now - who even writes an import and package system?), we just decided to go with it because of the (outwardly looking) reactive nature, performance, and built in XHR functionality.

I've created [an issue on GitHub](https://github.com/TareqK/javalinmithril-example/issues/1)
where you can post your pros/cons, or general comments on the tutorial.
