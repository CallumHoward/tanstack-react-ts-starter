import { TanStackDevtools } from "@tanstack/react-devtools";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { NotFound } from "@/components/not-found";
import { WebTabBar } from "@/components/web-tab-bar";
import { useNativeTabBar } from "@/lib/use-native-tab-bar";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf8",
      },
      {
        // viewport-fit=cover is required for env(safe-area-inset-*) to report
        // real values on notched iOS devices (see safe-area padding in styles.css).
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  notFoundComponent: NotFound,

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  useNativeTabBar();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col items-center">
        {children}
        <WebTabBar />
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
