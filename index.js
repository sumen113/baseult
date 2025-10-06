import { execSync } from "node:child_process";
import fs from "node:fs";
import express from "express";
import { ChemicalServer } from "chemicaljs";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

// --- Build Tag Online client if needed ---
if (!fs.existsSync("dist")) {
  console.log("No build folder found. Building...");
  execSync("pnpm run build");
  console.log("Built!");
}

const [nanoApp, nanoListen] = new ChemicalServer({ scramjet: false, rammerhead: false });
const PORT = process.env.PORT || 3000;

nanoApp.disable("x-powered-by");

// Serve both dist and public folders - do this BEFORE serveChemical()
nanoApp.use(express.static("dist", { index: "index.html", extensions: ["html"] }));
nanoApp.use(express.static("public"));

// Chemical server setup
nanoApp.serveChemical();

// Tag Online route handler
nanoApp.get("/", (req, res) => {
  if (fs.existsSync("dist/index.html")) {
    res.sendFile("index.html", { root: "dist" });
  } else {
    res.send("Tag Online server running");
  }
});
nanoApp.get("/tag-online", (req, res) => {
  res.sendFile("index.html", { root: "dist/tag-online" });
});

// SPA fallback
nanoApp.use((req, res) => res.status(404).sendFile("dist/index.html", { root: "." }));


// --- Start Nano normally ---
nanoListen(PORT, () => {
  console.log(`Server listening on port ${PORT} (Nano + Tag Online)`);
});

// --- ✅ Create a separate HTTP server for Socket.IO ---
const ioServer = createServer();
const io = new Server(ioServer, {
    path: "/socket.io",
    cors: {
      origin: "http://localhost:3000", // allow your Nano client
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.emit("welcome", "Connected to Tag Online socket server!");
});

// Start Socket.IO server on a separate port (e.g., 3001)
const SOCKET_PORT = 3001;
ioServer.listen(SOCKET_PORT, () => {
  console.log(`Socket.IO server listening on port ${SOCKET_PORT}`);
});

  






const TICK_RATE = 60;
const GAME_DURATION = 180;
let jumpForce = -0.03; // replace const JUMP_FORCE
const TAG_COOLDOWN = 500; // milliseconds

// <-- ADD THESE (global scope)
const MOVE_ACCEL = 0.0006; // horizontal acceleration (per-tick scaling uses dt)

// Default gravity (used until a map sets it)
let gravity = 0.0008;


let portals = [];
const PORTAL_COOLDOWN = 20000; // 20 seconds


let players = {};

let lastUpdate = Date.now(); // 🆕 Track last physics update time

// 🆕 Special usernames and their secret passwords
const SPECIAL_USERNAMES = {
  "sumen": "9289867243Qq",
  "donaldtrumpy": "67isgood",
  "IShowMonkey": "applepenus67",
  "Clip God": "reyreyiscool",
  "Aura": "password67",
  "MonkeyDLuffy": "jamiemonkey",
  "SKILLZ": "jadie",
  "Goten":"jbhifi"
};

const MAP_NAMES = ["Grass", "Moon"];
// Predefined maps
const MAPS = [
  // Map 1
  [
    { x: 0, y: 0.89, w: 2.0, h: 0.03, type: "static" },

    // Bottom left
    { x: 0.05, y: 0.82, w: 0.25, h: 0.03, type: "static" },
    { x: 0.25, y: 0.70, w: 0.25, h: 0.03, type: "static" },
  
    // Bottom mid-right
    { x: 1.25, y: 0.82, w: 0.35, h: 0.03, type: "static" },
    { x: 1.00, y: 0.70, w: 0.25, h: 0.03, type: "static" },
  
    // Bottom slope (left side)
  
    // Mid platforms
    { x: 0.10, y: 0.56, w: 0.25, h: 0.03, type: "static" },
    { x: 0.55, y: 0.56, w: 0.55, h: 0.03, type: "static" },
    { x: 1.40, y: 0.56, w: 0.25, h: 0.03, type: "static" },
  
    // Upper mids
    { x: 0.20, y: 0.40, w: 0.25, h: 0.03, type: "static" },
    { x: 0.65, y: 0.40, w: 0.55, h: 0.03, type: "static" },
  
    // Top right slant
    { x: 1.50, y: 0.36, w: 0.25, h: 0.03, type: "static", angle: 0.25 },
  
    // Higher single platforms
    { x: 0.40, y: 0.28, w: 0.25, h: 0.03, type: "static" },
    { x: 1.15, y: 0.28, w: 0.25, h: 0.03, type: "static" },
  
    // Very top center
    { x: 0.80, y: 0.18, w: 0.35, h: 0.03, type: "static" }
  ],
  // Map 2
  // Map 2 (fun version)
  [
    { x: 0, y: 0.89, w: 2.0, h: 0.03, type: "static" }, // ground

    // Bottom left
    { x: 0.05, y: 0.75, w: 0.25, h: 0.03, type: "static" },
    { x: 0.30, y: 0.62, w: 0.25, h: 0.03, type: "static" },

    // Bottom right
    { x: 1.40, y: 0.75, w: 0.25, h: 0.03, type: "static" },
    { x: 1.10, y: 0.62, w: 0.25, h: 0.03, type: "static" },

    // Mid-center
    { x: 0.55, y: 0.48, w: 0.45, h: 0.03, type: "static" },
    
    // Upper-left
    { x: 0.20, y: 0.35, w: 0.25, h: 0.03, type: "static" },

    // Upper-right slant
    { x: 1.30, y: 0.35, w: 0.25, h: 0.03, type: "static"},

    // Top-center
    { x: 0.75, y: 0.20, w: 0.35, h: 0.03, type: "static" }
  ]
];

// Default
let platforms = MAPS[0];

let jumpPads = [
  { x: -0.07, y: 0.87, w: 0.08, h: 0.02, power: -0.04 }, // left side
  { x: 1.94, y: 0.87, w: 0.08, h: 0.02, power: -0.04 }  // right side
];

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

  setTimeout(finishVoting, 8000); // 8 seconds to vote
}


