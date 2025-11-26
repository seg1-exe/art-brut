// animIntro.js
import mediaFiles from "./mediaFiles.js";

// Tempo plus rapide
const bpm = 260; // avant 149
const beatInterval = 60 / bpm; // durée entre spawns

const container = document.getElementById("anim-intro");

// Paramètres responsives basés sur la largeur de la fenêtre
let spawnCount = window.innerWidth < 768 ? 2 : 4; // + d'images par "beat"
const MAX_ELEMENTS = window.innerWidth < 768 ? 40 : 140;

const imageFiles = mediaFiles.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));

let recentMedia = [];
let introRunning = false;

function placeElement(el) {
  const rect = container.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  const elW = el.offsetWidth || w * 0.25;
  const elH = el.offsetHeight || h * 0.25;

  el.style.left = `${Math.random() * Math.max(0, w - elW)}px`;
  el.style.top = `${Math.random() * Math.max(0, h - elH)}px`;

  // petite rotation random pour dynamiser
  const angle = (Math.random() - 0.5) * 20; // -10° à +10°
  el.style.transform = `rotate(${angle}deg) scale(1.05)`;
}

function spawnImage() {
  if (!imageFiles.length) return;

  let fileName;
  do {
    fileName = imageFiles[Math.floor(Math.random() * imageFiles.length)];
  } while (recentMedia.includes(fileName) && imageFiles.length > 5);

  recentMedia.push(fileName);
  if (recentMedia.length > 5) recentMedia.shift();

  const el = document.createElement("img");
  el.src = `./images/anim-intro/${fileName}`;
  el.className = "intro-media";

  el.onload = () => {
    placeElement(el);
  };

  container.appendChild(el);

  // durée de vie un peu plus courte pour garder du rythme
  setTimeout(() => el.remove(), 6000);

  if (container.children.length > MAX_ELEMENTS) {
    container.removeChild(container.firstChild);
  }
}

function startIntroLoop() {
  if (!container) return;

  introRunning = true;

  // spawn immédiat pour éviter le “vide”
  for (let i = 0; i < spawnCount; i++) {
    spawnImage();
  }

  const interval = setInterval(() => {
    for (let i = 0; i < spawnCount; i++) {
      spawnImage();
    }
  }, beatInterval * 1000);

  // ⏱️ stop au bout de 5s
  setTimeout(() => {
    clearInterval(interval);
    introRunning = false;
  }, 5000);
}

window.addEventListener("resize", () => {
  spawnCount = window.innerWidth < 768 ? 2 : 4;
});

export function startAnimIntro() {
  if (introRunning) return;
  startIntroLoop();
}
