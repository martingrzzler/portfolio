import "./style.css";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

namespace View {
  export let scrollY = 0;
  let targetScrollY = 0;
  const damping = 0.05;
  export const defaultPosition = new THREE.Vector3(0, 10, 30);

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
    camera.position.x = Math.sin(rotation) * defaultPosition.z;
    camera.position.z = Math.cos(rotation) * defaultPosition.z;
    camera.lookAt(lookAt);
  }

  export function scrollProgress() {
    return (scrollY % 10000) / 100;
  }
}

namespace World {
  export const scene = new THREE.Scene();

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

  export async function loadModel() {
    return new Promise<GLTF>((resolve) => {
      const loader = new GLTFLoader();
      loader.load("/models/scene-all.glb", (glb) => {
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
}

namespace UI {
  export function hideLoading(loading: HTMLDivElement) {
    loading.classList.add("fade-out");

    loading.onanimationend = () => {
      loading.style.display = "none";
    };
  }

  export function getElements() {
    return {
      loading: document.querySelector(".loading-wrapper") as HTMLDivElement,
      canvas: document.querySelector("canvas") as HTMLCanvasElement,
      meContainer: document.querySelector(".me") as HTMLDivElement,
      welcome: document.querySelector("#welcome") as HTMLDivElement,
      projects: document.querySelector("#projects") as HTMLDivElement,
      experience: document.querySelector("#experience") as HTMLDivElement,
      contact: document.querySelector("#contact") as HTMLDivElement,
    };
  }
  export function slideInMeContainer(me: HTMLDivElement) {
    me.style.display = "block";
    me.classList.add("slide-up");
  }
}

window.addEventListener("load", async () => {
  const {
    loading,
    canvas,
    meContainer,
    welcome,
    projects,
    experience,
    contact,
  } = UI.getElements();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(innerWidth, innerHeight);
  View.onWindow();
  View.camera.position.copy(View.defaultPosition);
  World.addFog();
  World.scene.add(View.camera);
  World.addLight();
  const gltf = await World.loadModel();
  const {
    glider,
    climbAction,
    mountainCenter,
    mixer,
    glideAction,
    rig,
    iceAxe,
  } = World.initModel(gltf);
  glider.visible = false;

  climbAction.play();
  climbAction.paused = true;
  climbAction.loop = THREE.LoopOnce;
  climbAction.clampWhenFinished = true;

  World.scene.add(gltf.scene);
  View.camera.lookAt(mountainCenter);
  const clock = new THREE.Clock();
  await new Promise((resolve) => setTimeout(resolve, 2000));
  UI.hideLoading(loading);
  setTimeout(() => {
    UI.slideInMeContainer(meContainer);
  }, 800);

  let ranMask = 0b0000;
  let isGliding = false;
  let clampedUnitDir: THREE.Vector3 | null = null;
  function animate() {
    requestAnimationFrame(animate);
    let delta = clock.getDelta();
    View.updateByScroll(delta, mountainCenter);
    mixer.update(delta);

    if (View.scrollProgress() >= 5 && !(ranMask & 0b0001)) {
      ranMask |= 0b0001;
      welcome.classList.add("slide-west-leave");
      welcome.onanimationend = () => {
        welcome.style.display = "none";
        welcome.classList.remove("slide-west-leave");
      };

      projects.style.display = "block";
      projects.classList.add("slide-west-enter");
      projects.onanimationend = () => {
        projects.classList.remove("slide-west-enter");
      };

      climbAction.paused = false;
    } else if (View.scrollProgress() >= 30 && !(ranMask & 0b0010)) {
      ranMask |= 0b0010;
      projects.classList.add("slide-west-leave");
      projects.onanimationend = () => {
        projects.style.display = "none";
        projects.classList.remove("slide-west-leave");
      };

      experience.style.display = "block";
      experience.classList.add("slide-west-enter");
      experience.onanimationend = () => {
        experience.classList.remove("slide-west-enter");
      };
    } else if (View.scrollProgress() >= 60 && !(ranMask & 0b0100)) {
      ranMask |= 0b0100;
      experience.classList.add("slide-west-leave");
      experience.onanimationend = () => {
        experience.style.display = "none";
        experience.classList.remove("slide-west-leave");
      };

      contact.style.display = "block";
      contact.classList.add("slide-west-enter");
      contact.onanimationend = () => {
        contact.classList.remove("slide-west-enter");
      };
    } else if (
      View.scrollProgress() >= 90 &&
      !(ranMask & 0b1000) &&
      !climbAction.isRunning()
    ) {
      ranMask |= 0b1000;
      // startGliding
      console.log("start gliding");
      glideAction.play();
      climbAction.stop();
      iceAxe.visible = false;
      glider.visible = true;
      rig.lookAt(View.camera.position);
      isGliding = true;
    }

    if (isGliding) {
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

    renderer.render(World.scene, View.camera);
  }
  animate();
});
