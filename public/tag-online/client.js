function getUnlockedClasses() {
  const saved = localStorage.getItem("unlockedClasses");
  return saved ? JSON.parse(saved) : ["ninja"];
}

function saveUnlockedClasses(classes) {
  localStorage.setItem("unlockedClasses", JSON.stringify(classes));
}

let unlockedClasses = getUnlockedClasses();

const unlocked = new Set(unlockedClasses);

const allClasses = [
  "ninja",
  "monkey",
  "clown",
  "snowman",
  "mole",
  "alien",
  "scientist",
  "samurai",
];

const hasLocked = allClasses.some((c) => !unlocked.has(c));

const root = document.getElementById("app-root");

// Load different HTML structure depending on lock state
if (hasLocked) {
  root.innerHTML = `
    <style>
      /* Define the hover style using the CSS variable */
      .class-option {
        transform: scale(1);
      }
      .class-option:hover {
        transform: scale(1.15);
      }
    </style>
    <div id="join-screen">
    <h1>TAG ONLINE</h1>
    <input id="name" type="text" maxlength="12" placeholder="Enter your name">
    <div class="class-choices">
      <button class="class-option" data-class="ninja">
        <img src="images/ninja.png" alt="Ninja">
      </button>
      <button class="class-option" data-class="monkey">
        <img src="images/monkey.png" alt="Monkey">
      </button>
      <button class="class-option" data-class="clown">
        <img src="images/clown.png" alt="clown">
      </button>
      <button class="class-option" data-class="snowman">
        <img src="images/snowman.png" alt="snowman">
      </button>
      <button class="class-option" data-class="mole">
        <img src="images/mole.png" alt="mole">
      </button>
      <button class="class-option" data-class="alien">
        <img src="images/alien.png" alt="alien">
      </button>
      <button class="class-option" data-class="scientist">
        <img src="images/scientist.png" alt="scientist">
      </button>
      <button class="class-option" data-class="samurai">
        <img src="images/samurai.png" alt="samurai">
      </button>
    </div>
  
    <button id="join-btn" disabled>Join</button>
  </div>

  <canvas id="game"></canvas>

  <div id="waiting-screen">
    <div class="wait-left"></div>
    <div class="wait-right">
      <div id="waiting-text">your waiting 4 more players. <br> it might take a bit
      </div>
    </div>
  </div>  

  <div id="ability-ui" class="disabled">
    <div id="ability-name">waiting...</div>
    <div id="ability-timer">Ready</div>
  </div>
  
  <div id="overlay-message"></div>

  <div id="unlock-overlay">
    <div class="unlock-frame"></div>
    <div class="unlock-strip"></div>
    <div class="unlock-text">Unlocking...</div>
  </div>
  `;
} else {
  // If all characters are unlocked, you can load your "full HTML" version here instead
  root.innerHTML = `
      <div id="join-screen">
    <h1>TAG ONLINE</h1>
    <input id="name" type="text" maxlength="12" placeholder="Enter your name">
    <div class="class-choices">
      <button data-copy="ninja" class="class-copys">
        <img src="images/ninja.png" alt="Ninja">
      </button>
      <button data-copy="monkey" class="class-copys">
        <img src="images/monkey.png" alt="Monkey">
      </button>
      <button data-copy="clown" class="class-copys">
        <img src="images/clown.png" alt="Clown">
      </button>
      <button data-copy="snowman" class="class-copys">
        <img src="images/snowman.png" alt="Snowman">
      </button>
      <button data-copy="mole" class="class-copys">
        <img src="images/mole.png" alt="Mole">
      </button>
      <button data-copy="alien" class="class-copys">
        <img src="images/alien.png" alt="Alien">
      </button>
      <button data-copy="scientist" class="class-copys">
        <img src="images/scientist.png" alt="Scientist">
      </button>
      <button data-copy="samurai" class="class-copys">
        <img src="images/samurai.png" alt="Samurai">
      </button>
    </div>
    <div class="class-choices">
    <div id="ninjadrop" class="dropdown">
        <button class="class-option" data-class="ninja">
          <img src="images/ninja.png" alt="Ninja">
        </button>
        <button class="class-option" data-class="ninja2">
          <img src="images/ninja2.png" alt="Ninja2">
        </button>
      </div>
      <div id="monkeydrop" class="dropdown">
        <button class="class-option" data-class="monkey">
          <img src="images/monkey.png" alt="Monkey">
        </button>
        <button class="class-option" data-class="monkey2">
          <img src="images/monkey2.png" alt="Monkey2">
        </button>
      </div>
      <div id="clowndrop" class="dropdown">
        <button class="class-option" data-class="clown">
          <img src="images/clown.png" alt="clown">
        </button>
        <button class="class-option" data-class="clown2">
          <img src="images/clown2.png" alt="clown2">
        </button>
      </div>
      <div id="snowmandrop" class="dropdown">
        <button class="class-option" data-class="snowman">
          <img src="images/snowman.png" alt="snowman">
        </button>
        <button class="class-option" data-class="snowman2">
          <img src="images/snowman2.png" alt="snowman2">
        </button>
      </div>
      <div id="moledrop" class="dropdown">
        <button class="class-option" data-class="mole">
          <img src="images/mole.png" alt="mole">
        </button>
        <button class="class-option" data-class="mole2">
          <img src="images/mole2.png" alt="mole2">
        </button>
      </div>
      <div id="aliendrop" class="dropdown">
        <button class="class-option" data-class="alien">
          <img src="images/alien.png" alt="alien">
        </button>
        <button class="class-option" data-class="alien2">
          <img src="images/alien2.png" alt="alien2">
        </button>
      </div>
      <div id="scientistdrop" class="dropdown">
        <button class="class-option" data-class="scientist">
          <img src="images/scientist.png" alt="scientist">
        </button>
        <button class="class-option" data-class="scientist2">
          <img src="images/scientist2.png" alt="scientist2">
        </button>
      </div>
      <div id="samuraidrop" class="dropdown">
        <button class="class-option" data-class="samurai">
          <img src="images/samurai.png" alt="samurai">
        </button>
        <button class="class-option" data-class="samurai2">
          <img src="images/samurai2.png" alt="samurai2">
        </button>
      </div>
    </div>

    
  
    <button id="join-btn" disabled>Join</button>
  </div>

  <canvas id="game"></canvas>

  <div id="waiting-screen">
    <div class="wait-left"></div>
    <div class="wait-right">
      <div id="waiting-text">your waiting 4 more players. <br> it might take a bit
      </div>
    </div>
  </div>  

  <div id="ability-ui" class="disabled">
    <div id="ability-name">waiting...</div>
    <div id="ability-timer">Ready</div>
  </div>
  
  <div id="overlay-message"></div>

  <div id="unlock-overlay">
    <div class="unlock-frame"></div>
    <div class="unlock-strip"></div>
    <div class="unlock-text">Unlocking...</div>
  </div>
  `;
}

