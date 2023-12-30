package io.javalin.omeglin;

import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;

public class OmeglinMain {
    public static void main(String[] args) {
        Javalin.create(config -> {
            config.staticFiles.add("src/main/resources/public", Location.EXTERNAL);
            config.router.mount(router -> {
                router.ws("/api/matchmaking", Matchmaking::websocket);
            });
        }).start(7070);
    }
}
