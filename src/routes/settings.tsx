import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
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