const socket = io();
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let joined = false;
let name = "";
let playerClass = "";
let players = {};
let platforms = [];
let itPlayer = null;
let countdown = null;
let timer = 0;

let voteActive = false;
let voteOptions = 0;

let confettiParticles = [];
let confettiEndTime = 0;

const abilityUI = document.getElementById("ability-ui");
const abilityName = document.getElementById("ability-name");
const abilityTimer = document.getElementById("ability-timer");
let abilityCooldown = 0;

const classImages = {
  ninja: new Image(),
  monkey: new Image(),
  clown: new Image(),
  mole: new Image(),
  alien: new Image(),
  scientist: new Image(),
  snowman: new Image(),
  samurai: new Image(),

  ninja2: new Image(),
  monkey2: new Image(),
  clown2: new Image(),
  mole2: new Image(),
  alien2: new Image(),
  scientist2: new Image(),
  snowman2: new Image(),
  samurai2: new Image(),
};
classImages.snowman.src = "./images/snowman.png";
classImages.ninja.src = "./images/ninja.png";
classImages.monkey.src = "./images/monkey.png";
classImages.alien.src = "./images/alien.png";
classImages.mole.src = "./images/mole.png";
classImages.scientist.src = "./images/scientist.png";
classImages.clown.src = "./images/clown.png";
classImages.samurai.src = "./images/samurai.png";

classImages.snowman2.src = "./images/snowman2.png";
classImages.ninja2.src = "./images/ninja2.png";
classImages.monkey2.src = "./images/monkey2.png";
classImages.alien2.src = "./images/alien2.png";
classImages.mole2.src = "./images/mole2.png";
classImages.scientist2.src = "./images/scientist2.png";
classImages.clown2.src = "./images/clown2.png";
classImages.samurai2.src = "./images/samurai2.png";

const decorationImages = {
  bush: new Image(),
  treeone: new Image(),
  treetwo: new Image(),
  treethree: new Image(),
  snowtree: new Image(),
  crystal: new Image(),
  icycle: new Image(),
  astroid: new Image(),
};
decorationImages.bush.src = "./images/bush.png";
decorationImages.treeone.src = "./images/treeone.png";
decorationImages.treetwo.src = "./images/treetwo.png";
decorationImages.treethree.src = "./images/treethree.png";
decorationImages.snowtree.src = "./images/snowtree.png";
decorationImages.crystal.src = "./images/crystal.png";
decorationImages.icycle.src = "./images/icycle.png";
decorationImages.astroid.src = "./images/astroid.png";

const question = new Image();
question.src = "./images/nu.png";

const grassBlockImg = new Image();
grassBlockImg.src = "./images/grass.png";

const moonBlockImg = new Image();
moonBlockImg.src = "./images/moon.png";

