import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { notesListQueryOptions, addNote, deleteNote } from "../utils/notes";
import { NewNoteInput, Note } from "types";
import { useState } from "react";

export const Route = createFileRoute("/notes")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(notesListQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const { data: notes } = useSuspenseQuery(notesListQueryOptions());

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [body, setBody] = useState("");

  ///////////////////
  //// Mutationer////
  ///////////////////
  const mutation = useMutation({
    mutationFn: (newNote: NewNoteInput) => addNote({ data: newNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setTitle("");
      setContent("");
      setBody("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNote({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  // Vänta med submit tills titel finns och mutation är klar
  const isPending = mutation.isPending;
  const isFormValid = title.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isPending) return;
    mutation.mutate({ title, content: body });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          📝 Mina Anteckningar
        </h1>

        {/* Add Note Form */}
        <div className="mb-8 bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            ✨ Skapa ny anteckning
          </h2>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="T.ex. Min nya idé..."
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
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                placeholder="Skriv ditt innehåll här..."
                disabled={isPending}
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isPending}
              className={`px-6 py-3 border border-transparent rounded-lg shadow-md text-base font-semibold text-white transition-all transform hover:scale-105 
              ${
                !isFormValid || isPending
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
            >
              {isPending ? "⏳ Lägger till..." : "➕ Lägg till anteckning"}
            </button>

            {mutation.isError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                ❌ Fel vid tillägg: {(mutation.error as Error).message}
              </div>
            )}

            {mutation.isSuccess && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                ✅ Anteckning skapad!
              </div>
            )}
          </form>
        </div>

        {/* Notes List */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            📚 Alla anteckningar
          </h2>
          {notes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-md">
              <p className="text-gray-400 text-lg">
                📭 Inga anteckningar än. Skapa din första!
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800">
                      {note.title}
                    </h3>
                  </div>
                  {note.content && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {note.content}
                    </p>
                  )}
                  <div className="flex gap-3">
                    <Link
                      to={`/notes_/${note.id}` as any}
                      className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105"
                    >
                      👁️ Visa detaljer
                    </Link>
                    <button
                      onClick={() => {
                        deleteMutation.mutate(note.id);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all transform hover:scale-105"
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "⏳" : "🗑️"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Render child routes (note detail page) */}
        <Outlet />
      </div>
    </div>
  );
}
