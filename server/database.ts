import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import type { User, Retrospective, Note } from '../src/types/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DatabaseSchema {
  users: User[];
  retrospectives: Retrospective[];
  notes: Note[];
}

const defaultData: DatabaseSchema = {
  users: [],
  retrospectives: [],
  notes: [],
};

export const setupDatabase = async () => {
  const adapter = new JSONFile<DatabaseSchema>('/tmp/db.json');
  const db = new Low<DatabaseSchema>(adapter, defaultData);

  await db.read();

  // Initialize with default data if empty
  if (!db.data) {
    db.data = defaultData;
    await db.write();
  }

  return db;
};

export type Database = Low<DatabaseSchema>;
