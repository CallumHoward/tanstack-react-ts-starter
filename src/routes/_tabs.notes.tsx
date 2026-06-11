import { Capacitor } from "@capacitor/core";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";

import { NOTES, formatNoteDate, notePreview } from "@/lib/notes";
import { withNativeTransition } from "@/lib/use-native-transition";

export const Route = createFileRoute("/_tabs/notes")({
  component: NotesList,
});

function NotesList() {
  const router = useRouter();

  return (
    <main className="page notes-page">
      <h1>Notes</h1>
      <ul className="notes-list">
        {NOTES.map((note) => (
          <li key={note.id}>
            <Link
              to="/notes/$noteId"
              params={{ noteId: note.id }}
              className="note-row"
              onClick={(event) => {
                // Web: let the Link navigate normally. Native: drive a forward
                // push transition instead of the default navigation.
                if (!Capacitor.isNativePlatform()) return;
                event.preventDefault();
                void withNativeTransition("forward", () =>
                  router.navigate({ to: "/notes/$noteId", params: { noteId: note.id } }),
                );
              }}
            >
              <span className="note-row-title">{note.title}</span>
              <span className="note-row-meta">
                <span className="note-row-date">{formatNoteDate(note.updatedAt)}</span>
                <span className="note-row-preview">{notePreview(note.body)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
