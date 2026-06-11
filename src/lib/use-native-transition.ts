import { Capacitor } from "@capacitor/core";
import { NativeNavigation } from "@capgo/capacitor-native-navigation";
import type { NativeNavigationTransitionDirection } from "@capgo/capacitor-native-navigation";

// Wrap a route change in a native WebView snapshot transition. On the web it
// just runs the navigation (the browser/View-Transitions handle motion, if any).
//
// Order matters: begin captures the *current* screen, then we navigate and wait
// for the new screen to paint (navigate() resolves after loaders; one rAF for
// the paint) before finishing the snapshot->live animation.
export async function withNativeTransition(
  direction: NativeNavigationTransitionDirection,
  navigate: () => void | Promise<void>,
): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    await navigate();
    return;
  }

  const transition = await NativeNavigation.beginTransition({ direction });
  await navigate();
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
  await NativeNavigation.finishTransition({ id: transition.id, direction });
}
