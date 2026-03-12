// Minimal schema — all data is static/client-side for this dashboard
import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Placeholder table (not used — data is in-memory)
export const curveNotes = pgTable("curve_notes", {
  id: serial("id").primaryKey(),
  curveId: text("curve_id").notNull(),
  note: text("note").notNull(),
});

export const insertCurveNoteSchema = createInsertSchema(curveNotes).omit({ id: true });
export type InsertCurveNote = z.infer<typeof insertCurveNoteSchema>;
export type CurveNote = typeof curveNotes.$inferSelect;
