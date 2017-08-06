const WildEmitter = require('wildemitter');

export default class Network {

  connect() {
    console.log("Connecting to signalling server...")
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
      autoRequestMedia: false,
      //nick: 'Jane Doe',
    });

    webrtc.on('connectionReady', (sessionId) => {
      this.emit("sig:connect", {sessionId});
    })

    webrtc.on('message', (msg) => {
      const {sid, to, type, payload} = msg
      if (type === "game") {
        this.emit("sig:message", {to: to, from: sid, message: payload});
      }
      // other control messages are already handled by simplertc
    })

    // local p2p/ice failure
    webrtc.on('iceFailed', (peer) => {
      var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
      //console.log('local fail', connstate);
      if (connstate) {
        connstate.innerText = 'Connection failed.';
        fileinput.disabled = 'disabled';
      }
      this.emit("peer:error", {peer, message: "Connection failed (ICE)"});
    });

    // remote p2p/ice failure
    webrtc.on('connectivityError', (peer) => {
      var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
      console.log('remote fail', connstate);
      if (connstate) {
        connstate.innerText = 'Connection failed.';
        fileinput.disabled = 'disabled';
      }
      this.emit("peer:error", {peer, message: "Connection failed (connectivity)"});
    });

    const gameData = document.getElementById('game-data');

    const log = (text) => {
      gameData.value += text;
      gameData.value += "\n";
      gameData.scrollTop = gameData.scrollHeight - gameData.clientHeight;
    }

    let sigPingTime

    // webrtc.on('message', (msg) => {
    //   const {sid, to, type, payload} = msg
    //   if (type === "thegame") {
    //     console.log("SIGMSG", type, payload, to, sid)
    //     if (payload === "sigping") {
    //       const peer = webrtc.getPeers().find(p => p.sid === sid)
    //       //console.log("GOT PING", msg);
    //       if (peer) {
    //         peer.send("thegame", "sigpong");
    //       }
    //     } else if (payload === "sigpong") {
    //       if (sigPingTime) {
    //         let pongTime = new Date().valueOf();
    //         log("Sig latency: " + (pongTime - sigPingTime));
    //         sigPingTime = null
    //       }
    //     }
    //   }
    // })

    // called when a peer is created
    webrtc.on('createdPeer', (peer) => {
      //console.log('createdPeer', peer);

      // peer.on('channelMessage', (peer, channelLabel, message, dc, event) => {
      //   //console.log("channelMessage", message);
      //   if (message.type === "chat") {
      //     const msg = message.payload.message;
      //     log(msg);
      //   } else if (message.type === "ping") {
      //     peer.sendDirectly("thegame", "pong");
      //   } else if (message.type === "pong") {
      //     if (dcPingTime) {
      //       let pongTime = new Date().valueOf();
      //       log("DC latency: " + (pongTime - dcPingTime));
      //       dcPingTime = null
      //     }
      //   }
      // })

      // let timer
      // let dcPingTime

      // const sigSendPing = () => {
      //   if (!sigPingTime) {
      //     sigPingTime = new Date().valueOf();
      //     console.log("SENDING")
      //     peer.send("thegame", "sigping");
      //   }
      //   timer = setTimeout(sigSendPing, 10000);
      // }

      // //sigSendPing()

      // const dcSendPing = () => {
      //   if (!dcPingTime) {
      //     dcPingTime = new Date().valueOf();
      //     peer.sendDirectly("thegame", "ping");
      //   }
      //   timer = setTimeout(dcSendPing, 10000);
      // }

      const dc = peer.getDataChannel();

      dc.onopen = () => {
        //console.log("DC open", peer.id);

        // const msg = "hello from " + this.webrtc.connection.getSessionid();
        // peer.sendDirectly("thegame", "chat", {message: msg});

        this.emit("peer:connect", {peer});

        //dcSendPing();
      };

      dc.onclose = () => {
        //console.log("DC close", peer.id);
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

    // join without waiting for media
    webrtc.joinRoom('thegame');
  }

  getPeers() {
    return this.webrtc.getPeers();
  }
}

WildEmitter.mixin(Network);

window.Network = Network

// (window || module.exports || {}).exports = Network
