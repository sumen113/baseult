import express from "express";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

if (!fs.existsSync("dist")) {
  console.log("Building...");
  execSync("pnpm run build", { stdio: "inherit" });
  console.log("Done");
}

const app = express();

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
  },
});

const port = process.env.PORT || 6767;

app.disable("x-powered-by");

// Serve static files from dist/
app.use(
  express.static("dist", {
    index: "index.html",
    extensions: ["html"],
  }),
);

// Fallback: if a subfolder route exists, serve its index.html
app.use((req, res, next) => {
  const possibleIndex = `dist${req.path.replace(/\/$/, "")}/index.html`;
  if (fs.existsSync(possibleIndex)) {
    res.sendFile(possibleIndex, { root: "." });
  } else {
    // Fallback to root index.html for SPA
    res.sendFile("dist/index.html", { root: "." });
  }
});

httpServer.listen(port, () => {
  console.log(`sumensite put on http://localhost:${port}`);
});







const TICK_RATE = 60;
const GAME_DURATION = 180;
let jumpForce = -0.03; 
const TAG_COOLDOWN = 500; 

const MOVE_ACCEL = 0.0006; 

let gravity = 0.0008;
let FRICTION = 0.85; 

let portals = [];
const PORTAL_COOLDOWN = 20000; 

let charSpins = [];
let charSpinSpawnTimeout = null;
let charSpinSpawnedThisRound = false;


let players = {};

let lastUpdate = Date.now(); 

const SPECIAL_USERNAMES = {
  sumen: "nolifeloser",
  donaldtrumpy: "67isgood",
  IShowMonkey: "applepenus67",
  "Clip God": "reyreyiscool",
  Aura: "password67",
  MonkeyDLuffy: "jamiemonkey",
  SKILLZ: "jadie",
  Goten: "jbhifi",
};

const MAP_NAMES = ["Grass", "Moon", "Ice"];

const MAPS = [

  [
    { x: -0.1, y: 0.89, w: 2.0, h: 0.03, type: "static" },

    { x: 0.05, y: 0.82, w: 0.25, h: 0.03, type: "static" },
    { x: 0.25, y: 0.7, w: 0.25, h: 0.03, type: "static" },

    { x: 1.25, y: 0.82, w: 0.35, h: 0.03, type: "static" },
    { x: 1.0, y: 0.7, w: 0.25, h: 0.03, type: "static" },

    { x: 0.1, y: 0.56, w: 0.25, h: 0.03, type: "static" },
    { x: 0.55, y: 0.56, w: 0.55, h: 0.03, type: "static" },
    { x: 1.4, y: 0.56, w: 0.25, h: 0.03, type: "static" },

    { x: 0.2, y: 0.4, w: 0.25, h: 0.03, type: "static" },
    { x: 0.65, y: 0.4, w: 0.55, h: 0.03, type: "static" },

    { x: 1.5, y: 0.36, w: 0.25, h: 0.03, type: "static"},

    { x: 0.4, y: 0.28, w: 0.25, h: 0.03, type: "static" },
    { x: 1.15, y: 0.28, w: 0.25, h: 0.03, type: "static" },

    { x: 0.8, y: 0.18, w: 0.35, h: 0.03, type: "static" },
  ],

  [
    { x: 0, y: 0.89, w: 2.0, h: 0.03, type: "static" }, 

    { x: 0.05, y: 0.75, w: 0.25, h: 0.03, type: "static" },
    { x: 0.3, y: 0.62, w: 0.25, h: 0.03, type: "static" },

    { x: 1.4, y: 0.75, w: 0.25, h: 0.03, type: "static" },
    { x: 1.1, y: 0.62, w: 0.25, h: 0.03, type: "static" },

    { x: 0.55, y: 0.48, w: 0.45, h: 0.03, type: "static" },

    { x: 0.2, y: 0.35, w: 0.25, h: 0.03, type: "static" },

    { x: 1.3, y: 0.35, w: 0.25, h: 0.03, type: "static" },

    { x: 0.75, y: 0.2, w: 0.35, h: 0.03, type: "static" },
  ],

  [
    // Ground — long icy base
    { x: 0, y: 0.89, w: 2.0, h: 0.03, type: "static" },
  
    // Lower mid-tier platforms
    { x: 0.1, y: 0.78, w: 0.4, h: 0.03, type: "static" },
    { x: 1.2, y: 0.78, w: 0.45, h: 0.03, type: "static" },
  
    // Mid-level icy shelves
    { x: 0.4, y: 0.65, w: 0.5, h: 0.03, type: "static" },
    { x: 1.0, y: 0.55, w: 0.45, h: 0.03, type: "static"}, // slight tilt
  
    // Floating chunk near center (risk of sliding off)
    { x: 0.75, y: 0.45, w: 0.25, h: 0.03, type: "static" },
  
    // Narrow ledges
    { x: 0.25, y: 0.36, w: 0.2, h: 0.03, type: "static" },
    { x: 1.35, y: 0.36, w: 0.2, h: 0.03, type: "static" },
  
    // High top platforms (good for sniping or rewards)
    { x: 0.55, y: 0.25, w: 0.3, h: 0.03, type: "static" },
    { x: 1.1, y: 0.2, w: 0.3, h: 0.03, type: "static" },
  ]  
];

