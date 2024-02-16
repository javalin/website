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
    <groupId>io.javalin</groupId>
    <artifactId>javalin</artifactId>
    <version>{{javalinVersion | default: site.javalinversion}}</version>
</dependency>
~~~
Not familiar with Maven? Read our [Maven tutorial](/tutorials/maven-setup).
</div>

<div data-tab="2" markdown="1">
~~~java
implementation("io.javalin:javalin:{{javalinVersion | default: site.javalinversion }}")
~~~
Not familiar with Gradle? Read our [Gradle tutorial](/tutorials/gradle-setup).
</div>

<div data-tab="3" markdown="1">
~~~java
libraryDependencies += "io.javalin" % "javalin" % "{{javalinVersion | default: site.javalinversion }}"
~~~
</div>

<div data-tab="4" markdown="1">
~~~java
@Grab(group='io.javalin', module='javalin', version='{{javalinVersion | default: site.javalinversion }}')
~~~
</div>

<div data-tab="5" markdown="1">
~~~java
[io.javalin/javalin "{{javalinVersion | default: site.javalinversion }}"]
~~~
</div>

<div data-tab="6" markdown="1">
~~~java
'io.javalin:javalin:jar:{{javalinVersion | default: site.javalinversion }}'
~~~
</div>

<div data-tab="7" markdown="1">
~~~markup
<dependency org="io.javalin" name="javalin" rev="{{javalinVersion | default: site.javalinversion }}" />
~~~
</div>
</div>

<div markdown="1" class="bundle-hint">
If you want Javalin with testing tools, Jackson and Logback,
you can use the artifact id `javalin-bundle` instead of `javalin`.
</div>
<style>
.bundle-hint p {
    margin-top: 8px;
    font-size: 14px;
}
</style>
