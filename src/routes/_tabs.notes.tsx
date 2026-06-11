import { Link, createFileRoute } from "@tanstack/react-router";

import { NOTES, formatNoteDate, notePreview } from "@/lib/notes";

export const Route = createFileRoute("/_tabs/notes")({
  component: NotesList,
});

function NotesList() {
  return (
    <main className="page notes-page">
      <h1>Notes</h1>
      <ul className="notes-list">
        {NOTES.map((note) => (
          <li key={note.id}>
            <Link to="/notes/$noteId" params={{ noteId: note.id }} className="note-row">
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
