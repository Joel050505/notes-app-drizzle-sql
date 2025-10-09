import fs from "fs/promises";
import path from "path";

const filePath = path.resolve("notes.json");

export type Note = {
  id: number;
  title: string;
  body?: string;
  favorite: boolean;
};

export async function readNotes(): Promise<Note[]> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    const initial: Note[] = [];
    await writeNotes(initial);
    return initial;
  }
}

export async function writeNotes(notes: Note[]) {
  await fs.writeFile(filePath, JSON.stringify(notes, null, 2), "utf-8");
}

export async function POST({ request }: { request: Request }) {
  const newNote = await request.json();
  const notes = await readNotes();

  // In case the ID already exists, generate a new one
  if (notes.some((note) => note.id === newNote.id)) {
    newNote.id =
      notes.length > 0 ? Math.max(...notes.map((note) => note.id)) + 1 : 1;
  }

  notes.push(newNote);
  await writeNotes(notes);

  return new Response(JSON.stringify(newNote), {
    headers: {
      "Content-Type": "application/json",
    },
    status: 201,
  });
}

export async function GET() {
  const notes = await readNotes();

  return new Response(JSON.stringify(notes), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const idParam = url.searchParams.get("id");

  if (!idParam) {
    return new Response(JSON.stringify({ error: "Note ID is required" }), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }

  const id = parseInt(idParam, 10);
  const notes = await readNotes();
  const noteIndex = notes.findIndex((note) => note.id === id);

  if (noteIndex === -1) {
    return new Response(JSON.stringify({ error: "Note not found" }), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 404,
    });
  }

  // Remove the note
  const [deletedNote] = notes.splice(noteIndex, 1);
  await writeNotes(notes);

  return new Response(JSON.stringify(deletedNote), {
    headers: {
      "Content-Type": "application/json",
    },
    status: 200,
  });
}
