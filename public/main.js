import { startAnimIntro } from "./animIntro.js";

// Pas d'imports GSAP ici car ils sont dans le HTML
// Mais on enregistre le plugin quand même
gsap.registerPlugin(ScrollTrigger, Draggable);

const animIntro = document.getElementById('anim-intro');
const mainContent = document.getElementById('mainContent');
const burgerMenu = document.getElementById('burgerMenu');
const navMenu = document.getElementById('navMenu');
// Sélecteur plus précis pour le bouton close
const closeBtn = document.querySelector('#navMenu .closeBtn'); 
const burgerSVG = document.querySelector('#burgerMenu img');

// On sélectionne tous les panneaux
const panels = gsap.utils.toArray(".panel");

function setupApp() {
    startAnimIntro();

    // Séquence d'intro
    const tl = gsap.timeline({ delay: 5 }); // Délai de 5s pour l'intro

    tl.to(mainContent, {
        autoAlpha: 1, 
        duration: 0.1 
    })
    .to(animIntro, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
            animIntro.style.display = 'none';
            setupHorizontalScroll(); 
            setupDragScroll();
        }
    });

    setupMenuToggle();
}

function setupDragScroll() {
    // On crée un élément virtuel (proxy) qu'on va "faire semblant" de déplacer
    const proxy = document.createElement("div");
    
    Draggable.create(proxy, {
        trigger: "#mainContent", // On clique sur tout le contenu pour déclencher
        type: "x",               // Mouvement horizontal
        inertia: true,           // (Optionnel) Ajoute de l'inertie si vous avez le plugin Inertia
        
        onPress: function() {
            // Optionnel : arrêter le scroll automatique s'il y en avait un
            gsap.killTweensOf(window);
        },
        
        onDrag: function() {
            // C'est ici que la magie opère.
            // this.deltaX = de combien de pixels on a bougé depuis la dernière frame.
            // Si on glisse vers la GAUCHE (deltaX négatif), on veut avancer dans le site (scroll positif).
            // On inverse donc le signe : -this.deltaX
            
            // Vous pouvez multiplier par un facteur (ex: 1.5) pour scroller plus vite que la souris
            const scrollSpeed = 1; 
            window.scrollBy(0, -this.deltaX * scrollSpeed);
        }
    });
}

function setupHorizontalScroll() {
    // Si pas de panneaux, on arrête
    if (panels.length === 0) return;

    // Animation de défilement horizontal
    // On déplace les panneaux vers la gauche (axe X)
    gsap.to(panels, {
        xPercent: -100 * (panels.length - 1), // -100% * (nb de panneaux - 1)
        ease: "none",
        scrollTrigger: {
            trigger: "#mainContent",
            pin: true,       // Épingle le conteneur pendant le scroll
            scrub: 1,        // Lie l'anim au scroll avec fluidité
            // Calcule la longueur du scroll vertical nécessaire
            // "end" définit la "longueur" de la page virtuelle
            end: () => "+=" + (window.innerWidth * panels.length), 
            invalidateOnRefresh: true // Recalcule si on redimensionne la fenêtre
        }
    });
}

function setupMenuToggle() {
    // On crée la timeline
    const menuTl = gsap.timeline({ paused: true });

    menuTl
    // 1. Apparition du menu
    .to(navMenu, {
        x: '0%', 
        duration: 0.6,
        ease: "power3.inOut"
    }, "start") // Label "start" pour tout synchroniser

    // 2. Le Burger : On cache l'icône ET on désactive les clics sur le div parent
    .to(burgerMenu, {
        pointerEvents: "none", // CRUCIAL : Laisse passer le clic vers le bouton fermer
        duration: 0.1 // Très rapide
    }, "start")
    .to(burgerSVG, {
        rotation: 90,
        opacity: 0,
        duration: 0.3
    }, "start")
    
    // 3. Le bouton Fermer : On le fait apparaître
    .fromTo(closeBtn, 
        { rotation: -90, opacity: 0, scale: 0.5 },
        { rotation: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }, 
        "start+=0.2" // Léger délai pour l'effet
    );

    // Écouteur pour OUVRIR
    burgerMenu.addEventListener('click', () => {
        menuTl.play();
    });

    // Écouteur pour FERMER
    closeBtn.addEventListener('click', () => {
        console.log("Fermeture demandée"); // Pour déboguer si besoin
        menuTl.reverse();
        // GSAP va automatiquement remettre pointerEvents: "auto" sur le burger en faisant reverse()
    });
    
    // Optionnel : Fermer si on clique sur un lien du menu
    document.querySelectorAll('.navList a').forEach(link => {
        link.addEventListener('click', () => {
            menuTl.reverse();
        });
    });
}

window.addEventListener("DOMContentLoaded", () => {
  setupApp();
});