let platforms = MAPS[0];

let jumpPads = [
  { x: -0.07, y: 0.87, w: 0.08, h: 0.02, power: -0.04 }, 
  { x: 1.81, y: 0.87, w: 0.08, h: 0.02, power: -0.04 }, 
];

// Decorations for each map (matching MAPS index)
const DECORATIONS = [
  // Grass Map
  [
    { x: 0.1, y: 0.79, size: 0.08, type: "bush" },
    { x: 1.03, y: 0.66, size: 0.08, type: "bush" },
    { x: 1.57, y: 0.53, size: 0.08, type: "bush" },
    { x: 0.45, y: 0.23, size: 0.10, type: "bush" },
    { x: 0.7, y: 0.49, size: 0.15, type: "treeone" },
    { x: 1.55, y: 0.295, size: 0.15, type: "treeone" },
    { x: 0.25, y: 0.33, size: 0.15, type: "treetwo" },
    { x: 1.05, y: 0.11, size: 0.15, type: "treetwo" },
    { x: 0.4, y: 0.63, size: 0.15, type: "treethree" },
    { x: 0.8, y: 0.33, size: 0.15, type: "treethree" },
    { x: 0.5, y: 0.82, size: 0.15, type: "snowtree" },
  ],

  // Moon Map
  [

  ],

  // Ice Map
  [

  ],
];

let decorations = DECORATIONS[0];


let groundHeight = 0.1;

let gameRunning = false;
let countdown = 3;
let timer = GAME_DURATION;
let itPlayer = null;

let votes = {};
let voting = false;

function startVoting() {
  votes = {};
  voting = true;
  io.emit("mapVoteStart", { maps: MAPS.length, names: MAP_NAMES });

  setTimeout(finishVoting, 8000); 
}

function finishVoting() {
  voting = false;
  let tally = new Array(MAPS.length).fill(0);
  Object.values(votes).forEach((v) => tally[v]++);

  let max = Math.max(...tally);
  let winners = tally.map((v, i) => (v === max ? i : -1)).filter((i) => i >= 0);

  let chosen = winners[Math.floor(Math.random() * winners.length)];
  platforms = MAPS[chosen];
  decorations = DECORATIONS[chosen];
  gravity = chosen === 1 ? 0.0005 : 0.0006; 
  jumpForce = chosen === 1 ? -0.025 : -0.015; 

  FRICTION = chosen === 2 ? 0.94 : 0.85; 
  globalThis.ACCEL_MULT = chosen === 2 ? 1.1 : 1.0; 

  io.emit("mapChosen", chosen);
  io.emit("initGame"); 
  io.emit("state", {
    players,
    platforms,
    portals,
    jumpPads,
    decorations,
    charSpins,  // 🆕 add this
    gameRunning,
    itPlayer,
  });
  
  startGame();
}

function startGame() {
  charSpinSpawnedThisRound = false;
  gameRunning = false;
  countdown = 4;
  timer = GAME_DURATION;
  pickRandomIt();
  spawnPortals();
  // Spawn the character spin once at a random time this round
  const randomDelay = Math.floor(Math.random() * 170000)
  charSpinSpawnTimeout = setTimeout(() => {
    spawnCharSpin();
  }, randomDelay);

  const cdInterval = setInterval(() => {
    countdown--;
    io.emit("countdown", countdown);
    if (countdown <= 0) {
      clearInterval(cdInterval);
      gameRunning = true;
      startTimer();
    }
  }, 1000);
}

