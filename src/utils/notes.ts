import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
  readNotes,
  getNoteById,
  createNote,
  updateNote,
  removeNote,
} from "../routes/api/notes";

// TanStack Start server functions som anropar API-lagret
export const getNotes = createServerFn({ method: "GET" }).handler(async () => {
  return await readNotes();
});

export const getNote = createServerFn({ method: "GET" })
  .inputValidator((id: number) => id)
  .handler(async ({ data }) => {
    return await getNoteById(data);
  });

export const addNote = createServerFn({ method: "POST" })
  .inputValidator((note: { title: string; content?: string }) => note)
  .handler(async ({ data }) => {
    return await createNote(data);
  });

export const editNote = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { id: number; updates: { title?: string; content?: string } }) =>
      data
  )
  .handler(async ({ data }) => {
    return await updateNote(data.id, data.updates);
  });

export const deleteNote = createServerFn({ method: "POST" })
  .inputValidator((id: number) => id)
  .handler(async ({ data }) => {
    return await removeNote(data);
  });

// Query options för React Query
export const notesListQueryOptions = () =>
  queryOptions({
    queryKey: ["notes"],
    queryFn: () => getNotes(),
  });

export const noteByIdQueryOptions = (noteId: number) =>
  queryOptions({
    queryKey: ["notes", noteId],
    queryFn: () => getNote({ data: noteId }),
  });
