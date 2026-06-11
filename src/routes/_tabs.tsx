import { Outlet, createFileRoute } from "@tanstack/react-router";

import { WebTabBar } from "@/components/web-tab-bar";
import { useNativeTabBar } from "@/lib/use-native-tab-bar";

// Pathless layout for the tabbed section of the app. Routes nested under it
// (Home, About, Settings, Notes list) share the bottom navigation; routes
// outside it (e.g. a note detail) render without tabs.
export const Route = createFileRoute("/_tabs")({
  component: TabsLayout,
});

function TabsLayout() {
  useNativeTabBar();

  return (
    <>
      <Outlet />
      <WebTabBar />
    </>
  );
}
