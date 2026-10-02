import { createContext, useCallback, useContext, useState } from "react";

const KEY = "leo-intro-seen";
const ALWAYS_PLAY = import.meta.env.DEV; // play on every refresh while developing

const read = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Ctx = createContext({ done: true, finish: () => {} });

export function IntroProvider({ children }) {
  const [done, setDone] = useState(() => {
    if (ALWAYS_PLAY) return false;
    return read() || reducedMotion();
  });

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    setDone(true);
  }, []);

  return <Ctx.Provider value={{ done, finish }}>{children}</Ctx.Provider>;
}

export const useIntro = () => useContext(Ctx);