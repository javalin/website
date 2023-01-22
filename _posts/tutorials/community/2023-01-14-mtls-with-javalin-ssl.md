---
layout: tutorial
official: false
title: mTLS with Javalin SSL
permalink: /tutorials/mtls-tutorial
summarytitle: mTLS in Javalin
summary: Learn how to secure your Javalin application with mTLS.
date: 2023-01-14
author: <a href="https://www.linkedin.com/in/zugazagoitia/">Alberto Zugazagoitia</a>
language: ["java", "kotlin"]
rightmenu: true
#TODO: Make an example project 
#github: https://github.com/The-Funk/serving-protobuf-with-javalin 
---

<!-- Nav menu from the titles -->
<div id="spy-nav" class="right-menu" markdown="1">
- [Introduction](#introduction)
- [What will we need?](#what-will-we-need)
- [Securing with mTLS](#securing-javalin-with-mtls)
  - [Obtain the certs](#1-obtain-the-certificates)
  - [Add the dependency](#2-add-the-javalin-ssl-dependency)
  - [Configure the plugin](#3-configure-the-javalin-ssl-plugin)
  - [Testing the application](#4-testing-the-application)
- [Conclusion](#conclusion)
</div>

## Introduction

In this tutorial, we will learn how to use mTLS to secure our application.

mTLS stands for **mutual TLS**. It is a method for mutual authentication between a client and a server. In this method, the client will present a certificate to the server and the server will present a certificate to the client. Both the client and the server will verify the certificates presented by the other party. If the certificates are not valid, the connection will be rejected.

This is usually used to secure internal applications that are used by trusted clients. For example, you could use mTLS to secure an internal API that is used by your mobile application. Microservices and Kubernetes are also good candidates for mTLS.

![mTLS](/img/posts/mtlsTutorial/mtls.png)

More information about mTLS can be found in this excellent article: [What is Mutual TLS (mTLS)?](https://www.cloudflare.com/learning/access-management/what-is-mutual-tls/) by Cloudflare.

## What will we need?

To follow this tutorial, you will need:

- A Javalin application, if you don't have one yet, you can follow the [maven tutorial](/tutorials/maven-setup) or the [gradle tutorial](/tutorials/gradle-setup).
- A private certificate authority (CA) that will issue the certificates for your applications. You can use any 3rd party software to generate the certificates, such as [OpenSSL](https://www.openssl.org/) or [Keytool](https://docs.oracle.com/en/java/javase/11/tools/keytool.html). We won't be covering this in this tutorial, but you can check [this tutorial](https://medium.com/weekly-webtips/how-to-generate-keys-for-mutual-tls-authentication-a90f53bcec64) for more information.
Once you have it set up, you'll need:
  - A certificate for your application. This certificate will be used by the server to authenticate itself to the client.
  - A certificate for your client. This certificate will be used by the client to authenticate itself to the server.

## Securing Javalin with mTLS

In order to secure our Javalin application with mTLS, we will need to do the following:

### 1. Obtain the certificates

As mentioned before, we won't be covering how to generate the certificates in this tutorial, please refer to the [What will we need?](#what-will-we-need) section for more information.

Let's assume that we have our servers certificate and its private key in the following PEM encoded files:

- `/etc/ssl/server.crt`
- `/etc/ssl/server.key`
  
Our client will also have its own certificate and private key in the following PEM encoded files:
- `/etc/ssl/client.crt`
- `/etc/ssl/client.key`

<div class="comment"> 
Note: It's important for the server and the client to include any intermediate certificates in the PEM file.
</div>

And finally, we will need the CA certificate that was used to sign the server and client certificates in the following PEM encoded file:
- `/etc/ssl/ca.crt`

We will be trusting the CA certificate in our application, the server will accept any certificate signed by the CA. So, if we want to add a new client to our application, we will only need to sign its certificate with the CA and it will be able to connect to the server.

<div class="comment"> 
Note: these files are just examples, you can use any file names you want, and any of the supported formats
</div>

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

To secure our Javalin application with mTLS, we just need to load the certificates and private keys into the SSL plugin, and register it with our Javalin application.

{% capture java %}
SSLPlugin plugin = new SSLPlugin(conf -> {
    conf.insecure = false; // Disable HTTP

    // Server certificate and private key
    conf.pemFromPath("/etc/ssl/server.crt", "/etc/ssl/server.key"); 

    conf.withTrustConfig(trustConfig -> {
        // CA certificate
        trustConfig.certificateFromPath("/etc/ssl/ca.crt"); 
    });
});

Javalin.create(javalinConfig -> {
    javalinConfig.plugins.register(plugin);
}).start();
{% endcapture %}
{% capture kotlin %}
val plugin = SSLPlugin { conf ->
    conf.insecure = false // Disable HTTP

    // Server certificate and private key
    conf.pemFromPath("/etc/ssl/certificate.pem", "/etc/ssl/privateKey.pem") 

    conf.withTrustConfig { trustConfig ->
        // CA certificate
        trustConfig.certificateFromPath("/etc/ssl/ca.crt")
    }
}

Javalin.create { javalinConfig ->
    javalinConfig.plugins.register(plugin)
}.start()
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

As easy as that! Now, our Javalin application is secured with mTLS on the default port, 443.

### 4. Testing the application

To test our application, a client that supports mTLS is required. We will use Insomnia, a REST client with a nice GUI.

If we try to make a request to our application, we will get an error, because we are not sending any client certificate.

To import a new certificate, click Document Settings or Collection Settings then the Client Certificates tab.
Here we will first add the CA certificate, in the CA Certificate section.

Once you click New Certificate in the Client Certificates tab, you will be prompted to fill out the following information:

- **Host**: for our purposes, we will use `*` to match any host
- **PFX**: leave this empty
- **CRT File + Key File**: choose the client certificate and corresponding private key files
- **Passphrase**: the passphrase for the private key, if any

It should look like this:

![Insomnia conf](/img/posts/mtlsTutorial/insomnia-conf.png)

After you add the certificate, you will be able to use the client certificate in any request as you would normally do.

![Insomnia client certificate](/img/posts/mtlsTutorial/insomnia.png)

## Conclusion

In this tutorial, we have learned how to secure a Javalin application with mTLS. We have seen where we can learn to generate a CA certificate, and how to sign client certificates with it. We have also seen how to configure the Javalin SSL plugin to use the certificates and private keys, and how to test the application with Insomnia.

For further configuration options, and different certificate formats, please refer to the [Javalin SSL plugin documentation](/plugins/ssl-helpers).

