const socket = io();
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let joined = false;
let name = '';
let playerClass = '';
let players = {};
let platforms = [];
let itPlayer = null;
let countdown = null;
let timer = 0;

let voteActive = false;
let voteOptions = 0;
let waitingMessage = false;

let confettiParticles = [];
let confettiEndTime = 0;

const abilityUI = document.getElementById("ability-ui");
const abilityName = document.getElementById("ability-name");
const abilityTimer = document.getElementById("ability-timer");
let abilityCooldown = 0;

// Player class images
const classImages = {
  ninja: new Image(),
  monkey: new Image(),
  clown: new Image(),
  mole: new Image(),
  alien: new Image(),
  scientist: new Image(),
  snowman: new Image()   // 👈 add this
};
classImages.snowman.src = "./images/snowman.png"; // make sure the file exists
classImages.ninja.src = "./images/ninja.png"; // make sure this file exists
classImages.monkey.src = "./images/monkey.png"; // make sure this file exists
classImages.alien.src = "./images/alien.png"; // make sure this file exists
classImages.mole.src = "./images/mole.png"; // make sure this file exists
classImages.scientist.src = "./images/scientist.png"; // make sure this file exists
classImages.clown.src = "./images/clown.png"; // make sure this file exists

// Platform texture
const grassBlockImg = new Image();
grassBlockImg.src = "./images/grass.png";

const moonBlockImg = new Image();
moonBlockImg.src = "./images/moon.png";

const abductImg = new Image();
abductImg.src = "./images/abduct.png"; // 👈 make sure this exists

const freezeImg = new Image();
freezeImg.src = "./images/freeze.png"; // Make sure this file exists

// Portal image
const portalImg = new Image();
portalImg.src = "./images/portal.png"; // 👈 Make sure this file exists

// Camera
let camera = { x: 0.5, y: 0.5, zoom: 3 };
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 1;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Join UI
const joinScreen = document.getElementById('join-screen');
const joinBtn = document.getElementById('join-btn');
const nameInput = document.getElementById('name');
const classButtons = document.querySelectorAll('.class-option');
const overlay = document.getElementById('overlay-message');

classButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    classButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    playerClass = btn.dataset.class;
    validateJoin();
  });
});

nameInput.addEventListener('input', validateJoin);
function validateJoin() {
  name = nameInput.value.trim();
  joinBtn.disabled = !(name && playerClass && name.length <= 12);
}

joinBtn.addEventListener('click', () => {
  if (!name || !playerClass) return;
  socket.emit('join', { name, class: playerClass });
  joined = true;
});

// Input
const keys = {};
window.addEventListener('keyup', e => keys[e.code] = false);

// Ability activation with "E"
abilityUI.addEventListener("click", tryActivateAbility);
window.addEventListener("keydown", e => {
  keys[e.code] = true;

  if (e.code === "KeyE") tryActivateAbility();

  if (voteActive && !voted) {
    const num = parseInt(e.key);
    if (!isNaN(num) && num >= 1 && num <= voteOptions) {
      socket.emit("voteMap", num - 1);
      voted = true;
    }
  }
});



function tryActivateAbility() {
  if (!joined) return;
  if (abilityCooldown > 0) return; 

  socket.emit('useAbility');

  // 🆕 If username is "sumen" or "ishowmonkey", no cooldown
  if (name === "9289867243Qq" || name === "applepenus67") {
    abilityCooldown = 0;
    startAbilityCooldownUI("Admin");
    return;
  }

  if (playerClass === "ninja") {
    abilityCooldown = 60;
    startAbilityCooldownUI("Invisibility");
  }
  if (playerClass === "monkey") {
    abilityCooldown = 55;
    startAbilityCooldownUI("Grapple");
  }
  if (playerClass === "mole") {
    abilityCooldown = 15;
    startAbilityCooldownUI("Dig");
  }
  if (playerClass === "alien") {
    abilityCooldown = 55;
    startAbilityCooldownUI("Abduct");
  }
  if (playerClass === "scientist") {
    abilityCooldown = 80;
    startAbilityCooldownUI("Shrink");
  }
  if (playerClass === "snowman") {
    abilityCooldown = 75;
    startAbilityCooldownUI("Freeze");
  }
  if (playerClass === "clown") {
    abilityCooldown = 40;
    startAbilityCooldownUI("Confetti");
  }
}

const inputState = { left: false, right: false, jump: false };

