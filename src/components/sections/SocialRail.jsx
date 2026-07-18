import { motion } from "framer-motion";
import {
  FaGithub,
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";

const SOCIALS = [
  { icon: FaGithub, href: "https://github.com/leozuze", label: "GitHub" },
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/leozuze/", label: "LinkedIn" },
  { icon: FaFacebook, href: "https://www.facebook.com/profile.php?id=61561005188449", label: "Facebook" },
  { icon: FaInstagram, href: "https://instagram.com/jayzthe_plug", label: "Instagram" },
  {
    icon: FaWhatsapp,
    href: "https://wa.me/919764506058?text=Hi%20Leo%2C%20I%27d%20like%20to%20start%20a%20project.",
    label: "WhatsApp",
  },
];

export default function SocialRail() {
  return (
    <div className="flex flex-col items-center gap-6 md:gap-7 fixed right-3 sm:right-5 md:right-8 top-1/2 -translate-y-1/2 z-40">
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: 40 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-px bg-border"
      />
      {SOCIALS.map(({ icon: Icon, href, label }, i) => (
        <motion.a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 + i * 0.12 }}
          className="text-muted hover:text-accent transition-colors"
        >
          <Icon size={15} />
        </motion.a>
      ))}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: 40 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-px bg-border"
      />
    </div>
  );
}