function startTimer() {
  const timerInterval = setInterval(() => {
    if (!gameRunning) {
      clearInterval(timerInterval);
      return;
    }
    timer--;
    io.emit("timer", timer);
    if (timer <= 0) {
      gameRunning = false;
      if (itPlayer) io.emit("loser", players[itPlayer]?.name || "Someone");
      resetGame();
      clearInterval(timerInterval);
    }
  }, 1000);
}

function resetGame() {
  if (Object.keys(players).length >= 2) {
    startVoting();
    if (charSpinSpawnTimeout) {
      clearTimeout(charSpinSpawnTimeout);
      charSpinSpawnTimeout = null;
    }
    charSpinSpawnedThisRound = false;
    charSpins = [];
  } else {
    gameRunning = false;
    itPlayer = null;
    portals = [];    

    platforms = MAPS[0];
    decorations = DECORATIONS[0];
  }
}

function spawnPortals() {
  if (platforms.length < 2) return;

  let firstIndex = Math.floor(Math.random() * platforms.length);
  let secondIndex;
  do {
    secondIndex = Math.floor(Math.random() * platforms.length);
  } while (secondIndex === firstIndex);

  const platformA = platforms[firstIndex];
  const platformB = platforms[secondIndex];

  portals = [
    {
      x:
        Math.random() * (platformA.x + platformA.w - platformA.x) + platformA.x, 
      y: platformA.y - 0.04, 
      active: true,
    },
    {
      x:
        Math.random() * (platformB.x + platformB.w - platformB.x) + platformB.x,
      y: platformB.y - 0.04,
      active: true,
    },
  ];
}

function spawnCharSpin() {
  if (charSpinSpawnedThisRound) return; // already spawned this round
  if (platforms.length === 0) return;

  const pl = platforms[Math.floor(Math.random() * platforms.length)];
  const x = pl.x + Math.random() * pl.w;
  const y = pl.y - 0.04;

  console.log("Spawning char spin at", x, y);

  charSpins = [{ x, y, active: true }];
  charSpinSpawnedThisRound = true;
}

function pickRandomIt() {
  const keys = Object.keys(players);
  if (keys.length > 0) {
    itPlayer = keys[Math.floor(Math.random() * keys.length)];
    for (let id of keys) players[id].isIt = false;
    players[itPlayer].isIt = true;
    players[itPlayer].lastTagged = Date.now();
  }
}

function movePlatforms(dt) {
  platforms.forEach((pl) => {
    if (pl.type === "moving") {
      if (pl.direction === "horizontal") {
        pl.x += pl.speed * dt;
        if (Math.abs(pl.x - pl.originX) > pl.range) {
          pl.speed *= -1; 
        }
      } else if (pl.direction === "vertical") {
        pl.y += pl.speed * dt;
        if (Math.abs(pl.y - pl.originY) > pl.range) {
          pl.speed *= -1; 
        }
      }
    }
  });
}

