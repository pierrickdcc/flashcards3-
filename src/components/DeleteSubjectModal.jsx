
import React, { useEffect } from 'react';

const DeleteSubjectModal = ({ show, onClose, onDelete, onReassign, subjectToDelete }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Supprimer la matière : {subjectToDelete}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Que souhaitez-vous faire des cartes associées à cette matière ?</p>
        <div className="flex flex-col gap-4">
          <button onClick={onDelete} className="w-full px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
            Supprimer les cartes
          </button>
          <button onClick={onReassign} className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Réassigner à "Non classé"
          </button>
          <button onClick={onClose} className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSubjectModal;
