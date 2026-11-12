let instance = null;

export function setLenis(lenis) {
  instance = lenis;
}

export function scrollToY(y) {
  if (instance) {
    instance.scrollTo(y, { duration: 1.2, force: true });
    return;
  }
  window.scrollTo({ top: y, behavior: "smooth" });
}

export function scrollToTop() {
  scrollToY(0);
}