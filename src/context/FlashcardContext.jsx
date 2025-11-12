import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import toast from 'react-hot-toast';
import { DEFAULT_SUBJECT } from '../constants/app';

const FlashcardContext = createContext();

/**
 * Calculates the next review date for a flashcard based on user performance.
 * @param {number} quality - The quality of the review (0-5).
 * @param {number} interval - The current interval in days.
 * @param {number} easiness - The current easiness factor.
 * @returns {{interval: number, easiness: number, nextReview: string}} - The new interval, easiness factor, and next review date.
 */
export const calculateNextReview = (quality, interval, easiness) => {
  if (quality < 3) {
    return { interval: 1, easiness, nextReview: new Date().toISOString() };
  }

  let newEasiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEasiness < 1.3) newEasiness = 1.3;

  let newInterval;
  if (interval === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.ceil(interval * newEasiness);
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return { interval: newInterval, easiness: newEasiness, nextReview: nextReview.toISOString() };
};

export const FlashcardProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [workspaceId, setWorkspaceId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const cards = useLiveQuery(() => db.cards.toArray(), []);
  const subjects = useLiveQuery(() => db.subjects.toArray(), []);
  const courses = useLiveQuery(() => db.courses.toArray(), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription?.unsubscribe()
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    document.body.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
    const savedLastSync = localStorage.getItem('last_sync');
    if (savedLastSync) {
      setLastSync(new Date(savedLastSync));
    }
    const savedWorkspace = localStorage.getItem('workspace_id');
    if (savedWorkspace) {
      setWorkspaceId(savedWorkspace);
      setIsConfigured(true);
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
        case 'flashcards':
          dbTable = db.cards;
          break;
        case 'subjects':
          dbTable = db.subjects;
          break;
        case 'courses':
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
    if (!session || !isOnline || !workspaceId) return;

    setIsSyncing(true);
    toast.loading('Synchronisation en cours...');
    try {
      const { data: cloudCards, error: cardsError } = await supabase.from('flashcards').select('*').eq('workspace_id', workspaceId);
      const { data: cloudSubjects, error: subjectsError } = await supabase.from('subjects').select('*').eq('workspace_id', workspaceId);
      const { data: cloudCourses, error: coursesError } = await supabase.from('courses').select('*').eq('workspace_id', workspaceId);

      if (cardsError || subjectsError || coursesError) throw cardsError || subjectsError || coursesError;

      await db.transaction('rw', db.cards, db.subjects, db.courses, async () => {
        await db.cards.bulkPut(cloudCards);
        await db.subjects.bulkPut(cloudSubjects);
        await db.courses.bulkPut(cloudCourses);
      });

      const now = new Date();
      setLastSync(now);
      localStorage.setItem('last_sync', now.toISOString());
      toast.dismiss();
      toast.success('Synchronisation terminée !');

    } catch (err) {
      console.error('Erreur de synchronisation:', err);
      toast.dismiss();
      toast.error('Erreur de synchronisation.');
    } finally {
      setIsSyncing(false);
    }
  };
  // Adapter les noms de colonnes entre Supabase (snake_case) et local (camelCase)
const formatCardFromSupabase = (card) => ({
  ...card,
  nextReview: card.next_review, // Conversion
  easinessFactor: card.easiness_factor,
  updatedAt: card.updated_at
});

const formatCardForSupabase = (card) => ({
  ...card,
  next_review: card.nextReview, // Conversion inverse
  easiness_factor: card.easinessFactor,
  user_id: session.user.id // IMPORTANT: ajouter user_id
});
  /**
   * Adds a new flashcard to the database.
   * @param {{question: string, answer: string, subject: string}} card - The card to add.
   */
  const addCard = async (card) => {
    if (isOnline) {
      const cardForSupabase = {
        ...card,
        next_review: new Date().toISOString(),
        interval: 1,
        repetitions: 0,
        updated_at: new Date().toISOString(),
        workspace_id: workspaceId
      };
      try {
        const { data, error } = await supabase.from('flashcards').insert(cardForSupabase).select().single();
        if (error) {
          console.error('Erreur Supabase:', error);
          throw new Error(`Erreur ajout carte: ${error.message}`);
        }
        if (!data) {
          throw new Error('Aucune donnée reçue de Supabase');
        }
        await db.cards.add(data);
        toast.success('Carte ajoutée !');
      } catch (err) {
        console.error('Erreur add card cloud:', err);
        toast.error("L'ajout de la carte a échoué.");
      }
    } else {
      const newCard = {
        ...card,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nextReview: new Date().toISOString(),
        interval: 1,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        workspace_id: workspaceId
      };
      await db.cards.add(newCard);
      toast.success('Carte ajoutée hors ligne !');
    }
  };

  /**
   * Updates a flashcard in the database.
   * @param {string} id - The ID of the card to update.
   * @param {object} updates - The updates to apply to the card.
   */
  const updateCardWithSync = async (id, updates) => {
    const updatedCard = { ...updates, updated_at: new Date().toISOString() };
    await db.cards.update(id, updatedCard);
    toast.success('Carte mise à jour !');

    if (supabase && isOnline && workspaceId) {
      try {
        await supabase.from('flashcards').update({ ...updatedCard }).eq('id', id).eq('workspace_id', workspaceId);
      } catch (err) {
        console.error('Erreur update cloud:', err);
        toast.error('Erreur de synchronisation.');
      }
    }
  };

  const deleteCardWithSync = async (id) => {
    await db.cards.delete(id);
    toast.success('Carte supprimée !');

    if (supabase && isOnline && workspaceId) {
      try {
        await supabase.from('flashcards').delete().eq('id', id).eq('workspace_id', workspaceId);
      } catch (err) {
        console.error('Erreur delete cloud:', err);
        toast.error('Erreur de synchronisation.');
      }
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
          subject: parts[2].trim(),
          nextReview: new Date().toISOString(),
          interval: 1,
          reviewCount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          workspace_id: workspaceId
        };
      }
      return null;
    }).filter(Boolean);

    await db.cards.bulkAdd(newCards);
    toast.success(`${newCards.length} cartes ajoutées !`);

    if (supabase && isOnline && workspaceId && newCards.length > 0) {
      try {
        await supabase.from('flashcards').insert(newCards);
      } catch (err) {
        console.error('Erreur bulk add cloud:', err);
        toast.error('Erreur de synchronisation.');
      }
    }
  };

  const addSubject = async (newSubject) => {
  const normalizedName = newSubject.trim().toLowerCase();
  if (!normalizedName) return;

  // Votre vérification "equalsIgnoreCase" est déjà correcte
  const existing = await db.subjects.where('name').equalsIgnoreCase(normalizedName).first();
  if (existing) {
    toast.error('Cette matière existe déjà.');
    return;
  }

  if (isOnline) {
    const subjectForSupabase = {
      name: normalizedName, // "normalizedName" sera maintenant toujours en minuscules
      workspace_id: workspaceId
    };
    try {
        const { data, error } = await supabase.from('subjects').insert(subjectForSupabase).select().single();
        if (error) {
          console.error('Erreur Supabase:', error);
          throw new Error(`Erreur ajout matière: ${error.message}`);
        }
        if (!data) {
          throw new Error('Aucune donnée reçue de Supabase');
        }
        await db.subjects.add(data);
        toast.success('Matière ajoutée !');
      } catch (err) {
        console.error('Erreur add subject cloud:', err);
        toast.error("L'ajout de la matière a échoué.");
      }
    } else {
      const newSubjectOffline = {
        name: newSubject.trim(),
        workspace_id: workspaceId,
        created_at: new Date().toISOString(),
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      await db.subjects.add(newSubjectOffline);
      toast.success('Matière ajoutée hors ligne !');
    }
  };

  const handleDeleteCardsOfSubject = async (subjectName) => {
    await db.cards.where('subject').equalsIgnoreCase(subjectName).delete();
    await db.subjects.where('name').equalsIgnoreCase(subjectName).delete();
    toast.success(`Matière "${subjectName}" et toutes ses cartes supprimées.`);

    if (supabase && isOnline && workspaceId) {
      try {
        await supabase.from('flashcards').delete().eq('workspace_id', workspaceId).eq('subject', subjectName);
        await supabase.from('subjects').delete().eq('workspace_id', workspaceId).eq('name', subjectName);
      } catch (err) {
        console.error("Erreur suppression sujet/cartes cloud:", err);
        toast.error('Erreur de synchronisation.');
      }
    }
  };

  const handleReassignCardsOfSubject = async (subjectName) => {
    await db.cards.where('subject').equalsIgnoreCase(subjectName).modify({ subject: DEFAULT_SUBJECT });
    await db.subjects.where('name').equalsIgnoreCase(subjectName).delete();
    toast.success(`Cartes réassignées à "${DEFAULT_SUBJECT}".`);

    if (supabase && isOnline && workspaceId) {
      try {
        await supabase.from('flashcards').update({ subject: DEFAULT_SUBJECT }).eq('workspace_id', workspaceId).eq('subject', subjectName);
        await supabase.from('subjects').delete().eq('workspace_id', workspaceId).eq('name', subjectName);
        await supabase.from('subjects').upsert({ workspace_id: workspaceId, name: DEFAULT_SUBJECT });
      } catch (err) {
        console.error("Erreur réassignation sujet cloud:", err);
        toast.error('Erreur de synchronisation.');
      }
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
      updatedAt: new Date().toISOString()
    };
    await db.cards.update(currentCard.id, updated);

    if (session && isOnline && workspaceId) {
      try {
        await supabase.from('flashcards').update({
            next_review: nextReview,
            interval: interval,
            easiness_factor: updated.easiness,
            repetitions: updated.reviewCount,
            updated_at: updated.updatedAt
          }).eq('id', currentCard.id).eq('workspace_id', workspaceId);
      } catch (err) {
        console.error('Erreur review cloud:', err);
        toast.error('Erreur de synchronisation.');
      }
    }
  };

  const addCourse = async (course) => {
    if (isOnline) {
      const courseForSupabase = {
        ...course,
        created_at: new Date().toISOString(),
        workspace_id: workspaceId
      };
      try {
        const { data, error } = await supabase.from('courses').insert(courseForSupabase).select().single();
        if (error) {
          console.error('Erreur Supabase:', error);
          throw new Error(`Erreur ajout cours: ${error.message}`);
        }
        if (!data) {
          throw new Error('Aucune donnée reçue de Supabase');
        }
        await db.courses.add(data);
        toast.success('Cours ajouté !');
      } catch (err) {
        console.error('Erreur add course cloud:', err);
        toast.error("L'ajout du cours a échoué.");
      }
    } else {
      const newCourse = {
        ...course,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        workspace_id: workspaceId
      };
      await db.courses.add(newCourse);
      toast.success('Cours ajouté hors ligne !');
    }
  };

  const signOut = async () => {
    await db.delete();
    await supabase.auth.signOut();
    window.location.reload();
  };

  const value = {
    session, cards, subjects, courses, darkMode, setDarkMode, workspaceId, setWorkspaceId, isConfigured, isOnline,
    isSyncing, lastSync, syncToCloud, updateCardWithSync, deleteCardWithSync, handleBulkAdd, addSubject, reviewCard, addCard,
    handleDeleteCardsOfSubject, handleReassignCardsOfSubject, addCourse,
    signOut,
  };

  return (
    <FlashcardContext.Provider value={value}>
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcard = () => {
  const context = useContext(FlashcardContext);
  if (context === undefined) {
    throw new Error('useFlashcard must be used within a FlashcardProvider');
  }
  return context;
};
