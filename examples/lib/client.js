"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
exports.EventEmitter = events_1.EventEmitter;
const simplewebrtc_1 = require("simplewebrtc");
class Network extends events_1.EventEmitter {
    connect() {
        console.log("Connecting to signalling server...");
        this.roomId = window.location.pathname;
        this.ids = {};
        this.nick = null;
        const protocol = window.location.protocol;
        const host = window.location.hostname;
        const port = window.location.port;
        const webrtc = new simplewebrtc_1.SimpleWebRTC({
            url: protocol + "//" + host + ":" + port,
            media: {
                video: false,
                audio: false
            },
            receiveMedia: {
                offerToReceiveAudio: 0,
                offerToReceiveVideo: 0
            },
            peerConnectionConfig: {
                iceServers: [{ 'urls': 'stun:' + host + ':3479' }]
            },
            autoRequestMedia: false,
        });
        webrtc.on('connectionReady', (sessionId) => {
            this.nick = sessionId;
            this.addNetId(sessionId);
            this.emit("room:connect", { nick: this.nick, nicks: this.getNetIds() });
        });
        webrtc.on('joinedRoom', (name) => {
            this.emit("room:joined", { nick: this.nick, roomId: name });
        });
        webrtc.on('message', (msg) => {
            const { sid, to, type, payload } = msg;
            if (type === "room") {
                this.emit("room:message", { to: to, from: sid, message: payload });
            }
        });
        webrtc.on('iceFailed', (peer) => {
            this.emit("peer:error", { peer, message: "Connection failed (ICE)" });
        });
        webrtc.on('connectivityError', (peer) => {
            this.emit("peer:error", { peer, message: "Connection failed (connectivity)" });
        });
        webrtc.on('createdPeer', (peer) => {
            peer.on('channelMessage', (_peer, channelLabel, message, dc, event) => {
                console.log("channelMessage", message);
                if (message.type === "chat") {
                    const msg = peer.id + ": " + message.payload;
                }
                else if (message.type === "ping") {
                    peer.sendDirectly("game", "pong");
                }
                else if (message.type === "pong") {
                    if (peer.dcPingTime) {
                        const pongTime = new Date().valueOf();
                        const ms = pongTime - peer.dcPingTime;
                        console.log(peer.id, '(' + ms + 'ms)');
                        peer.dcPingTime = null;
                    }
                }
            });
            const dcSendPing = () => {
                if (!peer.dcPingTime) {
                    peer.dcPingTime = new Date().valueOf();
                    peer.sendDirectly("game", "ping");
                }
                setTimeout(dcSendPing, 10000);
            };
            const dc = peer.getDataChannel();
            dc.onopen = () => {
                this.addNetId(peer.id);
                this.emit("peer:connect", { peer });
                dcSendPing();
            };
            dc.onclose = () => {
                this.removeNetId(peer.id);
                this.emit("peer:disconnect", { peer });
            };
            var remotes = document.getElementById('remotes');
            if (remotes) {
                var container = document.createElement('div');
                container.id = 'container_' + webrtc.getDomId(peer);
                remotes.appendChild(container);
                if (peer && peer.pc) {
                    var connstate = document.createElement('div');
                    connstate.className = 'connectionstate';
                    container.appendChild(connstate);
                    peer.pc.on('iceConnectionStateChange', (event) => {
                        switch (peer.pc.iceConnectionState) {
                            case 'checking':
                                connstate.innerText = 'Connecting to peer...';
                                break;
                            case 'connected':
                            case 'completed':
                                connstate.innerText = peer.id;
                                break;
                            case 'disconnected':
                                connstate.innerText = 'Disconnected.';
                                break;
                            case 'failed':
                                break;
                            case 'closed':
                                connstate.innerText = 'Connection closed.';
                                const remove = () => container.removeChild(connstate);
                                setTimeout(remove, 1000);
                                break;
                        }
                    });
                }
            }
        });
        this.webrtc = webrtc;
        webrtc.joinRoom(this.roomId);
    }
    getNetIds() {
        return Object.keys(this.ids);
    }
    addNetId(id) {
        this.ids[id] = true;
        return Object.keys(this.ids);
    }
    removeNetId(id) {
        delete this.ids[id];
        return Object.keys(this.ids);
    }
    getPeers() {
        return this.webrtc.getPeers();
    }
    directBroadcast(type, payload) {
        this.webrtc.sendDirectlyToAll("game", type, payload);
    }
}
exports.Network = Network;
class Chat {
    init(el, net) {
        this.el = el;
        net.on('room:joined', ({ nick, roomId }) => {
            this.log("Assigned name " + nick);
            el.addEventListener("submit", (event) => {
                event.stopPropagation();
                event.preventDefault();
                const form = event.target;
                const input = form.querySelector("input[type=text]");
                const text = input.value;
                net.directBroadcast("chat", text);
                const chatMsg = net.nick + ": " + text;
                this.log(chatMsg);
                input.value = "";
            });
        });
        net.on('peer:error', ({ peer, message }) => {
            this.log(message);
        });
    }
    log(text) {
        const gameData = document.getElementById('game-data');
        gameData.value += text;
        gameData.value += "\n";
        gameData.scrollTop = gameData.scrollHeight - gameData.clientHeight;
    }
}
