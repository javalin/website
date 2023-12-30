package io.javalin.omeglin

import io.javalin.websocket.WsConfig
import io.javalin.websocket.WsContext
import org.slf4j.LoggerFactory
import java.util.concurrent.ConcurrentLinkedQueue

data class Message(val name: String, val data: String? = null)

data class Exchange(var a: WsContext?, var b: WsContext?, var doneCount: Int = 0) {
    fun otherUser(user: WsContext) = if (user == a) b else a
}

object Matchmaker {

    private val logger = LoggerFactory.getLogger(Matchmaker::class.java)
    private val queue = ConcurrentLinkedQueue<Exchange>()

    fun websocket(ws: WsConfig) {
        ws.onConnect { user -> user.enableAutomaticPings() }
        ws.onClose { user -> pairingAbort(user) }
        ws.onMessage { user ->
            logger.info("Received message: ${user.message()}")
            val message = user.messageAsClass(Message::class.java)
            when (message.name) {
                "PAIRING_START" -> pairingStart(user)
                "PAIRING_ABORT" -> pairingAbort(user)
                "PAIRING_DONE" -> pairingDone(user)
                "SDP_OFFER", "SDP_ANSWER", "SDP_ICE_CANDIDATE" -> { // should only happen when two users are paired
                    val exchange = queue.find { it.a == user || it.b == user }
                    if (exchange?.a == null || exchange.b == null) {
                        logger.warn("Received SDP message from unpaired user")
                        return@onMessage
                    }
                    exchange.otherUser(user)?.send(message) // forward message to other user
                }
            }
        }
    }

    private fun pairingStart(user: WsContext) {
        queue.removeAll { it.a == user || it.b == user } // prevent double queueing
        val waitingUser = queue.find { it.b == null }?.let { exchange ->
            exchange.b = user
            exchange.a?.send(Message("PARTNER_FOUND", "GO_FIRST"))
            exchange.b?.send(Message("PARTNER_FOUND"))
        }
        if (waitingUser == null) {
            queue.add(Exchange(a = user, b = null))
        }
    }

    private fun pairingAbort(user: WsContext) {
        queue.find { it.a == user || it.b == user }?.let { ex ->
            ex.otherUser(user)?.send(Message("PARTNER_LEFT"))
            queue.remove(ex)
        }
    }

    private fun pairingDone(user: WsContext) {
        queue.find { it.a == user || it.b == user }?.let { it.doneCount++ }
        queue.removeAll { it.doneCount == 2 } // remove exchanges where both users are done
    }

}
