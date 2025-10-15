export type Note = {
  id: number;
  title: string;
  content: string | null;
  createdAt: Date;
};

export type NewNoteInput = {
  title: string;
  content: string;
};
