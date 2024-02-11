import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as View from "./view";

export const scene = new THREE.Scene();

export function addFog() {
  scene.fog = new THREE.Fog(0xcccccc, 30, 90);
}

export function addLight() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
  directionalLight.position.set(1, 2, 0);
  scene.add(directionalLight);
}

let clampedUnitDir: THREE.Vector3 | null = null;
export function updateGliding(delta: number, rig: THREE.Object3D) {
  const speed = 2;
  const dir = View.camera.position.clone().sub(rig.position);
  const distance = dir.length();
  const unitDir = dir.clone().normalize();
  if (!clampedUnitDir && distance < 20) {
    clampedUnitDir = unitDir.clone();
  }
  const updateVec = clampedUnitDir
    ? clampedUnitDir.clone().multiplyScalar(speed * delta)
    : unitDir.multiplyScalar(speed * delta);
  updateVec.y = -0.5 * delta;

  if (!clampedUnitDir) {
    rig.lookAt(
      new THREE.Vector3(
        View.camera.position.x,
        rig.position.y,
        View.camera.position.z
      )
    );
  }

  rig.position.add(updateVec);
}

export function initClimbAction(climbAction: THREE.AnimationAction) {
  climbAction.play();
  climbAction.paused = true;
  climbAction.loop = THREE.LoopOnce;
  climbAction.clampWhenFinished = true;
}

export async function loadModel() {
  return new Promise<GLTF>((resolve) => {
    const loader = new GLTFLoader();
    loader.load("/models/scene-big.glb", (glb) => {
      resolve(glb);
    });
  });
}

export function initModel(glb: GLTF) {
  const mixer = new THREE.AnimationMixer(glb.scene);
  const meshes = {
    rig: new THREE.Object3D(),
    iceAxe: new THREE.Object3D(),
    glider: new THREE.Object3D(),
  };
  glb.scene.traverse((child) => {
    if (child.isObject3D) {
      switch (child.name) {
        case "rig":
          meshes.rig = child;
          break;
        case "axe":
          meshes.iceAxe = child;
          break;
        case "glider":
          meshes.glider = child;
          break;
        default:
          break;
      }
    }
  });

  return {
    ...meshes,
    mixer,
    climbAction: mixer.clipAction(
      glb.animations.find((clip) => clip.name === "ascent and cheer")!
    ),
    glideAction: mixer.clipAction(
      glb.animations.find((clip) => clip.name === "paraglide")!
    ),
    mountainCenter: new THREE.Box3()
      .setFromObject(glb.scene)
      .getCenter(new THREE.Vector3()),
  };
}
