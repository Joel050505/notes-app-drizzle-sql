import {
  ErrorComponent,
  Link,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  noteByIdQueryOptions,
  deleteNote,
  invalidateNotes,
  updateNote,
  toggleFavorite,
  invalidateNote,
} from "../utils/notes";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { useState } from "react";
import { NotFound } from "~/components/NotFound";

export const Route = createFileRoute("/notes/$noteId")({
  loader: async ({ params: { noteId }, context }) => {
    const id = parseInt(noteId, 10);
    await context.queryClient.ensureQueryData(noteByIdQueryOptions(id));
    return { noteId };
  },
  errorComponent: NoteErrorComponent,
  notFoundComponent: () => {
    return <NotFound>Note not found</NotFound>;
  },
  component: NoteComponent,
});

export function NoteErrorComponent({ error }: ErrorComponentProps) {
  return <ErrorComponent error={error} />;
}

function NoteComponent() {
  const { noteId } = Route.useParams();
  const id = parseInt(noteId, 10);
  const noteQuery = useSuspenseQuery(noteByIdQueryOptions(id));
  const note = noteQuery.data;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editBody, setEditBody] = useState(note.body);

  // Setup delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteNote({ data: id }),
    onSuccess: async () => {
      // Invalidate notes to refresh the list
      await invalidateNotes(queryClient);
      // Navigate back to the notes list
      navigate({ to: "/notes" });
    },
  });

  // Setup favorite toggle mutation
  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavorite({ data: id }),
    onSuccess: async () => {
      // Invalidate this note and the notes list
      await invalidateNote(queryClient, id);
      await invalidateNotes(queryClient);
    },
  });

  // Setup update mutation
  const updateMutation = useMutation({
    mutationFn: () =>
      updateNote({
        data: {
          id,
          title: editTitle,
          body: editBody,
        },
      }),
    onSuccess: async () => {
      // Invalidate this note and the notes list
      await invalidateNote(queryClient, id);
      await invalidateNotes(queryClient);
      setIsEditing(false);
    },
  });

  // Handle delete button click
  const handleDelete = () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    deleteMutation.mutate();
  };

  // Cancel delete
  const cancelDelete = () => {
    setIsConfirming(false);
  };

  // Handle edit mode
  const handleEdit = () => {
    setEditTitle(note.title);
    setEditBody(note.body);
    setIsEditing(true);
  };

  // Cancel edit
  const cancelEdit = () => {
    setIsEditing(false);
    setEditTitle(note.title);
    setEditBody(note.body);
  };

  // Save edit
  const handleSave = () => {
    updateMutation.mutate();
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <Link
          to="/notes"
          className="text-blue-600 hover:underline inline-block"
        >
          ← Back to notes
        </Link>

        <div className="flex gap-2">
          {/* Favorite button */}
          <button
            onClick={() => favoriteMutation.mutate()}
            disabled={favoriteMutation.isPending}
            className="px-4 py-2 rounded-md bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          >
            {favoriteMutation.isPending
              ? "..."
              : note.favorite
                ? "★ Unfavorite"
                : "☆ Favorite"}
          </button>

          {/* Edit button */}
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
            >
              Edit
            </button>
          )}

          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className={`px-4 py-2 rounded-md ${
              isConfirming
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {deleteMutation.isPending
              ? "Deleting..."
              : isConfirming
                ? "Confirm Delete"
                : "Delete"}
          </button>
        </div>
      </div>

      {isConfirming && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 mb-4 rounded-md">
          <p className="font-medium">
            Are you sure you want to delete this note?
          </p>
          <p className="text-sm mt-1">This action cannot be undone.</p>
          <button
            onClick={cancelDelete}
            className="text-red-600 underline text-sm mt-2"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        {isEditing ? (
          // Edit mode
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body
              </label>
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </button>
              <button
                onClick={cancelEdit}
                disabled={updateMutation.isPending}
                className="px-4 py-2 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>

            {updateMutation.isError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
                <p>
                  Error updating note: {(updateMutation.error as Error).message}
                </p>
              </div>
            )}
          </div>
        ) : (
          // View mode
          <>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">{note.title}</h1>
              {note.favorite && (
                <span className="text-yellow-500 text-2xl">★</span>
              )}
            </div>

            <div className="prose">
              <p className="whitespace-pre-wrap">{note.body}</p>
            </div>
          </>
        )}
      </div>

      {deleteMutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 mt-4 rounded-md">
          <p>Error deleting note: {(deleteMutation.error as Error).message}</p>
        </div>
      )}

      {favoriteMutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 mt-4 rounded-md">
          <p>
            Error toggling favorite: {(favoriteMutation.error as Error).message}
          </p>
        </div>
      )}
    </div>
  );
}
