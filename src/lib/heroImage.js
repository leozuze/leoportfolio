// One place for the hero photos.
// hero-cutout.webp: transparent-background photo for the hero (head rises above the circle).
// hero-avatar.webp: small square face crop for the laptop screen in the intro.
// If a file is missing, the older heroimg.webp is used instead.
import fallback from "../assets/images/hero-cutout.webp";

const first = (files) => Object.values(files)[0];

export const heroCutout = first(
  import.meta.glob("../assets/images/hero-cutout.{webp,png}", { eager: true, import: "default" })
);

export const heroAvatar =
  first(
    import.meta.glob("../assets/images/hero-avatar.{webp,png}", { eager: true, import: "default" })
  ) ?? fallback;

export const heroPhoto = fallback;