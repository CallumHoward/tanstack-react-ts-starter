import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";

import { formatNoteDate, getNote } from "@/lib/notes";
import { useEdgeSwipeBack } from "@/lib/use-edge-swipe-back";
import { useNativeNavbar } from "@/lib/use-native-navbar";
import { withNativeTransition } from "@/lib/use-native-transition";

export const Route = createFileRoute("/notes/$noteId")({
  component: NoteDetail,
});

function NoteDetail() {
  const { noteId } = Route.useParams();
  const note = getNote(noteId);
  const router = useRouter();

  const goBack = useCallback(
    () => void withNativeTransition("back", () => router.navigate({ to: "/notes" })),
    [router],
  );

  // Native Liquid Glass navbar + back button (hides the tab bar); no-op on web.
  useNativeNavbar(note?.title ?? "Note");
  // Left-edge swipe to go back (works on web and native).
  useEdgeSwipeBack(goBack);

  return (
    <main className="page note-detail">
      {/* Web back affordance; hidden on native where the navbar provides it. */}
      <button type="button" className="back-link" onClick={goBack}>
        ‹ Notes
      </button>
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