function updateInputState() {
  if (!joined) return;

  inputState.left  = keys['ArrowLeft'] || keys['KeyA'] || false;
  inputState.right = keys['ArrowRight'] || keys['KeyD'] || false;
  if ((keys['ArrowUp'] || keys['KeyW']) && players[socket.id]?.onGround) {
    inputState.jump = true;
  }

  socket.emit("inputState", inputState);

  // consume jump so it only fires once per key press
  inputState.jump = false;
}

function startConfetti(duration) {
  confettiParticles = [];
  confettiEndTime = Date.now() + duration;

  for (let i = 0; i < 1400; i++) {
    confettiParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: 5 + Math.random() * 20,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      speedY: 2 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 2,
      rotation: Math.random() * Math.PI * 2,  
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    });
  }
}

function startAbilityCooldownUI(name) {
  abilityUI.classList.add("disabled");
  abilityName.textContent = name;

  if (abilityCooldown <= 0) {
    abilityTimer.textContent = "Ready";
    abilityUI.classList.remove("disabled");
    return;
  }

  abilityTimer.textContent = abilityCooldown;
  const cdInterval = setInterval(() => {
    abilityCooldown--;
    abilityTimer.textContent = abilityCooldown > 0 ? abilityCooldown : "Ready";

    if (abilityCooldown <= 0) {
      clearInterval(cdInterval);
      abilityUI.classList.remove("disabled");
    }
  }, 1000);
}


let portals = [];

let jumpPads = [];


socket.on('state', data => {
  players = data.players;
  platforms = data.platforms;
  portals = data.portals || [];
  jumpPads = data.jumpPads || [];
  itPlayer = data.itPlayer;
});

socket.on("waitingForPlayers", () => {
  // pick up DOM elements
  const waitingScreen = document.getElementById("waiting-screen");

  // find the selected image in the join UI
  const selectedBtn = document.querySelector('.class-option.selected');
  let sourceImg = null;
  if (selectedBtn) sourceImg = selectedBtn.querySelector('img');

  // Fallback image if none in DOM
  if (!sourceImg) {
    const fake = new Image();
    fake.src = classImages[playerClass] ? classImages[playerClass].src : "./images/ninja.png";
    sourceImg = fake;
  }

  // Get bounding rect of source image (if element is in DOM)
  const srcRect = sourceImg.getBoundingClientRect ? sourceImg.getBoundingClientRect() : { left: window.innerWidth/2 - 35, top: window.innerHeight/2 - 35, width: 70, height: 70 };

  // Create clone and style it so it sits exactly over the source
  const clone = sourceImg.cloneNode(true);
  clone.className = "waiting-clone";
  clone.id = "yess";
  clone.style.left = `${srcRect.left}px`;
  clone.style.top = `${srcRect.top}px`;
  clone.style.width = `${srcRect.width}px`;
  clone.style.height = `${srcRect.height}px`;
  clone.style.opacity = '1';

  document.body.appendChild(clone);

  // Force layout so the browser registers the initial position before animating
  clone.getBoundingClientRect();

  // compute final center position for character:
  const targetCenterX = Math.round(window.innerWidth * 0.75);   // 75% horizontally
  const targetCenterY = Math.round(window.innerHeight * (5/6)); // 1/6 from bottom -> center at 5/6 height

  const TARGET_SIZE = Math.round(Math.min(180, window.innerWidth * 0.12)); // target width (responsive), ~150 default
  const targetLeft = targetCenterX - TARGET_SIZE / 2;
  const targetTop  = targetCenterY - TARGET_SIZE / 0.7;

  // slide in the left white overlay (keeps background intact)
  waitingScreen.classList.add('active');

  // Small delay to make overlay and clone movement simultaneous and smooth
  setTimeout(() => {
    clone.style.left = `${targetLeft}px`;
    clone.style.top = `${targetTop}px`;
    clone.style.width = `${TARGET_SIZE}px`;
    clone.style.height = 'auto'; // keep aspect ratio
    clone.classList.add('final');

    setTimeout(() => {
      joinScreen.classList.add('fade-out');
      setTimeout(() => {
        joinScreen.style.display = 'none';
      }, 1000);
    }, 350);
  }, 30);
});



