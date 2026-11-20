"use client";

import { useMotion } from "@/lib/motion";

/** Corner badge: reduce-motion toggle (persisted in localStorage). */
export function MotionToggle() {
  const { userReduced, reduced, toggleReduced } = useMotion();
  const label = userReduced ? "Motion reduced — turn effects back on" : "Reduce motion";
  return (
    <button
      type="button"
      className={`motion-toggle glass gloss ${reduced ? "is-on" : ""}`}
      aria-pressed={userReduced}
      aria-label={label}
      data-tip={userReduced ? "Effects off" : "Reduce motion"}
      onClick={toggleReduced}
    >
      <svg viewBox="0 0 20 20" aria-hidden="true" fill="none">
        {reduced ? (
          <path d="M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        ) : (
          <path
            d="M2 10c2.5-5 5.5-5 8 0s5.5 5 8 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
          />
        )}
      </svg>
    </button>
  );
}
