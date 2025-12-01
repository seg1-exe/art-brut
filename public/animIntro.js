// animIntro.js
import mediaFiles from "./mediaFiles.js";

// Tempo plus rapide
const bpm = 260;
const beatInterval = 60 / bpm;

const container = document.getElementById("anim-intro");

// Paramètres responsives basés sur la largeur de la fenêtre
let spawnCount = window.innerWidth < 768 ? 2 : 4;
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

  const angle = (Math.random() - 0.5) * 20;
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

  setTimeout(() => el.remove(), 6000);

  if (container.children.length > MAX_ELEMENTS) {
    container.removeChild(container.firstChild);
  }
}

function startIntroLoop(onComplete) {
  if (!container) return;

  introRunning = true;

  for (let i = 0; i < spawnCount; i++) {
    spawnImage();
  }

  const interval = setInterval(() => {
    for (let i = 0; i < spawnCount; i++) {
      spawnImage();
    }
  }, beatInterval * 1000);

  // ⏱️ stop au bout de 5s puis callback
  setTimeout(() => {
    clearInterval(interval);
    introRunning = false;
    if (typeof onComplete === "function") {
      onComplete();
    }
  }, 5000);
}

window.addEventListener("resize", () => {
  spawnCount = window.innerWidth < 768 ? 2 : 4;
});

export function startAnimIntro(onComplete) {
  if (introRunning) return;
  // au cas où il serait caché au départ
  container.style.display = "block";
  startIntroLoop(onComplete);
}
