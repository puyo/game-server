// import {Socket} from "phoenix"

const GameLib = {
  init() {
    this.connect();
  },

  connect() {
    console.log(window.location)
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
    })

    // local p2p/ice failure
    webrtc.on('iceFailed', function (peer) {
      var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
      console.log('local fail', connstate);
      if (connstate) {
        connstate.innerText = 'Connection failed.';
        fileinput.disabled = 'disabled';
      }
    });

    // remote p2p/ice failure
    webrtc.on('connectivityError', function (peer) {
      var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
      console.log('remote fail', connstate);
      if (connstate) {
        connstate.innerText = 'Connection failed.';
        fileinput.disabled = 'disabled';
      }
    });

    const self = this;

    // called when a peer is created
    webrtc.on('createdPeer', function (peer) {
      console.log('createdPeer', peer);

      var remotes = document.getElementById('remotes');
      if (remotes) {
        var container = document.createElement('div');
        remotes.appendChild(container);

        // show the ice connection state
        if (peer && peer.pc) {
          var connstate = document.createElement('div');
          connstate.className = 'connectionstate';
          container.appendChild(connstate);
          peer.pc.on('iceConnectionStateChange', function (event) {
            switch (peer.pc.iceConnectionState) {
            case 'checking':
              connstate.innerText = 'Connecting to peer...';
              break;
            case 'connected':
              break;

            case 'completed': // on caller side
              connstate.innerText = 'Connection established.';

              self.connectedToPeer(peer);

              break;
            case 'disconnected':
              connstate.innerText = 'Disconnected.';
              break;
            case 'failed':
              break;
            case 'closed':
              connstate.innerText = 'Connection closed.';
              break;
            }
          });
        }
      }
    });

    this.webrtc = webrtc;

    // join without waiting for media
    webrtc.joinRoom('room name');
  },

  connectedToPeer(peer) {
    console.log("CONNECTED", peer)

    peer.sendDirectly("channel label", "message type", {payload: "payload"});
  }
}

window.GameLib = GameLib