function applyPhysics(dt) {
  const now = Date.now();

  for (let id in players) {
    let p = players[id];
    if (!p) continue;
    p.vy += gravity * dt;

    const TERMINAL_VELOCITY = 0.05;
    if (p.vy > TERMINAL_VELOCITY) p.vy = TERMINAL_VELOCITY;

    p.y += p.vy * dt;
    p.onGround = false;

    if (p.y + p.radius > 1 - groundHeight) {
      p.y = 1 - groundHeight - p.radius;
      p.vy = 0;
      p.onGround = true;
    }

    for (let id in players) {
      let p = players[id];
      if (!p) continue;

      if (p.frozenUntil && Date.now() < p.frozenUntil) {
        p.vx = 0;
        p.vy = 0;
        continue; 
      }
    }

    platforms.forEach((pl) => {
      if (p.x + p.radius > pl.x && p.x - p.radius < pl.x + pl.w) {

        if (
          p.y + p.radius > pl.y &&
          p.y + p.radius < pl.y + pl.h + 0.01 &&
          p.vy >= 0
        ) {
          p.y = pl.y - p.radius;
          p.vy = 0;
          p.onGround = true;

          if (pl.type === "moving" && pl.direction === "horizontal") {
            p.x += pl.speed;
          }
        }

        else if (
          p.y - p.radius < pl.y + pl.h &&
          p.y - p.radius > pl.y &&
          p.vy < 0
        ) {
          p.y = pl.y + pl.h + p.radius;
          p.vy = 0;
        }
      }
    });

    jumpPads.forEach((jp) => {
      if (
        p.x + p.radius > jp.x &&
        p.x - p.radius < jp.x + jp.w &&
        p.y + p.radius > jp.y &&
        p.y + p.radius < jp.y + jp.h + 0.01 &&
        p.vy >= 0
      ) {
        p.vy = jp.power; 
      }
    });

    const MAX_SPEED = 0.35; 

    if (p.input) {
      const accel = MOVE_ACCEL * (globalThis.ACCEL_MULT || 1) * dt;
      if (p.input.left) p.vx -= accel;
      if (p.input.right) p.vx += accel;
    }    

    if (p.input && p.input.jump) {
      if (p.onGround) {
        p.vy = jumpForce;
        p.onGround = false;
      }

      p.input.jump = false;
    }

    if (p.vx > MAX_SPEED) p.vx = MAX_SPEED;
    if (p.vx < -MAX_SPEED) p.vx = -MAX_SPEED;

    p.x += p.vx * dt;
    p.vx *= Math.pow(FRICTION, dt);

    if (p.class === "monkey" && p.grappling && p.grappleTarget) {
      const dx = p.grappleTarget.x - p.x;
      const dy = p.grappleTarget.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.02) {

        p.x = p.grappleTarget.x;
        p.y = p.grappleTarget.y;
        p.vx = 0;
        p.vy = 0;
        p.grappling = false;
        p.grappleTarget = null;
      } else {

        const speed = 0.03 * dt;
        p.x += (dx / dist) * speed;
        p.y += (dy / dist) * speed;
        p.vx = 0;
        p.vy = 0;
      }
    }

    if (p.class === "monkey2" && p.grappling && p.grappleTarget) {
      const dx = p.grappleTarget.x - p.x;
      const dy = p.grappleTarget.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.02) {

        p.x = p.grappleTarget.x;
        p.y = p.grappleTarget.y;
        p.vx = 0;
        p.vy = 0;
        p.grappling = false;
        p.grappleTarget = null;
      } else {

        const speed = 0.03 * dt;
        p.x += (dx / dist) * speed;
        p.y += (dy / dist) * speed;
        p.vx = 0;
        p.vy = 0;
      }
    }

    if (p.abducting && p.abductTarget) {
      const dx = p.abductTarget.x - p.x;
      const dy = p.abductTarget.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.02) {

        p.x = p.abductTarget.x;
        p.y = p.abductTarget.y;
        p.vx = 0;
        p.vy = 0;
        p.abducting = false;
        p.abductTarget = null;
      } else {

        const speed = 0.02 * dt;

        p.x += (dx / dist) * speed;
        p.y += (dy / dist) * speed;
        p.vx = 0;
        p.vy = 0;
      }
    }

    const WORLD_WIDTH = 2.0;
    const WORLD_OFFSET_X = -0.1; // Move everything left a bit
    p.x = Math.max(WORLD_OFFSET_X + p.radius, Math.min(WORLD_OFFSET_X + WORLD_WIDTH - p.radius, p.x));


    if (portals.length === 2 && portals[0].active && portals[1].active) {
      const [p1, p2] = portals;
      const TELEPORT_RADIUS = 0.03;

      if (
        Math.abs(p.x - p1.x) < TELEPORT_RADIUS &&
        Math.abs(p.y - p1.y) < TELEPORT_RADIUS
      ) {
        p.x = p2.x;
        p.y = p2.y - 0.05; 
        portals[0].active = false;
        portals[1].active = false;
        setTimeout(spawnPortals, PORTAL_COOLDOWN);
      }

      else if (
        Math.abs(p.x - p2.x) < TELEPORT_RADIUS &&
        Math.abs(p.y - p2.y) < TELEPORT_RADIUS
      ) {
        p.x = p1.x;
        p.y = p1.y - 0.05;
        portals[0].active = false;
        portals[1].active = false;
        setTimeout(spawnPortals, PORTAL_COOLDOWN);
      }
    }
  }

  for (let id in players) {
    const p = players[id];
    if (p.invisibleUntil && Date.now() < p.invisibleUntil) {
      p.invisible = true;
    } else {
      p.invisible = false;
    }

    charSpins.forEach((spin) => {
      if (!spin.active) return;
      const dx = p.x - spin.x;
      const dy = p.y - spin.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < p.radius + 0.03) {
        spin.active = false;
        io.to(id).emit("tryClaimCharSpin");
      }
    });
  }

  if (itPlayer && gameRunning) {
    const it = players[itPlayer];
    for (let id in players) {
      if (id === itPlayer) continue;
      const p = players[id];
      const dx = it.x - p.x;
      const dy = it.y - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (
        distance < it.hitRadius + p.hitRadius &&
        now - (it.lastTagged || 0) > TAG_COOLDOWN
      ) {

        it.isIt = false;
        it.lastTagged = now;
        itPlayer = id;
        players[itPlayer].isIt = true;
        players[itPlayer].lastTagged = now;
        break;
      }
    }
  }
}

