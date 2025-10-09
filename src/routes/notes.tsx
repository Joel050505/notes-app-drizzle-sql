import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  notesListQueryOptions,
  addNote,
  NewNoteType,
  NoteType,
} from "../utils/notes";
import { useState } from "react";

export const Route = createFileRoute("/notes")({
  loader: async ({ context }) => {
    // Ensure data is prefetched before the component renders
    await context.queryClient.ensureQueryData(notesListQueryOptions());
    return {};
  },
  head: () => ({
    meta: [{ title: "My Notes" }],
  }),
  component: NotesListComponent,
});

function NotesListComponent() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // Use the prefetched data
  const { data: notes } = useSuspenseQuery(notesListQueryOptions());
  const queryClient = useQueryClient();

  // Setup mutation
  const mutation = useMutation({
    mutationFn: (newNote: NewNoteType) => addNote({ data: newNote }),

    // When mutate is called:
    onMutate: async (newNote) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notes"] });

      // Snapshot the previous value
      const previousNotes = queryClient.getQueryData<NoteType[]>(["notes"]);

      // Optimistically update to the new value
      if (previousNotes) {
        queryClient.setQueryData<NoteType[]>(["notes"], (old) => [
          ...(old || []),
          {
            id: Date.now(), // temporary id
            title: newNote.title,
            body: newNote.body,
            favorite: false,
          },
        ]);
      }

      // Return a context object with the snapshot
      return { previousNotes };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newNote, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes"], context.previousNotes);
      }
    },

    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      // Clear the form
      setTitle("");
      setBody("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return; // Prevent empty submissions

    mutation.mutate({ title, body });
  };

  const isFormValid = title.trim() !== "";
  const isPending = mutation.isPending;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Notes</h1>

      {/* Add Note Form */}
      <div className="mb-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Note</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Note title"
              disabled={isPending}
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="body"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Content
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Note content"
              disabled={isPending}
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isPending}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${
                !isFormValid || isPending
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
          >
            {isPending ? "Adding..." : "Add Note"}
          </button>

          {mutation.isError && (
            <div className="mt-2 text-red-600">
              Error adding note: {(mutation.error as Error).message}
            </div>
          )}

          {mutation.isSuccess && (
            <div className="mt-2 text-green-600">Note added successfully!</div>
          )}
        </form>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <p className="text-gray-500">No notes found. Create your first note!</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note.id}>
              <Link
                to="/notes/$noteId"
                params={{ noteId: String(note.id) }}
                className="block border rounded p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {note.title}
                  </span>
                  {note.favorite && <span className="text-yellow-500">★</span>}
                </div>
                {note.body && (
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {note.body}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <hr />

      {/* Render child routes (note detail page) */}
      <Outlet />
    </div>
  );
}
