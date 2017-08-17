//!/usr/bin/env node

// Environment variables
//
// STUN_ADDRESS=127.0.0.1
// STUN_PORT=19302
// SIGNAL_ADDRESS=127.0.0.1
// SIGNAL_PORT=19301
// SIGNAL_HTTPS=0

const express = require("express");
const sockets = require("signal-master/sockets");
const path = require("path");
const dgram = require("dgram");
const { spawn } = require("child_process");

// --------------------------------------------------

const stunPort = parseInt(process.env.STUN_PORT || 19302);
const stunAddress = process.env.STUN_ADDRESS || "127.0.0.1";
const signalAddress = process.env.SIGNAL_ADDRESS || "127.0.0.1";
const signalPort = parseInt(process.env.SIGNAL_PORT || 19301);
const app = express();

// node stun package was too old, what will we do to make local dev easy
startStunServer({ address: stunAddress, port: stunPort });
startSignalServer({app, address: signalAddress, port: signalPort})
startStaticServer({app, address: signalAddress, port: signalPort})

// --------------------------------------------------

function startStunServer({ address: stunAddress, port: stunPort }) {
  const scriptPath = path.join(
    __dirname,
    "node_modules/stuntmanjs/stunserver/stunserver"
  );
  const scriptArgs = [
    "--mode",
    "basic",
    "--primaryinterface",
    stunAddress,
    "--primaryport",
    stunPort,
    "--verbosity",
    "3"
  ];
  const stuntman = spawn(scriptPath, scriptArgs);
  stuntman.stdout.on("data", data => {
    console.log(`stun: ${data}`);
  });
  stuntman.stderr.on("data", data => {
    console.log(`stun: ${data}`);
  });
  stuntman.on("close", code => {
    console.log(`stun: closed`);
  });
  console.log("[stun] " + stunAddress + ":" + stunPort);
}

function startStaticServer({ app, address, port }) {
  const root = path.join(__dirname, "examples");

  if (app.get("env") === "development") {
    if (process.EventEmitter == null) {
      const events = require("events");
      process.EventEmitter = events.EventEmitter;
    }
    const livereload = require("express-livereload");
    livereload(app, {
      watchDir: root,
      port: process.env.LIVERELOAD_PORT || 35721
    });
  }
  app.use(express.static(root));
  console.log("[web] http://" + address + ":" + port);
}

function startSignalServer({
  app,
  address,
  port,
  isDev = false,
  maxClients = 0,
  secure = false,
  key = null,
  cert = null,
  password = null
}) {
  const config = {
    isDev: isDev,
    server: {
      port: port,
      secure: secure,
      key: key,
      cert: cert,
      password: password
    },
    rooms: {
      maxClients: maxClients
    },
    turnservers: []
  };

  if (
    process.env.NODE_ENV !== "production" &&
    !config.hasOwnProperty("stunservers")
  ) {
    config["stunservers"] = [{ url: `stun:${stunAddress}:${stunPort}` }];
  }

  const server = app.listen(signalPort);
  sockets(server, config);
  console.log("[signal] " + signalAddress + ":" + signalPort + " tcp");
}
