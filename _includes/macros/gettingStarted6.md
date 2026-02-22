{% capture java %}
import io.javalin.Javalin;

public static void main(String[] args) {
    var app = Javalin.create().start(7070);
    app.get("/", ctx -> ctx.result("Hello World"));
}
{% endcapture %}

{% capture kotlin %}
import io.javalin.Javalin

fun main() {
    val app = Javalin.create().start(7070)
    app.get("/") { ctx -> ctx.result("Hello World") }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}

