---
layout: tutorial
official: true
title: A quick intro to SSL in Java
permalink: /tutorials/javalin-ssl-tutorial
summarytitle: A quick intro to SSL in Java
summary: Learn how SSL works and how to secure your Javalin application with SSL.
date: 2022-11-17
author: <a href="https://www.linkedin.com/in/zugazagoitia/">Alberto Zugazagoitia</a>
language: ["java", "kotlin"]
rightmenu: true
#TODO: Make an example project 
#github: https://github.com/The-Funk/serving-protobuf-with-javalin 
---

<div id="spy-nav" class="right-menu" markdown="1">
- [Introduction](#introduction)
- [How does HTTPS work?](#how-does-https-work)
  - [What is a Certificate Authority?](#what-is-a-certificate-authority-ca)
  - [Self-Signed Certificates](#what-is-a-self-signed-certificate)
    - [When to use them](#why-would-you-use-a-self-signed-certificate)
    - [When not to use them](#when-should-you-not-use-a-self-signed-certificate)
- [SSL in Javalin or not?](#should-i-enable-ssl-in-my-javalin-application)
- [Securing Javalin](#securing-javalin-with-ssl)
  - [1. Obtain a certificate](#1-obtain-a-certificate)
    - [Making a self-signed cert](#generating-a-self-signed-certificate)
  - [2. Add the dependency](#2-add-the-javalin-ssl-dependency)
  - [3. Configure the plugin](#3-configure-the-javalin-ssl-plugin)
</div>

## Introduction

Since browsers started to enforce the use of HTTPS, it has become a necessity to secure your web application with SSL. In this tutorial, we will learn how to secure our Javalin application with SSL and how SSL works.
The first step to secure your application is to use HTTPS. HTTPS is the secure version of HTTP. It is the same protocol, but it uses SSL/TLS to encrypt the communication between the client and the server. The client and the server will use a secure channel to exchange information. This secure channel is established using a cryptographic protocol called TLS (Transport Layer Security). TLS is the successor of SSL (Secure Sockets Layer). The name change was made because of the acquisition of SSL by Netscape. Nowadays, SSL is used as a generic term to refer to the TLS protocol and its predecessors.
<br/>

## How does HTTPS work?

The following diagram shows the steps that are followed to establish a secure connection between a client and a server.

![HTTPS](/img/posts/sslTutorial/tls-diagram.png)
<div class="comment"> 
Courtesy of <a href="https://www.cloudflare.com/learning/access-management/what-is-mutual-tls/">Cloudflare</a>
</div>

The certificate's public key presented by the server is used to securely exchange a symmetric key to use during our connection.

However, the client needs to verify that the server is who it says it is. To do this, the client needs to verify the server's certificate. The client will check if the certificate is valid and if it was issued by a **trusted Certificate Authority (CA)**. If the certificate is not valid or it was not issued by a trusted CA, the client will reject the connection.

### What is a Certificate Authority (CA)?

The Certificate Authority (CA) is an entity that issues digital certificates. The CA verifies the identity of the server and signs the certificate with its private key. The certificate contains the public key of the server and some metadata about the server, such as the common name, the organization, the country, and the expiration date. The client will use this information to decide if it trusts the server.

Let's Encrypt is a Certificate Authority that provides free SSL certificates. Managing this certificates can be a bit tricky. This is outside of the scope of this tutorial. However, you can find more information about Let's Encrypt in the [Let's Encrypt documentation](https://letsencrypt.org/getting-started/).

### What is a Self-Signed Certificate?

A self-signed certificate is a certificate that is signed by the same entity that created it.
The certificate is **not** signed by a trusted CA. A client will not trust the certificate because it is not signed by a trusted CA.
However, the client can trust the certificate if it is manually added to the list of trusted certificates in the client's trust store.

#### Why would you use a Self-Signed Certificate?

There are several reasons why you would use a self-signed certificate. For example, you could use a self-signed certificate for testing purposes. You could also use a self-signed certificate if you are developing an internal application that will be used only by trusted clients. In this case, you can add the self-signed certificate to the client's trust store.

#### When should you not use a Self-Signed Certificate?

When you are developing a web application that will be used by the general public, you should not use a self-signed certificate. The reason is that the client will not trust the certificate because it is not signed by a trusted CA. If the client does not trust the certificate, the connection will be rejected and a security warning will be displayed in the browser: 

<img src="/img/posts/sslTutorial/your-connection-is-not-private.png" style="border: 2px solid black; height: 400px; width:auto;">
<br/>
<br/>

## Should I enable SSL in my Javalin application?

In most cases you won't be securing your application with SSL, this responsibility will be delegated to a reverse proxy, this is a server that sits in front of your application and forwards requests to it, like this:

![reverse-proxy](/img/posts/sslTutorial/reverse-proxy-diagram.png)

This approach provides a lot of benefits, such as:

- Removing any SSL related code from your application
- The reverse proxy (and the certificate) can be shared by multiple applications
- SSL termination is done at the reverse proxy, which means that the application will not have to deal with the overhead of encrypting and decrypting the data.

This is especially useful if you are running your application in a containerized environment, where you can easily spin up multiple instances of your application and share the same reverse proxy.

However, this won't work for all use cases, forwarding traffic using http is only a good idea if you are running your applications in the same server, if you are running your application in a different server, you should encrypt the traffic between the reverse proxy and the application.

Some of the most popular reverse proxies are:

- [Nginx](https://www.nginx.com/), a popular open source reverse proxy that can be used as a load balancer. You will need to configure Nginx to use SSL and to forward the traffic to your application, you can find more information about this in the [Nginx documentation](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/). You will also need to obtain a certificate for your domain, if you don't have one, you can use [Let's Encrypt](https://letsencrypt.org/) and the [Certbot](https://certbot.eff.org/) tool to obtain a free certificate, you can find more information about this in the [Certbot documentation](https://certbot.eff.org/docs/using.html).
  
- [Caddy](https://caddyserver.com/), a newer reverse proxy written in Go that is easy to configure and that can be used as a load balancer. You can find more information about Caddy in the [Caddy documentation](https://caddyserver.com/docs/). Configuring Caddy and obtaining a certificate for your domain is **really easy**, you can find more information about it [here](https://caddyserver.com/docs/automatic-https).
 
<br/>
<br/>

## Securing Javalin with SSL

If after everything we have seen, you still want to secure your Javalin application with SSL, you can follow the steps in this tutorial. In this tutorial, we will use a self-signed certificate to secure our application. However, you can use a certificate issued by a trusted CA if you want just skip to [step 2](#2-add-the-javalin-ssl-dependency).

### 1. Obtain a certificate

The first step is to obtain a certificate. You can obtain a certificate from a trusted CA or you can generate a self-signed certificate. In this tutorial, we will use a dummy self-signed certificate. Once we have a certificate and its private key, we can secure our Javalin application with SSL.

Supported certificate formats are PKCS#12 (.p12) and PKCS#8 (.pem) and Java KeyStore (.jks).

#### Generating a self-signed certificate

Java KeyStore files might sound like a good idea, but they are not. They are only supported by Java and they are not easy to use. You can find more information about Java KeyStore files in the [Java documentation](https://docs.oracle.com/javase/8/docs/technotes/guides/security/StandardNames.html#KeyStore).

In this tutorial, we will use the PKCS#8 format (.pem), since it is used preferentially by open-source software and the default from Let's Encrypt.

To generate our certificate we will use the [OpenSSL](https://www.openssl.org/) tool. It is recommended to install openssl using your package manager, for example, in Ubuntu you can install it using the following command:

```bash
sudo apt install openssl
```

On windows, things are a bit more complicated, you can find more information about installing OpenSSL in the following StackOverflow [answers](https://stackoverflow.com/questions/50625283/how-to-install-openssl-in-windows-10).

Once you have OpenSSL installed, you can generate a self-signed certificate using the following command:

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```
<div class="comment"> 
The parameters `keyout` and `out` specify the name of the files that will be generated. The parameter `days` specifies the number of days that the certificate will be valid.
</div>

You will be asked to provide some information about the certificate, such as the country, the state, the city, etc. You can leave this information blank if you want, it will be visible in the certificate, but it will not affect the functionality of the certificate.

Once you have generated the certificate, you should have two files: `key.pem` and `cert.pem`. These files contain the private key and the certificate respectively. Remember where you saved these files, you will need them later.

### 2. Add the Javalin SSL dependency

Once we have our certificate and its private key, to secure our Javalin application with SSL, we will use the Javalin SSL plugin. The plugin is available in maven central. To add the plugin to our project, we need to add the following dependency:

<div class="multitab-code dependencies" data-tab="1">
<ul>
    <li data-tab="1">Maven</li>
    <li data-tab="2">Gradle</li>
    <li data-tab="3">SBT</li>
    <li data-tab="4">Grape</li>
    <li data-tab="5">Leiningen</li>
    <li data-tab="6">Buildr</li>
    <li data-tab="7">Ivy</li>
</ul>

<div data-tab="1" markdown="1">
~~~markup
<dependency>
    <groupId>io.javalin.community.ssl</groupId>
    <artifactId>ssl-plugin</artifactId>
    <version>{{site.javalinversion}}</version>
</dependency>
~~~
Not familiar with Maven? Read our [Maven tutorial](/tutorials/maven-setup).
</div>

<div data-tab="2" markdown="1">
~~~java
implementation("io.javalin.community.ssl:ssl-plugin:{{site.javalinversion}}")
~~~
Not familiar with Gradle? Read our [Gradle tutorial](/tutorials/gradle-setup).
</div>

<div data-tab="3" markdown="1">
~~~java
libraryDependencies += "io.javalin.community.ssl" % "ssl-plugin" % "{{site.javalinversion}}"
~~~
</div>

<div data-tab="4" markdown="1">
~~~java
@Grab(group='io.javalin.community.ssl', module='ssl-plugin', version='{{site.javalinversion}}')
~~~
</div>

<div data-tab="5" markdown="1">
~~~java
[io.javalin.community.ssl/ssl-plugin "{{site.javalinversion}}"]
~~~
</div>

<div data-tab="6" markdown="1">
~~~java
'io.javalin.community.ssl:ssl-plugin:jar:{{site.javalinversion}}'
~~~
</div>

<div data-tab="7" markdown="1">
~~~markup
<dependency org="io.javalin.community.ssl" name="ssl-plugin" rev="{{site.javalinversion}}" />
~~~
</div>
</div>

<style>
.bundle-hint p {
    margin-top: 8px;
    font-size: 14px;
}
</style>

### 3. Configure the Javalin SSL plugin

Let's assume that we have our certificate and its private key in the following files:

- `/etc/ssl/cert.pem`
- `/etc/ssl/key.pem`

To secure our Javalin application with SSL, we need to configure the Javalin SSL plugin. We can do this by doing the following:
{% capture java %}
SslPlugin plugin = new SslPlugin(conf -> {
    conf.pemFromPath("/etc/ssl/certificate.pem", "/etc/ssl/privateKey.pem");
});

Javalin.create(javalinConfig -> {
    javalinConfig.plugins.register(plugin);
}).start();
{% endcapture %}
{% capture kotlin %}
val plugin = SslPlugin { conf ->
    conf.pemFromPath("/etc/ssl/certificate.pem", "/etc/ssl/privateKey.pem")
}

Javalin.create { javalinConfig ->
    javalinConfig.plugins.register(plugin)
}.start()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

As easy as that! Now, our Javalin application is secured with SSL on the default port 443 as well as on the default insecure port 80. 

For further configuration options, please refer to the [Javalin SSL plugin documentation](/plugins/ssl-helpers).
