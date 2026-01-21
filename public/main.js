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

    setupPerles();

    const tl = gsap.timeline();

    tl.to(mainContent, {
        autoAlpha: 1,
        duration: 0.1
    });

    setupFusils();
    setupMenuToggle();
    setupMaskHover();
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
                ease: "power2.out"
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

    const scrollSpeed = 0.1;
    const dragSpeed = 0.25;
    const ease = 0.08;

    let currentX = 0;
    let targetX = 0;
    const totalPanels = panels.length;
    const wrapWidth = totalPanels * 100;

    gsap.set(panels, { xPercent: (i) => i * 100 });

    gsap.ticker.add(() => {
        const diff = targetX - currentX;
        if (Math.abs(diff) < 0.01) return;

        currentX += diff * ease;

        panels.forEach((panel, i) => {
            const basePos = i * 100;
            let xPos = (basePos + currentX) % wrapWidth;

            if (xPos > (totalPanels - 1) * 100) {
                xPos -= wrapWidth;
            } else if (xPos < -100) {
                xPos += wrapWidth;
            }
            gsap.set(panel, { xPercent: xPos });
        });
    });

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
            targetX += this.deltaX * dragSpeed;
        },
        onThrowUpdate: function () {
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

function setupPerles() {
    const container = document.querySelector('.perles-container');
    const originalPerles = gsap.utils.toArray('.perle');

    if (!container || originalPerles.length === 0) return;

    container.innerHTML = '';
    const wrapper = document.createElement('div');
    container.appendChild(wrapper);

    const count = 20;
    const pearlData = [];

    for (let i = 0; i < count; i++) {
        const randomImg = originalPerles[Math.floor(Math.random() * originalPerles.length)];
        const clone = randomImg.cloneNode(true);

        const width = gsap.utils.random(30, 100) + "%";
        const margin = gsap.utils.random(20, 40) + "px 0";
        clone.style.width = width;
        clone.style.margin = margin;

        const animParams = {
            x: gsap.utils.random(-20, 20),
            duration: gsap.utils.random(2, 4),
            delay: gsap.utils.random(0, 2)
        };

        pearlData.push({ element: clone, params: animParams });
        wrapper.appendChild(clone);
    }

    const pearlDataClones = [];

    pearlData.forEach(data => {
        const clone = data.element.cloneNode(true);
        wrapper.appendChild(clone);

        pearlDataClones.push({ element: clone, params: data.params });
    });

    gsap.to(wrapper, {
        yPercent: -50,
        ease: "none",
        duration: 20,
        repeat: -1
    });

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