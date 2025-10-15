import {
  bigint,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const notes = mysqlTable("notes_tables", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .$defaultFn(() => Date.now()),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// export type Note = typeof notes.$inferSelect;
// export type NewNote = typeof notes.$inferInsert;