function finishVoting() {
  voting = false;
  let tally = new Array(MAPS.length).fill(0);
  Object.values(votes).forEach(v => tally[v]++);

  let max = Math.max(...tally);
  let winners = tally.map((v, i) => v === max ? i : -1).filter(i => i >= 0);

  let chosen = winners[Math.floor(Math.random() * winners.length)];
  platforms = MAPS[chosen];
  gravity = chosen === 1 ? 0.0006 : 0.0008;   // Moon has lower gravity
  jumpForce = chosen === 1 ? -0.015 : -0.025; // Moon has softer, slower jump
  io.emit("mapChosen", chosen);
  console.log("Map chosen:", MAP_NAMES[chosen]);
  io.emit("initGame");   // broadcast to all connected clients
  io.emit("state", { players, platforms, portals, jumpPads, gameRunning, itPlayer });


  startGame();
}

function startGame() {
  gameRunning = false;
  countdown = 4;
  timer = GAME_DURATION;
  pickRandomIt();
  spawnPortals();

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
    // 🆕 Start a fresh vote instead of reusing the old map
    startVoting();
  } else {
    gameRunning = false;
    itPlayer = null;
    portals = [];
    // Reset to default map so next player doesn't get stuck on last map
    platforms = MAPS[0];
  }
}

