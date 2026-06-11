import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_tabs/about")({
  component: About,
});

function About() {
  return (
    <main className="page">
      <h1>About</h1>
      <p>A placeholder about page.</p>
    </main>
  );
}
