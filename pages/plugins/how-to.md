---
layout: default
title: How to write a Javalin plugin
rightmenu: true
permalink: /plugins/how-to
---

<div id="spy-nav" class="right-menu" markdown="1">
- [What is a plugin?](#what-is-a-plugin)
- [The Plugin API](#how-does-the-plugin-api-look)
    - [- Plugin](#the-plugin-class)
    - [- ContextPlugin](#the-contextplugin-class)
- [Plugin examples](#plugin-examples)
    - [- Basic plugins](#creating-a-simple-plugin-no-config-no-extension)
    - [- Plugins with config](#creating-a-plugin-with-config-and-no-extension)
    - [- Plugins with config and context extension](#creating-a-plugin-with-config-and-extension)
</div>

<h1 class="no-margin-top">About Plugins</h1>
In Javalin 6, the plugin system was completely rewritten. The new system is much more powerful and flexible,
but it's also a bit more complicated. Our hope is that the new system will ensure that all plugins
follow the same pattern, so that it will be easier for end users to use the plugins.

This how-to guide will walk you through the plugin system,
and how to write your own plugins.

## What is a plugin?
A plugin is a piece of code that can be added to Javalin to extend Javalin's functionality. 
Typically, this means adding some handlers to the Javalin instance, or modifying the configuration,
or adding some functionality to the Javalin `Context`. Examples of plugins could be an
integration with a database, some code which does authentication, an integration with 
a rate-limiting service, template rendering, etc.

## How does the Plugin API look?
To write a plugin in Javalin, you need to extend the `Plugin` class. This class can be a bit
intimidating, but we will walk you through it step by step. There are also several examples in the later sections.

### The `Plugin` class
```kotlin
abstract class Plugin<CONFIG>(userConfig: Consumer<CONFIG>? = null, defaultConfig: CONFIG? = null) {

    /** Initialize properties and access configuration before any handler is registered. */
    open fun onInitialize(config: JavalinConfig) {}

    /** Called when the plugin is applied to the Javalin instance. */
    open fun onStart(config: JavalinConfig) {}

    /** Checks if plugin can be registered multiple times. */
    open fun repeatable(): Boolean = false

    /** The priority of the plugin that determines when it should be started. */
    open fun priority(): PluginPriority = PluginPriority.NORMAL

    /** The name of this plugin. */
    open fun name(): String = this.javaClass.simpleName

    /** The combined config of the plugin. */
    @JvmField
    protected var pluginConfig: CONFIG = defaultConfig?.also { userConfig?.accept(it) } as CONFIG
}
```

Every function in the `Plugin` class has a default implementation, so you only need to override the functions
that you actually want to use. The `Plugin` class also accepts a generic type parameter `CONFIG`,
which is the type of the configuration object that you want to use. If you don't want to
use a configuration object, you can use `Void`/`Unit` as the type parameter.

### The `ContextPlugin` class
If you want to add functionality to the `Context` class, you can extend the `ContextExtension` class,
which in turn extends the `Plugin` class. This class has a generic type parameter `EXTENSION`,
in addition to the `CONFIG` type parameter from the `Plugin` class:

```kotlin
abstract class ContextPlugin<CONFIG, EXTENSION>(
    userConfig: Consumer<CONFIG>? = null,
    defaultConfig: CONFIG? = null
) : Plugin<CONFIG>(userConfig, defaultConfig) {
    /** Context extending plugins cannot be repeatable, as they are keyed by class */
    final override fun repeatable(): Boolean = false
    abstract fun createExtension(context: Context): EXTENSION
}
```

The `ContextExtension` class has a function `createExtension`, which is called when the
user calls `ctx.with(Plugin::class)`. This function should return an instance of the
extension class. It also overrides the `repeatable` function to always returns
`false`. This is necessary because context extensions are keyed by class, so you can only have one
instance of each context extension.

This is all a bit complicated, but it will become clearer when we look at some examples.
We will be creating a rate limiting plugin, which we will name `Ratey`.\\
Typically, a plugin will be named after the functionality that it provides, or after the library that it integrates.

## Plugin examples
This section will walk you through the process of creating a plugin. We will start with a simple
plugin, and then we will add some more functionality to it in each section.

### Creating a simple plugin (no config, no extension)
The simplest plugin is one that doesn't have a config, and doesn't 
create a `Context` extension. All you have to do in this case is extend the `Plugin` class,
and override any functions that you want to use. We will use `Void` as the config type, 
since we don't need a config.

Let's create a plugin named `Ratey` that does rate limiting:

{% capture java %}
class Ratey extends Plugin<Void> {
    int counter;
    @Override
    public void onInitialize(JavalinConfig config) {
        config.router.mount(router -> {
            router.before(ctx -> {
                if (counter++ > 100) {
                    throw new TooManyRequestsResponse();
                }
            });
        });
    }
}
{% endcapture %}
{% capture kotlin %}
class Ratey : Plugin<Void>() {
    var counter = 0

    override fun onInitialize(config: JavalinConfig) {
        config.router.mount { router ->
            router.before { ctx ->
                if (counter++ > 100) {
                    throw TooManyRequestsResponse()
                }
            }
        }
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

In order to use this plugin, you need to call `JavalinConfig#registerPlugin`:

{% capture java %}
var app = Javalin.create(config -> {
    config.registerPlugin(new Ratey());
});
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create { config ->
    config.registerPlugin(Ratey())
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

This will register the plugin. The `onInitialize` function will be called when Javalin is initialized,
so our rate-limiting code will be executed for every request. This plugin is currently quite terrible,
as it will rate-limit all requests, and it has a hardcoded limit of 100 requests. Let's make it a bit
more flexible by adding a config.

### Creating a plugin with config (and no extension)
Let's say that we want to be able to configure the rate-limiter limit. 
We can do this by adding a config to our plugin. We have to use `Ratey.Config` as our
config type, and add a `Consumer<Config>` to the constructor of our plugin:

{% capture java %}
class Ratey extends Plugin<Ratey.Config> { // the Ratey.Config class is the config type
    int counter;
    public Ratey(Consumer<Config> userConfig) {
        super(userConfig, new Config()); // we pass config + default config to the super constructor
    }
    public static class Config {
        public int limit = 1;
    }
    @Override
    public void onInitialize(JavalinConfig config) {
        config.router.mount(router -> {
            router.before(ctx -> {
                if (counter++ > pluginConfig.limit) { // we can access the config through the pluginConfig field
                    throw new TooManyRequestsResponse();
                }
            });
        });
    }
}
{% endcapture %}
{% capture kotlin %}
class Ratey(userConfig: Consumer<Config>) : Plugin<Ratey.Config>(userConfig, Config()) {
    // the Ratey.Config class is the config type
    // we need to pass the config + default config to the super constructor
    // this will merge the user config with the default config
    var counter = 0
    class Config {
        var limit = 1
    }

    override fun onInitialize(config: JavalinConfig) {
        config.router.mount { router ->
            router.before { ctx ->
                if (counter++ > pluginConfig.limit) { // we can access the config through the pluginConfig field
                    throw TooManyRequestsResponse()
                }
            }
        }
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Now, we can configure our plugin when we register it:

{% capture java %}
var app = Javalin.create(config -> {
    config.registerPlugin(new Ratey(rateyConfig -> {
        rateyConfig.limit = 100_000;
    }));
});
{% endcapture %}
{% capture kotlin %}
val app = Javalin.create { config ->
    config.registerPlugin(Ratey { rateyConfig ->
        rateyConfig.limit = 100_000
    })
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

<div class="comment">
    <p>
        <strong>Note:</strong> The reason why Javalin requires a <code>Consumer</code> for the config is to enforce consistency
        across different plugins. Most of Javalin's built-in functionality uses a <code>Consumer</code> for the config,
        and we want to make sure that all plugins follow the same pattern.
    </p>
</div>

While our plugin is better now, it's still not good. We are only able to limit the number of requests, but
ideally we want to be able to do this per user and have different costs per endpoint.
Let's add a `Context` extension to our plugin.

### Creating a plugin with config and extension

For this example, we want to be able to limit the number of requests per user, and have different costs per endpoint.
Instead of a before-handler, we will create an extension to the `Context` class, which we will let users
call with `ctx.with(Ratey::class)`. This will return an instance of our extension class.

Let's extend the `ContextExtension` class in our `Ratey` plugin and add a `createExtension` function:

{% capture java %}
class Ratey extends ContextPlugin<Ratey.Config, Ratey.Extension> {
    public Ratey(Consumer<Config> userConfig) {
        super(userConfig, new Config());
    }

    // map of ip to counter, to keep track of the number of requests per ip
    Map<String, Integer> ipToCounter = new HashMap<>();

    // called when the user calls ctx.with(Ratey.class), should return an instance of the extension class
    @Override
    public Extension createExtension(@NotNull Context context) {  
        return new Extension(context);
    }

    // the config class that is used in JavalinConfig#registerPlugin
    public static class Config {
        public int limit = 1;
    }
    // this is an inner class, so it has access to the ipToCounter property of the outer class
    public class Extension {
        private final Context context;

        public Extension(Context context) {
            this.context = context;
        }

        public void tryConsume(int cost) {
            String ip = context.ip();
            int counter = ipToCounter.compute(ip, (k, v) -> v == null ? cost : v + cost);
            if (counter > pluginConfig.limit) {
                throw new TooManyRequestsResponse();
            }
        }
    }
}
{% endcapture %}
{% capture kotlin %}
class Ratey(userConfig: Consumer<Config>) : ContextPlugin<Ratey.Config, Ratey.Extension>(userConfig, Config()) {
    // map of ip to counter, to keep track of the number of requests per ip
    val ipToCounter = mutableMapOf<String, Int>()
    // this function is called when the user calls ctx.with(Ratey::class), 
    // and should return an instance of the extension class
    override fun createExtension(context: Context) = Extension(context)
    // the config class that is used in JavalinConfig#registerPlugin
    class Config(var limit: Int = 0)
    // this is an inner class, so it has access to the ipToCounter property of the outer class
    inner class Extension(var context: Context) {
        fun tryConsume(cost: Int = 1) {
            val ip = context.ip()
            val counter = ipToCounter.compute(ip) { _, v -> v?.plus(cost) ?: cost }!!
            if (counter > pluginConfig.limit) {
                throw TooManyRequestsResponse()
            }
        }
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Now, we can use our plugin like this:

{% capture java %}
// register
var app = Javalin.create(config -> {
    config.registerPlugin(new Ratey(rateyConfig -> {
        rateyConfig.limit = 100_000;
    }));
});

// use in handler
app.get("/cheap-endpoint", ctx -> {
    ctx.with(Ratey.class).tryConsume(1);
    ctx.result("Hello cheap world!");
});
app.get("expensive-endpoint", ctx -> {
    ctx.with(Ratey.class).tryConsume(100);
    ctx.result("Hello expensive world!");
});
{% endcapture %}
{% capture kotlin %}
// register
val app = Javalin.create { config ->
    config.registerPlugin(Ratey { rateyConfig ->
        rateyConfig.limit = 100_000
    })
}

// use in handler
app.get("/cheap-endpoint") { ctx ->
    ctx.with(Ratey::class).tryConsume(1)
    ctx.result("Hello cheap world!")
}
app.get("expensive-endpoint") { ctx ->
    ctx.with(Ratey::class).tryConsume(100)
    ctx.result("Hello expensive world!")
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Now each IP can make 100_000 requests, and the endpoints have different costs associated with them.
This is a much better plugin, but it still has some issue. This plugin is not thread-safe, and it
never resets the counters or removes old entries from the map. This is not relevant for this guide
though, the main purpose was to show the interaction between the `Plugin`, `ContextPlugin` and
`pluginConfig`.
