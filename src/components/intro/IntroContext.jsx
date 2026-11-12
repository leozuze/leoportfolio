/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const KEY = "leo-intro-seen";
// plays on every refresh while developing; set to false to test once-per-session
const ALWAYS_PLAY = import.meta.env.DEV;

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
    } catch {
      /* storage is blocked, so the intro may replay next visit. That is fine. */
    }
    setDone(true);
  }, []);

  const value = useMemo(() => ({ done, finish }), [done, finish]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useIntro() {
  return useContext(Ctx);
}