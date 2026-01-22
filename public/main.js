import { startAnimIntro } from "./animIntro.js";

gsap.registerPlugin(ScrollTrigger, Draggable, Observer);

const animIntro = document.getElementById('anim-intro');
const mainContent = document.getElementById('mainContent');
const burgerMenu = document.getElementById('burgerMenu');
const navMenu = document.getElementById('navMenu');
const closeBtn = document.querySelector('#navMenu .closeBtn');
const burgerSVG = document.querySelector('#burgerMenu img');

const panels = gsap.utils.toArray(".panel");

function setupApp() {
    gsap.set(animIntro, { display: 'none' });
    setupInfiniteLoop();

    const tl = gsap.timeline();

    tl.to(mainContent, {
        autoAlpha: 1,
        duration: 0.1
    });

    setupFusils();
    setupMenuToggle();
    setupMaskHover();
    setupScott();
    setupNedjar();
}

function setupMaskHover() {
    let tooltip = document.getElementById('mask-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'mask-tooltip';
        document.body.appendChild(tooltip);
    }

    const masks = document.querySelectorAll('.maisonneuve-oeuvres > img');

    masks.forEach(mask => {
        mask.addEventListener('mouseenter', (e) => {
            gsap.set(mask, { zIndex: 20 });

            gsap.to(mask, {
                rotation: gsap.utils.random(-10, 10),
                duration: 0.3,
                ease: "back.out(1.7)"
            });

            const title = mask.getAttribute('data-title') || "Œuvre sans titre";
            const date = mask.getAttribute('data-date') || "";
            const desc = mask.getAttribute('data-desc') || "";

            tooltip.innerHTML = `
                <h3>${title}</h3>
                <div class="date">${date}</div>
                <div class="desc">${desc}</div>
            `;

            const offset = 20;
            gsap.set(tooltip, {
                display: 'block',
                opacity: 1,
                x: e.clientX + offset,
                y: e.clientY + offset
            });
        });

        mask.addEventListener('mouseleave', () => {
            gsap.to(mask, {
                rotation: 0,
                duration: 0.3,
                ease: "power2.out",
                onComplete: () => {
                    gsap.set(mask, { zIndex: 5 });
                }
            });
            gsap.set(tooltip, { display: 'none' });
        });

        mask.addEventListener('mousemove', (e) => {
            const offset = 20;
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

    // CONFIGURATION
    const scrollSpeed = 0.1;
    const dragSpeed = 0.25;
    const ease = 0.08;

    let currentX = 0;
    let targetX = 0;

    // 1. CALCUL DES LARGEURS (Variable Width Logic)
    // On stocke la largeur (en vw) et la position de départ de chaque panel
    let totalWidth = 0;
    const panelData = panels.map(panel => {
        // On récupère la largeur du panel en pixels et on convertit en VW
        // (Largeur px / Largeur fenêtre) * 100
        const widthVW = (panel.offsetWidth / window.innerWidth) * 100;

        const data = {
            element: panel,
            width: widthVW,
            startPos: totalWidth // Sa position théorique (0, 100, 200, 368...)
        };

        totalWidth += widthVW;
        return data;
    });

    // La taille totale de la boucle
    const wrapWidth = totalWidth;

    // 2. BOUCLE D'ANIMATION
    gsap.ticker.add(() => {
        const diff = targetX - currentX;
        if (Math.abs(diff) < 0.01) return;

        currentX += diff * ease;

        panelData.forEach((p, i) => {
            // Position de base calculée dynamiquement
            // On ajoute le mouvement global (currentX)
            let xPos = (p.startPos + currentX) % wrapWidth;

            // Gestion du modulo pour les nombres négatifs (scroll gauche)
            if (xPos < -p.width) {
                // Si le panel est entièrement sorti à gauche, on le renvoie au bout à droite
                xPos += wrapWidth;
            } else if (xPos > wrapWidth - p.width) {
                // Si on scrolle trop à droite (optionnel selon le sens de la boucle)
                xPos -= wrapWidth;
            }

            // Correction spécifique : Si un panel est très large, le modulo simple peut créer un saut visuel
            // On s'assure que xPos reste cohérent par rapport au viewport
            if (xPos > (wrapWidth / 2)) {
                xPos -= wrapWidth;
            } else if (xPos < -(wrapWidth / 2)) {
                xPos += wrapWidth;
            }

            // IMPORTANT : On utilise 'x' (vw) et non plus 'xPercent'
            // car xPercent est relatif à la taille de l'élément lui-même (qui varie maintenant)
            gsap.set(p.element, { x: xPos + "vw", xPercent: 0 });
        });
    });

    // 3. GESTION SCROLL & DRAG (Identique à avant, juste adapté pour targetX)
    Observer.create({
        target: window,
        type: "wheel,touch,pointer",
        onChange: (self) => {
            const velocity = self.deltaY !== 0 ? self.deltaY : self.deltaX;
            targetX -= velocity * scrollSpeed;
        }
    });

    const proxy = document.createElement("div");
    Draggable.create(proxy, {
        trigger: "#mainContent",
        type: "x",
        inertia: true,
        onPress: function () {
            gsap.killTweensOf(targetX);
        },
        onDrag: function () {
            // On convertit les pixels dragués en VW pour rester cohérent
            const dragInVW = (this.deltaX / window.innerWidth) * 100;
            targetX += dragInVW * dragSpeed;
        },
        onThrowUpdate: function () {
            const dragInVW = (this.deltaX / window.innerWidth) * 100;
            targetX += dragInVW * dragSpeed;
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

    container.innerHTML = '';

    const wrapper = document.createElement('div');
    container.appendChild(wrapper);

    const content = [...originalFusils, ...originalFusils, ...originalFusils, ...originalFusils];

    content.forEach(img => {
        wrapper.appendChild(img.cloneNode(true));
    });

    gsap.to(wrapper, {
        yPercent: -25,
        ease: "none",
        duration: 10,
        repeat: -1
    });

    const allFusils = wrapper.querySelectorAll('.fusil');

    gsap.set(allFusils, { rotation: -20 });

    gsap.to(allFusils, {
        rotation: 20,
        duration: 0.15,
        ease: "steps(1)",
        yoyo: true,
        repeat: -1,
        stagger: {
            each: 0.05,
            from: "random"
        }
    });
}

function setupScott() {
    const container = document.querySelector('.scott-carousel');
    let items = document.querySelectorAll('.scott-item');
    const tooltip = document.getElementById('mask-tooltip');

    // --- CONFIGURATION DE L'ORBITE ---
    // On définit le rayon X (largeur) et Y (hauteur) de l'ovale
    const radiusX = window.innerWidth * 0.45; // 45% de la largeur écran (assez large)
    const radiusY = window.innerHeight * 0.35; // 35% de la hauteur écran

    const centerX = 0; // Le 0 est relatif au centre défini en CSS (50% 50%)
    const centerY = 0;

    const speed = 0.002; // Vitesse de rotation
    let angle = 0;
    let isPaused = false;

    // Duplication si moins de 7 images pour faire un cercle bien rempli
    if (items.length < 7) {
        const originals = Array.from(items);
        originals.forEach(item => container.appendChild(item.cloneNode(true)));
        items = document.querySelectorAll('.scott-item');
    }

    const totalItems = items.length;
    const angleStep = (Math.PI * 2) / totalItems; // Espace régulier entre chaque image

    // --- BOUCLE D'ANIMATION ---
    gsap.ticker.add(() => {
        if (!isPaused) {
            angle += speed;
        }

        items.forEach((item, i) => {
            // Angle actuel de cet item
            const itemAngle = angle + (i * angleStep);

            // Calcul trigonométrique de la position (Cercle/Ellipse)
            const x = centerX + Math.cos(itemAngle) * radiusX;
            const y = centerY + Math.sin(itemAngle) * radiusY;

            // --- GESTION DE LA PROFONDEUR (Z-INDEX) ---
            // Le texte (.scott-center) est à z-index: 10

            // Si y > 0 (partie basse de l'écran), on est DEVANT -> z-index 20
            // Si y < 0 (partie haute), on est DERRIÈRE -> z-index 5

            // On ajoute un petit "buffer" pour éviter que ça clignote pile au milieu
            const depthZ = y > 0 ? 20 : 5;

            // Perspective simulée : plus c'est bas (proche), plus c'est gros
            // scale varie entre 0.8 (loin) et 1.2 (proche)
            const perspectiveScale = 1 + (y / radiusY) * 0.2;

            // Si survolé, on force un scale plus gros, sinon on suit l'orbite
            const finalScale = item.classList.contains('hovered') ? 1.4 : perspectiveScale;

            gsap.set(item, {
                x: x,
                y: y,
                xPercent: -50, // Important pour centrer l'image sur son point de coordonnées
                yPercent: -50,
                zIndex: depthZ,
                scale: finalScale
            });
        });
    });

    // --- INTERACTIONS ---
    items.forEach(item => {
        item.addEventListener('mouseenter', (e) => {
            isPaused = true;
            item.classList.add('hovered');

            const title = item.getAttribute('data-title');
            const date = item.getAttribute('data-date');
            const desc = item.getAttribute('data-desc');

            tooltip.innerHTML = `
                <h3 style="color:#D91C24">${title}</h3>
                <div class="date">${date}</div>
                <div class="desc">${desc}</div>
            `;

            gsap.set(tooltip, {
                display: 'block',
                opacity: 1,
                x: e.clientX + 20,
                y: e.clientY + 20
            });
        });

        item.addEventListener('mousemove', (e) => {
            gsap.to(tooltip, {
                x: e.clientX + 20,
                y: e.clientY + 20,
                duration: 0.1,
                overwrite: "auto"
            });
        });

        item.addEventListener('mouseleave', () => {
            isPaused = false;
            item.classList.remove('hovered');
            gsap.set(tooltip, { display: 'none' });
        });
    });
}

function setupNedjar() {
    const dolls = document.querySelectorAll('.doll-wrapper');
    // On réutilise le tooltip global créé précédemment
    const tooltip = document.getElementById('mask-tooltip');

    dolls.forEach(doll => {
        // Sécurité : on force le point de pivot
        gsap.set(doll, { transformOrigin: "top center" });

        // --- 1. SURVOL (Balance + Affiche Cartel) ---
        doll.addEventListener('mouseenter', (e) => {
            // A. PHYSIQUE (Balancier)
            const angle = Math.random() < 0.5 ? 15 : -15;

            gsap.to(doll, {
                rotation: angle,
                duration: 0.4,
                ease: "power2.out",
                overwrite: true,
                zIndex: 50
            });

            gsap.to(doll, {
                rotation: 0,
                duration: 2.5,
                ease: "elastic.out(1, 0.3)",
                delay: 0.4,
                onComplete: () => {
                    // On ne remet le z-index bas que si on a quitté la poupée
                    if (!doll.matches(':hover')) {
                        gsap.set(doll, { zIndex: 10 });
                    }
                }
            });

            // B. CARTEL (Tooltip)
            // On récupère les infos du HTML
            const title = doll.getAttribute('data-title') || "Sans titre";
            const date = doll.getAttribute('data-date') || "";
            const desc = doll.getAttribute('data-desc') || "";

            // On remplit le tooltip (style spécifique rouge pour Nedjar)
            tooltip.innerHTML = `
                <h3 style="color:#D91C24">${title}</h3>
                <div class="date">${date}</div>
                <div class="desc">${desc}</div>
            `;

            // On affiche le tooltip près de la souris
            gsap.set(tooltip, {
                display: 'block',
                opacity: 1,
                x: e.clientX + 20,
                y: e.clientY + 20
            });
        });

        // --- 2. MOUVEMENT SOURIS (Le cartel suit la souris) ---
        doll.addEventListener('mousemove', (e) => {
            gsap.to(tooltip, {
                x: e.clientX + 20,
                y: e.clientY + 20,
                duration: 0.1, // Petit délai pour effet smooth
                overwrite: "auto"
            });
        });

        // --- 3. SORTIE (Cache Cartel) ---
        doll.addEventListener('mouseleave', () => {
            // On cache le tooltip
            gsap.set(tooltip, { display: 'none' });

            // Note: On laisse l'animation de balancier se finir tranquillement
        });

        // Optionnel : Interaction Click
        doll.addEventListener('click', () => {
            gsap.fromTo(doll,
                { rotation: 0 },
                { rotation: 360, duration: 1, ease: "back.out(1.7)" }
            );
        });
    });
}



window.addEventListener("DOMContentLoaded", () => {
    setupApp();
});