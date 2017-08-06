class SnakeServer {
  constructor() {
    this.mainLoopTimer = null;

    this.state = {
      players: {},
      foodBits: [],
      w: 30,
      h: 30,
    }

    this.makeFood();

    this.delay = 80;
  }

  addPlayer(name) {
    this.state.players[name] = {
      snake: this.makeSnake(),
      dir: 'r',
    };
  }

  hasPlayer(name) {
    return this.state.players[name] != null;
  }

  setDir(name, dir) {
    this.state.players[name]['dir'] = dir;
  }

  removePlayer(name) {
    delete this.state.players[name];
  }

  playerCount() {
    return Object.keys(this.state.players).length;
  }

  makeSnake() {
    const snakeLength = 6;
    const snake = [];
    // Initialises snake from top left of canvas
    for(let i = snakeLength - 1; i >= 0; i--) {
      snake.push({x: i, y: this.playerCount()});
    }
    return snake;
  }

  makeFood() {
    // spawns food in length/width of canvas minus 1 cw
    this.state.foodBits.push({
      x: Math.floor(Math.random() * this.state.w),
      y: Math.floor(Math.random() * this.state.h),
      type: "regular",
      colour: "#45B29D"
    });
  }

  updateSnakes() {
    for (let name in this.state.players) {
      const snake = this.state.players[name].snake;
      const dir = this.state.players[name].dir;

      let headX = snake[0].x;
      let headY = snake[0].y;

      if (dir == "r") headX++;
      else if (dir == "l") headX--;
      else if (dir == "u") headY--;
      else if (dir == "d") headY++;

      // Teleporting walls
      if (headX >= this.state.w){
        headX = 0;
      }
      else if (headX <= -1){
        headX = this.state.w - 1;
      }
      else if (headY >= this.state.h){
        headY = 0;
      }
      else if (headY <= -1){
        headY = this.state.h - 1;
      }
      const tail = snake.pop(); // pops(removes) tail cell
      tail.x = headX;
      tail.y = headY;

      snake.unshift(tail); // Puts tail cell at the head of the snake
    }
  }

  checkCollision() {
    for (let name in this.state.players) {
      const snake = this.state.players[name].snake;
      const dir = this.state.players[name].dir;
      let headX = snake[0].x;
      let headY = snake[0].y;

      for (let i = 0; i < this.state.foodBits.length; i++) {
        const f = this.state.foodBits[i];
        if (headX == f.x && headY == f.y) {
          if (f.type === "regular") {
            const tail = {
              // get the x and y position of the last cell in the snake array
              // (the tail)
              x: snake[snake.length-1].x,
              y: snake[snake.length-1].y,
            };

            // adds the new tail cell that's been created to the end of the
            // array.
            snake.push(tail);
            // This block above extends the tail.

            // This is what removes the food from the screen.
            this.state.foodBits.splice(i, 1);
            i--; // dont skip next food bit

            this.makeFood();
          }
        } else {
          for (let j = 1; j < snake.length; j++) {
            const s = snake[j];
            // TODO: snake collisions
          }
        }
      }
    }
  } // food collision

  update() {
    this.updateSnakes();
    this.checkCollision();
  }

  mainLoop() {
    //net.directBroadcast('state', server.state);
    this.update();
    this.emit("state", this.state);
    this.mainLoopTimer = setTimeout(() => {
      this.mainLoop();
    }, this.delay); // again!
  }

  start() {
    this.mainLoopTimer = setTimeout(() => {
      this.mainLoop();
    }, this.delay);
  }

  stop() {
    clearTimeout(this.mainLoopTimer);
  }
};

WildEmitter.mixin(SnakeServer);

class SnakeClient {

  constructor() {
    this.initHTML();

    const canvas = document.getElementById("snakeCanvas");
    this.ctx = canvas.getContext("2d");

    this.dir = 'r';
    this.w = canvas.width;
    this.h = canvas.height;
    this.cw = 15; // Cell width
    this.state = {players: {}, foodBits: [], w: 50, h: 50}

    this.initKeyboard();
  }

  initHTML() {
    const gameDiv = document.querySelector("#game");
    gameDiv.innerHTML = `
      <canvas id="snakeCanvas" width="800px" height="400px"></canvas>
    `
  }

  initKeyboard() {
    document.addEventListener("keydown", (e) => {
      let key = e.which;
      if (key === 37 || key === 38 || key === 39 || key === 40) {
        e.preventDefault();
      }
      let newDir

      if ((key === 37) && (this.dir != "r"))
        newDir = "l";
      else if ((key === 38) && (this.dir != "d"))
        newDir = "u";
      else if ((key === 39) && (this.dir != "l"))
        newDir = "r";
      else if ((key === 40) && (this.dir != "u"))
        newDir = "d";

      if (newDir) {
        this.dir = newDir
        this.emit("dir", newDir);
      }
    });
  }

