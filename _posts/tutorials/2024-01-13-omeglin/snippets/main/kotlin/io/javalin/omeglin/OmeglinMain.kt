package io.javalin.omeglin

import io.javalin.Javalin
import io.javalin.http.staticfiles.Location

fun main() {
    Javalin.create {
        it.staticFiles.add("src/main/resources/public", Location.EXTERNAL)
        it.router.mount{
            it.ws("/api/matchmaking", Matchmaker::websocket)
        }
    }.start(7070)
}
