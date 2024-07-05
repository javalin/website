---
layout: default
title: DevLoggingPlugin documentation
rightmenu: false
permalink: /plugins/devlogging
---

<h1 class="no-margin-top">DevLoggingPlugin</h1>

When you enable the DevLoggingPlugin, the following output is logged
when the server receives a HTTP request:

```
[JettyServerThreadPool-81] INFO io.javalin.Javalin - JAVALIN REQUEST DEBUG LOG:
Request: GET [/hello-world]
    Matching endpoint-handlers: [GET=/hello-world]
    Headers: {User-Agent=unirest-java/3.1.00, Accept-Encoding=gzip, ... }
    Cookies: {}
    Body:
    QueryString: null
    QueryParams: {}
    FormParams: {}
Response: [200 OK], execution took 0.19 ms
    Headers: {Date=Fri, 19 Aug 2022 16:28:16 GMT, Content-Type=text/plain}
    Body is 12 bytes (starts on next line):
    Hello World!
```

When the server receives a WebSocket request, all the relevant events are logged:

```
[JettyServerThreadPool-75] INFO io.javalin.Javalin - JAVALIN WEBSOCKET DEBUG LOG
WebSocket Event: onConnect
Session Id: ca762465-a30d-4f9d-97a3-ce24e9515135
Host: localhost
Matched Path: /path/{param}
PathParams: {param=1}
QueryParams: {test=[banana], hi=[1, 2]}

[JettyServerThreadPool-80] INFO io.javalin.Javalin - JAVALIN WEBSOCKET DEBUG LOG
WebSocket Event: onClose
Session Id: ca762465-a30d-4f9d-97a3-ce24e9515135
Host: localhost
Matched Path: /path/{param}
PathParams: {param=1}
QueryParams: {test=[banana], hi=[1, 2]}
StatusCode: 1000
Reason: No reason was provided
```

You can enable dev logging through `config`:

```java
Javalin.create(config -> {
    config.bundledPlugins.enableDevLogging();
});
```