  drawBackground() {
    this.ctx.fillStyle = "#334D5C"; // canvas fill colour
    this.ctx.fillRect(0, 0, this.state.w * this.cw, this.state.h * this.cw);
  }

  drawSnakes() {
    let pnum = 0;
    for (let name in this.state.players) {
      pnum += 1;
      let col = "hsl(" + pnum * 20 + ", 100%, 80%)";
      let snake = this.state.players[name].snake;
      for (let i = 0; i < snake.length; i++) {
        let s = snake[i];
        this.ctx.fillStyle = col;
        this.ctx.fillRect(s.x*this.cw, s.y*this.cw, this.cw, this.cw);
      }
    }
  }

  drawFood() {
    for (let i = 0; i < this.state.foodBits.length; i++) {
      let f = this.state.foodBits[i];
      this.ctx.fillStyle = f.colour;
      this.ctx.fillRect(f.x*this.cw, f.y*this.cw, this.cw, this.cw);
    }
  }

  draw() {
    this.drawBackground();
    this.drawSnakes();
    this.drawFood();
  }
}

WildEmitter.mixin(SnakeClient);

function becomeClient(server, client, net, callbacks) {
  console.log("CLIENT");

  net.log("Client mode...")

  server.off("state");
  client.off("dir");
  server.stop();

  net.on("peer:message", ({message}) => {
    //console.log("msg from peer", message);
    if (message.type === "state") {
      //console.log("state updated from server");
      client.state = message.payload;
      client.draw();
    }
  })

  callbacks.clientDirHandler = client.on("dir", (dir) => {
    //console.log("on client dir", dir)
    net.directBroadcast("dir", dir)
  })
}

function becomeServer(server, client, net, callbacks) {
  console.log("SERVER");

  net.log("Server mode...")

  server.off("state");
  client.off("dir");
  server.stop();

  callbacks.serverStateHandler = server.on("state", (state) => {
    // broadcast to others
    //console.log("sending state to clients")
    net.directBroadcast("state", state)

    client.state = state;
    client.draw();
  })
  callbacks.clientDirHandler = client.on("dir", (dir) => {
    server.setDir(net.id, dir);
  })

  callbacks.serverMessageHandler = net.on("peer:message", ({from, message}) => {
    console.log("server got msg", from, message)
    if (message.type === "dir") {
      server.setDir(from, message.payload);
    }
  })
  callbacks.serverDisconnectHandler = net.on("peer:disconnect", ({peer}) => {
    server.removePlayer(peer.id);
  })

  ensurePlayers(server, net.getNetIds());

  server.start();
}

function becomeSinglePlayer(server, client, net, callbacks) {
  console.log("SINGLE PLAYER");

  net.log("Single player mode...")

  server.off("state");
  client.off("dir");
  server.stop();

  callbacks.serverStateHandler = server.on("state", (state) => {
    client.state = state;
    client.draw();
  })
  callbacks.clientDirHandler = client.on("dir", (dir) => {
    server.setDir(net.id, dir);
  })

  ensurePlayers(server, net.getNetIds());
  server.start();
}

function ensurePlayers(server, ids) {
  ids.forEach(id => {
    if (server.hasPlayer(id)) {
      // OK
    } else {
      server.addPlayer(id);
    }
  })
}

document.addEventListener("DOMContentLoaded", function(event) {
  const net = new Network();
  const server = new SnakeServer();
  const client = new SnakeClient();
  const callbacks = {}

  net
    .on("sig:connect", ({id, ids}) => {
      console.log("SIG CONNECTED", id, ids);
      becomeSinglePlayer(server, client, net, callbacks);
    })
    .on("sig:message", (stuff) => {
      console.log("SIG MESSAGE", stuff);
    })
    .on("peer:connect", ({peer}) => {
      const ids = net.getNetIds();
      console.log("PEER CONNECTED", peer.id, ids);

      const isServer = (ids.sort()[0] == net.id);

      if (isServer) {
        becomeServer(server, client, net, callbacks);
      } else {
        becomeClient(server, client, net, callbacks);
      }
    })
    .on("peer:error", ({peer, message}) => {
      console.log("PEER ERROR", peer, message);
    })
    .on("peer:disconnect", ({peer}) => {
      console.log("PEER DISCONNECTED", peer);
      ensurePlayers(server, net.getNetIds());
    })
    .connect();
});
