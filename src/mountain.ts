import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

const scene = new THREE.Scene();
let animationMixer: THREE.AnimationMixer | undefined = undefined;
let climbAction: THREE.AnimationAction | undefined = undefined;
scene.fog = new THREE.Fog(0xcccccc, 0, 60);
const cameraZ = 35;
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
camera.position.set(0, 10, cameraZ);
scene.add(camera);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
directionalLight.position.set(1, 2, 0);
scene.add(directionalLight);

const canvas = document.querySelector("canvas")!;
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setClearColor(0x000000, 0);
renderer.setSize(innerWidth, innerHeight);

// const controls = new OrbitControls(camera, canvas);
// controls.zoomToCursor = false;

let mountainCenter = new THREE.Vector3();

const loader = new GLTFLoader();
loader.load("/models/scene-all.glb", (glb) => {
  scene.add(glb.scene);

  console.log(glb);
  glb.scene.traverse((child) => {
    if (child.isObject3D && child.name === "glider") {
      child.visible = false;
    }
  });

  animationMixer = new THREE.AnimationMixer(glb.scene);
  climbAction = animationMixer.clipAction(
    glb.animations.find((clip) => clip.name === "ascent and cheer")!
  );
  climbAction.play();

  const box = new THREE.Box3().setFromObject(glb.scene);
  mountainCenter = box.getCenter(new THREE.Vector3());
  camera.lookAt(mountainCenter);
});

let scrollY = 0;
let targetScrollY = 0;
const damping = 0.05;
window.addEventListener("wheel", (event) => {
  targetScrollY += event.deltaY;
});

const clock = new THREE.Clock();

let count = 0;

function animate() {
  requestAnimationFrame(animate);
  let delta = clock.getDelta();
  scrollY += (targetScrollY - scrollY) * damping * delta * 60;

  const rotation = (scrollY / 10000) * Math.PI * 2;
  camera.position.x = Math.sin(rotation) * cameraZ;
  camera.position.z = Math.cos(rotation) * cameraZ;
  camera.lookAt(mountainCenter);

  if (animationMixer) {
    count++;
    animationMixer.update(delta);
    if (count === 1) {
      climbAction!.paused = true;
    }
  }

  // controls.update();
  renderer.render(scene, camera);
}

animate();

class Loop {
  private clock = new THREE.Clock();
  private updateFns: Function[] = [];
  private update() {
    const delta = this.clock.getDelta();
    this.updateFns.forEach((fn) => fn(delta));
  }
  start() {
    this.clock.start();
    const loop = () => {
      this.update();
      requestAnimationFrame(loop);
    };
    loop();
  }
  add(fn: Function) {
    this.updateFns.push(fn);
  }
}