const MS_PER_TICK = 1000 / TICK_RATE;
let accumulator = 0;

setInterval(() => {
  if (!gameRunning) return;
  const now = Date.now();
  let frameTime = now - lastUpdate;
  if (frameTime > 250) frameTime = 250; 
  lastUpdate = now;

  accumulator += frameTime;

  while (accumulator >= MS_PER_TICK) {
    const dt = 1;
    movePlatforms(dt);
    applyPhysics(dt);
    accumulator -= MS_PER_TICK;
  }  

  io.emit("state", {
    players,
    platforms,
    portals,
    jumpPads,
    decorations,
    charSpins,  // 🆕 add this
    gameRunning,
    itPlayer,
  });
}, 1000 / TICK_RATE);

io.on("connection", (socket) => {
  socket.on("join", ({ name, password, class: playerClass }) => {
    let inputName = (name || "").trim();
    let inputPass = (password || "").trim();
    let finalName = inputName;

    if (inputName.includes(":")) {
      const parts = inputName.split(":");
      inputName = parts[0].trim();
      inputPass = parts[1]?.trim() || "";
    }

    let matched = false;

    for (let special in SPECIAL_USERNAMES) {
      const correctPass = SPECIAL_USERNAMES[special];

      const taken = Object.values(players).some((p) => p.name === special);

      if (
        inputName.toLowerCase() === special.toLowerCase() &&
        inputPass === correctPass
      ) {
        finalName = taken ? "COPYCAT" : special; 
        matched = true;
        break;
      }

      if (inputName === correctPass) {
        finalName = taken ? "COPYCAT" : special;
        matched = true;
        break;
      }

      if (
        inputName.toLowerCase() === special.toLowerCase() &&
        inputPass !== correctPass
      ) {
        finalName = "COPYCAT";
        matched = true;
        break;
      }
    }

    if (!matched && finalName === "")
      finalName = "Guest" + Math.floor(Math.random() * 1000);

    players[socket.id] = {
      name: finalName,
      class: playerClass,
      x: 0.5,
      y: 0.5,
      vx: 0,
      vy: 0,
      radius: 0.02,
      hitRadius: 0.01,
      onGround: false,
      isIt: false,
      lastTagged: 0,
      color:
        finalName.toLowerCase() === "sumen"
          ? "#1fd128"
          : finalName.toLowerCase() === "ishowmonkey"
            ? "red"
            : finalName.toLowerCase() === "donaldtrumpy"
              ? "#FFD700"
              : "white",

      input: { left: false, right: false, jump: false },
    };

    socket.on("claimCharSpin", () => {
      io.to(socket.id).emit("charSpinClaimed");
    });

    socket.on("voteMap", (index) => {
      if (voting && index >= 0 && index < MAPS.length) {
        votes[socket.id] = index;

        let tally = new Array(MAPS.length).fill(0);
        Object.values(votes).forEach((v) => tally[v]++);
        io.emit("mapVoteUpdate", tally);
      }
    });

    if (Object.keys(players).length === 1) {
      socket.emit("waitingForPlayers");
    }
    if (Object.keys(players).length >= 2 && !gameRunning && !voting) {
      startVoting();
    }
    if (gameRunning && !voting) {
      socket.emit("initGame"); 
    }
  });

  socket.on("inputState", (state) => {
    const p = players[socket.id];
    if (!p) return;
    p.input.left = !!state.left;
    p.input.right = !!state.right;
    if (state.jump) p.input.jump = true;
  });

  socket.on("move", (action) => {
    const p = players[socket.id];
    if (!p) return;

    if (action === "leftDown" || action === "leftPress") p.input.left = true;
    else if (
      action === "leftUp" ||
      action === "leftRelease" ||
      action === "leftStop"
    )
      p.input.left = false;

    if (action === "rightDown" || action === "rightPress") p.input.right = true;
    else if (
      action === "rightUp" ||
      action === "rightRelease" ||
      action === "rightStop"
    )
      p.input.right = false;

    if (action === "left" && !p.input.left) {

      p.vx -= MOVE_ACCEL * 8;
    } else if (action === "right" && !p.input.right) {
      p.vx += MOVE_ACCEL * 8;
    }

    if (action === "stop") {
      p.input.left = false;
      p.input.right = false;
    }

    if (action === "jump") {
      p.input.jump = true;
    }

  });

  socket.on("useAbility", () => {
    const p = players[socket.id];
    if (!p) return;

    if (p.class === "ninja") {
      p.invisibleUntil = Date.now() + 5000; 
    }

    if (p.class === "monkey") {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      if (!platform) return;

      const targetX = platform.x + Math.random() * platform.w;
      const targetY = platform.y - p.radius - 0.01;
      p.grappleTarget = { x: targetX, y: targetY };
      p.grappling = true;
    }

    if (p.class === "clown") {

      socket.broadcast.emit("confetti", { duration: 5000 });
    }

    if (p.class === "snowman") {

      io.emit("freeze", {
        duration: 3000,
        userId: socket.id, 
      });

      for (let id in players) {
        if (id !== socket.id) {
          players[id].frozenUntil = Date.now() + 3000;
        }
      }
    }
    if (p.class === "mole") {

      let platformBelow = null;
      let minY = Infinity;

      for (let pl of platforms) {
        const isBelow =
          p.x > pl.x &&
          p.x < pl.x + pl.w && 
          p.y + p.radius <= pl.y + 0.01 && 
          pl.y < 0.95; 

        if (isBelow && pl.y < minY) {
          minY = pl.y;
          platformBelow = pl;
        }
      }

      if (platformBelow) {

        p.y = platformBelow.y + platformBelow.h + p.radius + 0.01;
        p.vy = 0.01; 
      }
    }
    if (p.class === "alien") {

      const otherIds = Object.keys(players).filter((id) => id !== socket.id);
      if (otherIds.length === 0) return; 
      const targetId = otherIds[Math.floor(Math.random() * otherIds.length)];
      const target = players[targetId];

      const destPlatform =
        platforms[Math.floor(Math.random() * platforms.length)];
      const destX = destPlatform.x + destPlatform.w * Math.random();
      const destY = destPlatform.y - target.radius - 0.01;

      target.abducting = true;
      target.abductTarget = { x: destX, y: destY };

      io.emit("abductStart", { id: targetId });
    }
    if (p.class === "scientist") {
      if (!p.shrunk) {

        p.shrunk = true;
        p.radius *= 0.5; 
        p.hitRadius *= 0.5; 

        setTimeout(() => {
          if (players[socket.id]) {
            players[socket.id].radius /= 0.5;
            players[socket.id].hitRadius /= 0.5;
            players[socket.id].shrunk = false;
          }
        }, 10000);
      }
    }
    if (p.class === "samurai") {
      const dashSpeed = 0.02;
      const dashDuration = 10;
  
      let dirX = Math.sign(p.vx);
      let dirY = Math.sign(p.vy);
  
      if (dirX === 0 && dirY === 0) {
        const dirs = [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: -1 },
        ];
        const rand = dirs[Math.floor(Math.random() * dirs.length)];
        dirX = rand.x;
        dirY = rand.y;
      }
  
      // Apply dash movement
      p.x += dirX * dashSpeed;
      p.y += dirY * dashSpeed;
  
      io.emit("samuraiDash", {
        id: socket.id,
        x: p.x,
        y: p.y,
        duration: dashDuration,
      });
  
      const originalVx = p.vx;
      const originalVy = p.vy;
      p.vx = dirX * 0.1;
      p.vy = dirY * 0.1;
  
      setTimeout(() => {
        if (players[socket.id]) {
          p.vx = originalVx;
          p.vy = originalVy;
        }
      }, dashDuration);
    }

    if (p.class === "ninja2") {
      p.invisibleUntil = Date.now() + 5000; 
    }

    if (p.class === "monkey2") {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      if (!platform) return;

      const targetX = platform.x + Math.random() * platform.w;
      const targetY = platform.y - p.radius - 0.01;
      p.grappleTarget = { x: targetX, y: targetY };
      p.grappling = true;
    }

    if (p.class === "clown2") {

      socket.broadcast.emit("confetti", { duration: 5000 });
    }

    if (p.class === "snowman2") {

      io.emit("freeze", {
        duration: 3000,
        userId: socket.id, 
      });

      for (let id in players) {
        if (id !== socket.id) {
          players[id].frozenUntil = Date.now() + 3000;
        }
      }
    }
    if (p.class === "mole2") {

      let platformBelow = null;
      let minY = Infinity;

      for (let pl of platforms) {
        const isBelow =
          p.x > pl.x &&
          p.x < pl.x + pl.w && 
          p.y + p.radius <= pl.y + 0.01 && 
          pl.y < 0.95; 

        if (isBelow && pl.y < minY) {
          minY = pl.y;
          platformBelow = pl;
        }
      }

      if (platformBelow) {

        p.y = platformBelow.y + platformBelow.h + p.radius + 0.01;
        p.vy = 0.01; 
      }
    }
    if (p.class === "alien2") {

      const otherIds = Object.keys(players).filter((id) => id !== socket.id);
      if (otherIds.length === 0) return; 
      const targetId = otherIds[Math.floor(Math.random() * otherIds.length)];
      const target = players[targetId];

      const destPlatform =
        platforms[Math.floor(Math.random() * platforms.length)];
      const destX = destPlatform.x + destPlatform.w * Math.random();
      const destY = destPlatform.y - target.radius - 0.01;

      target.abducting = true;
      target.abductTarget = { x: destX, y: destY };

      io.emit("abductStart", { id: targetId });
    }
    if (p.class === "scientist2") {
      if (!p.shrunk) {

        p.shrunk = true;
        p.radius *= 0.5; 
        p.hitRadius *= 0.5; 

        setTimeout(() => {
          if (players[socket.id]) {
            players[socket.id].radius /= 0.5;
            players[socket.id].hitRadius /= 0.5;
            players[socket.id].shrunk = false;
          }
        }, 10000);
      }
    }
    if (p.class === "samurai2") {
      const dashSpeed = 0.02;
      const dashDuration = 10;
  
      let dirX = Math.sign(p.vx);
      let dirY = Math.sign(p.vy);
  
      if (dirX === 0 && dirY === 0) {
        const dirs = [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: -1 },
        ];
        const rand = dirs[Math.floor(Math.random() * dirs.length)];
        dirX = rand.x;
        dirY = rand.y;
      }
  
      // Apply dash movement
      p.x += dirX * dashSpeed;
      p.y += dirY * dashSpeed;
  
      io.emit("samuraiDash", {
        id: socket.id,
        x: p.x,
        y: p.y,
        duration: dashDuration,
      });
  
      const originalVx = p.vx;
      const originalVy = p.vy;
      p.vx = dirX * 0.1;
      p.vy = dirY * 0.1;
  
      setTimeout(() => {
        if (players[socket.id]) {
          p.vx = originalVx;
          p.vy = originalVy;
        }
      }, dashDuration);
    }
  });

  socket.on("disconnect", () => {
    if (itPlayer === socket.id) {
      itPlayer = null;
      pickRandomIt(); 
    }

    delete players[socket.id];

    if (Object.keys(players).length < 2) {
      gameRunning = false;

      if (Object.keys(players).length === 1) {
        const remainingId = Object.keys(players)[0];
        io.to(remainingId).emit("reloadPage");
      }
    }
  });
});

export { finishVoting };