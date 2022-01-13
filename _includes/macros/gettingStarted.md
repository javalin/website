{% capture java %}
import io.javalin.Javalin;

public class HelloWorld {
    public static void main(String[] args) {
        Javalin app = Javalin.create().start(7070);
        app.get("/", ctx -> ctx.result("Hello World"));
    }
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
