import {EventEmitter} from 'events'

class Network extends EventEmitter {

    roomId: string
    ids: any
    id: string
    nick: string
    webrtc: any

    connect() {
        console.log("Connecting to signalling server...")

        this.roomId = window.location.pathname;

        this.ids = {}
        this.id = null
        this.nick = null

        const protocol = window.location.protocol;
        const host = window.location.hostname;
        const port = window.location.port;
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
                iceServers: [{'urls': 'stun:' + host + ':3479'}]
            },
            autoRequestMedia: false,
            //nick: 'Jane Doe',
        });

        webrtc.on('connectionReady', (sessionId) => {
            this.id = sessionId
            this.addNetId(sessionId);
            this.emit("room:connect", {id: this.id, ids: this.getNetIds()});
        })

        webrtc.on('joinedRoom', (roomId) => {
            // is this very different to connectionReady?
            this.emit("room:joined", {id: this.id, roomId: name});
        })

        // P2P message arrived
        webrtc.on('channelMessage', (peer, channelLabel, message, dc, event) => {
            if (channelLabel === "game") {
                this.emit("peer:message", {to: this.id, from: peer.id, message: message});
            } else if (message.type === "chat") {
                const msg = peer.id + ": " + message.payload;
                //this.log(msg);
            } else if (message.type === "ping") {
                peer.sendDirectly("ping", "pong");
            } else if (message.type === "pong") {
                if (peer.dcPingTime) {
                    const pongTime = new Date().valueOf();
                    const ms = pongTime - peer.dcPingTime;
                    console.log(peer.id, '(' + ms + 'ms)');
                    peer.dcPingTime = null
                }
            }
        })

        webrtc.on('message', (msg) => {
            const {sid, to, type, payload} = msg
            if (type === "room") {
                this.emit("room:message", {to: to, from: sid, message: payload});
            }
            // other control messages are already handled by simplertc
        })

        // local p2p/ice failure
        webrtc.on('iceFailed', (peer) => {
            this.emit("peer:error", {peer, message: "Connection failed (ICE)"});
        });
        // remote p2p/ice failure
        webrtc.on('connectivityError', (peer) => {
            this.emit("peer:error", {peer, message: "Connection failed (connectivity)"});
        });

        // called when a peer is created
        webrtc.on('createdPeer', (peer) => {
            //console.log('createdPeer', peer);

            const dc = peer.getDataChannel();

            dc.onopen = () => {
                //console.log("DC open", peer.id);
                // const msg = "hello from " + this.webrtc.connection.getSessionid();
                // peer.sendDirectly("game", "chat", {message: msg});
                this.addNetId(peer.id);
                this.emit("peer:connect", {peer});
                this.dcSendPing(peer);
            };

            dc.onclose = () => {
                //console.log("DC close", peer.id);
                this.removeNetId(peer.id);
                //this.log(peer.id + " left");
                this.emit("peer:disconnect", {peer});
            };

            var remotes = document.getElementById('remotes');
            if (remotes) {
                var container = document.createElement('div');
                container.id = 'container_' + webrtc.getDomId(peer);
                remotes.appendChild(container);

                // show the ice connection state
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
                        case 'completed': // on caller side
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

        // join room
        webrtc.joinRoom(this.roomId);
    }

    getNetIds() {
        return Object.keys(this.ids);
    }

    addNetId(id) {
        this.ids[id] = true
        return Object.keys(this.ids);
    }

    removeNetId(id) {
        delete this.ids[id]
        return Object.keys(this.ids);
    }

    getPeers() {
        return this.webrtc.getPeers();
    }

    directBroadcast(type, payload) {
        this.webrtc.sendDirectlyToAll("game", type, payload);
    }

    dcSendPing(peer) {
        if (peer.dcPingTime == null) {
            peer.dcPingTime = new Date().valueOf();
            peer.sendDirectly("ping", "ping");
        }
        setTimeout(() => this.dcSendPing(peer), 10000);
    }
}

class ChatClient {
    el: HTMLFormElement

    constructor({el, net}: {el: HTMLFormElement, net: Network}) {
        this.el = el

        net.on('room:joined', ({id, roomId}) => {
            this.log("Assigned name " + id);

            el.addEventListener("submit", (event) => {
                event.stopPropagation();
                event.preventDefault();
                const form = <HTMLFormElement>event.target;
                const input = <HTMLInputElement>form.querySelector("input[type=text]");
                const text = input.value;
                net.directBroadcast("chat", text);
                const chatMsg = net.id + ": " + text;
                this.log(chatMsg);
                input.value = "";
            })
        })

        net.on('peer:error', ({peer, message}) => {
            this.log(message);
        });
    }

    log(text) {
        const textarea = <HTMLTextAreaElement>this.el.getElementsByTagName('textarea')[0];
        textarea.value += text;
        textarea.value += "\n";
        textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
    }
}

export { Network, ChatClient, EventEmitter }
