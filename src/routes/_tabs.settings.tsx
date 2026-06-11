import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_tabs/settings")({
  component: Settings,
});

function Settings() {
  return (
    <main className="page">
      <h1>Settings</h1>
      <p>A placeholder settings page.</p>
    </main>
  );
}
