import { startAnimIntro } from "./animIntro.js";

// On enregistre les plugins, y compris Observer
gsap.registerPlugin(ScrollTrigger, Draggable, Observer);

const animIntro = document.getElementById('anim-intro');
const mainContent = document.getElementById('mainContent');
const burgerMenu = document.getElementById('burgerMenu');
const navMenu = document.getElementById('navMenu');
const closeBtn = document.querySelector('#navMenu .closeBtn');
const burgerSVG = document.querySelector('#burgerMenu img');

const panels = gsap.utils.toArray(".panel");

function setupApp() {
    // startAnimIntro();

    // Pour gagner du temps en dev : on cache direct l'intro
    gsap.set(animIntro, { display: 'none' });
    setupInfiniteLoop();

    setupPerles();


    /*
    const tl = gsap.timeline({ delay: 5 });

    tl.to(mainContent, {
        autoAlpha: 1,
        duration: 0.1
    })
        .to(animIntro, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                animIntro.style.display = 'none';
                // On lance la nouvelle fonction de scroll infini
                setupInfiniteLoop();
            }
        });
    */

    setupFusils();
    setupMenuToggle();
    setupMaskHover();
}

function setupMaskHover() {
    // Création du tooltip si inexistant
    let tooltip = document.getElementById('mask-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'mask-tooltip';
        document.body.appendChild(tooltip);
    }

    const masks = document.querySelectorAll('.maisonneuve-oeuvres > img');

    masks.forEach(mask => {
        mask.addEventListener('mouseenter', (e) => {
            // 1. Rotation aléatoire
            gsap.to(mask, {
                rotation: gsap.utils.random(-10, 10),
                duration: 0.3,
                ease: "back.out(1.7)"
            });

            // 2. Remplissage du tooltip
            const title = mask.getAttribute('data-title') || "Œuvre sans titre";
            const date = mask.getAttribute('data-date') || "";
            const desc = mask.getAttribute('data-desc') || "";

            tooltip.innerHTML = `
                <h3>${title}</h3>
                <div class="date">${date}</div>
                <div class="desc">${desc}</div>
            `;

            // 3. Affichage et Positionnement initial
            const offset = 20;
            gsap.set(tooltip, {
                display: 'block',
                opacity: 1,
                x: e.clientX + offset,
                y: e.clientY + offset
            });
        });

        mask.addEventListener('mouseleave', () => {
            // Reset rotation
            gsap.to(mask, {
                rotation: 0,
                duration: 0.3,
                ease: "power2.out"
            });
            // Hide tooltip
            gsap.set(tooltip, { display: 'none' });
        });

        mask.addEventListener('mousemove', (e) => {
            const offset = 20;
            // Tooltip suit la souris avec leger décalage
            gsap.to(tooltip, {
                x: e.clientX + offset,
                y: e.clientY + offset,
                duration: 0.1,
                ease: "power2.out",
                overwrite: "auto"
            });
        });
    });
}

function setupInfiniteLoop() {
    if (panels.length === 0) return;

    // --- CONFIGURATION DE LA VITESSE ---

    // Vitesse du scroll (Souris/Trackpad)
    // Baisse ce chiffre pour ralentir. (Ex: 0.1 est très lent, 1.0 est rapide)
    const scrollSpeed = 0.1;

    // Vitesse du Drag (Tactile/Souris maintenue)
    // 1.0 = Le site suit exactement le doigt (1px pour 1px)
    // 0.5 = Le site bouge 2x moins vite que le doigt (sensation de lourdeur)
    const dragSpeed = 0.25;

    // Fluidité (0.01 à 1). Plus c'est bas, plus c'est "mou/lourd".
    const ease = 0.08;


    // --- LOGIQUE INTERNE (Ne pas toucher) ---
    let currentX = 0;
    let targetX = 0;
    const totalPanels = panels.length;
    const wrapWidth = totalPanels * 100;

    // Initialisation
    gsap.set(panels, { xPercent: (i) => i * 100 });

    // --- BOUCLE D'ANIMATION ---
    gsap.ticker.add(() => {
        const diff = targetX - currentX;
        if (Math.abs(diff) < 0.01) return;

        currentX += diff * ease;

        panels.forEach((panel, i) => {
            const basePos = i * 100;
            let xPos = (basePos + currentX) % wrapWidth;

            // Gestion du modulo pour les nombres négatifs
            if (xPos > (totalPanels - 1) * 100) {
                xPos -= wrapWidth;
            } else if (xPos < -100) {
                xPos += wrapWidth;
            }
            gsap.set(panel, { xPercent: xPos });
        });
    });

    // --- GESTION OBSERVER (SCROLL) ---
    Observer.create({
        target: window,
        type: "wheel,touch,pointer",
        onChange: (self) => {
            const velocity = self.deltaY !== 0 ? self.deltaY : self.deltaX;
            // On multiplie par notre variable scrollSpeed
            targetX -= velocity * scrollSpeed;
        }
    });

    // --- GESTION DRAGGABLE (TOUCH) ---
    const proxy = document.createElement("div");
    Draggable.create(proxy, {
        trigger: "#mainContent",
        type: "x",
        inertia: true,
        onPress: function () {
            // On ne synchronise plus la position absolue, on gère juste le mouvement relatif
            gsap.killTweensOf(targetX);
        },
        onDrag: function () {
            // On ajoute seulement la différence de mouvement multipliée par la vitesse
            targetX += this.deltaX * dragSpeed;
        },
        onThrowUpdate: function () {
            // Même chose pour l'inertie (le lancer après avoir relâché)
            targetX += this.deltaX * dragSpeed;
        }
    });
}

