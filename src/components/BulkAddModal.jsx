
import React, { useState, useEffect } from 'react';
import { useFlashcard } from '../context/FlashcardContext';

const BulkAddModal = ({ show, onClose }) => {
  const { handleBulkAdd } = useFlashcard();
  const [bulkAdd, setBulkAdd] = useState('');

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!show) return null;

  const handleSubmit = () => {
    handleBulkAdd(bulkAdd);
    setBulkAdd('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Ajouter des cartes</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Format : <code className="px-1.5 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-900 rounded-md">Question / Réponse / Matière</code>
          <br />
          Une carte par ligne.
        </p>
        <textarea
          value={bulkAdd}
          onChange={(e) => setBulkAdd(e.target.value)}
          placeholder="Qu'est-ce qu'une cellule? / Unité de base du vivant / Sciences&#10;Capitale de la France? / Paris / Histoire"
          className="w-full h-48 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
        />
        <div className="flex gap-4 mt-6">
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Ajouter
          </button>
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkAddModal;
