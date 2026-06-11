import { Capacitor } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import { NativeNavigation } from "@capgo/capacitor-native-navigation";
import type { NativeNavigationTab } from "@capgo/capacitor-native-navigation";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { TABS, tabIdForPath } from "@/lib/tabs";

// The native setTabbar call rebuilds the whole bar from its options and treats a
// missing `tabs` as an empty array — so every call must re-send the full set or
// the bar disappears.
const NATIVE_TABS: NativeNavigationTab[] = TABS.map((tab) => ({
  id: tab.id,
  title: tab.title,
  icon: { ios: { sfSymbol: tab.sfSymbol }, svg: tab.svg },
}));

// Drives the native iOS/Android tab bar and bridges its taps to the router.
// No-op on the web, where the CSS WebTabBar handles navigation instead.
export function useNativeTabBar() {
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  // Set up the native bar once and translate native tab taps into navigations.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Lets CSS swap web-only layout (e.g. the fallback bar) off on native.
    document.documentElement.classList.add("is-native");

    let handle: PluginListenerHandle | undefined;
    let cancelled = false;

    const setup = async () => {
      // contentInsetMode: "css" writes --cap-native-navigation-* vars we pad with.
      await NativeNavigation.configure({ enabled: true, contentInsetMode: "css" });
      await NativeNavigation.setTabbar({
        tabs: NATIVE_TABS,
        selectedId: tabIdForPath(router.state.location.pathname),
      });

      const listener = await NativeNavigation.addListener("tabSelect", (event) => {
        const tab = TABS.find((candidate) => candidate.id === event.id);
        if (tab) void router.navigate({ to: tab.path });
      });

      if (cancelled) void listener.remove();
      else handle = listener;
    };

    void setup();

    return () => {
      cancelled = true;
      void handle?.remove();
    };
  }, [router]);

  // Keep the native selection in sync when the route changes from the web side.
  // Re-send the full tab set (not just selectedId) so the bar is not cleared.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    void NativeNavigation.setTabbar({
      tabs: NATIVE_TABS,
      selectedId: tabIdForPath(pathname),
      animated: false,
    });
  }, [pathname]);
}
