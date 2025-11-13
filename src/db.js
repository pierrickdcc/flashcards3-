
// src/db.js
import Dexie from 'dexie';

export const db = new Dexie('flashcardsDB');
db.version(2).stores({
  // Changez '++id' en 'id'
  cards: 'id, workspace_id, subject, nextReview, updatedAt, isSynced',
  subjects: 'id, workspace_id, name, isSynced', // 'name' devrait être indexé
  courses: 'id, workspace_id, subject, isSynced',
  deletionsPending: 'id, tableName',
});