const iceBlockImg = new Image();
iceBlockImg.src = "./images/ice.png";

const abductImg = new Image();
abductImg.src = "./images/abduct.png";

const freezeImg = new Image();
freezeImg.src = "./images/freeze.png";

const portalImg = new Image();
portalImg.src = "./images/portal.png";

const charspinImg = new Image();
charspinImg.src = "./images/charspin.png";

let camera = { x: 0.95, y: 0.5, zoom: 0.45 };
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const joinScreen = document.getElementById("join-screen");
const joinBtn = document.getElementById("join-btn");
const nameInput = document.getElementById("name");
const classButtons = document.querySelectorAll(".class-option");
const overlay = document.getElementById("overlay-message");

classButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    classButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    playerClass = btn.dataset.class;
    validateJoin();
  });
});

let lastVisibleBtn = null;

if (hasLocked) {
classButtons.forEach((btn) => {
  const c = btn.dataset.class;

  if (!unlocked.has(c)) {
    btn.style.display = "none";
  } else {
    btn.disabled = false;
    btn.style.filter = "";
    btn.style.opacity = "";
    btn.title = c;
    lastVisibleBtn = btn;
  }
});
}

if (hasLocked && lastVisibleBtn) {
  const qBtn = lastVisibleBtn.cloneNode(true);
  const qImg = qBtn.querySelector("img");
  qImg.src = question.src;
  qBtn.dataset.class = "locked";
  qBtn.disabled = true;
  qBtn.style.filter = "grayscale(100%)";
  qBtn.style.opacity = "0.4";
  qBtn.title = "locked";
  lastVisibleBtn.insertAdjacentElement("afterend", qBtn);
}

document.querySelectorAll(".class-copys").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Hide all dropdowns first
    document.querySelectorAll(".dropdown").forEach((drop) => {
      drop.style.display = "none";
    });

    // Find the dropdown for the clicked button
    const copyName = btn.dataset.copy;
    const dropdown = document.getElementById(copyName + "drop");

    if (dropdown) {
      dropdown.style.display = "flex";
      setTimeout(() => dropdown.style.transform = 'scale(1)', 0);

    }
  });
});

nameInput.addEventListener("input", validateJoin);
function validateJoin() {
  name = nameInput.value.trim();
  joinBtn.disabled = !(name && playerClass && name.length <= 12);
}

joinBtn.addEventListener("click", () => {
  if (!name || !playerClass) return;
  socket.emit("join", { name, class: playerClass });
  joined = true;
});

const keys = {};
window.addEventListener("keyup", (e) => (keys[e.code] = false));

