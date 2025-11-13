
import React from 'react';
import { Brain, Plus, FolderPlus, FilePlus, BookPlus } from 'lucide-react';
import { useUIState } from '../context/UIStateContext';

const Actions = ({ startReview, cardsToReviewCount }) => {
  const { setShowBulkAddModal, setShowAddSubjectModal, setShowAddCardModal, setShowAddCourseModal } = useUIState();

  const baseButtonClass = "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors duration-200";
  const reviewButtonClass = "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed";
  const secondaryButtonClass = "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700";

  return (
    <div className="flex flex-wrap items-center gap-4 my-6">
      <button
        onClick={startReview}
        disabled={cardsToReviewCount === 0}
        title={cardsToReviewCount === 0 ? "Aucune carte à réviser" : ""}
        className={`${baseButtonClass} ${reviewButtonClass}`}
      >
        <Brain size={20} /> Réviser ({cardsToReviewCount})
      </button>
      
      <button
        onClick={() => setShowAddCardModal(true)}
        className={`${baseButtonClass} ${secondaryButtonClass}`}
      >
        <FilePlus size={20} /> Ajouter une carte
      </button>

      <button
        onClick={() => setShowAddCourseModal(true)}
        className={`${baseButtonClass} ${secondaryButtonClass}`}
      >
        <BookPlus size={20} /> Ajouter un cours
      </button>

      <button
        onClick={() => setShowBulkAddModal(true)}
        className={`${baseButtonClass} ${secondaryButtonClass}`}
      >
        <Plus size={20} /> Ajout en masse
      </button>

      <button
        onClick={() => setShowAddSubjectModal(true)}
        className={`${baseButtonClass} ${secondaryButtonClass}`}
      >
        <FolderPlus size={20} /> Matière
      </button>
    </div>
  );
};

export default Actions;
