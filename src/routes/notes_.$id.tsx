import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { editNote, deleteNote, noteByIdQueryOptions } from "~/utils/notes";
export const Route = createFileRoute("/notes_/$id")({
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      noteByIdQueryOptions(parseInt(params.id))
    );
  },
  component: NoteDetail,
});
function NoteDetail() {
  const { id } = Route.useParams();
  const { data: note } = useSuspenseQuery(noteByIdQueryOptions(parseInt(id)));
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const updateMutation = useMutation({
    mutationFn: (updates: { title: string; content?: string }) =>
      editNote({ data: { id: parseInt(id), updates } }),
    onSuccess: () => {
      queryClient.invalidateQueries(noteByIdQueryOptions(parseInt(id)));
      setIsEditing(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteNote({ data: parseInt(id) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      navigate({ to: "/notes" } as any);
    },
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          to="/notes"
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          ← Tillbaka till alla anteckningar
        </Link>

        {isEditing ? (
          <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              ✏️ Redigera anteckning
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate({
                  title: title.trim(),
                  content: content.trim() || undefined,
                });
              }}
            >
              <div className="mb-5">
                <label
                  htmlFor="edit-title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Titel
                </label>
                <input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Titel..."
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="edit-content"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Innehåll
                </label>
                <textarea
                  id="edit-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                  placeholder="Innehåll..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateMutation.isPending
                    ? "💾 Sparar..."
                    : "💾 Spara ändringar"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all transform hover:scale-105"
                >
                  ❌ Avbryt
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
            <h1 className="text-3xl font-bold mb-4 text-gray-800 border-b pb-4">
              {note ? note.title : "Ingen anteckning hittad"}
            </h1>

            {note && (
              <>
                <div className="mb-6">
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                    {note.content || "Inget innehåll..."}
                  </p>
                </div>

                <div className="mb-6 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  🕐 Skapad: {new Date(note.createdAt).toLocaleString("sv-SE")}
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105"
                  >
                    ✏️ Redigera
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteMutation.isPending ? "⏳ Tar bort..." : "🗑️ Ta bort"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