function setupMenuToggle() {
    const menuTl = gsap.timeline({ paused: true });

    menuTl
        .to(navMenu, { x: '0%', duration: 0.6, ease: "power3.inOut" }, "start")
        .to(burgerMenu, { pointerEvents: "none", duration: 0.1 }, "start")
        .to(burgerSVG, { rotation: 90, opacity: 0, duration: 0.3 }, "start")
        .fromTo(closeBtn,
            { rotation: -90, opacity: 0, scale: 0.5 },
            { rotation: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" },
            "start+=0.2"
        );

    burgerMenu.addEventListener('click', () => menuTl.play());
    closeBtn.addEventListener('click', () => menuTl.reverse());
    document.querySelectorAll('.navList a').forEach(link => {
        link.addEventListener('click', () => menuTl.reverse());
    });
}

function setupFusils() {
    const container = document.querySelector('.fusil-container');
    const originalFusils = gsap.utils.toArray('.fusil');

    // --- 1. GESTION DU SCROLL INFINI (Fix) ---
    // On vide le conteneur pour reconstruire proprement
    container.innerHTML = '';

    // On crée une div wrapper pour le mouvement
    const wrapper = document.createElement('div');
    container.appendChild(wrapper);

    // Combien de fois dupliquer ? 
    // On veut assez d'images pour couvrir l'écran + une marge de sécurité
    // Ici on fait 4 sets au total (Original + 3 clones) pour être large
    const content = [...originalFusils, ...originalFusils, ...originalFusils, ...originalFusils];

    content.forEach(img => {
        // On clone le noeud image pour ne pas déplacer l'original
        wrapper.appendChild(img.cloneNode(true));
    });

    // L'animation du Scroll
    // On déplace le wrapper de 0% à -25% (car on a 4 sets, donc 1 set = 25%)
    // Dès qu'on arrive à -25%, on revient à 0 instantanément (invisible à l'oeil)
    gsap.to(wrapper, {
        yPercent: -25,
        ease: "none",
        duration: 10, // Ajustez la vitesse ici
        repeat: -1
    });

    // --- 2. ANIMATION BRUTE (Rotations Saccadées) ---
    // On sélectionne les NOUVELLES images créées dans le wrapper
    const allFusils = wrapper.querySelectorAll('.fusil');

    // On force la position de départ
    gsap.set(allFusils, { rotation: -20 });

    gsap.to(allFusils, {
        rotation: 20,      // Va vers +20°
        duration: 0.15,    // Très rapide / très récurrent
        ease: "steps(1)",  // Saut instantané
        yoyo: true,
        repeat: -1,
        stagger: {
            each: 0.05,    // Décalage réduit pour suivre le rythme
            from: "random"
        }
    });
}

function setupPerles() {
    const container = document.querySelector('.perles-container');
    const originalPerles = gsap.utils.toArray('.perle');

    if (!container || originalPerles.length === 0) return;

    container.innerHTML = '';
    const wrapper = document.createElement('div');
    container.appendChild(wrapper);

    // --- Génération du Bloc A ---
    const count = 20;
    const pearlData = [];

    // On pré-génère 20 perles aléatoires
    for (let i = 0; i < count; i++) {
        const randomImg = originalPerles[Math.floor(Math.random() * originalPerles.length)];
        const clone = randomImg.cloneNode(true);

        // Styles aléatoires
        const width = gsap.utils.random(30, 100) + "%";
        const margin = gsap.utils.random(20, 40) + "px 0";
        clone.style.width = width;
        clone.style.margin = margin;

        // Paramètres d'animation à figer pour la synchro
        const animParams = {
            x: gsap.utils.random(-20, 20),
            duration: gsap.utils.random(2, 4),
            delay: gsap.utils.random(0, 2)
        };

        pearlData.push({ element: clone, params: animParams });
        wrapper.appendChild(clone);
    }

    // --- Génération du Bloc B (Clones identiques pour la boucle) ---
    // On veut que le Bloc B soit une copie EXACTE du A (même style + même animation)
    const pearlDataClones = [];

    pearlData.forEach(data => {
        const clone = data.element.cloneNode(true);
        wrapper.appendChild(clone);

        // On associe les MÊMES params d'anim
        pearlDataClones.push({ element: clone, params: data.params });
    });

    // --- 1. Animation de montée (Scroll infini) ---
    gsap.to(wrapper, {
        yPercent: -50, // On remonte de la hauteur d'un bloc (Bloc A)
        ease: "none",
        duration: 20,
        repeat: -1
    });

    // --- 2. Animation Zigzag Synchronisée ---
    // On applique l'anim sur TOUTES les perles (A et B)
    // Comme les paires (Perle A[i], Perle B[i]) partagent les mêmes params,
    // elles bougeront exactement pareil, rendant le "snap" invisible.
    [...pearlData, ...pearlDataClones].forEach(item => {
        gsap.to(item.element, {
            x: item.params.x,
            duration: item.params.duration,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: item.params.delay
        });
    });
}

window.addEventListener("DOMContentLoaded", () => {
    setupApp();
});