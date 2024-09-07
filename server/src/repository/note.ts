import puresql, { PuresqlAdapter } from "puresql";
import * as entity from "@App/domain/entity";
import * as db from "@App/domain/db";
import { CreateNote, NoteRepository } from "@App/domain/repository";
import { OkPacket } from "mysql";
import { get } from "http";

export class SQLRepository implements NoteRepository {
  private adapter: PuresqlAdapter;
  private queries: Record<string, puresql.PuresqlQuery<any>>;

  constructor(
    adapter: PuresqlAdapter,
    queries: Record<string, puresql.PuresqlQuery<any>>
  ) {
    this.adapter = adapter;
    this.queries = queries;
  }

  async createNote(note: CreateNote): Promise<entity.Note> {
    const newNoteData = {
      speaker_id: note.speakerId,
      meeting_id: note.speakerId,
      text: note.text,
    };

    const res: OkPacket = await this.queries.create_note(
      newNoteData,
      this.adapter
    );

    const noteId = res.insertId;

    return this.getNote(noteId);
  }

  async getNote(noteId: number): Promise<entity.Note> {
    const notes: db.Note[] = await this.queries.get_note(
      { id: noteId },
      this.adapter
    );

    // TODO handle not found

    const note = notes[0];

    return {
      id: note.id,
      speakerId: note.speaker_id,
      meetingId: note.meeting_id,
      text: note.text,
      createdAt: note.created_at,
    };
  }
}
