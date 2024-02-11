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
