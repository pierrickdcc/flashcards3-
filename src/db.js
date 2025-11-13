
// src/db.js
import Dexie from 'dexie';
import { TABLE_NAMES } from './constants/app';

export const db = new Dexie('flashcardsDB');
db.version(2).stores({
  [TABLE_NAMES.CARDS]: 'id, workspace_id, subject, nextReview, updatedAt, isSynced',
  [TABLE_NAMES.SUBJECTS]: 'id, workspace_id, name, isSynced',
  [TABLE_NAMES.COURSES]: 'id, workspace_id, subject, isSynced',
  [TABLE_NAMES.DELETIONS_PENDING]: 'id, tableName',
});