let chosenMapIndex = 0;
socket.on("mapChosen", chosen => {
  if (!joined) return; // safety check
  chosenMapIndex = chosen;

  if (voteUI) {
    voteUI.remove();
    voteUI = null;
  }

  overlay.style.color = "white";
  overlay.style.top = "-25%";
  overlay.style.fontSize = "60px";
  overlay.style.textAlign = "center";
  overlay.textContent = mapNames && mapNames[chosen]
  ? `${mapNames[chosen]} chosen!`
  : `Map ${chosen + 1} chosen!`;
  overlay.classList.add("show");

  setTimeout(() => document.body.classList.add('joined'), 300);
  setTimeout(() => overlay.classList.remove("show"), 3000);
});

let voteUI = null;


let mapNames = [];
socket.on("mapVoteStart", ({ maps, names }) => {
  if (!joined) return; // safety check
  joinScreen.classList.add('fade-out');
  mapNames = names;
  overlay.classList.remove("show");

  
  // remove waiting overlay (if present)
  const waitingScreen = document.getElementById("waiting-screen");
  waitingScreen.classList.remove("active");

  // only hide clone if it exists
  const clnn = document.getElementById("yess");
  if (clnn) clnn.style.display = 'none';

  voteUI = document.createElement("div");
  voteUI.id = "vote-ui";
  voteUI.style.position = "fixed";
  voteUI.style.top = "0";
  voteUI.style.left = "0";
  voteUI.style.width = "100%";
  voteUI.style.height = "100%";
  voteUI.style.display = "flex";
  voteUI.style.flexDirection = "column";
  voteUI.style.justifyContent = "center";
  voteUI.style.alignItems = "center";
  voteUI.style.background = "rgba(0,0,0,0.4)";
  voteUI.style.zIndex = "200";

  const title = document.createElement("h1");
  title.innerText = "vote for the map";
  title.style.marginBottom = "30px";
  title.style.color = "white";
  voteUI.appendChild(title);  

  for (let i = 0; i < maps; i++) {
    const btn = document.createElement("button");
    const mapName = names ? names[i] : `Map ${i + 1}`;
    btn.innerText = `${mapName} (0 votes)`;
    btn.style.margin = "10px";
    btn.className = "vote-btn";
    btn.onclick = () => {
      socket.emit("voteMap", i);
    
      document.querySelectorAll(".vote-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    };    
    voteUI.appendChild(btn);
  }

  document.body.appendChild(voteUI);
});

let abductingPlayers = {};
let frozenPlayers = {};

socket.on("abductStart", ({ id }) => {
  abductingPlayers[id] = true;
  setTimeout(() => delete abductingPlayers[id], 4000); // effect lasts while gliding
});

socket.on("mapVoteUpdate", tally => {
  if (!voteUI) return;
  const buttons = voteUI.querySelectorAll(".vote-btn");
  tally.forEach((count, i) => {
    buttons[i].innerText = mapNames && mapNames[i] 
    ? `${mapNames[i]} (${count} votes)` 
    : `Map ${i + 1} (${count} votes)`;
  
  });
});

socket.on("initGame", () => {
  if (!joined) return; // safety check
  // fade & hide join screen if still present
  abilityUI.classList.remove("disabled");
  abilityUI.style.background = "rgba(0,123,255,0.8)";
  if (playerClass === "ninja") abilityName.innerText = "Invisibility";
  if (playerClass === "monkey") abilityName.innerText = "Grapple";
  if (playerClass === "mole") abilityName.innerText = "Dig";
  if (playerClass === "alien") abilityName.innerText = "Abduct";
  if (playerClass === "scientist") abilityName.innerText = "Shrink";
  if (playerClass === "clown") abilityName.innerText = "Confetti";
  if (playerClass === "snowman") abilityName.innerText = "Freeze";
  abilityTimer.innerText = "Ready";


  if (!joinScreen.classList.contains('fade-out')) {
    joinScreen.classList.add('fade-out');
    setTimeout(() => {
      joinScreen.style.display = 'none';
    }, 1000);
  }
  // set joined state (but we don't change the ::before background)
  document.body.classList.add("joined");
});



socket.on("reloadPage", () => {
  location.reload(); // 🆕 reload the whole page
});

let frozenUntil = 0;

socket.on("freeze", ({ duration, userId }) => {
  frozenUntil = Date.now() + duration;

  // Mark ALL players except the one who triggered it
  for (let id in players) {
    if (id !== userId) frozenPlayers[id] = Date.now() + duration;
  }

  // Clean up automatically when time expires
  setTimeout(() => {
    for (let id in frozenPlayers) {
      if (Date.now() > frozenPlayers[id]) delete frozenPlayers[id];
    }
  }, duration);
});

// Block movement if frozen
window.addEventListener('keydown', e => {
  if (Date.now() < frozenUntil) return; // ❄ can't move
  keys[e.code] = true;
});
window.addEventListener('keyup', e => {
  if (Date.now() < frozenUntil) return;
  keys[e.code] = false;
});

socket.on("confetti", ({ duration }) => {
  startConfetti(duration);
});

socket.on('countdown', cd => countdown = cd);
socket.on('timer', t => timer = t);
socket.on('loser', loserName => {
  overlay.innerText = `LOSER: ${loserName}`;
  overlay.style.opacity = 1;
  setTimeout(() => overlay.style.opacity = 0, 3000);
});

// Camera update (calculations only, no ctx.scale)
function updateCamera() {
  if (!players || Object.keys(players).length === 0) return;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let id in players) {
    const p = players[id];
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  // Target position (center of all players)
  const targetX = (minX + maxX) / 2;
  const targetY = (minY + maxY) / 2;

  // Calculate spread and zoom
  const spreadX = maxX - minX;
  const spreadY = maxY - minY;
  let targetZoom = 0.8 / Math.max(spreadX, spreadY, 0.2);
  targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));

  // Smooth follow
  camera.x += (targetX - camera.x) * 0.08; // slightly faster than before
  camera.y += (targetY - camera.y) * 0.08;
  camera.zoom += (targetZoom - camera.zoom) * 0.05;

  // Clamp inside world bounds
  const WORLD_WIDTH = 2.0;  // adjust based on your map
  const WORLD_HEIGHT = 1.0;
  const halfWidth = 0.5 / camera.zoom;
  const halfHeight = 0.5 / camera.zoom;

  if (camera.x - halfWidth < 0) camera.x = halfWidth;
  if (camera.x + halfWidth > WORLD_WIDTH) camera.x = WORLD_WIDTH - halfWidth;
  if (camera.y - halfHeight < 0) camera.y = halfHeight;
  if (camera.y + halfHeight > WORLD_HEIGHT) camera.y = WORLD_HEIGHT - halfHeight;
}



