import { TanStackDevtools } from "@tanstack/react-devtools";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { NotFound } from "@/components/not-found";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { getThemeServerFn } from "@/lib/theme";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  // Read the theme from the cookie on the server so the shell can render the
  // correct <html> class in the initial HTML, avoiding any flash.
  loader: () => getThemeServerFn(),

  head: () => ({
    meta: [
      {
        charSet: "utf8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "color-scheme",
        content: "light dark",
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
  const theme = Route.useLoaderData();

  return (
    <html lang="en" className={theme}>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col items-center">
        <ThemeProvider initialTheme={theme}>
          <header className="flex w-full justify-end p-4">
            <ThemeToggle />
          </header>
          {children}
        </ThemeProvider>
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
