{% capture java %}
import io.javalin.Javalin;

public class HelloWorld {
    public static void main(String[] args) {
        Javalin app = Javalin.create().port(7000);
        app.get("/", (req, res) -> res.body("Hello World"));
    }
}
{% endcapture %}

{% capture kotlin %}
import io.javalin.Javalin

fun main(args: Array<String>) {
    val app = Javalin.create().port(7000)
    app.get("/") { req, res-> res.body("Hello World") }
}
{% endcapture %}
{% include macros/docsSnippet.html java=java kotlin=kotlin %}