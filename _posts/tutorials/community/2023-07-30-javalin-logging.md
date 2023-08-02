---
layout: tutorial
official: false
title: Logging and Javalin
permalink: /tutorials/javalin-logging
summarytitle: Extra details on Javalin and logging providers
summary: Explaining detailed logging configuration on Javalin 
date: 2023-07-30
author: <a href="https://sombriks.com/bio">Leonardo Silveira</a>
language: ["java", "kotlin", "maven"]
rightmenu: true
#TODO: Make an example project 
github: https://github.com/sombriks/javalin-logging-examples 
---

## Introduction

Javalin offers support for first class logging via SL4J and with a few tweaks
it's possible to configure one [logging framework](https://www.slf4j.org/manual.html#swapping)
in your project.

### Default configuration

When you spin a Javalin project without set a proper logging framework, it
presents a [simple solution](/documentation#logging):

```bash
/usr/lib/jvm/java-17/bin/java #...
SLF4J: No SLF4J providers were found.
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See https://www.slf4j.org/codes.html#noProviders for further details.

#########################################################################
Javalin: It looks like you don't have a logger in your project.
The easiest way to fix this is to add 'slf4j-simple':

pom.xml:
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-simple</artifactId>
    <version>2.0.7</version>
</dependency>

build.gradle or build.gradle.kts:
implementation("org.slf4j:slf4j-simple:2.0.7")

Visit https://javalin.io/documentation#logging if you need more help
#########################################################################
```

While [log4j-simple](https://www.slf4j.org/apidocs/org/slf4j/simple/SimpleLogger.html)
solves the issue, it's limited to send messages to `System.err` or to a single
file. It's customizable by adding a file called `simplelogger.properties` into
classpath (add it into `src/main/resources` folder):

```properties
# simplelogger.properties
# see https://www.slf4j.org/apidocs/org/slf4j/simple/SimpleLogger.html
org.slf4j.simpleLogger.defaultLogLevel=DEBUG
org.slf4j.simpleLogger.showDateTime=true
org.slf4j.simpleLogger.dateTimeFormat=YYYY-MM-dd HH:mm:ss.SSS
# less jetty noise
org.slf4j.simpleLogger.log.org.eclipse.jetty=INFO
# more javalin noise
org.slf4j.simpleLogger.log.io.javalin=TRACE
```

A sample output would be like this:

```
/usr/lib/jvm/java-17/bin/java #...
2023-08-02 00:53:17.280 [main] INFO io.javalin.Javalin - Starting Javalin ...
2023-08-02 00:53:17.419 [main] INFO org.eclipse.jetty.server.Server - jetty-11.0.15; built: 2023-04-11T18:37:53.775Z; git: 5bc5e562c8d05c5862505aebe5cf83a61bdbcb96; jvm 17.0.7+7
2023-08-02 00:53:17.529 [main] INFO org.eclipse.jetty.server.session.DefaultSessionIdManager - Session workerName=node0
2023-08-02 00:53:17.552 [main] INFO org.eclipse.jetty.server.handler.ContextHandler - Started i.j.j.@3a93b025{/,null,AVAILABLE}
2023-08-02 00:53:17.565 [main] INFO org.eclipse.jetty.server.AbstractConnector - Started ServerConnector@7fad8c79{HTTP/1.1, (http/1.1)}{0.0.0.0:7070}
2023-08-02 00:53:17.575 [main] INFO org.eclipse.jetty.server.Server - Started Server@4450d156{STARTING}[11.0.15,sto=0] @626ms
2023-08-02 00:53:17.575 [main] INFO io.javalin.Javalin - 
       __                  ___          ______
      / /___ __   ______ _/ (_)___     / ____/
 __  / / __ `/ | / / __ `/ / / __ \   /___ \
/ /_/ / /_/ /| |/ / /_/ / / / / / /  ____/ /
\____/\__,_/ |___/\__,_/_/_/_/ /_/  /_____/

       https://javalin.io/documentation

2023-08-02 00:53:17.581 [main] INFO io.javalin.Javalin - Listening on http://localhost:7070/
2023-08-02 00:53:17.594 [main] INFO io.javalin.Javalin - You are running Javalin 5.6.1 (released June 22, 2023).
2023-08-02 00:53:17.596 [main] INFO io.javalin.Javalin - Javalin started in 318ms \o/
```

### Logback

Adding logback as dependency instead of simple logging is very straightforward, 
all you have to do is to add it as dependency:

```xml
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.4.6</version>
</dependency>
```

For logback you can create a classpath resource file called `logback.xml` and
configure all sorts of [appenders](https://logback.qos.ch/manual/appenders.html)
and loggers:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- sample logback configuration file -->
<configuration>
    <import class="ch.qos.logback.core.ConsoleAppender"/>
    <import class="ch.qos.logback.classic.encoder.PatternLayoutEncoder"/>
    <import class="ch.qos.logback.core.rolling.RollingFileAppender"/>
    <import class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy"/>

    <appender name="Console" class="ConsoleAppender">
        <encoder class="PatternLayoutEncoder">
            <pattern>%cyan(%d{ISO8601}) %highlight(%-5level) [%blue(%t)] %yellow(%c{20}): %msg%n%throwable</pattern>
        </encoder>
    </appender>

    <appender name="File" class="RollingFileAppender">
        <rollingPolicy class="SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>sample-app.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <maxHistory>30</maxHistory>
            <maxFileSize>1MB</maxFileSize>
            <totalSizeCap>1GB</totalSizeCap>
        </rollingPolicy>
        <encoder>
            <pattern>%d{ISO8601} %-5level [%t] %C{20}: %msg%n%throwable</pattern>
        </encoder>
    </appender>

    <root level="info">
        <appender-ref ref="Console"/>
        <appender-ref ref="File"/>
    </root>
</configuration>
```

A sample output for this configuration would be something like this (but with colors!):

```
/usr/lib/jvm/java-17/bin/java #...
2023-08-02 01:45:26,386 INFO  [main] io.javalin.Javalin: Starting Javalin ...
2023-08-02 01:45:26,503 INFO  [main] o.e.j.server.Server: jetty-11.0.15; built: 2023-04-11T18:37:53.775Z; git: 5bc5e562c8d05c5862505aebe5cf83a61bdbcb96; jvm 17.0.7+7
2023-08-02 01:45:26,560 INFO  [main] o.e.j.s.s.DefaultSessionIdManager: Session workerName=node0
2023-08-02 01:45:26,576 INFO  [main] o.e.j.s.h.ContextHandler: Started i.j.j.@4bff7da0{/,null,AVAILABLE}
2023-08-02 01:45:26,584 INFO  [main] o.e.j.s.AbstractConnector: Started ServerConnector@66d3eec0{HTTP/1.1, (http/1.1)}{0.0.0.0:7070}
2023-08-02 01:45:26,592 INFO  [main] o.e.j.server.Server: Started Server@26e356f0{STARTING}[11.0.15,sto=0] @773ms
2023-08-02 01:45:26,592 INFO  [main] io.javalin.Javalin: 
       __                  ___          ______
      / /___ __   ______ _/ (_)___     / ____/
 __  / / __ `/ | / / __ `/ / / __ \   /___ \
/ /_/ / /_/ /| |/ / /_/ / / / / / /  ____/ /
\____/\__,_/ |___/\__,_/_/_/_/ /_/  /_____/

       https://javalin.io/documentation

2023-08-02 01:45:26,597 INFO  [main] io.javalin.Javalin: Listening on http://localhost:7070/
2023-08-02 01:45:26,609 INFO  [main] io.javalin.Javalin: You are running Javalin 5.6.1 (released June 22, 2023).
2023-08-02 01:45:26,610 INFO  [main] io.javalin.Javalin: Javalin started in 227ms \o/
```

Also, a log file will appear since we have two appenders in our configuration,
one console appender and one file appender.

Logback offers other cool appenders, like
[SocketAppender](https://logback.qos.ch/manual/appenders.html#SocketAppender),
[SMTPAppender](https://logback.qos.ch/manual/appenders.html#SMTPAppender) and
[DBAppender](https://logback.qos.ch/manual/appenders.html#DBAppender).

Another way to enable logback on your Javalin project is to use the
`javalin-bundle` artifactId instead of hte regular `javalin` dep:

```xml
<dependency>
    <groupId>io.javalin</groupId>
    <artifactId>javalin-bundle</artifactId>
    <version>5.6.1</version>
</dependency>
```

That way you don't need to explicitly point out logback but still gets it, and
a few other [reasonable defaults](https://github.com/javalin/javalin/blob/master/javalin-bundle/pom.xml).

### Log4j2

The [log4j2](https://logging.apache.org/log4j/2.x/manual/appenders.html) library
is the most popular java logging library and has a rich ecosystem.

It is also the most targeted by attackers, but keep yourself up to date and
everything will be fine.

The needed dependency to use this logging library follows:

```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j2-impl</artifactId>
    <version>2.20.0</version>
</dependency>
```

And the logging configuration file is called `log4j2.xml` to be present in the
classpath:

```xml
{% raw %}
<Configuration status="WARN" monitorInterval="30">
    <Properties>
        <Property name="LOG_PATTERN">%d{yyyy-MM-dd HH:mm:ss.SSS} ${LOG_LEVEL_PATTERN:-%5p} ${%pid} [%15.15t] %-40.40C{10.}: %m%n%ex</Property>
        <Property name="COLOR_LOG_PATTERN">%d{yyyy-MM-dd HH:mm:ss.SSS} %highlight{${LOG_LEVEL_PATTERN:-%5p}}{FATAL=red, ERROR=red, WARN=yellow, INFO=green, DEBUG=blue, TRACE=blue} %style{%pid}{magenta} [%15.15t] %style{%-40.40C{1.}}{cyan} : %m%n%ex</Property>
    </Properties>

    <Appenders>
        <Console name="Console" target="SYSTEM_OUT" follow="true">
            <PatternLayout pattern="${COLOR_LOG_PATTERN}"/>
        </Console>
        <RollingFile name="File"
                     fileName="sample-app.log"
                     filePattern="sample-app-%d{yyyy-MM-dd}-%i.log">
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <Policies>
                <SizeBasedTriggeringPolicy size="1GB"/>
            </Policies>
        </RollingFile>
    </Appenders>

    <Loggers>
        <Root level="INFO">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="File"/>
        </Root>
    </Loggers>
</Configuration>
{% endraw %}
```

This is a sample output for log4j2. Of course, it's colored on supported
consoles!

```
/usr/lib/jvm/java-17/bin/java #...
2023-08-02 02:14:15.304  INFO 386659 [           main] i.j.u.JavalinLogger                      : Starting Javalin ...
2023-08-02 02:14:15.412  INFO 386659 [           main] o.e.j.s.Server                           : jetty-11.0.15; built: 2023-04-11T18:37:53.775Z; git: 5bc5e562c8d05c5862505aebe5cf83a61bdbcb96; jvm 17.0.7+7
2023-08-02 02:14:15.473  INFO 386659 [           main] o.e.j.s.s.DefaultSessionIdManager        : Session workerName=node0
2023-08-02 02:14:15.489  INFO 386659 [           main] o.e.j.s.h.ContextHandler                 : Started i.j.j.@52d239ba{/,null,AVAILABLE}
2023-08-02 02:14:15.498  INFO 386659 [           main] o.e.j.s.AbstractConnector                : Started ServerConnector@5812f68b{HTTP/1.1, (http/1.1)}{0.0.0.0:7070}
2023-08-02 02:14:15.501  INFO 386659 [           main] o.e.j.s.Server                           : Started Server@53fd0d10{STARTING}[11.0.15,sto=0] @1288ms
2023-08-02 02:14:15.501  INFO 386659 [           main] i.j.u.JavalinLogger                      : 
       __                  ___          ______
      / /___ __   ______ _/ (_)___     / ____/
 __  / / __ `/ | / / __ `/ / / __ \   /___ \
/ /_/ / /_/ /| |/ / /_/ / / / / / /  ____/ /
\____/\__,_/ |___/\__,_/_/_/_/ /_/  /_____/

       https://javalin.io/documentation

2023-08-02 02:14:15.507  INFO 386659 [           main] i.j.u.JavalinLogger                      : Listening on http://localhost:7070/
2023-08-02 02:14:15.518  INFO 386659 [           main] i.j.u.JavalinLogger                      : You are running Javalin 5.6.1 (released June 22, 2023).
2023-08-02 02:14:15.520  INFO 386659 [           main] i.j.u.JavalinLogger                      : Javalin started in 218ms \o/

```

Log4j2 has really cool appenders, some of them are similar to the logback ones,
others like [JPAAppender](https://logging.apache.org/log4j/2.x/manual/appenders.html#JPAAppender)
and [KafkaAppender](https://logging.apache.org/log4j/2.x/manual/appenders.html#KafkaAppender)
are unique to Log4j2

### Using _any_ of those loggers

Log messages with those libraries is very straightforward since the api is the
same. 

The following idiom is pretty common use case:

{% capture java %}
package org.example;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class App {

    private static final Logger LOG = LoggerFactory.getLogger(App.class);    

    public App(){
        LOG.info("hello {}!","world");
    }

    public static void main(String ...args) {
        new App(); 
    }
    
}
{% endcapture %}
{% capture kotlin %}
package org.example

import org.slf4j.LoggerFactory

class App() {

    val log by lazy { LoggerFactory.getLogger(App::class.java) }

    constructor() {
        log.info("hello {}!", "world")
    }

}

fun main(){
    App()
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

### Conclusion

Javalin logging is versatile and offers through SL4J a wide range of logging
libraries. See which one has the logging options and observability strategies
that fulfill your needs.