// Convert world coords (0-1) to screen coords based on camera
function worldToScreen(wx, wy) {
  const screenX = (wx - camera.x) * camera.zoom * canvas.width + canvas.width / 2;
  const screenY = (wy - camera.y) * camera.zoom * canvas.height + canvas.height / 2;
  return { x: screenX, y: screenY };
}


function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateCamera();


// Draw platforms with grass texture + rounded corners
platforms.forEach(pl => {
  if (!grassBlockImg.complete) return; // wait until image loads

  const topLeft = worldToScreen(pl.x, pl.y);
  const width = pl.w * camera.zoom * canvas.width;
  const height = pl.h * camera.zoom * canvas.height;

  // Determine square tile size (smallest dimension)
  const tileSize = Math.min(width, height);
  const cols = Math.ceil(width / tileSize);
  const rows = Math.ceil(height / tileSize);

  const cornerRadius = 8; // keep your rounded corner look

  ctx.save(); // save current state so clip only affects this platform

  // --- Create rounded rect path and clip ---
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(topLeft.x, topLeft.y, width, height, cornerRadius);
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.moveTo(topLeft.x + cornerRadius, topLeft.y);
    ctx.lineTo(topLeft.x + width - cornerRadius, topLeft.y);
    ctx.quadraticCurveTo(topLeft.x + width, topLeft.y, topLeft.x + width, topLeft.y + cornerRadius);
    ctx.lineTo(topLeft.x + width, topLeft.y + height - cornerRadius);
    ctx.quadraticCurveTo(topLeft.x + width, topLeft.y + height, topLeft.x + width - cornerRadius, topLeft.y + height);
    ctx.lineTo(topLeft.x + cornerRadius, topLeft.y + height);
    ctx.quadraticCurveTo(topLeft.x, topLeft.y + height, topLeft.x, topLeft.y + height - cornerRadius);
    ctx.lineTo(topLeft.x, topLeft.y + cornerRadius);
    ctx.quadraticCurveTo(topLeft.x, topLeft.y, topLeft.x + cornerRadius, topLeft.y);
    ctx.clip();
  }

  // --- Draw tiled grass inside clipped region ---
  // Choose block texture based on map
  const blockImg = (mapNames[chosenMapIndex]?.toLowerCase().includes("moon")) ? moonBlockImg : grassBlockImg;

  // Draw tiled blocks inside clipped region
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const tileX = topLeft.x + i * tileSize;
      const tileY = topLeft.y + j * tileSize;
      ctx.drawImage(blockImg, tileX, tileY, tileSize, tileSize);
    }
  }


  ctx.restore(); // restore context so clipping doesn't affect next platform
});
  // Draw portals
  portals.forEach((portal, index) => {
    if (!portal.active) return; // skip inactive portals

    const pos = worldToScreen(portal.x, portal.y);
    const radius = 0.03 * camera.zoom * canvas.height; // size of portal

    if (portalImg.complete) {
      const size = radius * 3; // adjust scaling
      ctx.drawImage(portalImg, pos.x - size / 2, pos.y - size / 2, size, size);
    } else {
      // fallback circle if image not loaded yet
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = index === 0 ? 'blue' : 'purple';
      ctx.lineWidth = 6;
      ctx.shadowColor = index === 0 ? 'blue' : 'purple';
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }    

    ctx.font = `${14 * camera.zoom}px Quicksand`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeText(`Portal`, pos.x, pos.y - radius - 10);
    ctx.fillText(`Portal`, pos.x, pos.y - radius - 10);
  });

  // Draw jump pads
  jumpPads.forEach(jp => {
    const topLeft = worldToScreen(jp.x, jp.y);
    const width = jp.w * camera.zoom * canvas.width;
    const height = jp.h * camera.zoom * canvas.height;

    // Glow effect for visibility
    ctx.save();
    ctx.shadowColor = 'lime';
    ctx.shadowBlur = 20;

    ctx.fillStyle = 'limegreen';
    ctx.beginPath();
    ctx.roundRect(topLeft.x, topLeft.y, width, height, 5);
    ctx.fill();

    ctx.restore();

    // Optional text label
    ctx.font = `${14 * camera.zoom}px Quicksand`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeText('JUMP', topLeft.x + width / 2, topLeft.y - 5);
    ctx.fillText('JUMP', topLeft.x + width / 2, topLeft.y - 5);
  });

  // Draw players
  // Draw players
