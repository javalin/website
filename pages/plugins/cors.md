---
layout: default
title: CORS plugin documentation
rightmenu: true
permalink: /plugins/cors
---

<div id="spy-nav" class="right-menu" markdown="1">
- [Getting Started](#getting-started)
- [Allowing any host](#allowing-any-host)
- [Subdomain wildcard support](#subdomain-wildcard-support)
- [Multiple CORS configurations](#multiple-cors-configurations)
- [allowCredentials and exposeHeader](#allowcredentials-and-exposeheader)
</div>

<h1 class="no-margin-top">CORS plugin</h1>

The CORS plugin manages CORS related headers for you given some configuration such as allowed hosts.

## Getting started

You can enable the cors plugin through the `config.plugins` part of the config:

{% capture java %}
Javalin.create(config -> {
    config.bundledPlugins.enableCors(cors -> {
        cors.addRule(it -> {
            it.allowHost("example.com", "javalin.io");
        });
    });
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.bundledPlugins.enableCors { cors ->
        cors.addRule {
            it.allowHost("example.com", "javalin.io")
        }
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

This example would allow the origins `https://example.com` and `https://javalin.io`.

The default scheme can be changed by setting it: `defaultScheme = "http"`, but you can also just specify it with your
`allowHost()` call: `allowHost("http://example.com")`

## Allowing any host

Allowing everybody by using can be done with `anyHost()`.
`anyHost()` adds the special star origin `*`, allowing any host from a CORS standpoint. Do note that you can still
deny via other means such as an access manager, but it is recommended to just allow the hosts that you need.

{% capture java %}
Javalin.create(config -> {
    config.bundledPlugins.enableCors(cors -> {
        cors.addRule(it -> {
            it.allowHost("example.com", "javalin.io");
        });
    });
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.bundledPlugins.enableCors { cors ->
        cors.addRule {
            it.allowHost("example.com", "javalin.io")
        }
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Similar to `anyHost()` you can set `reflectClientOrigin = true` to reflect back the clients origin instead of the generic
star. This has the same implications as `anyHost()`, so it should be considered carefully.

{% capture java %}
Javalin.create(config -> {
    config.bundledPlugins.enableCors(cors -> {
        cors.addRule(it -> {
            it.reflectClientOrigin = true;
        });
    });
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.bundledPlugins.enableCors { cors ->
        cors.addRule {
            it.reflectClientOrigin = true
        }
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Subdomain wildcard support

Special support for subdomains is added by allowing a single star as a wildcard.
`allowHost("*.example.com")` would allow any subdomain of `example.com` to access your resources from a CORS standpoint.

{% capture java %}
Javalin.create(config -> {
    config.bundledPlugins.enableCors(cors -> {
        cors.addRule(it -> {
            it.allowHost("*.example.com");
        });
    });
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.bundledPlugins.enableCors { cors ->
        cors.addRule {
            it.allowHost("*.example.com")
        }
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

## Multiple CORS configurations

It is also possible to have different cors configurations for different paths.
Take a look at the following example:

{% capture java %}
Javalin.create(config -> {
    config.bundledPlugins.enableCors(cors -> {
        cors.addRule(it -> {
            it.path = "images*";
            it.allowHost("https://images.local");
        });
        cors.addRule(it -> {
            it.path = "videos*";
            it.allowHost("https://videos.local");
        });
        cors.addRule(it -> {
            it.path = "music*";
            it.allowHost("https://music.local");
        });
    });
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.bundledPlugins.enableCors { cors ->
        cors.addRule {
            it.path = "images*"
            it.allowHost("https://images.local")
        }
        cors.addRule {
            it.path = "videos*"
            it.allowHost("https://videos.local")
        }
        cors.addRule {
            it.path = "music*"
            it.allowHost("https://music.local")
        }
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Everything listed under `images` would be only accessible by the host `images.local` and everything under `videos`
only to the host `videos.local`.

## allowCredentials and exposeHeader

For those who need it you can also set the `Access-Control-Allow-Credentials` header by setting `allowCredentials = true`
and expose headers to the website's JavaScript by using e.g. `exposeHeader("x-server")` to expose the `x-server` header.

{% capture java %}
Javalin.create(config -> {
    config.bundledPlugins.enableCors(cors -> {
        cors.addRule(it -> {
            it.allowHost("*.example.com");
            it.allowCredentials = true;
            it.exposeHeader("x-server");
        });
    });
});
{% endcapture %}
{% capture kotlin %}
Javalin.create { config ->
    config.bundledPlugins.enableCors { cors ->
        cors.addRule {
            it.allowHost("*.example.com")
            it.allowCredentials = true
            it.exposeHeader("x-server")
        }
    }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

Do note that you cannot use Javalin's `anyHost()` option together with `Access-Control-Allow-Credentials` as that is 
[explicitly forbidden by all browsers.](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#sect2)

### Passing credentials from the frontend to the backend

Browsers do not automatically pass credentials to a backend which sets the `Access-Control-Allow-Credentials`.
This must be done explicitly for JavaScript based requests. The following two examples demonstrate this for the browser
native fetch and for the popular axios library.

Minimal example using the `fetch` API:

```javascript
const data = {};
fetch("https://example.com", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(data)
});
```

Source: [Mozilla's MDN Using the fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#sending_a_request_with_credentials_included)

Example using `axios`:

```javascript
import axios from "axios";

const data = {};
axios.post("https://example.com", data, {
  withCredentials: true
});
```

Source: [axios request config page](https://axios-http.com/docs/req_config)
