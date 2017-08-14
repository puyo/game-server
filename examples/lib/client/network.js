"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WildEmitter = require('wildemitter');
class Network {
    connect() {
        console.log("Connecting to signalling server...");
        this.roomId = window.location.pathname;
        this.ids = {};
        this.id = null;
        const protocol = window.location.protocol;
        const host = window.location.hostname;
        const port = 8080;
        const webrtc = new SimpleWebRTC({
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
            this.id = sessionId;
            this.addNetId(sessionId);
            this.emit("sig:connect", { id: this.id, ids: this.getNetIds() });
        });
        webrtc.on('joinedRoom', (name) => {
            this.log("Assigned name " + this.id);
            this.emit("sig:joinedroom", name);
            const chat = document.querySelector("#chat");
            chat.addEventListener("submit", (event) => {
                event.stopPropagation();
                event.preventDefault();
                const input = event.target.querySelector("[type=text]");
                const text = input.value;
                this.directBroadcast("chat", text);
                const chatMsg = this.id + ": " + text;
                this.log(chatMsg);
                input.value = "";
            });
        });
        webrtc.on('channelMessage', (peer, channelLabel, message, dc, event) => {
            if (channelLabel === "game") {
                this.emit("peer:message", { to: this.id, from: peer.id, message: message });
            }
        });
        webrtc.on('message', (msg) => {
            const { sid, to, type, payload } = msg;
            if (type === "game") {
                this.emit("sig:message", { to: to, from: sid, message: payload });
            }
        });
        webrtc.on('iceFailed', (peer) => {
            var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
            if (connstate) {
                connstate.innerText = 'Connection failed.';
            }
            this.emit("peer:error", { peer, message: "Connection failed (ICE)" });
        });
        webrtc.on('connectivityError', (peer) => {
            var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
            console.log('remote fail', connstate);
            if (connstate) {
                connstate.innerText = 'Connection failed.';
            }
            this.emit("peer:error", { peer, message: "Connection failed (connectivity)" });
        });
        webrtc.on('createdPeer', (peer) => {
            peer.on('channelMessage', (_peer, channelLabel, message, dc, event) => {
                if (message.type === "chat") {
                    const msg = peer.id + ": " + message.payload;
                    this.log(msg);
                }
                else if (message.type === "ping") {
                    peer.sendDirectly("game", "pong");
                }
                else if (message.type === "pong") {
                    if (peer.dcPingTime) {
                        const pongTime = new Date().valueOf();
                        const ms = pongTime - peer.dcPingTime;
                        var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
                        if (connstate) {
                            connstate.innerText = peer.id + ' (' + ms + 'ms)';
                        }
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
    log(text) {
        const gameData = document.getElementById('game-data');
        gameData.value += text;
        gameData.value += "\n";
        gameData.scrollTop = gameData.scrollHeight - gameData.clientHeight;
    }
}
exports.default = Network;
WildEmitter.mixin(Network);
window.WildEmitter = WildEmitter;
window.Network = Network;
