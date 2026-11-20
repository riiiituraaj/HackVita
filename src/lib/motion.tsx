"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const KEY = "hv-reduce-motion";

type MotionCtx = {
  /** True when the OS asks for less motion OR the corner toggle is on. */
  reduced: boolean;
  /** The corner toggle's own state. */
  userReduced: boolean;
  toggleReduced: () => void;
  /** Fine pointer + hover capable (desktop mouse/trackpad). */
  finePointer: boolean;
  /** The preloader has finished. */
  booted: boolean;
  setBooted: (v: boolean) => void;
};

const Ctx = createContext<MotionCtx>({
  reduced: false,
  userReduced: false,
  toggleReduced: () => {},
  finePointer: false,
  booted: false,
  setBooted: () => {},
});

function readStored(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function writeStored(v: boolean) {
  try {
    window.localStorage.setItem(KEY, v ? "1" : "0");
  } catch {
    /* storage unavailable (private mode, blocked) — the toggle still works for this visit */
  }
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [systemReduced, setSystemReduced] = useState(false);
  const [userReduced, setUserReduced] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fp = window.matchMedia("(hover: hover) and (pointer: fine)");
    setSystemReduced(mq.matches);
    setFinePointer(fp.matches);
    setUserReduced(readStored());
    const onMq = () => setSystemReduced(mq.matches);
    const onFp = () => setFinePointer(fp.matches);
    mq.addEventListener("change", onMq);
    fp.addEventListener("change", onFp);
    return () => {
      mq.removeEventListener("change", onMq);
      fp.removeEventListener("change", onFp);
    };
  }, []);

  const reduced = systemReduced || userReduced;

  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  }, [reduced]);

  useEffect(() => {
    document.documentElement.dataset.booted = booted ? "1" : "0";
  }, [booted]);

  const toggleReduced = useCallback(() => {
    setUserReduced((v) => {
      writeStored(!v);
      return !v;
    });
  }, []);

  const value = useMemo(
    () => ({ reduced, userReduced, toggleReduced, finePointer, booted, setBooted }),
    [reduced, userReduced, toggleReduced, finePointer, booted],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useMotion = () => useContext(Ctx);

/** Inline script: sets data-motion before first paint so there is no flash of animated state. */
export const motionBootScript = `(function(){try{var d=document.documentElement;var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var u=false;try{u=localStorage.getItem('${KEY}')==='1'}catch(e){}d.dataset.motion=(r||u)?'reduced':'full';d.dataset.booted='0';d.dataset.js='1';try{if(sessionStorage.getItem('hv-booted')==='1')d.dataset.quickboot='1'}catch(e){}}catch(e){}})();`;
