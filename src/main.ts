import "./style.css";
import * as THREE from "three";
import * as View from "./view";
import * as World from "./world";
import * as UI from "./ui";

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
  View.onWindow(renderer);
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
  World.initClimbAction(climbAction);

  World.scene.add(gltf.scene);
  View.camera.lookAt(mountainCenter);
  const clock = new THREE.Clock();
  UI.hideLoading(loading);
  setTimeout(() => {
    UI.slideInMeContainer(meContainer);
  }, 800);

  let isGliding = false;

  let ranMask = 0b0000;
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
      glideAction.play();
      climbAction.stop();
      iceAxe.visible = false;
      glider.visible = true;
      rig.lookAt(View.camera.position);
      isGliding = true;
    }

    if (isGliding) {
      World.updateGliding(delta, rig);

      if (rig.position.y < -5) {
        rig.position.y = -10;

        isGliding = false;
      }
    }

    renderer.render(World.scene, View.camera);
  }
  animate();
});