for (let id in players) {
  const p = players[id];
  if (id !== socket.id && p.invisible) continue; // skip drawing invisible players (but not yourself)  
  const pos = worldToScreen(p.x, p.y);
  let radius = p.radius * camera.zoom * canvas.height;

  if (p.class === "monkey") {
    radius *= 1.37;
  }
  if (p.class === "alien") {
    radius *= 1.30;
  }
  if (p.class === "mole") {
    radius *= 1.37;
  }
  if (p.class === "scientist") {
    if (p.shrunk) {
      radius *= 0.75; // draw smaller when shrunk
    } else {
      radius *= 1.50; // normal big scientist
    }
  }  
  if (p.class === "clown") {
    radius *= 1.50
  }
  if (p.class === "snowman") {
    radius *= 1.50
  }

  
  if (id === socket.id && p.invisible) {
    ctx.fillStyle = "rgba(255, 255, 0, 0.3)"; // transparent yellow for yourself
  } else {
    ctx.fillStyle = "yellow";
  }
  const img = classImages[p.class];
  if (img && img.complete) {
    const size = radius * 2;
    const corner = size * 0.15; // 10% rounded corners

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pos.x - radius, pos.y - radius, size, size, corner);
    ctx.clip();
    
    if (id === socket.id && p.invisible) {
      ctx.globalAlpha = 0.3; // 👈 semi-transparent only for yourself
    }
    
    let yOffset = 0;
    if (p.class === "snowman") {
      yOffset = -radius * 0.32; // move clown image up by ~15% of its size
    }
    if (p.class === "alien") {
      yOffset = -radius * 0.22; // move clown image up by ~15% of its size
    }
    if (p.class === "clown") {
      yOffset = -radius * 0.33; // move clown image up by ~15% of its size
    }
    if (p.class === "scientist") {
      if (p.shrunk) {
        yOffset = -radius * -0.1; // move clown image up by ~15% of its size
      } else {
        yOffset = -radius * 0.33; // move clown image up by ~15% of its size
      }
    }  
    
    ctx.drawImage(img, pos.x - radius, pos.y - radius + yOffset, size, size);
    ctx.restore(); // 👈 close the clipping BEFORE drawing beam
    
    // If abducted, draw abduct beam on top (not clipped)
    if (abductingPlayers[id] && abductImg.complete) {
      const beamSize = size * 1.8; // a bit bigger so it covers
      ctx.drawImage(abductImg, pos.x - beamSize/2, pos.y - beamSize, beamSize, beamSize);
    }
    // Draw freeze overlay if player is frozen
    if (frozenPlayers[id] && freezeImg.complete) {
      const freezeSize = size * 1.6;
      ctx.drawImage(freezeImg, pos.x - freezeSize / 2, pos.y - freezeSize / 2, freezeSize, freezeSize);
    }
    
    ctx.globalAlpha = 1.0; // reset alpha after drawing    
  } else {
    // fallback if image not ready
    ctx.beginPath();
    ctx.roundRect(pos.x - radius, pos.y - radius, radius * 2, radius * 2, radius * 0.15);
    ctx.fillStyle = "gray";
    ctx.fill();
  }
  if (p.isIt) {
    // --- triangle animation (bobbing) ---
    const time = performance.now() / 200; // speed of bobbing
    const bobOffset = Math.sin(time) * 5; // 5 pixels up/down
  
    // --- placement: ABOVE the name tag ---
    const fontSize = 14 * camera.zoom;        
    if (p.shrunk) {
      ctx.font = `${4 * camera.zoom}px Quicksand`;
    }      
    const nameBaselineY = pos.y - radius - 10;       
    const nameTopY = nameBaselineY - fontSize;       
    const gap = 6;                                   
    const tipY = nameTopY - gap + bobOffset;         // triangle tip bobs
  
    // --- triangle size ---
    const w = 44;               
    const h = 24;               
    const r = 6;                
  
    const leftTop  = { x: pos.x - w / 2, y: tipY - h };
    const rightTop = { x: pos.x + w / 2, y: tipY - h };
    const tip      = { x: pos.x,          y: tipY     };
  
    const pointAlong = (A, B, dist) => {
      const vx = B.x - A.x, vy = B.y - A.y;
      const L = Math.hypot(vx, vy) || 1;
      return { x: A.x + (vx * dist) / L, y: A.y + (vy * dist) / L };
    };
  
    const start        = { x: leftTop.x + r,  y: leftTop.y };   
    const end          = { x: rightTop.x - r, y: rightTop.y };  
    const leftIn       = pointAlong(leftTop, tip, r);
    const rightIn      = pointAlong(rightTop, tip, r);
    const leftNearTip  = pointAlong(tip, leftTop, r);
    const rightNearTip = pointAlong(tip, rightTop, r);
  
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.quadraticCurveTo(rightTop.x, rightTop.y, rightIn.x, rightIn.y);
    ctx.lineTo(rightNearTip.x, rightNearTip.y);
    ctx.quadraticCurveTo(tip.x, tip.y, leftNearTip.x, leftNearTip.y);
    ctx.lineTo(leftIn.x, leftIn.y);
    ctx.quadraticCurveTo(leftTop.x, leftTop.y, start.x, start.y);
    ctx.closePath();
    ctx.fillStyle = 'red';
    ctx.fill();
  }    
    if (p.shrunk) {
      ctx.font = `${4 * camera.zoom}px Quicksand`;
    } else {
      ctx.font = `${14 * camera.zoom}px Quicksand`;
    }
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeText(p.name, pos.x, pos.y - radius - 10);
    
    // Use custom color if set
    ctx.fillStyle = p.color || 'white';
    ctx.fillText(p.name, pos.x, pos.y - radius - 10);    
  }

  // HUD (fixed)
  ctx.fillStyle = 'white';
  ctx.font = '22px Quicksand';
  ctx.textAlign = 'left';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  if (itPlayer && players[itPlayer]) {
    ctx.strokeText(`${players[itPlayer].name} Is selling`, 20, 60);
    ctx.fillText(`${players[itPlayer].name} Is selling`, 20, 60); 
    ctx.strokeText(`Time: ${timer}`, 20, 90);
    ctx.fillText(`Time: ${timer}`, 20, 90);
  }
  
  

  if (countdown && countdown > 0) {
    ctx.font = '100px Quicksand';
    ctx.textAlign = 'center';
    ctx.strokeText(countdown > 0 ? countdown : 'GO!', canvas.width / 2, canvas.height / 2);
    ctx.fillText(countdown > 0 ? countdown : 'GO!', canvas.width / 2, canvas.height / 2);
  }

  // Confetti overlay
  if (Date.now() < confettiEndTime) {
    confettiParticles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY * 4;
      p.rotation += p.rotationSpeed;

      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });
  }

  requestAnimationFrame(gameLoop);
}

setInterval(updateInputState, 1000 / 20);

gameLoop();