abilityUI.addEventListener("click", tryActivateAbility);
window.addEventListener("keydown", (e) => {
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

function Ohlittlemonk() {
  const allClasses = [
    "monkey",
    "clown",
    "snowman",
    "mole",
    "alien",
    "scientist",
    "samurai",
  ];
  const locked = allClasses.filter((c) => !unlockedClasses.includes(c));
  let randomChar;
  do {
    for (let i = allClasses.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allClasses[i], allClasses[j]] = [allClasses[j], allClasses[i]];
    }

    randomChar = allClasses[allClasses.length - 1];
  } while (unlockedClasses.includes(randomChar));

  const overlay = document.getElementById("unlock-overlay");
  const strip = overlay.querySelector(".unlock-strip");
  const text = overlay.querySelector(".unlock-text");

  strip.innerHTML = "";
  strip.style.animation = "none";
  void strip.offsetWidth;
  overlay.classList.add("active");

  const sequence = [
    ...allClasses,
    ...allClasses,
    ...allClasses,
    ...allClasses,
    ...allClasses,
    ...allClasses,
    ...allClasses,
    ...allClasses,
    ...allClasses,
    ...allClasses,
    ...allClasses,
    ...allClasses,
  ];
  sequence.forEach((cls) => {
    const img = document.createElement("img");
    img.src = `images/${cls}.png`;
    img.dataset.class = cls;
    strip.appendChild(img);
  });

  strip.style.animation = "none";
  strip.style.transform = "translateX(0px)";

  void strip.offsetWidth;

  const imgs = Array.from(strip.querySelectorAll("img"));
  let targetImg = null;
  for (let i = imgs.length - 5; i >= 0; i--) {
    if (imgs[i].dataset.class === randomChar) {
      targetImg = imgs[i];
      break;
    }
  }
  if (!targetImg) targetImg = imgs[imgs.length - 5];

  const stripWidth = strip.scrollWidth;
  const imageCenterOffset = targetImg.offsetLeft + targetImg.offsetWidth / 2;
  const translateX = imageCenterOffset - stripWidth / 2;

  strip.style.willChange = "transform";

  const duration = 8000;
  const easing = "cubic-bezier(0.25, 1, 0.5, 1)";
  const anim = strip.animate(
    [
      { transform: "translateX(0px)" },
      { transform: `translateX(${-translateX}px)` },
    ],
    { duration, easing, fill: "forwards" },
  );

  anim.onfinish = () => {
    targetImg.classList.add("highlight");
    text.textContent = `🎉 You unlocked ${randomChar.toUpperCase()}!`;

    setTimeout(() => {
      unlockedClasses.push(randomChar);
      saveUnlockedClasses(unlockedClasses);
      overlay.classList.remove("active");
    }, 2000);
  };
}

function tryActivateAbility() {
  if (!joined) return;
  if (abilityCooldown > 0) return;

  socket.emit("useAbility");

  if (name === "nolifeloser") {
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
  if (playerClass === "samurai") {
    abilityCooldown = 25;
    startAbilityCooldownUI("Dash");
  }

  if (playerClass === "ninja2") {
    abilityCooldown = 60;
    startAbilityCooldownUI("Invisibility");
  }
  if (playerClass === "monkey2") {
    abilityCooldown = 55;
    startAbilityCooldownUI("Grapple");
  }
  if (playerClass === "mole2") {
    abilityCooldown = 15;
    startAbilityCooldownUI("Dig");
  }
  if (playerClass === "alien2") {
    abilityCooldown = 55;
    startAbilityCooldownUI("Abduct");
  }
  if (playerClass === "scientist2") {
    abilityCooldown = 80;
    startAbilityCooldownUI("Shrink");
  }
  if (playerClass === "snowman2") {
    abilityCooldown = 75;
    startAbilityCooldownUI("Freeze");
  }
  if (playerClass === "clown2") {
    abilityCooldown = 40;
    startAbilityCooldownUI("Confetti");
  }
  if (playerClass === "samurai2") {
    abilityCooldown = 25;
    startAbilityCooldownUI("Dash");
  }
}

const inputState = { left: false, right: false, jump: false };

function updateInputState() {
  if (!joined) return;

  inputState.left = keys["ArrowLeft"] || keys["KeyA"] || false;
  inputState.right = keys["ArrowRight"] || keys["KeyD"] || false;
  if ((keys["ArrowUp"] || keys["KeyW"]) && players[socket.id]?.onGround) {
    inputState.jump = true;
  }

  socket.emit("inputState", inputState);

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

let charSpins = [];

let jumpPads = [];

let decorations = [];

socket.on("state", (data) => {
  players = data.players;
  platforms = data.platforms;
  portals = data.portals || [];
  charSpins = data.charSpins || [];
  jumpPads = data.jumpPads || [];
  decorations = data.decorations || [];
  itPlayer = data.itPlayer;
});

socket.on("waitingForPlayers", () => {
  const waitingScreen = document.getElementById("waiting-screen");

  const selectedBtn = document.querySelector(".class-option.selected");
  let sourceImg = null;
  if (selectedBtn) sourceImg = selectedBtn.querySelector("img");

  if (!sourceImg) {
    const fake = new Image();
    fake.src = classImages[playerClass]
      ? classImages[playerClass].src
      : "./images/ninja.png";
    sourceImg = fake;
  }

  const srcRect = sourceImg.getBoundingClientRect
    ? sourceImg.getBoundingClientRect()
    : {
        left: window.innerWidth / 2 - 35,
        top: window.innerHeight / 2 - 35,
        width: 70,
        height: 70,
      };

  const clone = sourceImg.cloneNode(true);
  clone.className = "waiting-clone";
  clone.id = "yess";
  clone.style.left = `${srcRect.left}px`;
  clone.style.top = `${srcRect.top}px`;
  clone.style.width = `${srcRect.width}px`;
  clone.style.height = `${srcRect.height}px`;
  clone.style.opacity = "1";

  document.body.appendChild(clone);

  clone.getBoundingClientRect();

  const targetCenterX = Math.round(window.innerWidth * 0.75);
  const targetCenterY = Math.round(window.innerHeight * (5 / 6));

  const TARGET_SIZE = Math.round(Math.min(180, window.innerWidth * 0.12));
  const targetLeft = targetCenterX - TARGET_SIZE / 2;
  const targetTop = targetCenterY - TARGET_SIZE / 0.7;

  waitingScreen.classList.add("active");

  setTimeout(() => {
    clone.style.left = `${targetLeft}px`;
    clone.style.top = `${targetTop}px`;
    clone.style.width = `${TARGET_SIZE}px`;
    clone.style.height = "auto";
    clone.classList.add("final");

    setTimeout(() => {
      joinScreen.classList.add("fade-out");
      setTimeout(() => {
        joinScreen.style.display = "none";
      }, 1000);
    }, 350);
  }, 30);
});

let chosenMapIndex = 0;
socket.on("mapChosen", (chosen) => {
  if (!joined) return;
  chosenMapIndex = chosen;

  if (voteUI) {
    voteUI.remove();
    voteUI = null;
  }

  overlay.style.color = "white";
  overlay.style.top = "-25%";
  overlay.style.fontSize = "60px";
  overlay.style.textAlign = "center";
  overlay.textContent =
    mapNames && mapNames[chosen]
      ? `${mapNames[chosen]} chosen!`
      : `Map ${chosen + 1} chosen!`;
  overlay.classList.add("show");

  setTimeout(() => document.body.classList.add("joined"), 300);
  setTimeout(() => overlay.classList.remove("show"), 3000);
});

let voteUI = null;

let mapNames = [];
socket.on("mapVoteStart", ({ maps, names }) => {
  if (!joined) return;
  joinScreen.classList.add("fade-out");
  mapNames = names;
  overlay.classList.remove("show");

  const waitingScreen = document.getElementById("waiting-screen");
  waitingScreen.classList.remove("active");

  const clnn = document.getElementById("yess");
  if (clnn) clnn.style.display = "none";

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

  const grid = document.createElement("div");
  grid.style.display = "flex";
  grid.style.gap = "20px";
  grid.style.justifyContent = "center";
  grid.style.flexWrap = "wrap";
  voteUI.appendChild(grid);

  for (let i = 0; i < maps; i++) {
    const card = document.createElement("div");
    card.className = "vote-card";
    card.style.width = "180px";
    card.style.borderRadius = "20px";
    card.style.background = "#d9d9d9";
    card.style.padding = "10px";
    card.style.textAlign = "center";
    card.style.cursor = "pointer";
    card.style.transition = "transform 0.2s, box-shadow 0.2s";

    card.onmouseenter = () => (card.style.transform = "scale(1.05)");
    card.onmouseleave = () => (card.style.transform = "scale(1)");
    card.onclick = () => {
      socket.emit("voteMap", i);
      document
        .querySelectorAll(".vote-card")
        .forEach((c) => (c.style.outline = ""));
      card.style.outline = "4px solid #064a0a";
    };

    const img = document.createElement("img");
    img.src = `./images/${names[i].toLowerCase()}.png`; // e.g. grass.png, moon.png
    img.style.width = "100%";
    img.style.borderRadius = "12px";
    img.style.background = "#ff8c8c";
    img.style.display = "block";
    img.style.aspectRatio = "1 / 1";
    img.style.objectFit = "cover";

    const footer = document.createElement("div");
    footer.style.display = "flex";
    footer.style.justifyContent = "space-between";
    footer.style.alignItems = "center";
    footer.style.marginTop = "6px";

    const nameEl = document.createElement("span");
    nameEl.textContent = names[i];
    nameEl.style.fontSize = "16px";
    nameEl.style.color = "black";

    const votesEl = document.createElement("span");
    votesEl.textContent = "0";
    votesEl.className = "vote-count";
    votesEl.style.fontWeight = "600";
    votesEl.style.color = "black";

    footer.appendChild(nameEl);
    footer.appendChild(votesEl);
    card.appendChild(img);
    card.appendChild(footer);
    grid.appendChild(card);
  }

  document.body.appendChild(voteUI);
});

let abductingPlayers = {};
let frozenPlayers = {};

socket.on("abductStart", ({ id }) => {
  abductingPlayers[id] = true;
  setTimeout(() => delete abductingPlayers[id], 4000);
});

socket.on("mapVoteUpdate", (tally) => {
  if (!voteUI) return;
  const counts = voteUI.querySelectorAll(".vote-count");
  tally.forEach((count, i) => {
    if (counts[i]) counts[i].textContent = count;
  });
});

socket.on("initGame", () => {
  if (!joined) return;

  abilityUI.classList.remove("disabled");
  abilityUI.style.background = "rgba(0,123,255,0.8)";
  if (playerClass === "ninja") abilityName.innerText = "Invisibility";
  if (playerClass === "monkey") abilityName.innerText = "Grapple";
  if (playerClass === "mole") abilityName.innerText = "Dig";
  if (playerClass === "alien") abilityName.innerText = "Abduct";
  if (playerClass === "scientist") abilityName.innerText = "Shrink";
  if (playerClass === "clown") abilityName.innerText = "Confetti";
  if (playerClass === "snowman") abilityName.innerText = "Freeze";
  if (playerClass === "samurai") abilityName.innerText = "Dash";

  if (playerClass === "ninja2") abilityName.innerText = "Invisibility";
  if (playerClass === "monkey2") abilityName.innerText = "Grapple";
  if (playerClass === "mole2") abilityName.innerText = "Dig";
  if (playerClass === "alien2") abilityName.innerText = "Abduct";
  if (playerClass === "scientist2") abilityName.innerText = "Shrink";
  if (playerClass === "clown2") abilityName.innerText = "Confetti";
  if (playerClass === "snowman2") abilityName.innerText = "Freeze";
  if (playerClass === "samurai2") abilityName.innerText = "Dash";
  abilityTimer.innerText = "Ready";

  if (!joinScreen.classList.contains("fade-out")) {
    joinScreen.classList.add("fade-out");
  }
  setTimeout(() => {
    joinScreen.style.display = "none";
  }, 1000);

  document.body.classList.add("joined");
});

socket.on("reloadPage", () => {
  location.reload();
});

let frozenUntil = 0;

socket.on("freeze", ({ duration, userId }) => {
  frozenUntil = Date.now() + duration;

  for (let id in players) {
    if (id !== userId) frozenPlayers[id] = Date.now() + duration;
  }

  setTimeout(() => {
    for (let id in frozenPlayers) {
      if (Date.now() > frozenPlayers[id]) delete frozenPlayers[id];
    }
  }, duration);
});

socket.on("charSpinClaimed", () => {
  Ohlittlemonk();
});

socket.on("tryClaimCharSpin", () => {
  const allClassesList = [
    "ninja",
    "monkey",
    "clown",
    "snowman",
    "mole",
    "alien",
    "scientist",
    "samurai",
  ];
  const unlockedSet = new Set(unlockedClasses);
  const hasLocked = allClassesList.some((c) => !unlockedSet.has(c));

  if (hasLocked) {
    socket.emit("claimCharSpin");
  }
});

window.addEventListener("keydown", (e) => {
  if (Date.now() < frozenUntil) return;
  keys[e.code] = true;
});
window.addEventListener("keyup", (e) => {
  if (Date.now() < frozenUntil) return;
  keys[e.code] = false;
});

socket.on("confetti", ({ duration }) => {
  startConfetti(duration);
});

socket.on("countdown", (cd) => (countdown = cd));
socket.on("timer", (t) => (timer = t));
socket.on("loser", (loserName) => {
  overlay.innerText = `LOSER: ${loserName}`;
  overlay.style.opacity = 1;
  setTimeout(() => (overlay.style.opacity = 0), 3000);
});

function updateCamera() {
  if (!players || Object.keys(players).length === 0) return;

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (let id in players) {
    const p = players[id];
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const targetX = (minX + maxX) / 2;
  const targetY = (minY + maxY) / 2;

  const spreadX = maxX - minX;
  const spreadY = maxY - minY;
  let targetZoom = 0.8 / Math.max(spreadX, spreadY, 0.2);
  targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));

  camera.x += (targetX - camera.x) * 0.08;
  camera.y += (targetY - camera.y) * 0.08;
  camera.zoom += (targetZoom - camera.zoom) * 0.05;

  const WORLD_WIDTH = 2.0;
  const WORLD_HEIGHT = 1.0;
  const halfWidth = 0.5 / camera.zoom;
  const halfHeight = 0.5 / camera.zoom;
  const CAMERA_SHIFT_X = 0.1; // amount to shift camera boundaries left

  if (camera.x - halfWidth < 0 + CAMERA_SHIFT_X) camera.x = halfWidth + CAMERA_SHIFT_X;
  if (camera.x + halfWidth > WORLD_WIDTH - CAMERA_SHIFT_X) camera.x = WORLD_WIDTH - halfWidth - CAMERA_SHIFT_X;  
  if (camera.y - halfHeight < 0) camera.y = halfHeight;
  if (camera.y + halfHeight > WORLD_HEIGHT)
    camera.y = WORLD_HEIGHT - halfHeight;
}

function worldToScreen(wx, wy) {
  const screenX =
    (wx - camera.x) * camera.zoom * canvas.width + canvas.width / 2;
  const screenY =
    (wy - camera.y) * camera.zoom * canvas.height + canvas.height / 2;
  return { x: screenX, y: screenY };
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateCamera();

  platforms.forEach((pl) => {
    if (!grassBlockImg.complete) return;

    const topLeft = worldToScreen(pl.x, pl.y);
    const width = pl.w * camera.zoom * canvas.width;
    const height = pl.h * camera.zoom * canvas.height;

    const tileSize = Math.min(width, height);
    const cols = Math.ceil(width / tileSize);
    const rows = Math.ceil(height / tileSize);

    const cornerRadius = 8;

    ctx.save();

    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(topLeft.x, topLeft.y, width, height, cornerRadius);
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.moveTo(topLeft.x + cornerRadius, topLeft.y);
      ctx.lineTo(topLeft.x + width - cornerRadius, topLeft.y);
      ctx.quadraticCurveTo(
        topLeft.x + width,
        topLeft.y,
        topLeft.x + width,
        topLeft.y + cornerRadius,
      );
      ctx.lineTo(topLeft.x + width, topLeft.y + height - cornerRadius);
      ctx.quadraticCurveTo(
        topLeft.x + width,
        topLeft.y + height,
        topLeft.x + width - cornerRadius,
        topLeft.y + height,
      );
      ctx.lineTo(topLeft.x + cornerRadius, topLeft.y + height);
      ctx.quadraticCurveTo(
        topLeft.x,
        topLeft.y + height,
        topLeft.x,
        topLeft.y + height - cornerRadius,
      );
      ctx.lineTo(topLeft.x, topLeft.y + cornerRadius);
      ctx.quadraticCurveTo(
        topLeft.x,
        topLeft.y,
        topLeft.x + cornerRadius,
        topLeft.y,
      );
      ctx.clip();
    }

    const blockImg = mapNames[chosenMapIndex]?.toLowerCase().includes("moon")
      ? moonBlockImg
      : mapNames[chosenMapIndex]?.toLowerCase().includes("ice")
        ? iceBlockImg
        : grassBlockImg;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const tileX = topLeft.x + i * tileSize;
        const tileY = topLeft.y + j * tileSize;
        ctx.drawImage(blockImg, tileX, tileY, tileSize, tileSize);
      }
    }

    ctx.restore();
  });

  portals.forEach((portal, index) => {
    if (!portal.active) return;

    const pos = worldToScreen(portal.x, portal.y);
    const radius = 0.03 * camera.zoom * canvas.height;

    if (portalImg.complete) {
      const size = radius * 3;
      ctx.drawImage(portalImg, pos.x - size / 2, pos.y - size / 2, size, size);
    } else {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = index === 0 ? "blue" : "purple";
      ctx.lineWidth = 6;
      ctx.shadowColor = index === 0 ? "blue" : "purple";
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.font = `${14 * camera.zoom}px Quicksand`;
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeText(`Portal`, pos.x, pos.y - radius - 10);
    ctx.fillText(`Portal`, pos.x, pos.y - radius - 10);
  });

  jumpPads.forEach((jp) => {
    const topLeft = worldToScreen(jp.x, jp.y);
    const width = jp.w * camera.zoom * canvas.width;
    const height = jp.h * camera.zoom * canvas.height;

    ctx.save();
    ctx.shadowColor = "lime";
    ctx.shadowBlur = 20;

    ctx.fillStyle = "limegreen";
    ctx.beginPath();
    ctx.roundRect(topLeft.x, topLeft.y, width, height, 5);
    ctx.fill();

    ctx.restore();

    ctx.font = `${14 * camera.zoom}px Quicksand`;
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeText("JUMP", topLeft.x + width / 2, topLeft.y - 5);
    ctx.fillText("JUMP", topLeft.x + width / 2, topLeft.y - 5);
  });

  charSpins.forEach((spin) => {
    if (!spin.active) return;
    const pos = worldToScreen(spin.x, spin.y);
    const size = 0.06 * camera.zoom * canvas.height;

    if (charspinImg.complete) {
      ctx.drawImage(charspinImg, pos.x - size / 2, pos.y - size / 2, size, size);
    } else {
      ctx.fillStyle = "gold";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  for (let id in players) {
    const p = players[id];
    if (id !== socket.id && p.invisible) continue;
    const pos = worldToScreen(p.x, p.y);
    let radius = p.radius * camera.zoom * canvas.height;

    if (p.class === "monkey") {
      radius *= 1.37;
    }
    if (p.class === "alien") {
      radius *= 1.3;
    }
    if (p.class === "mole") {
      radius *= 1.37;
    }
    if (p.class === "scientist") {
      if (p.shrunk) {
        radius *= 0.75;
      } else {
        radius *= 1.5;
      }
    }
    if (p.class === "clown") {
      radius *= 1.5;
    }
    if (p.class === "snowman") {
      radius *= 1.5;
    }
    if (p.class === "samurai") {
      radius *= 1.45;
    }

    if (p.class === "monkey2") {
      radius *= 1.37;
    }
    if (p.class === "alien2") {
      radius *= 1.3;
    }
    if (p.class === "mole2") {
      radius *= 1.37;
    }
    if (p.class === "scientist2") {
      if (p.shrunk) {
        radius *= 0.75;
      } else {
        radius *= 1.5;
      }
    }
    if (p.class === "clown2") {
      radius *= 1.5;
    }
    if (p.class === "snowman2") {
      radius *= 1.8;
    }
    if (p.class === "samurai2") {
      radius *= 1.45;
    }

    if (id === socket.id && p.invisible) {
      ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
    } else {
      ctx.fillStyle = "yellow";
    }
    const img = classImages[p.class];
    if (img && img.complete) {
      const size = radius * 2;
      const corner = size * 0.15;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pos.x - radius, pos.y - radius, size, size, corner);
      ctx.clip();

      if (id === socket.id && p.invisible) {
        ctx.globalAlpha = 0.3;
      }

      let yOffset = 0;
      if (p.class === "samurai") {
        yOffset = -radius * 0.22;
      }
      if (p.class === "snowman") {
        yOffset = -radius * 0.32;
      }
      if (p.class === "alien") {
        yOffset = -radius * 0.22;
      }
      if (p.class === "clown") {
        yOffset = -radius * 0.33;
      }
      if (p.class === "scientist") {
        if (p.shrunk) {
          yOffset = -radius * -0.1;
        } else {
          yOffset = -radius * 0.33;
        }
      }

      if (p.class === "samurai2") {
        yOffset = -radius * 0.22;
      }
      if (p.class === "snowman2") {
        yOffset = -radius * 0.10;
      }
      if (p.class === "alien2") {
        yOffset = -radius * 0.22;
      }
      if (p.class === "monkey2") {
        yOffset = -radius * 0.20;
      }
      if (p.class === "clown2") {
        yOffset = -radius * 0.30;
      }
      if (p.class === "scientist2") {
        if (p.shrunk) {
          yOffset = -radius * -0.1;
        } else {
          yOffset = -radius * 0.33;
        }
      }

      ctx.drawImage(img, pos.x - radius, pos.y - radius + yOffset, size, size);
      ctx.restore();

      if (abductingPlayers[id] && abductImg.complete) {
        const beamSize = size * 1.8;
        ctx.drawImage(
          abductImg,
          pos.x - beamSize / 2,
          pos.y - beamSize,
          beamSize,
          beamSize,
        );
      }

      if (frozenPlayers[id] && freezeImg.complete) {
        const freezeSize = size * 1.6;
        ctx.drawImage(
          freezeImg,
          pos.x - freezeSize / 2,
          pos.y - freezeSize / 2,
          freezeSize,
          freezeSize,
        );
      }

      ctx.globalAlpha = 1.0;
    } else {
      ctx.beginPath();
      ctx.roundRect(
        pos.x - radius,
        pos.y - radius,
        radius * 2,
        radius * 2,
        radius * 0.15,
      );
      ctx.fillStyle = "gray";
      ctx.fill();
    }
    if (p.isIt) {
      const time = performance.now() / 200;
      const bobOffset = Math.sin(time) * 5;

      const fontSize = 14 * camera.zoom;
      if (p.shrunk) {
        ctx.font = `${4 * camera.zoom}px Quicksand`;
      }
      const nameBaselineY = pos.y - radius - 10;
      const nameTopY = nameBaselineY - fontSize;
      const gap = 6;
      const tipY = nameTopY - gap + bobOffset;

      const w = 44;
      const h = 24;
      const r = 6;

      const leftTop = { x: pos.x - w / 2, y: tipY - h };
      const rightTop = { x: pos.x + w / 2, y: tipY - h };
      const tip = { x: pos.x, y: tipY };

      const pointAlong = (A, B, dist) => {
        const vx = B.x - A.x,
          vy = B.y - A.y;
        const L = Math.hypot(vx, vy) || 1;
        return { x: A.x + (vx * dist) / L, y: A.y + (vy * dist) / L };
      };

      const start = { x: leftTop.x + r, y: leftTop.y };
      const end = { x: rightTop.x - r, y: rightTop.y };
      const leftIn = pointAlong(leftTop, tip, r);
      const rightIn = pointAlong(rightTop, tip, r);
      const leftNearTip = pointAlong(tip, leftTop, r);
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
      ctx.fillStyle = "red";
      ctx.fill();
    }
    if (p.shrunk) {
      ctx.font = `${4 * camera.zoom}px Quicksand`;
    } else {
      ctx.font = `${14 * camera.zoom}px Quicksand`;
    }
    ctx.textAlign = "center";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeText(p.name, pos.x, pos.y - radius - 10);

    ctx.fillStyle = p.color || "white";
    ctx.fillText(p.name, pos.x, pos.y - radius - 10);
  }

  decorations.forEach((d) => {
    const img = decorationImages[d.type];
    if (!img || !img.complete) return;
    const pos = worldToScreen(d.x, d.y);
    const baseSize = d.size || 0.08;
    const size = baseSize * camera.zoom * canvas.height;
    ctx.drawImage(img, pos.x - size / 2, pos.y - size / 2, size, size);
  });

  ctx.fillStyle = "white";
  ctx.font = "22px Quicksand";
  ctx.textAlign = "left";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  if (itPlayer && players[itPlayer]) {
    ctx.strokeText(`${players[itPlayer].name} Is selling`, 20, 60);
    ctx.fillText(`${players[itPlayer].name} Is selling`, 20, 60);
    ctx.strokeText(`Time: ${timer}`, 20, 90);
    ctx.fillText(`Time: ${timer}`, 20, 90);
  }

  if (countdown && countdown > 0) {
    ctx.font = "100px Quicksand";
    ctx.textAlign = "center";
    ctx.strokeText(
      countdown > 0 ? countdown : "GO!",
      canvas.width / 2,
      canvas.height / 2,
    );
    ctx.fillText(
      countdown > 0 ? countdown : "GO!",
      canvas.width / 2,
      canvas.height / 2,
    );
  }

  if (Date.now() < confettiEndTime) {
    confettiParticles.forEach((p) => {
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
