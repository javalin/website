export class Chat {

    #input = document.getElementById("chatInput");
    #sendBtn = document.getElementById("chatSend");
    #log = document.getElementById("chatLog");
    #peerConnection;

    constructor(peerConnection) {
        this.#peerConnection = peerConnection;
        this.updateUi("NOT_CONNECTED");
        this.#sendBtn.addEventListener("click", () => {
            if (this.#peerConnection.dataChannel === null) return console.log("No data channel");
            if (this.#input.value.trim() === "") return this.#input.value = "";
            this.#addToLog("local", this.#input.value);
            this.#peerConnection.dataChannel.send(JSON.stringify({chat: this.#input.value}));
            this.#input.value = "";
        });

        this.#input.addEventListener("keyup", event => {
            if (event.key !== "Enter") return;
            this.#sendBtn.click(); // reuse the click handler
        });
    }

    updateUi(state) {
        if (["NOT_CONNECTED", "CONNECTING", "CONNECTED"].includes(state)) {
            this.#log.innerHTML = "";
        }
        if (state === "NOT_CONNECTED") this.#addToLog("server", "Click 'Find Stranger' to connect with a random person!");
        if (state === "CONNECTING") this.#addToLog("server", "Finding a stranger for you to chat with...");
        if (state === "CONNECTED") this.#addToLog("server", "You're talking to a random person. Say hi!");
        if (state === "DISCONNECTED_LOCAL") this.#addToLog("server", "You disconnected");
        if (state === "DISCONNECTED_REMOTE") this.#addToLog("server", "Stranger disconnected");
    }

    addRemoteMessage = (message) => this.#addToLog("remote", message)

    #addToLog(owner, message) {
        this.#log.insertAdjacentHTML("beforeend", `<div class="message ${owner}">${message}</div>`);
        this.#log.scrollTop = this.#log.scrollHeight;
    }
}
