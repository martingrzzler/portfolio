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
    skills: document.querySelector("#skills") as HTMLDivElement,
    experience: document.querySelector("#experience") as HTMLDivElement,
    contact: document.querySelector("#contact") as HTMLDivElement,
  };
}
export function slideInMeContainer(me: HTMLDivElement) {
  me.style.display = "block";
  me.classList.add("slide-up");
}

export function exitOutOfView(element: HTMLDivElement) {
  element.classList.add("slide-west-leave");
  element.onanimationend = () => {
    element.style.display = "none";
    element.classList.remove("slide-west-leave");
  };
}

export function enterIntoView(element: HTMLDivElement) {
  element.style.display = "block";
  element.classList.add("slide-west-enter");
  element.onanimationend = () => {
    element.classList.remove("slide-west-enter");
  };
}
