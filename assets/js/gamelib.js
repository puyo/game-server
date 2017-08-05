import {Socket} from "phoenix"
// import {SimpleWebRTC} from "simplewebrtc"

const GameLib = {
  connect() {
    let signallingSocket = new Socket("/socket", {params: {}})
    signallingSocket.connect()

    // Now that you are connected, you can join channels with a topic:
    let gameId = window.location.pathname.split("/").pop()
    let channel = signallingSocket.channel("game:" + gameId, {})
    channel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) })

    return {signallingSocket: signallingSocket, channel: channel}
  },

  call(signallingSocket) {
    var webrtc = new SimpleWebRTC({
      url: 'http://localhost',
	    localVideoEl: 'localVideo',
	    remoteVideosEl: 'remoteVideo',
	    autoRequestMedia: false,
      connection: signallingSocket,
    })

    webrtc.on('readyToCall', function () {
	    webrtc.joinRoom('My room name')
    })
  },
}

window.GameLib = GameLib

console.log(window)
