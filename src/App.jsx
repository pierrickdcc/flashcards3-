import React, { useState, useMemo } from 'react';
import { useFlashcard } from './context/FlashcardContext';
import Auth from './components/Auth';
import Header from './components/Header';
import DeleteSubjectModal from './components/DeleteSubjectModal';
import Stats from './components/Stats';
import Actions from './components/Actions';
import Filters from './components/Filters';
import CardGrid from './components/CardGrid';
import CardTable from './components/CardTable';
import ReviewMode from './components/ReviewMode';
import ConfigModal from './components/ConfigModal';
import BulkAddModal from './components/BulkAddModal';
import AddSubjectModal from './components/AddSubjectModal';
import AddCardModal from './components/AddCardModal';
import AddCourseModal from './components/AddCourseModal';
import Dashboard from './components/Dashboard';
import CourseViewer from './components/CourseViewer';
import CourseList from './components/CourseList';
import SignOutConfirmationModal from './components/SignOutConfirmationModal';
import { Toaster } from 'react-hot-toast';
import { DEFAULT_SUBJECT } from './constants/app';

const FlashcardsPWA = () => {
  const {
    session,
    cards,
    subjects,
    courses,
    reviewCard,
    deleteCardWithSync,
    updateCardWithSync,
    handleDeleteCardsOfSubject,
    handleReassignCardsOfSubject,
    setWorkspaceId,
    workspaceId,
    isConfigured,
    signOut
  } = useFlashcard();

  // --- LOCAL UI STATE ---
  const [view, setView] = useState('courses');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewMode, setReviewMode] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showDeleteSubjectModal, setShowDeleteSubjectModal] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleDeleteSubject = (subjectName) => {
    setSubjectToDelete(subjectName);
    setShowDeleteSubjectModal(true);
  };

  const confirmDeleteSubject = () => {
    handleDeleteCardsOfSubject(subjectToDelete);
    setShowDeleteSubjectModal(false);
    setSubjectToDelete(null);
    setSelectedSubject('all');
  };

  const confirmReassignSubject = () => {
    handleReassignCardsOfSubject(subjectToDelete);
    setShowDeleteSubjectModal(false);
    setSubjectToDelete(null);
    setSelectedSubject(DEFAULT_SUBJECT);
  };

  const getCardsToReview = () => {
    if (!cards) return [];
    const now = new Date();
    let filtered = cards.filter(c => new Date(c.nextReview) <= now);
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(c => c.subject === selectedSubject);
    }
    return filtered.sort(() => Math.random() - 0.5);
  };

  const startReview = () => {
    const toReview = getCardsToReview();
    if (toReview.length > 0) {
      setCurrentCard(toReview[0]);
      setReviewMode(true);
      setShowAnswer(false);
    }
  };

  const handleReviewCard = (quality) => {
    reviewCard(currentCard, quality);
    setShowAnswer(false);

    const remaining = getCardsToReview().filter(c => c.id !== currentCard.id);
    if (remaining.length > 0) {
      setCurrentCard(remaining[0]);
    } else {
      setReviewMode(false);
      setCurrentCard(null);
    }
  };

  const filteredCards = useMemo(() => {
    if (!cards?.length) return [];

    const term = searchTerm?.toLowerCase().trim();
    return cards.filter(c => {
      const matchesSubject = selectedSubject === 'all' || c.subject === selectedSubject;
      if (!matchesSubject) return false;

      if (!term) return true;
      const q = c.question.toLowerCase();
      const a = c.answer.toLowerCase();
      return q.includes(term) || a.includes(term);
    });
  }, [cards, selectedSubject, searchTerm]);

  const cardsToReview = getCardsToReview();
  const stats = {
    total: cards?.length || 0,
    toReview: cardsToReview.length,
    subjects: subjects?.length || 0
  };

  if (!session) {
    return <Auth />;
  }

  if (selectedCourse) {
    return (
      <CourseViewer
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    );
  }

  if (reviewMode && currentCard) {
    return (
      <ReviewMode
        currentCard={currentCard}
        cardsToReview={cardsToReview}
        setReviewMode={setReviewMode}
        showAnswer={showAnswer}
        setShowAnswer={setShowAnswer}
        reviewCard={handleReviewCard}
      />
    );
  }

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div>
      <Toaster />
      <Header
        setShowConfigModal={setShowConfigModal}
        isConfigured={isConfigured}
        setShowSignOutModal={setShowSignOutModal}
      />

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <Stats stats={stats} />
        
        <Actions
          startReview={startReview}
          cardsToReviewCount={cardsToReview.length}
          setShowBulkModal={setShowBulkModal}
          setShowAddSubjectModal={setShowAddSubjectModal}
          setShowAddCardModal={setShowAddCardModal}
          setShowAddCourseModal={setShowAddCourseModal}
        />
        
        <Filters
          view={view}
          setView={setView}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          subjects={subjects || []}
          onDeleteSubject={handleDeleteSubject}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {view === 'courses' && (
          <CourseList
            onCourseSelect={setSelectedCourse}
          />
        )}
        {view === 'cards' && (
          <CardGrid
            filteredCards={filteredCards}
            setEditingCard={setEditingCard}
            deleteCardWithSync={deleteCardWithSync}
          />
        )}
        {view === 'table' && (
          <CardTable
            filteredCards={filteredCards}
            editingCard={editingCard}
            setEditingCard={setEditingCard}
            updateCardWithSync={updateCardWithSync}
            deleteCardWithSync={deleteCardWithSync}
            subjects={subjects || []}
          />
        )}
        {view === 'dashboard' && (
          <Dashboard />
        )}
      </main>

      {/* Modals */}
      <ConfigModal
        show={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
      
      <BulkAddModal
        show={showBulkModal}
        onClose={() => setShowBulkModal(false)}
      />
      
      <AddSubjectModal
        show={showAddSubjectModal}
        onClose={() => setShowAddSubjectModal(false)}
      />

      <AddCardModal
        show={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
      />

      <AddCourseModal
        show={showAddCourseModal}
        onClose={() => setShowAddCourseModal(false)}
      />

      <DeleteSubjectModal
        show={showDeleteSubjectModal}
        onClose={() => setShowDeleteSubjectModal(false)}
        onDelete={confirmDeleteSubject}
        onReassign={confirmReassignSubject}
        subjectToDelete={subjectToDelete}
      />

      <SignOutConfirmationModal
        show={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
      />
    </div>
  );
};

export default FlashcardsPWA;
