import { queryOptions, QueryClient } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import fs from "fs/promises";
import path from "path";

export type NoteType = {
  id: number;
  title: string;
  body: string;
  favorite: boolean;
};

// Helper functions to read/write notes file
async function readNotesFile(): Promise<NoteType[]> {
  try {
    const filePath = path.resolve("notes.json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeNotesFile(notes: NoteType[]) {
  const filePath = path.resolve("notes.json");
  await fs.writeFile(filePath, JSON.stringify(notes, null, 2), "utf-8");
}

export const fetchNotes = createServerFn({ method: "GET" }).handler(
  async () => {
    console.info("Fetching notes...");
    return await readNotesFile();
  }
);

export const notesListQueryOptions = () =>
  queryOptions({
    queryKey: ["notes"],
    queryFn: () => fetchNotes(),
  });

export const noteByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["note", id],
    queryFn: async () => {
      const notes = await fetchNotes();
      const note = notes.find((note) => note.id === id);
      if (!note) throw notFound();
      return note;
    },
  });

// Helper function to prefetch a specific note by ID
export const prefetchNote = async (queryClient: QueryClient, id: number) => {
  await queryClient.prefetchQuery(noteByIdQueryOptions(id));
};

// Helper function to prefetch all notes
export const prefetchNotes = async (queryClient: QueryClient) => {
  await queryClient.prefetchQuery(notesListQueryOptions());
};

// Helper function to invalidate notes queries
export const invalidateNotes = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: ["notes"] });
};

// Helper function to invalidate a specific note query
export const invalidateNote = async (queryClient: QueryClient, id: number) => {
  await queryClient.invalidateQueries({ queryKey: ["note", id] });
};

// Type for creating a new note
export type NewNoteType = {
  title: string;
  body: string;
};

// Function to create a new note
export const addNote = createServerFn({ method: "POST" })
  .inputValidator((d: NewNoteType) => d)
  .handler(async ({ data }) => {
    console.info("Creating new note...");

    // Get all existing notes
    const existingNotes = await readNotesFile();

    // Generate a new ID
    const newId =
      existingNotes.length > 0
        ? Math.max(...existingNotes.map((note) => note.id)) + 1
        : 1;

    // Create the new note
    const newNote: NoteType = {
      id: newId,
      title: data.title,
      body: data.body,
      favorite: false,
    };

    // Add it to the list and save
    const updatedNotes = [...existingNotes, newNote];
    await writeNotesFile(updatedNotes);

    return newNote;
  });

// Function to delete a note
export const deleteNote = createServerFn({ method: "POST" })
  .inputValidator((d: number) => d)
  .handler(async ({ data: id }) => {
    console.info(`Deleting note with id ${id}...`);

    // Read notes, filter out the one to delete, and save
    const notes = await readNotesFile();
    const noteToDelete = notes.find((note) => note.id === id);

    if (!noteToDelete) {
      throw new Error("Note not found");
    }

    const updatedNotes = notes.filter((note) => note.id !== id);
    await writeNotesFile(updatedNotes);

    return noteToDelete;
  });

// Type for updating a note
export type UpdateNoteType = {
  id: number;
  title?: string;
  body?: string;
  favorite?: boolean;
};

// Function to update a note
export const updateNote = createServerFn({ method: "POST" })
  .inputValidator((d: UpdateNoteType) => d)
  .handler(async ({ data }) => {
    console.info(`Updating note with id ${data.id}...`);

    const notes = await readNotesFile();
    const noteIndex = notes.findIndex((note) => note.id === data.id);

    if (noteIndex === -1) {
      throw new Error("Note not found");
    }

    // Update the note with new values
    const updatedNote: NoteType = {
      ...notes[noteIndex],
      ...(data.title !== undefined && { title: data.title }),
      ...(data.body !== undefined && { body: data.body }),
      ...(data.favorite !== undefined && { favorite: data.favorite }),
    };

    notes[noteIndex] = updatedNote;
    await writeNotesFile(notes);

    return updatedNote;
  });

// Function to toggle favorite status
export const toggleFavorite = createServerFn({ method: "POST" })
  .inputValidator((d: number) => d)
  .handler(async ({ data: id }) => {
    console.info(`Toggling favorite for note with id ${id}...`);

    const notes = await readNotesFile();
    const noteIndex = notes.findIndex((note) => note.id === id);

    if (noteIndex === -1) {
      throw new Error("Note not found");
    }

    // Toggle the favorite status
    notes[noteIndex].favorite = !notes[noteIndex].favorite;
    await writeNotesFile(notes);

    return notes[noteIndex];
  });
