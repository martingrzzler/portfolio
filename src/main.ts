import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

namespace View {
  let scrollY = 0;
  let targetScrollY = 0;
  const damping = 0.05;
  export const defaultPosition = new THREE.Vector3(0, 10, 35);

  export const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.01,
    1000
  );

  export function onWindow() {
    window.addEventListener("wheel", (event) => {
      targetScrollY += event.deltaY;
    });
  }

  export function updateByScroll(delta: number, lookAt: THREE.Vector3) {
    scrollY += (targetScrollY - scrollY) * damping * delta * 60;

    const rotation = (scrollY / 10000) * Math.PI * 2;
    camera.position.x = Math.sin(rotation) * View.defaultPosition.z;
    camera.position.z = Math.cos(rotation) * View.defaultPosition.z;
    camera.lookAt(lookAt);
  }
}

namespace World {
  export const scene = new THREE.Scene();
  export let isGliding = false;
  export let mountainCenter = new THREE.Vector3();
  export let mixer: THREE.AnimationMixer | undefined = undefined;
  export let climbAction: THREE.AnimationAction | undefined = undefined;
  export let glideAction: THREE.AnimationAction | undefined = undefined;
  export let glider: THREE.Object3D | null = null;
  export let rig: THREE.Object3D | null = null;
  export let iceAxe: THREE.Object3D | null = null;

  export function addFog() {
    scene.fog = new THREE.Fog(0xcccccc, 0, 60);
  }

  export function addLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(1, 2, 0);
    scene.add(directionalLight);
  }

  export function addModel(onLoaded: () => void) {
    const loader = new GLTFLoader();
    loader.load("/models/scene-all.glb", (glb) => {
      scene.add(glb.scene);

      glb.scene.traverse((child) => {
        if (child.isObject3D) {
          switch (child.name) {
            case "rig":
              rig = child;
              break;
            case "axe":
              iceAxe = child;
              break;
            case "glider":
              glider = child;
              break;
            default:
              break;
          }
        }
      });

      glider!.visible = false;

      mixer = new THREE.AnimationMixer(glb.scene);
      climbAction = mixer.clipAction(
        glb.animations.find((clip) => clip.name === "ascent and cheer")!
      );
      glideAction = mixer.clipAction(
        glb.animations.find((clip) => clip.name === "paraglide")!
      );
      climbAction.play();
      climbAction.paused = true;
      climbAction.loop = THREE.LoopOnce;
      climbAction.clampWhenFinished = true;

      const box = new THREE.Box3().setFromObject(glb.scene);
      mountainCenter = box.getCenter(new THREE.Vector3());
      onLoaded();
    });
  }

  let clampedUnitDir: THREE.Vector3 | null = null;
  let initFlight = true;
  export function updateGliding(delta: number) {
    if (!World.rig) return;
    if (initFlight) {
      World.glideAction!.play();
      World.climbAction!.stop();
      World.rig.lookAt(View.camera.position);
      initFlight = false;
    }

    const speed = 2;

    const dir = View.camera.position.clone().sub(World.rig.position);

    const distance = dir.length();
    const unitDir = dir.clone().normalize();
    if (!clampedUnitDir && distance < 20) {
      console.log("clamped");
      clampedUnitDir = unitDir.clone();
      console.log(clampedUnitDir);
    }
    const updateVec = clampedUnitDir
      ? clampedUnitDir.clone().multiplyScalar(speed * delta)
      : unitDir.multiplyScalar(speed * delta);
    updateVec.y = -0.5 * delta;

    if (!clampedUnitDir) {
      World.rig.lookAt(View.camera.position);
    }

    World.rig.position.add(updateVec);
  }

  export function update(delta: number) {
    if (!mixer) return;
    mixer.update(delta);
  }
}

namespace Render {
  export let canvas: null | HTMLCanvasElement = null;
  export let renderer: THREE.WebGLRenderer | null = null;

  export function onWindow() {
    canvas = document.querySelector("canvas")!;
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });

    renderer.setClearColor(0x000000, 0);
    renderer.setSize(innerWidth, innerHeight);
  }
}

// const controls = new OrbitControls(camera, canvas);
// controls.zoomToCursor = false;
// controls.update();

function init() {
  Render.onWindow();
  View.onWindow();
  View.camera.position.copy(View.defaultPosition);

  // World.addFog();
  World.scene.add(View.camera);
  World.addLight();
  World.addModel(() => {
    View.camera.lookAt(World.mountainCenter);
  });

  const climbBtn = document.querySelector("#climb")!;
  climbBtn.addEventListener("click", () => {
    if (World.climbAction) {
      World.climbAction.paused = !World.climbAction.paused;
    }
  });
  const gliderBtn = document.querySelector("#glide")!;
  gliderBtn.addEventListener("click", () => {
    World.glider!.visible = true;
    World.iceAxe!.visible = false;
    World.isGliding = true;
  });
}

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  let delta = clock.getDelta();
  View.updateByScroll(delta, World.mountainCenter);
  World.update(delta);
  if (World.isGliding) {
    World.updateGliding(delta);
  }

  Render.renderer!.render(World.scene, View.camera);
}

window.addEventListener("load", () => {
  init();
  animate();
});
