import { EventEmitter } from "events";

class Network extends EventEmitter {
  roomId: string;
  ids: any;
  id: string;
  nick: string;
  webrtc: any;

  connect() {
    console.log("Connecting to signalling server...");

    this.roomId = window.location.pathname;

    this.ids = {};
    this.id = null;
    this.nick = null;

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
        iceServers: [{ urls: "stun:" + host + ":3479" }]
      },
      autoRequestMedia: false
      //nick: 'Jane Doe',
    });

    webrtc.on("connectionReady", sessionId => {
      this.id = sessionId;
      this.addNetId(sessionId);
      this.emit("room:connect", { id: this.id, ids: this.getNetIds() });

      webrtc.connection.on("message", msg => {
        const { from, payload, type } = msg;
        if (type === "chat") {
          this.emit("room:chat", { from, payload });
        }
      });
    });

    webrtc.on("joinedRoom", roomId => {
      this.emit("room:joined", { id: this.id, roomId: name });
    });

    // P2P message arrived
    webrtc.on("channelMessage", (peer, channelLabel, message, dc, event) => {
      if (channelLabel === "game") {
        this.emit("p2p:message", {
          to: this.id,
          from: peer.id,
          message: message
        });
      } else if (message.type === "ping") {
        peer.sendDirectly("ping", "pong");
      } else if (message.type === "pong") {
        if (peer.dcPingTime) {
          const pongTime = new Date().valueOf();
          const ms = pongTime - peer.dcPingTime;
          console.log(peer.id, "(" + ms + "ms)");
          peer.dcPingTime = null;
        }
      }
    });

    webrtc.on("message", msg => {
      const { sid, to, type, payload } = msg;
      if (type === "room") {
        this.emit("room:message", { to: to, from: sid, message: payload });
      } else if (type === "chat") {
        this.emit("chat:message", { to: to, from: sid, message: payload });
      }
      // other control messages are already handled by simplertc
    });

    // local p2p/ice failure
    webrtc.on("iceFailed", peer => {
      this.emit("p2p:error", { peer, message: "Connection failed (ICE)" });
    });
    // remote p2p/ice failure
    webrtc.on("connectivityError", peer => {
      this.emit("p2p:error", {
        peer,
        message: "Connection failed (connectivity)"
      });
    });

    // called when a peer is created
    webrtc.on("createdPeer", peer => {
      const dc = peer.getDataChannel();

      dc.onopen = () => {
        this.addNetId(peer.id);
        this.emit("p2p:connect", { peer });
        this.dcSendPing(peer);
      };

      dc.onclose = () => {
        this.removeNetId(peer.id);
        this.emit("p2p:disconnect", { peer });
      };

      this.emit("p2p:peer", { peer });
    });

    this.webrtc = webrtc;

    // join room
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

  broadcastP2p(type, payload) {
    this.webrtc.sendDirectlyToAll("game", type, payload);
  }

  broadcast(type, payload) {
    this.webrtc.sendToAll(type, payload);
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
  el: HTMLFormElement;

  constructor({ el, net }: { el: HTMLFormElement; net: Network }) {
    this.el = el;

    const form = <HTMLFormElement>el.getElementsByTagName("form")[0];
    const input = <HTMLInputElement>form.querySelector("input[type=text]");

    net
      .on("room:joined", ({ id, roomId }) => {
        this.log("Assigned name " + id);

        el.addEventListener("submit", event => {
          event.stopPropagation();
          event.preventDefault();
          const text = input.value;
          net.broadcast("chat", text);
          const chatMsg = net.id + ": " + text;
          this.log(chatMsg);
          input.value = "";
        });
      })
      .on("room:chat", ({ from, payload }) => {
        const chatMsg = from + ": " + payload;
        this.log(chatMsg);
      })
      .on("p2p:peer", ({ peer }) => {
        const userList = el.getElementsByClassName("members")[0];
        if (userList) {
          const userEl = document.createElement("li");
          userEl.innerText = peer.id;
          userEl.className = "peer";
          userEl.id = "container_" + net.webrtc.getDomId(peer);
          userList.appendChild(userEl);

          // show the ice connection state
          if (peer && peer.pc) {
            const connstate = document.createElement("span");
            connstate.className = "state";
            userEl.appendChild(connstate);
            peer.pc.on("iceConnectionStateChange", event => {
              switch (peer.pc.iceConnectionState) {
                case "checking":
                  userEl.className = "peer connecting";
                  break;
                case "connected":
                case "completed": // on caller side
                  userEl.className = "peer connected";
                  break;
                case "disconnected":
                  userEl.className = "peer disconnected";
                  break;
                case "failed":
                  break;
                case "closed":
                  userEl.className = "peer closed";
                  const remove = () => userList.removeChild(userEl);
                  setTimeout(remove, 200);
                  break;
              }
            });
          }
        }
      });
  }

  log(text: string) {
    const textarea = <HTMLTextAreaElement>this.el.getElementsByTagName(
      "textarea"
    )[0];
    textarea.value += text;
    textarea.value += "\n";
    textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
  }
}

export { Network, ChatClient, EventEmitter };
