
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import toast from 'react-hot-toast';
import { DEFAULT_SUBJECT, TABLE_NAMES, LOCAL_STORAGE_KEYS } from '../constants/app';
import { calculateNextReview } from '../utils/spacedRepetition';
import { useAuth } from './AuthContext';

const DataSyncContext = createContext();

export const DataSyncProvider = ({ children }) => {
  const { session, workspaceId, isConfigured } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const cards = useLiveQuery(() => db.cards.toArray(), []);
  const subjects = useLiveQuery(() => db.subjects.toArray(), []);
  const courses = useLiveQuery(() => db.courses.toArray(), []);

  useEffect(() => {
    const savedLastSync = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_SYNC);
    if (savedLastSync) {
      setLastSync(new Date(savedLastSync));
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && isConfigured && session) {
      syncToCloud();
    }
  }, [isOnline, isConfigured, session]);

  // Realtime subscriptions
  useEffect(() => {
    if (!session || !workspaceId) return;

    const handleChanges = async (payload) => {
      const { eventType, new: newRecord, old: oldRecord, table } = payload;
      let dbTable;

      switch (table) {
        case TABLE_NAMES.CARDS:
          dbTable = db.cards;
          break;
        case TABLE_NAMES.SUBJECTS:
          dbTable = db.subjects;
          break;
        case TABLE_NAMES.COURSES:
          dbTable = db.courses;
          break;
        default:
          return;
      }

      switch (eventType) {
        case 'INSERT':
          await dbTable.put(newRecord);
          break;
        case 'UPDATE':
          const localRecord = await dbTable.get(newRecord.id);
          if (localRecord) {
            const localDate = new Date(localRecord.updated_at || localRecord.created_at || 0);
            const remoteDate = new Date(newRecord.updated_at || newRecord.created_at);
            if (remoteDate > localDate) {
              await dbTable.put(newRecord);
            }
          } else {
            await dbTable.put(newRecord);
          }
          break;
        case 'DELETE':
          await dbTable.delete(oldRecord.id);
          break;
        default:
          break;
      }
    };

    const cardsChannel = supabase.channel(`public:flashcards:workspace_id=eq.${workspaceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flashcards' }, handleChanges)
      .subscribe();

    const subjectsChannel = supabase.channel(`public:subjects:workspace_id=eq.${workspaceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, handleChanges)
      .subscribe();

    const coursesChannel = supabase.channel(`public:courses:workspace_id=eq.${workspaceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, handleChanges)
      .subscribe();

    return () => {
      supabase.removeChannel(cardsChannel);
      supabase.removeChannel(subjectsChannel);
      supabase.removeChannel(coursesChannel);
    };
  }, [session, workspaceId]);

  const syncToCloud = async () => {
    if (!session || !isOnline || !workspaceId || isSyncing) return;

    setIsSyncing(true);
    toast.loading('Synchronisation en cours...');

    try {
      const lastSyncTime = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_SYNC) || new Date(0).toISOString();

      const { data: cloudCards, error: cardsError } = await supabase.from(TABLE_NAMES.CARDS).select('*').eq('workspace_id', workspaceId).gte('updated_at', lastSyncTime);
      const { data: cloudSubjects, error: subjectsError } = await supabase.from(TABLE_NAMES.SUBJECTS).select('*').eq('workspace_id', workspaceId).gte('updated_at', lastSyncTime);
      const { data: cloudCourses, error: coursesError } = await supabase.from(TABLE_NAMES.COURSES).select('*').eq('workspace_id', workspaceId).gte('updated_at', lastSyncTime);

      if (cardsError || subjectsError || coursesError) {
        throw cardsError || subjectsError || coursesError;
      }

      await db.transaction('rw', db.cards, db.subjects, db.courses, async () => {
        if (cloudCards.length > 0) {
            const formattedCards = cloudCards.map(formatCardFromSupabase);
            const cloudCardIds = formattedCards.map(c => c.id);
            const localCards = await db.cards.where('id').anyOf(cloudCardIds).toArray();
            const localCardMap = new Map(localCards.map(c => [c.id, c]));
            const cardsToUpdate = [];

            for (const cloudCard of formattedCards) {
                const localCard = localCardMap.get(cloudCard.id);
                if (!localCard || new Date(cloudCard.updatedAt) > new Date(localCard.updatedAt)) {
                    cardsToUpdate.push({ ...cloudCard, isSynced: true });
                }
            }
            if (cardsToUpdate.length > 0) await db.cards.bulkPut(cardsToUpdate);
        }

        if (cloudSubjects.length > 0) {
            const formattedSubjects = cloudSubjects.map(formatSubjectFromSupabase);
            const cloudSubjectIds = formattedSubjects.map(s => s.id);
            const localSubjects = await db.subjects.where('id').anyOf(cloudSubjectIds).toArray();
            const localSubjectMap = new Map(localSubjects.map(s => [s.id, s]));
            const subjectsToUpdate = [];

            for (const cloudSubject of formattedSubjects) {
                const localSubject = localSubjectMap.get(cloudSubject.id);
                if (!localSubject || new Date(cloudSubject.updatedAt) > new Date(localSubject.updatedAt)) {
                    subjectsToUpdate.push({ ...cloudSubject, isSynced: true });
                }
            }
            if (subjectsToUpdate.length > 0) await db.subjects.bulkPut(subjectsToUpdate);
        }

        if (cloudCourses.length > 0) {
            const formattedCourses = cloudCourses.map(formatCourseFromSupabase);
            const cloudCourseIds = formattedCourses.map(c => c.id);
            const localCourses = await db.courses.where('id').anyOf(cloudCourseIds).toArray();
            const localCourseMap = new Map(localCourses.map(c => [c.id, c]));
            const coursesToUpdate = [];

            for (const cloudCourse of formattedCourses) {
                const localCourse = localCourseMap.get(cloudCourse.id);
                if (!localCourse || new Date(cloudCourse.updatedAt) > new Date(localCourse.updatedAt)) {
                    coursesToUpdate.push({ ...cloudCourse, isSynced: true });
                }
            }
            if (coursesToUpdate.length > 0) await db.courses.bulkPut(coursesToUpdate);
        }
    });
      const localCardsWithTempId = await db.cards.where('id').startsWith('local_').toArray();
      if(localCardsWithTempId.length > 0) await db.cards.bulkDelete(localCardsWithTempId.map(c => c.id));

      const localUnsyncedCards = await db.cards.where('isSynced').equals(false).toArray();
      const localUnsyncedSubjects = await db.subjects.where('isSynced').equals(false).toArray();
      const localUnsyncedCourses = await db.courses.where('isSynced').equals(false).toArray();

      if (localUnsyncedCards.length > 0) {
        const { error } = await supabase.from(TABLE_NAMES.CARDS).upsert(localUnsyncedCards.map(formatCardForSupabase));
        if (error) throw error;
        await db.cards.where('isSynced').equals(false).modify({ isSynced: true });
      }
      if (localUnsyncedSubjects.length > 0) {
        const { error } = await supabase.from(TABLE_NAMES.SUBJECTS).upsert(localUnsyncedSubjects.map(formatSubjectForSupabase));
        if (error) throw error;
        await db.subjects.where('isSynced').equals(false).modify({ isSynced: true });
      }
      if (localUnsyncedCourses.length > 0) {
        const { error } = await supabase.from(TABLE_NAMES.COURSES).upsert(localUnsyncedCourses.map(formatCourseForSupabase));
        if (error) throw error;
        await db.courses.where('isSynced').equals(false).modify({ isSynced: true });
      }

      const pendingDeletions = await db.deletionsPending.toArray();
      if (pendingDeletions.length > 0) {
        await Promise.all(pendingDeletions.map(async (deletion) => {
          const { error } = await supabase.from(deletion.tableName).delete().eq('id', deletion.id);
          if (error && error.code !== 'PGRST204') {
            console.error(`Erreur lors de la suppression de ${deletion.id} de ${deletion.tableName}:`, error);
          } else {
            await db.deletionsPending.delete(deletion.id);
          }
        }));
      }

      const now = new Date();
      setLastSync(now);
      localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_SYNC, now.toISOString());
      toast.dismiss();
      toast.success('Synchronisation terminée !');

    } catch (err) {
      console.error('Erreur de synchronisation:', err);
      toast.dismiss();
      toast.error(`Erreur de synchronisation: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };
const formatCardFromSupabase = (card) => ({
  ...card,
  nextReview: card.next_review,
  easinessFactor: card.easiness_factor,
  updatedAt: card.updated_at
});

const formatCardForSupabase = (card) => ({
  ...card,
  next_review: card.nextReview,
  easiness_factor: card.easinessFactor,
  updated_at: card.updatedAt,
  user_id: session.user.id,
  workspace_id: card.workspace_id,
});

const formatSubjectFromSupabase = (subject) => ({
  ...subject,
  updatedAt: subject.updated_at,
  workspace_id: subject.workspace_id,
});

const formatSubjectForSupabase = (subject) => ({
  ...subject,
  updated_at: subject.updatedAt,
  workspace_id: subject.workspace_id,
  user_id: session.user.id,
});

const formatCourseFromSupabase = (course) => ({
  ...course,
  updatedAt: course.updated_at,
  workspace_id: course.workspace_id,
});

const formatCourseForSupabase = (course) => ({
  ...course,
  updated_at: course.updatedAt,
  workspace_id: course.workspace_id,
  user_id: session.user.id,
});

  const addCard = async (card) => {
    const newCard = {
      ...card,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nextReview: new Date().toISOString(),
      interval: 1,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workspace_id: workspaceId,
      isSynced: false
    };
    await db.cards.add(newCard);
    toast.success('Carte ajoutée !');
    if (isOnline) {
      syncToCloud();
    }
  };

  const updateCardWithSync = async (id, updates) => {
    const updatedCard = { ...updates, updated_at: new Date().toISOString(), isSynced: false };
    await db.cards.update(id, updatedCard);
    toast.success('Carte mise à jour !');
    if (isOnline) {
      syncToCloud();
    }
  };

  const deleteCardWithSync = async (id) => {
    await db.cards.delete(id);
    await db.deletionsPending.add({ id, tableName: 'flashcards' });
    toast.success('Carte supprimée !');

    if (isOnline) {
      syncToCloud();
    }
  };

  const handleBulkAdd = async (bulkAdd) => {
    const lines = bulkAdd.trim().split('\n');
    const newCards = lines.map((line, idx) => {
      const parts = line.split('/');
      if (parts.length >= 3) {
        return {
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${idx}`,
          question: parts[0].trim(),
          answer: parts[1].trim(),
          subject: normalizeSubjectName(parts[2].trim()),
          nextReview: new Date().toISOString(),
          interval: 1,
          reviewCount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          workspace_id: workspaceId,
          isSynced: false
        };
      }
      return null;
    }).filter(Boolean);

    if (newCards.length === 0) return;

    await db.cards.bulkAdd(newCards);
    toast.success(`${newCards.length} cartes ajoutées !`);

    if (isOnline) {
      syncToCloud();
    }
  };

  const normalizeSubjectName = (name) => {
    if (!name) return '';
    const trimmed = name.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };

  const addSubject = async (newSubject) => {
    const normalizedName = normalizeSubjectName(newSubject);
    if (!normalizedName) return;

    const existing = await db.subjects.where('name').equalsIgnoreCase(normalizedName).first();
    if (existing) {
      toast.error('Cette matière existe déjà.');
      return;
    }

    const newSubjectOffline = {
      name: normalizedName,
      workspace_id: workspaceId,
      created_at: new Date().toISOString(),
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isSynced: false
    };

    await db.subjects.add(newSubjectOffline);
    toast.success('Matière ajoutée !');

    if (isOnline) {
      syncToCloud();
    }
  };

  const handleDeleteCardsOfSubject = async (subjectName) => {
    const cardsToDelete = await db.cards.where('subject').equalsIgnoreCase(subjectName).toArray();
    const subjectToDelete = await db.subjects.where('name').equalsIgnoreCase(subjectName).first();

    if (subjectToDelete) {
      await db.deletionsPending.add({ id: subjectToDelete.id, tableName: 'subjects' });
      await db.subjects.delete(subjectToDelete.id);
    }

    if (cardsToDelete.length > 0) {
      const deletions = cardsToDelete.map(c => ({ id: c.id, tableName: 'flashcards' }));
      await db.deletionsPending.bulkAdd(deletions);
      await db.cards.bulkDelete(cardsToDelete.map(c => c.id));
    }

    toast.success(`Matière "${subjectName}" et toutes ses cartes supprimées.`);

    if (isOnline) {
      syncToCloud();
    }
  };

  const handleReassignCardsOfSubject = async (subjectName) => {
    const subjectToDelete = await db.subjects.where('name').equalsIgnoreCase(subjectName).first();

    await db.cards.where('subject').equalsIgnoreCase(subjectName).modify({ subject: DEFAULT_SUBJECT, isSynced: false });

    if (subjectToDelete) {
      await db.deletionsPending.add({ id: subjectToDelete.id, tableName: 'subjects' });
      await db.subjects.delete(subjectToDelete.id);
    }

    toast.success(`Cartes réassignées à "${DEFAULT_SUBJECT}".`);

    if (isOnline) {
      syncToCloud();
    }
  };

  const reviewCard = async (currentCard, quality) => {
    const { nextReview, interval, easiness } = calculateNextReview(quality, currentCard.interval || 1, currentCard.easiness || 2.5);
    const updated = {
      ...currentCard,
      nextReview,
      interval,
      easiness,
      reviewCount: currentCard.reviewCount + 1,
      updatedAt: new Date().toISOString(),
      isSynced: false
    };
    await db.cards.update(currentCard.id, updated);

    if (isOnline) {
      syncToCloud();
    }
  };

  const addCourse = async (course) => {
    const newCourse = {
      ...course,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      workspace_id: workspaceId,
      isSynced: false
    };

    await db.courses.add(newCourse);
    toast.success('Cours ajouté !');

    if (isOnline) {
      syncToCloud();
    }
  };

  const signOut = async () => {
    await syncToCloud();
    await db.delete();
    await supabase.auth.signOut();
    window.location.reload();
  };

  const getCardsToReview = (subject = 'all') => {
    if (!cards) return [];
    const now = new Date();
    let filtered = cards.filter(c => new Date(c.nextReview) <= now);
    if (subject !== 'all') {
      filtered = filtered.filter(c => c.subject === subject);
    }
    return filtered.sort(() => Math.random() - 0.5);
  };

  const startReview = (subject = 'all') => {
    const toReview = getCardsToReview(subject);
    if (toReview.length > 0) {
      setReviewMode(true);
    } else {
      toast.error("Aucune carte à réviser !");
    }
  };

  const value = {
    cards, subjects, courses, isOnline, isSyncing, lastSync, syncToCloud,
    addCard, updateCardWithSync, deleteCardWithSync, handleBulkAdd, addSubject,
    handleDeleteCardsOfSubject, handleReassignCardsOfSubject, reviewCard, addCourse,
    signOut, getCardsToReview, startReview,
  };

  return (
    <DataSyncContext.Provider value={value}>
      {children}
    </DataSyncContext.Provider>
  );
};

export const useDataSync = () => {
  const context = useContext(DataSyncContext);
  if (context === undefined) {
    throw new Error('useDataSync must be used within a DataSyncProvider');
  }
  return context;
};
