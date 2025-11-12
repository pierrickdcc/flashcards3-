// src/db.js
import Dexie from 'dexie';

export const db = new Dexie('flashcardsDB');
db.version(1).stores({
  cards: '++id, workspace_id, subject, nextReview, updatedAt, isSynced',
  subjects: '++id, workspace_id, name',
  courses: '++id, workspace_id, subject',
});