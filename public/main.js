const gsapInstance = window.gsap;

const img = document.querySelector('#app img');
const cartel = document.querySelector('.cartel');


gsapInstance.set(cartel, {
  autoAlpha: 0,
  x: -9999,
  y: -9999
});

function showCartel() {
  gsapInstance.to(cartel, {
    autoAlpha: 1,
    duration: 0.2,
    ease: 'power2.out'
  });
}

function hideCartel() {
  gsapInstance.to(cartel, {
    autoAlpha: 0,
    duration: 0.2,
    ease: 'power2.out'
  });
}

const moveX = gsapInstance.quickTo(cartel, "x", {
  duration: 0.1,
  ease: "power3.out"
});

const moveY = gsapInstance.quickTo(cartel, "y", {
  duration: 0.1,
  ease: "power3.out"
});

img.addEventListener('mouseenter', () => {
  showCartel();
});

img.addEventListener('mouseleave', () => {
  hideCartel();
});

img.addEventListener('mousemove', (event) => {
  const offsetY = 50; 
  const offsetX = 180;

  moveX(event.clientX + offsetX);
  moveY(event.clientY + offsetY);
});
