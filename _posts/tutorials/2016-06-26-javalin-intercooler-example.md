---
layout: tutorial
title: "Creating an AJAX todo-list without writing JavaScript"
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
date: 2016-06-26 11:11:11
permalink: /tutorials/ajax-without-writing-javascript
github: https://github.com/tipsy/javalin-intercooler-example
summarytitle: JavaScript todo-list app
summary: Create a modern single page application in Javalin and intercooler.js without writing JavaScript.
---

## What You Will Learn
You will learn how to create a single page AJAX application that can create new todos, edit existing todos, filter todos on status, and more, all on the server side without writing any JavaScript. The tutorial uses a client side library, <a href="http://intercoolerjs.org/" target="_blank">intercooler.js</a>, which lets you write declarative AJAX applications using HTML attributes.

### Screenshot

<img src="/img/posts/javalinIntercooler/todoList.png" alt="Application Screenshot">

The todo-list is implemented in the style of <a href="http://todomvc.com/" target="_blank">TodoMVC</a>, which is a an app commonly used to evaluate frontend frameworks.

## Declaring your Javalin routes
Normally in Javalin, a route returns some string content in the response. When using intercooler, a lot of your routes will return a string created by the same code, so I created a void route-handler called ICRoute for the routes that alter state (post/put/delete) on the server side:
~~~java
public static void main(String[] args) {

    exception(Exception.class, (e, req, res) -> e.printStackTrace()); // print all exceptions
    staticFiles.location("/public");
    port(9999);

    get("/",                        (req, res)      -> renderTodos(req));
    get("/todos/:id/edit",          (req, res)      -> renderEditTodo(req));

    post("/todos",                  (ICRoute) (req) -> TodoDao.add(Todo.create(req.queryParams("todo-title"))));
    delete("/todos/completed",      (ICRoute) (req) -> TodoDao.removeCompleted());
    delete("/todos/:id",            (ICRoute) (req) -> TodoDao.remove(req.params("id")));
    put("/todos/toggle_status",     (ICRoute) (req) -> TodoDao.toggleAll(req.queryParams("toggle-all") != null));
    put("/todos/:id",               (ICRoute) (req) -> TodoDao.update(req.params("id"), req.queryParams("todo-title")));
    put("/todos/:id/toggle_status", (ICRoute) (req) -> TodoDao.toggleStatus(req.params("id")));

    after((req, res) -> {
        if (res.body() == null) { // if the route didn't return anything
            res.body(renderTodos(req));
        }
    });

}
~~~

As you can see, if the response body is null, the request was handled by an ICRoute, and we should set the response body to contain the newly rendered todo-list view.  
The GitHub repo also has an <a href="https://github.com/tipsy/javalin-intercooler/blob/master/src/main/java/BasicTodoList.java" target="_blank">example without ICRoute</a>, which returns a string in every route (no after-filter).

### Rendering the views
Almost every route returns the same template (in different states), and are handled by this render method:
~~~java
private static String renderTodos(Request req) {
    String statusStr = req.queryParams("status");
    Map<String, Object> model = new HashMap<>();
    model.put("todos", TodoDao.ofStatus(statusStr));
    model.put("filter", Optional.ofNullable(statusStr).orElse(""));
    model.put("activeCount", TodoDao.ofStatus(Status.ACTIVE).size());
    model.put("anyCompleteTodos", TodoDao.ofStatus(Status.COMPLETE).size() > 0);
    model.put("allComplete", TodoDao.all().size() == TodoDao.ofStatus(Status.COMPLETE).size());
    model.put("status", Optional.ofNullable(statusStr).orElse(""));
    if ("true".equals(req.queryParams("ic-request"))) {
        return renderTemplate("velocity/todoList.vm", model);
    }
    return renderTemplate("velocity/index.vm", model);
}
~~~
When you first GET the root, the request is not from intercooler, and the method renders index.vm (which also includes todoList.vm). When a PUT/POST/DELETE request is made with intercooler, the TodoList data object changes, and only todoList.vm needs to be re-rendered.

## The todo-list template
This is where the magic happens. The template contains a number of ic-attributes, which determine how your app functions:
~~~markup
<header ic-include='{"status":"$status"}'>
    <h1>todos</h1>
    <form id="todo-form" ic-post-to="/todos">
        <input id="new-todo" placeholder="What needs to be done?" name="todo-title" pattern=".{4,}" required title="> 3 chars" autofocus>
    </form>
</header>
<section id="main" ic-include='{"status":"$status"}'>
    <input type="checkbox" name="toggle-all" ic-put-to="/todos/toggle_status" id="toggle-all" #if($allComplete) checked #end>
    <ul id="todo-list">
        #foreach($todo in $todos)
            <li class="#if($todo.complete)completed#end">
                <div class="view">
                    <input type="checkbox" class="toggle" ic-put-to="/todos/$todo.id/toggle_status" #if($todo.complete)checked#end>
                    <label ic-get-from="/todos/$todo.id/edit" ic-target="closest li" ic-trigger-on="dblclick" ic-replace-target="true">$todo.title</label>
                    <button class="destroy" ic-delete-from="/todos/$todo.id"></button>
                </div>
            </li>
        #end
    </ul>
</section>
~~~

You can see a form with the attribute **ic-post-to='/todos'**. This form contains the input field used to add new todos. Adding this attribute is literally all you need to do in order to enable AJAX form-posts with intercooler.

Each individual todo (inside the #foreach) have a checkbox, a label, and a button. These are also mapped directly to Javalin routes using ic-attributes:
~~~java
checkbox (toggle status)   ic-put-to='/todos/$todo.id/toggle_status'

button (delete todo)       ic-delete-from='/todos/$todo.id'

label (update todo-title)  ic-get-from='/todos/$todo.id/edit' ic-target='closest li'
                           ic-trigger-on='dblclick' ic-replace-target='true'
~~~

The first two are pretty self explanatory, but the label one is a bit more complex. Since we want to allow inline editing of todos (double click to make the todo editable), we need to replace the content of the list with a form that we can submit. Intercooler GETs this form from '/todos/$todo.it/edit', and uses it to overwrite the current todo-item. The form looks like this:

~~~markup
<li class="editing">
    <form id="edit-form" ic-put-to="/todos/$todo.id">
        <input id="todo-edit" ic-get-from="/" ic-trigger-on="resetEscape" name="todo-title" class="edit" value="$todo.title" autofocus>
    </form>
</li>
~~~

The form has a ic-put property which triggers on form submit, and a ic-get which triggers if the users exits edit mode (resetEscape). This bit actually requires a couple of lines of JavaScript (a key-listener).

## Conclusion
Creating an AJAX powered app in Javalin and intercooler is extremely easy, and using HTTP verbs as HTML attributes feels very natural (PUT this here, POST this there, DELETE this). If you're used to writing full-fledged JavaScript applications you might feel that you're not in complete control of your application anymore. You can still use JavaScript to trigger intercooler functionality though, such as the resetEscape event in the above code.

Overall I think intercooler can be a very viable alternative for less complex AJAX apps, especially for developers suffering from JavaScript fatigue. Making an app non-js first then adding attributes to ajaxify it also seems to work well, at least for the simple cases I experimented with.

Please fork the example, play around with it, and let me know what you think in the comments!