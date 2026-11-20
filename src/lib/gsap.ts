"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;

export function ensureGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.config({ nullTargetWarn: false });
  registered = true;
}

ensureGsap();

export { gsap, ScrollTrigger, SplitText };
