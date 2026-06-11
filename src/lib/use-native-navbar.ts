import { Capacitor } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import { NativeNavigation } from "@capgo/capacitor-native-navigation";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { setDirection } from "@/lib/transitions";

// Native top navbar (Liquid Glass on iOS 26+) with a back button, for pushed
// detail routes that sit outside the tabbed layout. Hides the tab bar while
// shown and routes the back tap. No-op on the web (the page's own back link and
// the absence of the tab bar cover it there).
export function useNativeNavbar(title: string) {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let handle: PluginListenerHandle | undefined;
    let cancelled = false;

    const setup = async () => {
      // Idempotent; also covers deep-linking straight to a detail route without
      // first passing through the tabbed layout.
      await NativeNavigation.configure({ enabled: true, contentInsetMode: "css" });
      await NativeNavigation.setTabbar({ hidden: true });
      await NativeNavigation.setNavbar({ title, backButton: { visible: true } });

      const listener = await NativeNavigation.addListener("navbarBack", () => {
        // Pop through history so the cap-router-outlet plays the back animation
        // and the URL stays in sync (same path the swipe gesture takes).
        setDirection("back");
        if (router.history.canGoBack()) router.history.back();
        else void router.navigate({ to: "/notes" });
      });

      if (cancelled) void listener.remove();
      else handle = listener;
    };

    void setup();

    return () => {
      cancelled = true;
      void handle?.remove();
      // Leaving the detail hides the navbar; the tab bar is restored by the
      // _tabs layout's useNativeTabBar when it remounts.
      void NativeNavigation.setNavbar({ hidden: true });
    };
  }, [router, title]);
}
