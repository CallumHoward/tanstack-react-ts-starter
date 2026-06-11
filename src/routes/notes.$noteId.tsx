import { Link, createFileRoute } from "@tanstack/react-router";

import { formatNoteDate, getNote } from "@/lib/notes";
import { useNativeNavbar } from "@/lib/use-native-navbar";

export const Route = createFileRoute("/notes/$noteId")({
  component: NoteDetail,
});

function NoteDetail() {
  const { noteId } = Route.useParams();
  const note = getNote(noteId);

  // Native Liquid Glass navbar + back button (hides the tab bar); no-op on web.
  useNativeNavbar(note?.title ?? "Note");

  return (
    <main className="page note-detail">
      {/* Web back affordance; hidden on native where the navbar provides it. */}
      <Link to="/notes" className="back-link">
        ‹ Notes
      </Link>
      {note ? (
        <article>
          <h1>{note.title}</h1>
          <p className="note-detail-date">{formatNoteDate(note.updatedAt)}</p>
          <p className="note-detail-body">{note.body}</p>
        </article>
      ) : (
        <p>Note not found.</p>
      )}
    </main>
  );
}
