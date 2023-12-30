export class PeerConnection {
    sdpExchange; // WebSocket with listeners for exchanging SDP offers and answers
    peerConnection; // RTCPeerConnection for exchanging media (with listeners for media and ICE)
    dataChannel; // RTCDataChannel for exchanging signaling and chat messages (with listeners)
    state; // NOT_CONNECTED, CONNECTING, CONNECTED, DISCONNECTED_SELF, DISCONNECTED_REMOTE
    options; // constructor args {onStateChange, onLocalMedia, onRemoteMedia, onChatMessage}
    localStream; // MediaStream from local webcam and microphone

    constructor(options) {
        this.options = options;
        this.init();
    }

    async init() { // needs to be separate from constructor because of async
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            this.options.onLocalMedia(this.localStream);
        } catch (error) {
            alert("Failed to enable webcam and/or microphone, please reload the page and try again");
        }
        this.setState("NOT_CONNECTED");
        this.peerConnection = this.createPeerConnection();
        this.sdpExchange = this.createSdpExchange();
    }

    createSdpExchange() { // WebSocket with listeners for exchanging SDP offers and answers
        let ws = new WebSocket(`ws://${window.location.host}/api/matchmaking`);
        ws.addEventListener("message", (event) => {
            const message = JSON.parse(event.data);
            console.log("Received WebSocket message", message.name)
            if (message.name === "PARTNER_FOUND") this.handlePartnerFound(message.data);
            if (message.name === "SDP_OFFER") this.handleSdpOffer(JSON.parse(message.data));
            if (message.name === "SDP_ANSWER") this.handleSdpAnswer(JSON.parse(message.data));
            if (message.name === "SDP_ICE_CANDIDATE") this.handleIceCandidate(JSON.parse(message.data));
        });
        ws.addEventListener("close", async () => {
            while (this.sdpExchange.readyState === WebSocket.CLOSED) {
                console.log("WebSocket closed, reconnecting in 1 second");
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.sdpExchange = this.createSdpExchange();
            }
        });
        return ws;
    }

    createPeerConnection() { // RTCPeerConnection for exchanging media (with listeners for media and ICE)
        let conn = new RTCPeerConnection();
        conn.ontrack = event => {
            console.log(`Received ${event.track.kind} track`);
            this.options.onRemoteMedia(event.streams[0])
        };
        conn.onicecandidate = event => {
            if (event.candidate === null) { // candidate gathering complete
                console.log("ICE candidate gathering complete");
                return this.sdpExchange.send(JSON.stringify({name: "PAIRING_DONE"}));
            }
            console.log("ICE candidate created, sending to partner");
            let candidate = JSON.stringify(event.candidate);
            this.sdpExchange.send(JSON.stringify({name: "SDP_ICE_CANDIDATE", data: candidate}))
        };
        conn.oniceconnectionstatechange = () => {
            if (conn.iceConnectionState === "connected") {
                this.setState("CONNECTED");
                // ice candidates can still be added after "connected" state, so we need to log this with a delay
                setTimeout(() => console.log("WebRTC connection established"), 500);
            }
        };
        conn.ondatachannel = event => { // only for the "answerer" (the one who receives the SDP offer)
            console.log("Received data channel from offerer");
            this.dataChannel = this.setupDataChannel(event.channel)
        };
        return conn;
    }

    setupDataChannel(channel) { // RTCDataChannel for exchanging signaling and chat messages
        channel.onmessage = event => {
            console.log("Received data channel message", event.data);
            if (event.data === "BYE") {
                this.disconnect("REMOTE");
                return console.log("Received BYE message, closing connection");
            }
            this.options.onChatMessage(JSON.parse(event.data).chat);
        }
        return channel;
    }

    sendBye() {
        if (this.dataChannel === null) return console.log("No data channel");
        this.dataChannel.send("BYE");
        this.disconnect("LOCAL");
    }

    disconnect(orignator) {
        this.dataChannel = null;
        this.peerConnection.close();
        this.peerConnection = this.createPeerConnection();
        this.setState(`DISCONNECTED_${orignator}`);
    }

    setState(state) {
        this.state = state;
        this.options.onStateChange(state);
    }

    handlePartnerFound(instructions) {
        if (instructions !== "GO_FIRST") {
            return console.log("Partner found, waiting for SDP offer ..."); // only for the "answerer" (the one who receives the SDP offer)
        }
        console.log("Partner found, creating SDP offer and data channel");
        this.tryHandle("PARTNER_FOUND", async () => { // only for the "offerer" (the one who sends the SDP offer)
            this.dataChannel = this.setupDataChannel(this.peerConnection.createDataChannel("data-channel"));
            this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream));
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            let offerJson = JSON.stringify(this.peerConnection.localDescription);
            this.sdpExchange.send(JSON.stringify({name: "SDP_OFFER", data: offerJson}))
        });
    }

    handleSdpOffer(offer) { // only for the "answerer" (the one who receives the SDP offer)
        this.tryHandle("SDP_OFFER", async () => {
            console.log("Received SDP offer, creating SDP answer")
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            let answerJson = JSON.stringify(this.peerConnection.localDescription);
            this.sdpExchange.send(JSON.stringify({name: "SDP_ANSWER", data: answerJson}))
        });
    }

    handleSdpAnswer(answer) { // only for the "offerer" (the one who sends the SDP offer)
        this.tryHandle("SDP_ANSWER", async () => {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });
    }

    handleIceCandidate(iceCandidate) {
        this.tryHandle("ICE_CANDIDATE", async () => {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
        });
    }

    tryHandle(command, callback) {
        try {
            callback()
        } catch (error) {
            console.error(`Failed to handle ${command}`, error);
        }
    }
}
