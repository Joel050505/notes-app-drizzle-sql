import { eq, desc } from "drizzle-orm";
import { notes } from "../../db/schema";
import { db } from "../../db/db";

// Rena Drizzle-funktioner (ingen TanStack Start här)

export async function readNotes() {
  return await db.select().from(notes).orderBy(desc(notes.createdAt));
} // desc för att sortera nyaste först, drizzle-orm inbyggd funktion

export async function getNoteById(id: number) {
  const result = await db.select().from(notes).where(eq(notes.id, id));
  return result[0];
}

export async function createNote({
  title,
  content,
}: {
  title: string;
  content?: string;
}) {
  const result = await db
    .insert(notes)
    .values({ title, content: content || "" })
    .$returningId();
  const newNote = await db
    .select()
    .from(notes)
    .where(eq(notes.id, result[0].id));
  return newNote[0];
}

export async function updateNote(
  id: number,
  updates: { title?: string; content?: string }
) {
  await db.update(notes).set(updates).where(eq(notes.id, id));
  const updatedNote = await db.select().from(notes).where(eq(notes.id, id));
  return updatedNote[0];
}

export async function removeNote(id: number) {
  await db.delete(notes).where(eq(notes.id, id));
}
