---
layout: docs
title: SSL Plugin
rightmenu: true
permalink: /plugins/ssl-helpers
---

<div id="spy-nav" class="right-menu" markdown="1">
- [How does it work?](#how-does-it-work)
- [Getting Started](#getting-started)
- [Configuration options](#configuration-options)
  - [Connection options](#connection-options)
  - [Key loading options](#key-loading-options)
- [Advanced configuration](#advanced-configuration)
- [Good to know](#good-to-know)
</div>

<h1 class="no-margin-top">SSL Plugin</h1>

The SSL plugin provides a simple way to configure SSL and HTTP/2 for Javalin, just the same way you would configure Javalin itself!

## How does it work?

The plugin provides a `SslConfig` class that can be used to configure this plugin, which can be later registered with Javalin. This class can be configured using a lambda the same way you would configure Javalin itself.

{% capture java %}
SSLPlugin plugin = new SSLPlugin(conf -> {
    conf.loadPemFromPath("certs/cert.pem", "certs/key.pem");
});

Javalin.create(javalinConfig -> {
    javalinConfig.plugins.register(plugin);
}).start();
{% endcapture %}
{% capture kotlin %}
val plugin = SSLPlugin { conf ->
    conf.loadPemFromPath("/path/to/cert.pem", "/path/to/key.pem")
}

Javalin.create { javalinConfig ->
    javalinConfig.plugins.register(plugin)
}.start()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

By default two connectors are created, one for HTTP and one for HTTPS. The HTTP connector is **NOT** configured to redirect all requests to the HTTPS connector
(this can be achieved using the bundled plugin: `javalinConfig.plugins.enableSslRedirects();`). 
The default port for HTTP is 80 and for HTTPS is 443.

## Getting Started

Add the dependency:

<div class="multitab-code dependencies" data-tab="1">
<ul>
    <li data-tab="1">Maven</li>
    <li data-tab="2">Gradle</li>
</ul>

<div data-tab="1" markdown="1">
~~~markup
<dependency>
    <groupId>io.javalin.community</groupId>
    <artifactId>javalin-ssl-plugin</artifactId>
    <version>{{site.javalinversion}}</version>
</dependency>
~~~
Not familiar with Maven? Read our [Maven tutorial](/tutorials/maven-setup).
</div>

<div data-tab="2" markdown="1">
~~~java
implementation group: 'io.javalin.community', name: 'javalin-ssl-plugin', version: '{{site.javalinversion}}'
~~~
Not familiar with Gradle? Read our [Gradle tutorial](/tutorials/gradle-setup).
</div>

</div>

<style>
.bundle-hint p {
    margin-top: 8px;
    font-size: 14px;
}
</style>

Configure the plugin:

{% capture java %}
SSLPlugin plugin = new SSLPlugin(conf -> {
    conf.loadPemFromPath("/path/to/cert.pem", "/path/to/key.pem");
    // additional configuration options
});
{% endcapture %}
{% capture kotlin %}
val plugin = SSLPlugin { conf ->
    conf.loadPemFromPath("/path/to/cert.pem", "/path/to/key.pem")
    // additional configuration options
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

And register the plugin with Javalin:

{% capture java %}
Javalin.create(javalinConfig -> {
    javalinConfig.plugins.register(plugin);
}).start();
{% endcapture %}
{% capture kotlin %}
Javalin.create { javalinConfig ->
    javalinConfig.plugins.register(plugin)
}.start()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

As easy as that!

## Configuration options

### Connection options

Options such as the port and the host can be configured using the following variables:

```java
host = null;                           // Host to bind to, by default it will bind to all interfaces.
insecure = true;                       // Toggle the default http (insecure) connector.
secure = true;                         // Toggle the default https (secure) connector.
http2 = true;                          // Toggle HTTP/2 Support

insecurePort = 80;                     // Port to use on the http (insecure) connector.
securePort = 443;                      // Port to use on the SSL (secure) connector.

sniHostCheck = true;                   // Enable SNI hostname verification.
tlsConfig = TLSConfig.INTERMEDIATE;    // Set the TLS configuration.
    
```
The `TLSConfig` enum provides a set of predefined configurations for the TLS protocol. The default configuration is `TLSConfig.INTERMEDIATE`, which is based on the latest Mozilla's guidelines. The following configurations are available:

```java
TLSConfig.OLD
TLSConfig.INTERMEDIATE
TLSConfig.MODERN
```
You can also create your own custom configuration by using the `TLSConfig` constructor.

### Key loading options

The plugin provides a set of methods to load the certificate and key from different sources. The following methods are available:

PEM certificate and key:

```java
pemFromPath("/path/to/cert.pem", "/path/to/key.pem");                   // load from paths.
pemFromPath("/path/to/cert.pem", "/path/to/key.pem", "keyPassword");    // load from paths with the given key password.
pemFromClasspath("certName.pem", "keyName.pem");                        // load from files in the classpath.
pemFromClasspath("certName.pem", "keyName.pem", "keyPassword");         // load from files in the classpath with the given key password.
pemFromInputStream(certInputStream, keyInputStream);                    // load from input streams.
pemFromInputStream(certInputStream, keyInputStream, "keyPassword");     // load from input streams with the given key password.
pemFromString(certString, keyString);                                   // load from strings.
pemFromString(certString, keyString, "keyPassword");                    // load from strings with the given key password.
```
PKCS#12/JKS keystores:

```java
keystoreFromPath("/path/to/keystore.jks", "keystorePassword");          // load the keystore from the given path
keystoreFromClasspath("keyStoreName.p12", "keystorePassword");          // load the keystore from the given path in the classpath.
keystoreFromInputStream(keystoreInputStream, "keystorePassword");       // load the keystore from the given input stream.
```

Each of these methods are mutually exclusive, so only one of them can be used at a time.

## Advanced configuration

Once the plugin is configured, there is a `SSLPlugin#patch` method that can be used to patch the Jetty server. This method receives a `Server` as a parameter and adds the configured connectors to it. This method can be used to apply the SSL configuration to a server that is not created by Javalin.


## Good to know

 - This plugin can be used to enable HTTP/2 without the need to use a certificate. To do so, just set the `secure` option to `false` and the `http2` option to `true`.
  
 - HTTP/3 is not supported yet, but it is planned to be added in the future. The IETF is still working on the final specification, so it is not prudent to implement it yet.
  
 - Client certificates are not supported yet, and it is **not** planned to be added in the future. If you need this feature, please open an issue in the [GitHub repository](https://github.com/javalin/javalin-ssl)
  
 - Jetty 11 ships with SNI verification enabled by default, if hostname spoofing is a not concern, you can disable it by setting the `sniHostCheck` option to `false`. This option is enabled by default for security reasons, but it can be disabled if you are using a reverse proxy that handles the hostname verification. Jetty might respond with an `HTTP ERROR 400 Invalid SNI` if the hostname verification fails.
  
 - Live reload of certificates is not supported yet, and it **is** planned to be added in the future.