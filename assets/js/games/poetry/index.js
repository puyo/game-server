// import "../rtc";
// import {Socket} from "phoenix"

// let socket = new Socket("/socket", {params: {}})
// socket.connect()

// // Now that you are connected, you can join channels with a topic:
// let gameId = window.location.pathname.split("/").pop()
// let channel = socket.channel("game:" + gameId, {})
// channel.join()
//   .receive("ok", resp => { console.log("Joined successfully", resp) })
//   .receive("error", resp => { console.log("Unable to join", resp) })


document.addEventListener("DOMContentLoaded", function(event) {
  console.log("YAY")

  const details = GameLib.connect();
  console.log(details);
});
