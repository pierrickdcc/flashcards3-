import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import toast from 'react-hot-toast';
import { DEFAULT_SUBJECT } from '../constants/app';
import { calculateNextReview } from '../utils/spacedRepetition';

const FlashcardContext = createContext();

export const FlashcardProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [workspaceId, setWorkspaceId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Modal states
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  // Filter states
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');


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
    if (!session || !isOnline || !workspaceId || isSyncing) return;

    setIsSyncing(true);
    toast.loading('Synchronisation en cours...');

    try {
      // 1. Envoyer les modifications locales vers le cloud
      const localUnsyncedCards = await db.cards.where('isSynced').equals(false).toArray();
      const localUnsyncedSubjects = await db.subjects.where('isSynced').equals(false).toArray();
      const localUnsyncedCourses = await db.courses.where('isSynced').equals(false).toArray();

      if (localUnsyncedCards.length > 0) {
        const { error } = await supabase.from('flashcards').upsert(localUnsyncedCards.map(c => ({...c, isSynced: undefined, id: c.id.startsWith('local_') ? undefined : c.id })));
        if (error) throw error;
      }
      if (localUnsyncedSubjects.length > 0) {
          const { error } = await supabase.from('subjects').upsert(localUnsyncedSubjects.map(s => ({...s, isSynced: undefined, id: s.id.startsWith('local_') ? undefined : s.id })));
        if (error) throw error;
      }
      if (localUnsyncedCourses.length > 0) {
          const { error } = await supabase.from('courses').upsert(localUnsyncedCourses.map(c => ({...c, isSynced: undefined, id: c.id.startsWith('local_') ? undefined : c.id })));
        if (error) throw error;
      }

      // Marquer tout comme synchronisé localement après l'envoi réussi
      await db.cards.where('isSynced').equals(false).modify({ isSynced: true });
      await db.subjects.where('isSynced').equals(false).modify({ isSynced: true });
      await db.courses.where('isSynced').equals(false).modify({ isSynced: true });

      // 2. Récupérer les données du cloud et fusionner
      const lastSyncTime = localStorage.getItem('last_sync') || new Date(0).toISOString();

      const { data: cloudCards, error: cardsError } = await supabase.from('flashcards').select('*').eq('workspace_id', workspaceId).gte('updated_at', lastSyncTime);
      const { data: cloudSubjects, error: subjectsError } = await supabase.from('subjects').select('*').eq('workspace_id', workspaceId).gte('updated_at', lastSyncTime);
      const { data: cloudCourses, error: coursesError } = await supabase.from('courses').select('*').eq('workspace_id', workspaceId).gte('updated_at', lastSyncTime);

      if (cardsError || subjectsError || coursesError) throw cardsError || subjectsError || coursesError;

      // Suppression des éléments locaux qui ont été créés avec un ID temporaire
      // et qui sont maintenant revenus du cloud avec un ID permanent.
      const localCards = await db.cards.where('id').startsWith('local_').toArray();
      if(localCards.length > 0) await db.cards.bulkDelete(localCards.map(c => c.id));

      await db.transaction('rw', db.cards, db.subjects, db.courses, async () => {
        if (cloudCards.length > 0) await db.cards.bulkPut(cloudCards.map(c => ({...c, isSynced: true})));
        if (cloudSubjects.length > 0) await db.subjects.bulkPut(cloudSubjects.map(c => ({...c, isSynced: true})));
        if (cloudCourses.length > 0) await db.courses.bulkPut(cloudCourses.map(c => ({...c, isSynced: true})));
      });

      const now = new Date();
      setLastSync(now);
      localStorage.setItem('last_sync', now.toISOString());
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
        workspace_id: workspaceId,
        isSynced: false
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
    if (isOnline) {
      const updatedCard = { ...updates, updated_at: new Date().toISOString() };
      await db.cards.update(id, updatedCard);
      toast.success('Carte mise à jour !');
      try {
        await supabase.from('flashcards').update({ ...updatedCard }).eq('id', id).eq('workspace_id', workspaceId);
      } catch (err) {
        console.error('Erreur update cloud:', err);
        toast.error('Erreur de synchronisation.');
      }
    } else {
      const updatedCard = { ...updates, updated_at: new Date().toISOString(), isSynced: false };
      await db.cards.update(id, updatedCard);
      toast.success('Carte mise à jour hors ligne !');
    }
  };

  const deleteCardWithSync = async (id) => {
    if (!isOnline) {
      toast.error("La suppression n'est pas disponible hors ligne.");
      return;
    }
    await db.cards.delete(id);
    toast.success('Carte supprimée !');
    try {
      await supabase.from('flashcards').delete().eq('id', id).eq('workspace_id', workspaceId);
    } catch (err) {
      console.error('Erreur delete cloud:', err);
      toast.error('Erreur de synchronisation.');
      // Si la suppression cloud échoue, il faudrait idéalement annuler la suppression locale
      // ou la marquer pour une nouvelle tentative. Pour l'instant, on se contente de notifier.
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

  const normalizeSubjectName = (name) => {
    if (!name) return '';
    const trimmed = name.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };

  const addSubject = async (newSubject) => {
  const normalizedName = normalizeSubjectName(newSubject);
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
        name: normalizedName,
        workspace_id: workspaceId,
        created_at: new Date().toISOString(),
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isSynced: false
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
        workspace_id: workspaceId,
        isSynced: false
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
    session, cards, subjects, courses, darkMode, setDarkMode, workspaceId, setWorkspaceId, isConfigured, isOnline,
    isSyncing, lastSync, syncToCloud, updateCardWithSync, deleteCardWithSync, handleBulkAdd, addSubject, reviewCard, addCard,
    handleDeleteCardsOfSubject, handleReassignCardsOfSubject, addCourse,
    signOut,
    // Modals
    showConfigModal, setShowConfigModal,
    showBulkAddModal, setShowBulkAddModal,
    showAddSubjectModal, setShowAddSubjectModal,
    showAddCardModal, setShowAddCardModal,
    showAddCourseModal, setShowAddCourseModal,
    // Review
    reviewMode, setReviewMode,
    getCardsToReview, startReview,
    // Filters
    selectedSubject, setSelectedSubject,
    searchTerm, setSearchTerm,
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
