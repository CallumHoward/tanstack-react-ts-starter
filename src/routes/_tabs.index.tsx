import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_tabs/")({
  component: Home,
});

function Home() {
  return (
    <main className="page">
      <h1>Home</h1>
      <p>Welcome — this is the home tab.</p>
    </main>
  );
}
