---
layout: tutorial
official: true
title: "Setting up Javalin with Docker"
author: <a href="https://www.linkedin.com/in/zugazagoitia" target="_blank">Alberto Zugazagoitia</a>
date: 2022-10-30
permalink: /tutorials/docker
summarytitle: Docker setup
summary: Create a Docker image from your Javalin application.
language: java
---

## About Docker

Docker is a set of tools that enables you to create, deploy, and run applications using containers. Docker is a very popular tool in the DevOps world, and it is also very useful for local development. Applications are packaged in a container that can be run on any machine that has Docker installed. This means that you can run your application on your local machine, on a remote server, or even on a virtual machine without having to worry about dependencies, Java version, or anything else.

## What do you need?

To follow this tutorial, you will need:

- [Docker](https://docs.docker.com/get-docker/)
- A Javalin application using Maven (you can use the [Javalin Maven example](/tutorials/maven-setup) as a starting point).

## Steps

### 1. Creating a Shaded JAR

The first step is to create a JAR file that contains all the dependencies of your application. This is called a "shaded" JAR, and it is a common practice in the Java world. To create a shaded JAR, you can use the [Maven Shade Plugin](https://maven.apache.org/plugins/maven-shade-plugin/). Add the following configuration to your `pom.xml` file inside the `<plugins>` tag:

~~~xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <version>3.4.1</version>
    <configuration>
        <transformers>
            <transformer
                implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                <mainClass>app.Main</mainClass> <!-- Here you should put the main class of your application -->
            </transformer>
        </transformers>
        <filters>
            <filter> <!-- This filter is needed to avoid a bug in the shade plugin -->
                <artifact>*:*</artifact>
                <excludes>
                    <exclude>META-INF/*.SF</exclude>
                    <exclude>META-INF/*.DSA</exclude>
                    <exclude>META-INF/*.RSA</exclude>
                </excludes>
            </filter>
        </filters>
    </configuration>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>shade</goal>
            </goals>
        </execution>
    </executions>
</plugin>
~~~

In the example above, the main class of the application is `app.Main`. You should replace this with the main class of your application.

The shaded JAR will be created in the `target` folder of your project with the name `{project-name}-{version}.jar`. In order to have a consistent name, we will rename the JAR file to `app.jar`, so that it is easier to reference it in the Dockerfile. To do this, add the following configuration to your `pom.xml` file inside the `<build>` tag:

~~~xml
<finalName>app</finalName>
~~~

A sample `pom.xml` file with the configuration above can be found [here](https://github.com/javalin/javalin-samples/tree/main/javalin5/javalin-docker-example/pom.xml).

Now, you can run the following command to create the shaded JAR:

~~~bash
mvn clean package
~~~

> The result of this command should be a file called `app.jar` in the `target` folder.

### 2. Create a Dockerfile and build the image

The next step is to create a Dockerfile. This file will contain the instructions that Docker will use to build the image. The Dockerfile is a text file that contains all the commands that a user could call on the command line to assemble an image. The Dockerfile is a very powerful tool, and you can find more information about it [here](https://docs.docker.com/engine/reference/builder/).

We won't go into too much detail about the Dockerfile, but here is a simple example:

~~~dockerfile
FROM eclipse-temurin:11-alpine
COPY target/app.jar /app.jar
# This is the port that your javalin application will listen on
EXPOSE 7000 
ENTRYPOINT ["java", "-jar", "/app.jar"]
~~~

> Replace the port number with the port that your application listens on, this is usually the port that you pass to the `Javalin.create().start()` method.

Once you have created the Dockerfile in the root of your project, you can build the image by running the following command:

~~~bash
docker build -t javalin-app .
~~~

> The `-t` flag is used to specify the name of the image. In this case, the image will be called `javalin-app`. Tagging an image is a good practice, and it will make it easier to reference the image in the future, especially if you are going to push it to a registry.

### 3. Run the image

Once the image is built, you can run it by executing the following command:

~~~bash
docker run -p 7000:7000 javalin-app
~~~

> The `-p` flag is used to map the port of the container to the port of the host machine. In this case, we are mapping the port 7000 of the container to the port 7000 of the host machine. 

Since the image is running, you can access your application by navigating to `http://localhost:7000` in your browser.

## Conclusion

In this tutorial, we have learned how to create a Docker image from a Javalin application. We have also learned how to run the image and access the application. Docker is a very powerful tool, and it can be used in many different ways.

This image can be used in a CI/CD pipeline, or it can be pushed to a registry and deployed to a remote server. You can also use this image to run your application locally, and it will be very easy to set up and run.

If you want to learn more about Docker, you can check out the [official documentation](https://docs.docker.com/).

As always, you can find the source code of this tutorial [here](https://github.com/javalin/javalin-samples/tree/main/javalin5/javalin-docker-example)


