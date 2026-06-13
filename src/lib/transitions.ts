// SSR-safe seam for @capgo/capacitor-transitions.
//
// The package defines custom-element classes (`class … extends HTMLElement`)
// at import time, which throws in Node during our SPA shell prerender. So we
// never import it statically: the runtime is loaded once on the client via
// dynamic import, and callers use the thin wrappers below (no-ops until loaded,
// which happens on the first client paint — before any user interaction).
//
// The `import type` keeps the package's JSX augmentation (cap-router-outlet,
// cap-page, …) active project-wide without emitting any runtime import.
import type { TransitionDirection } from "@capgo/capacitor-transitions/react";

type TransitionsApi = typeof import("@capgo/capacitor-transitions/react");

let api: TransitionsApi | null = null;
let apiPromise: Promise<TransitionsApi> | null = null;

/** Load + register the transition runtime (client only). Safe to call repeatedly. */
export function loadTransitions(): Promise<TransitionsApi> | undefined {
  if (typeof window === "undefined") return undefined;
  if (!apiPromise) {
    apiPromise = (async () => {
      await import("@capgo/capacitor-transitions"); // registers the custom elements
      api = await import("@capgo/capacitor-transitions/react");
      return api;
    })();
  }
  return apiPromise;
}

/** Set the direction for the next router navigation (no-op until loaded). */
export function setDirection(direction: TransitionDirection): void {
  api?.setDirection(direction);
}

// The built-in swipe-back derives its release duration from finger velocity, so
// releasing with ~0 velocity snaps instantly (duration 0). iOS always eases the
// settle. Floor the outlet's (internal) finishSwipeGestureBack release duration
// so both cancel and complete glide. Best-effort: a no-op if the method is
// renamed upstream — the gesture still works, just without the smoothing.
const MIN_SWIPE_RELEASE_MS = 220;

type SwipeOutlet = HTMLElement & {
  finishSwipeGestureBack?: (shouldComplete: boolean, releaseDuration: number) => Promise<void>;
};

export function smoothSwipeRelease(element: HTMLElement): void {
  const outlet = element as SwipeOutlet;
  const original = outlet.finishSwipeGestureBack;
  if (typeof original !== "function") return;
  const bound = original.bind(outlet);
  outlet.finishSwipeGestureBack = (shouldComplete, releaseDuration) =>
    bound(shouldComplete, Math.max(releaseDuration, MIN_SWIPE_RELEASE_MS));
}
