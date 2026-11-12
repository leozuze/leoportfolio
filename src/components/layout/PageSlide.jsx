// Wrapper for the home sections that follow the hero.
// It used to scale and round its corners while sliding over a pinned hero.
// The hero no longer pins, and animating a page-sized element's scale and
// radius is what made scrolling drag, so it is now a plain wrapper.
export default function PageSlide({ children }) {
  return <div className="relative z-10 bg-bg">{children}</div>;
}