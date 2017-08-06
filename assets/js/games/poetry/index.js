document.addEventListener("DOMContentLoaded", function(event) {
  const net = new Network();

  net.on("sig:connect", (stuff) => {
    console.log("SIG CONNECTED", stuff);
  })

  net.on("sig:message", (stuff) => {
    console.log("SIG MESSAGE", stuff);
  })

  net.on("peer:connect", ({peer}) => {
    console.log("PEER CONNECTED", peer);
  })

  net.on("peer:error", ({peer, message}) => {
    console.log("PEER ERROR", peer, message);
  })

  net.on("peer:disconnect", ({peer}) => {
    console.log("PEER DISCONNECTED", peer);
  })

  net.connect();
});