function spawnPortals() {
  if (platforms.length < 2) return;

  // Randomly pick two different platforms
  let firstIndex = Math.floor(Math.random() * platforms.length);
  let secondIndex;
  do {
    secondIndex = Math.floor(Math.random() * platforms.length);
  } while (secondIndex === firstIndex);

  const platformA = platforms[firstIndex];
  const platformB = platforms[secondIndex];

  portals = [
    {
      x: Math.random() * (platformA.x + platformA.w - platformA.x) + platformA.x, // center of platform
      y: platformA.y - 0.04,            // slightly above platform
      active: true
    },
    {
      x: Math.random() * (platformB.x + platformB.w - platformB.x) + platformB.x,
      y: platformB.y - 0.04,
      active: true
    }
  ];
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
  platforms.forEach(pl => {
    if (pl.type === "moving") {
      if (pl.direction === "horizontal") {
        pl.x += pl.speed * dt;
        if (Math.abs(pl.x - pl.originX) > pl.range) {
          pl.speed *= -1; // reverse direction
        }
      } else if (pl.direction === "vertical") {
        pl.y += pl.speed * dt;
        if (Math.abs(pl.y - pl.originY) > pl.range) {
          pl.speed *= -1; // reverse direction
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

    // Ground collision
    if (p.y + p.radius > 1 - groundHeight) {
      p.y = 1 - groundHeight - p.radius;
      p.vy = 0;
      p.onGround = true;
    }

    for (let id in players) {
      let p = players[id];
      if (!p) continue;
    
      // NEW: freeze check BEFORE gravity
      if (p.frozenUntil && Date.now() < p.frozenUntil) {
        p.vx = 0;
        p.vy = 0;
        continue; // skip gravity & movement entirely
      }
    }
    


    // Platform collisions
    // Platform collisions
    platforms.forEach(pl => {
      if (p.x + p.radius > pl.x && p.x - p.radius < pl.x + pl.w) {
        // Landing on platform (from above)
        if (p.y + p.radius > pl.y && p.y + p.radius < pl.y + pl.h + 0.01 && p.vy >= 0) {
          p.y = pl.y - p.radius;
          p.vy = 0;
          p.onGround = true;
        
          // If platform is moving horizontally, move player with it
          if (pl.type === "moving" && pl.direction === "horizontal") {
            p.x += pl.speed;
          }
        }        
        // Hitting head on platform (from below)
        else if (p.y - p.radius < pl.y + pl.h && p.y - p.radius > pl.y && p.vy < 0) {
          p.y = pl.y + pl.h + p.radius;
          p.vy = 0;
        }
      }
    });

    // Jump pad collisions
    jumpPads.forEach(jp => {
      if (
        p.x + p.radius > jp.x &&
        p.x - p.radius < jp.x + jp.w &&
        p.y + p.radius > jp.y &&
        p.y + p.radius < jp.y + jp.h + 0.01 &&
        p.vy >= 0
      ) {
        p.vy = jp.power; // apply strong jump force
      }
    });

    // Horizontal bounds
    // Horizontal motion & jump handling (deterministic, per-tick)
    const FRICTION = 0.85; // tweak for slipperiness (0.85 is slightly slippery)
    const MAX_SPEED = 0.35; // keep in sync with MOVE_ACCEL clamp above

    // Apply horizontal acceleration from input (scale by dt so it's frame-rate independent)
    if (p.input) {
      if (p.input.left)  p.vx -= MOVE_ACCEL * dt;
      if (p.input.right) p.vx += MOVE_ACCEL * dt;
    }

    // Apply jump only once when queued and onGround
    if (p.input && p.input.jump) {
      if (p.onGround) {
        p.vy = jumpForce;
        p.onGround = false;
      }
      // consume the jump request so it doesn't repeat
      p.input.jump = false;
    }

    // Clamp horizontal speed to avoid runaway differences
    if (p.vx > MAX_SPEED) p.vx = MAX_SPEED;
    if (p.vx < -MAX_SPEED) p.vx = -MAX_SPEED;

    // Move player horizontally and apply friction (scaled by dt)
    p.x += p.vx * dt;
    p.vx *= Math.pow(FRICTION, dt);

    // Monkey grapple glide
    if (p.class === "monkey" && p.grappling && p.grappleTarget) {
      const dx = p.grappleTarget.x - p.x;
      const dy = p.grappleTarget.y - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < 0.02) {
        // Arrived
        p.x = p.grappleTarget.x;
        p.y = p.grappleTarget.y;
        p.vx = 0;
        p.vy = 0;
        p.grappling = false;
        p.grappleTarget = null;
      } else {
        // Glide movement (smooth)
        const speed = 0.03 * dt;
        p.x += (dx / dist) * speed;
        p.y += (dy / dist) * speed;
        p.vx = 0;
        p.vy = 0;
      }
    }
    // Alien abduct glide
    if (p.abducting && p.abductTarget) {
      const dx = p.abductTarget.x - p.x;
      const dy = p.abductTarget.y - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < 0.02) {
        // Arrived
        p.x = p.abductTarget.x;
        p.y = p.abductTarget.y;
        p.vx = 0;
        p.vy = 0;
        p.abducting = false;
        p.abductTarget = null;
      } else {
        // Smooth glide
        const speed = 0.02 * dt;

        p.x += (dx / dist) * speed;
        p.y += (dy / dist) * speed;
        p.vx = 0;
        p.vy = 0;
      }
    }
    

    // Keep player inside bounds
    const WORLD_WIDTH = 2.0;
    p.x = Math.max(p.radius, Math.min(WORLD_WIDTH - p.radius, p.x));
    

    // Check portal collisions
    if (portals.length === 2 && portals[0].active && portals[1].active) {
      const [p1, p2] = portals;
      const TELEPORT_RADIUS = 0.03;

      // If player touches portal 1
      if (Math.abs(p.x - p1.x) < TELEPORT_RADIUS && Math.abs(p.y - p1.y) < TELEPORT_RADIUS) {
        p.x = p2.x;
        p.y = p2.y - 0.05; // Offset so they don't instantly collide
        portals[0].active = false;
        portals[1].active = false;
        setTimeout(spawnPortals, PORTAL_COOLDOWN);
      }

      // If player touches portal 2
      else if (Math.abs(p.x - p2.x) < TELEPORT_RADIUS && Math.abs(p.y - p2.y) < TELEPORT_RADIUS) {
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
  }

  // Tag logic with cooldown
  if (itPlayer && gameRunning) {
    const it = players[itPlayer];
    for (let id in players) {
      if (id === itPlayer) continue;
      const p = players[id]; 
      const dx = it.x - p.x;
      const dy = it.y - p.y;
      const distance = Math.sqrt(dx*dx + dy*dy);

      if (distance < it.hitRadius + p.hitRadius && now - (it.lastTagged || 0) > TAG_COOLDOWN) {
        // Transfer 'It'
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
  if (frameTime > 250) frameTime = 250; // avoid spiral of death
  lastUpdate = now;

  accumulator += frameTime;

  while (accumulator >= MS_PER_TICK) {
    const dt = 1; // always fixed step = 1 tick
    movePlatforms(dt);
    applyPhysics(dt);
    accumulator -= MS_PER_TICK;
  }

  io.emit("state", { players, platforms, portals, jumpPads, gameRunning, itPlayer });
}, 1000 / TICK_RATE);


io.on("connection", socket => {
  socket.on("join", ({ name, password, class: playerClass }) => {
    let inputName = (name || "").trim();
    let inputPass = (password || "").trim();
    let finalName = inputName;

    // ✅ Support "username:password" in the name box
    if (inputName.includes(":")) {
      const parts = inputName.split(":");
      inputName = parts[0].trim();
      inputPass = parts[1]?.trim() || "";
    }

    // Check if the entered name OR password matches a special username
    let matched = false;

    // Check for special usernames
    for (let special in SPECIAL_USERNAMES) {
      const correctPass = SPECIAL_USERNAMES[special];

      // Check if someone else is already using this reserved username
      const taken = Object.values(players).some(p => p.name === special);

      if (inputName.toLowerCase() === special.toLowerCase() && inputPass === correctPass) {
        finalName = taken ? "COPYCAT" : special; // assign if not taken
        matched = true;
        break;
      }

      // typed password directly in the name box
      if (inputName === correctPass) {
        finalName = taken ? "COPYCAT" : special;
        matched = true;
        break;
      }

      // typed reserved username but wrong password
      if (inputName.toLowerCase() === special.toLowerCase() && inputPass !== correctPass) {
        finalName = "COPYCAT";
        matched = true;
        break;
      }
    }

    // Fallback for empty or unmatched names
    if (!matched && finalName === "") finalName = "Guest" + Math.floor(Math.random() * 1000);

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
      color: (finalName.toLowerCase() === "sumen") 
        ? "#1fd128" 
        : (finalName.toLowerCase() === "ishowmonkey") 
          ? "red" 
          : (finalName.toLowerCase() === "donaldtrumpy") 
            ? "#FFD700" 
            : "white",
      // <-- NEW: store current input state per-player
      input: { left: false, right: false, jump: false }
    };     

    // Send current game state immediately so they see the map

    // 🆕 Tell client to transition background even if no voting happened

    socket.on("voteMap", index => {
      if (voting && index >= 0 && index < MAPS.length) {
        votes[socket.id] = index;

        // send updated tally to everyone
        let tally = new Array(MAPS.length).fill(0);
        Object.values(votes).forEach(v => tally[v]++);
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
      socket.emit("initGame");   // broadcast to all connected clients
    }    
  });

  socket.on("inputState", state => {
    const p = players[socket.id];
    if (!p) return;
    p.input.left  = !!state.left;
    p.input.right = !!state.right;
    if (state.jump) p.input.jump = true;
  });
  

  // Expecting simple strings from client. We accept both "left"/"right"/"jump"
  // and also "leftDown"/"leftUp"/"rightDown"/"rightUp" for keydown/keyup designs.
  // Replace existing socket.on("move", ...) with this robust handler
  socket.on("move", action => {
    const p = players[socket.id];
    if (!p) return;

    // Debug (remove or comment out after verifying behavior)
    // console.log('move action from', socket.id, action, 'before', p.input, 'vx', p.vx.toFixed(4));

    // Treat these as hold/release input (recommended for keyboard)
    if (action === "leftDown" || action === "leftPress") p.input.left = true;
    else if (action === "leftUp" || action === "leftRelease" || action === "leftStop") p.input.left = false;

    if (action === "rightDown" || action === "rightPress") p.input.right = true;
    else if (action === "rightUp" || action === "rightRelease" || action === "rightStop") p.input.right = false;

    // If client only sends "left" / "right" (click-style), treat them as short impulses:
    // a single click will nudge velocity immediately so players who click can still move.
    if (action === "left" && !p.input.left) {
      // small immediate impulse (not frame-scaled) so click->move feels responsive
      p.vx -= MOVE_ACCEL * 8;
    } else if (action === "right" && !p.input.right) {
      p.vx += MOVE_ACCEL * 8;
    }

    // Some clients send 'stop' to clear both directions
    if (action === "stop") {
      p.input.left = false;
      p.input.right = false;
    }

    // Jump: still queue and consume inside applyPhysics
    if (action === "jump") {
      p.input.jump = true;
    }

    // Debug (uncomment to watch state after handling)
    // console.log('after', p.input, 'vx', p.vx.toFixed(4));
  });

  socket.on("useAbility", () => {
  const p = players[socket.id];
  if (!p) return;

  if (p.class === "ninja") {
    p.invisibleUntil = Date.now() + 5000; // 5s invisibility
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
    // Tell ALL other players to show confetti for 5s
    socket.broadcast.emit("confetti", { duration: 5000 });
  }

  if (p.class === "snowman") {
  // Freeze ALL other players for 3s
    io.emit("freeze", { 
      duration: 3000, 
      userId: socket.id // tell everyone who triggered it
    });  
  
    // Optionally mark them frozen server-side too
    for (let id in players) {
      if (id !== socket.id) {
        players[id].frozenUntil = Date.now() + 3000;
      }
    }
  }
  if (p.class === "mole") {
    // Find the *closest* platform directly under the mole
    let platformBelow = null;
    let minY = Infinity;

    for (let pl of platforms) {
      const isBelow = 
        p.x > pl.x && 
        p.x < pl.x + pl.w &&          // mole is horizontally within platform
        p.y + p.radius <= pl.y + 0.01 && // platform is below mole
        pl.y < 0.95;                  // exclude bottom ground

      if (isBelow && pl.y < minY) {
        minY = pl.y;
        platformBelow = pl;
      }
    }

    if (platformBelow) {
      // Move mole just under that platform
      p.y = platformBelow.y + platformBelow.h + p.radius + 0.01;
      p.vy = 0.01; // small push down
    }
  }
  if (p.class === "alien") {
    // Pick a random other player
    const otherIds = Object.keys(players).filter(id => id !== socket.id);
    if (otherIds.length === 0) return; // no one else to abduct
    const targetId = otherIds[Math.floor(Math.random() * otherIds.length)];
    const target = players[targetId];

    // Choose a random destination on the map
    const destPlatform = platforms[Math.floor(Math.random() * platforms.length)];
    const destX = destPlatform.x + destPlatform.w * Math.random();
    const destY = destPlatform.y - target.radius - 0.01;

    // Mark abduct state
    target.abducting = true;
    target.abductTarget = { x: destX, y: destY };

    // Tell everyone to render abduction effect
    io.emit("abductStart", { id: targetId });
  }
  if (p.class === "scientist") {
    if (!p.shrunk) { // prevent stacking
      p.shrunk = true;
      p.radius *= 0.5;     // shrink body size
      p.hitRadius *= 0.5;  // shrink hitbox

      // reset after 10s
      setTimeout(() => {
        if (players[socket.id]) {
          players[socket.id].radius /= 0.5
          players[socket.id].hitRadius /= 0.5;
          players[socket.id].shrunk = false;
        }
      }, 10000);
    }
  }
});  

  socket.on("disconnect", () => {
  if (itPlayer === socket.id) {
    itPlayer = null; 
    pickRandomIt(); // pick a new one if possible
  }

  delete players[socket.id];

  if (Object.keys(players).length < 2) {
    gameRunning = false;

    // 🆕 if exactly one player remains, reload their page
    if (Object.keys(players).length === 1) {
      const remainingId = Object.keys(players)[0];
      io.to(remainingId).emit("reloadPage");
    }
  }
});
});