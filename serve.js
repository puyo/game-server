//!/usr/bin/env node

// STUN_ADDRESS=127.0.0.1
// STUN_PORT=19302
// SIGNAL_ADDRESS=127.0.0.1
// SIGNAL_PORT=19301
// SIGNAL_HTTPS=0

const express = require('express')
const sockets = require('signal-master/sockets')
const path = require('path')
const dgram = require('dgram')
const stun = require('stun')

// --

const stunPort = parseInt(process.env.STUN_PORT || 19302)
const stunAddress = process.env.STUN_ADDRESS || '127.0.0.1'
const signalAddress = process.env.SIGNAL_ADDRESS || '127.0.0.1'
const signalPort = parseInt(process.env.SIGNAL_PORT || 19301)

const app = express()

const root = path.join(__dirname, 'examples');

if (app.get('env') === 'development') {
  if (process.EventEmitter == null) {
    const events = require('events')
    process.EventEmitter = events.EventEmitter
  }
  const livereload = require('express-livereload')
  livereload(app, {
    watchDir: root,
    port: process.env.LIVERELOAD_PORT || 35721
  });
}

app.use(express.static(root));

startStunServer({address: stunAddress, port: stunPort})
startSignalServer({app, address: signalAddress, port: signalPort})

// --

function startStunServer({address, port}) {

  const socket = dgram.createSocket('udp4')
  const server = stun.createServer(socket)

  const {
    STUN_BINDING_RESPONSE,
    STUN_ATTR_MAPPED_ADDRESS,
    STUN_ATTR_XOR_MAPPED_ADDRESS,
    STUN_ATTR_SOFTWARE,
  } = stun.constants

  const userAgent = `node/${process.version} stun/v1.0.0`

  server.on('bindingRequest', (req, rinfo) => {
    const msg = stun.createMessage(STUN_BINDING_RESPONSE)
    msg.addAttribute(STUN_ATTR_MAPPED_ADDRESS, rinfo.address, rinfo.port)
    msg.addAttribute(STUN_ATTR_XOR_MAPPED_ADDRESS, rinfo.address, rinfo.port)
    msg.addAttribute(STUN_ATTR_SOFTWARE, userAgent)
    console.log(msg)
    server.send(msg, rinfo.port, rinfo.address)
  })

  socket.bind(port, address, () => {
    console.log('[stun] ' + address + ':' + port + ' udp')
  })

  return server
}

// app: an express app
// maxClients: maximum number of clients per room. 0 = no limit
// secure: whether this connects via https
//
function startSignalServer({app, address, port, isDev = false, maxClients = 0, secure = false, key = null, cert = null, password = null}) {
  const server = app.listen(signalPort)

  const config = {
    "isDev": isDev,
    "server": {
      "port": port,
      "secure": secure,
      "key": key,
      "cert": cert,
      "password": password
    },
    "rooms": {
      "maxClients": maxClients,
    },
    "turnservers": [],
  }

  if (process.env.NODE_ENV !== "production" && !config.hasOwnProperty("stunservers")) {
    config["stunservers"] = [
      { url: `stun:${stunAddress}:${stunPort}` }
    ]
  }

  sockets(server, config)
  console.log('[signal] ' + signalAddress + ':' + signalPort + ' tcp')
}
