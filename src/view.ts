import * as THREE from "three";

export let scrollY = 0;
let targetScrollY = 0;
const damping = 0.05;
let lastTouchY = 0;

export const defaultPosition = new THREE.Vector3(0, 12, 30);

export const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.01,
  1000
);

export function onWindow(renderer: THREE.WebGLRenderer) {
  window.addEventListener("wheel", (event) => {
    targetScrollY += event.deltaY;
  });

  window.addEventListener("resize", () => {
    onWindowResize(camera, renderer);
  });

  // workaround for mobile
  window.addEventListener("touchmove", (event) => {
    const touchY = event.touches[0].clientY;
    if (lastTouchY) {
      targetScrollY += (lastTouchY - touchY) * 3;
    }
    lastTouchY = touchY;
  });

  window.addEventListener("touchend", () => {
    lastTouchY = 0;
  });

  window.addEventListener("scroll", (e) => {
    console.log(e);
  });
}

export function updateByScroll(delta: number, lookAt: THREE.Vector3) {
  scrollY += (targetScrollY - scrollY) * damping * delta * 60;

  const rotation = (scrollY / 10000) * Math.PI * 2;
  camera.position.x = Math.sin(rotation) * defaultPosition.z;
  camera.position.z = Math.cos(rotation) * defaultPosition.z;
  camera.lookAt(lookAt);
}

export function scrollProgress() {
  return (scrollY % 10000) / 100;
}

export function onWindowResize(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
