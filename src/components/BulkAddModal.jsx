
import React, { useState } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import ModalWrapper from './ModalWrapper';

const BulkAddModal = ({ show, onClose }) => {
  const { handleBulkAdd } = useDataSync();
  const [bulkAdd, setBulkAdd] = useState('');

  const handleSubmit = () => {
    handleBulkAdd(bulkAdd);
    setBulkAdd('');
    onClose();
  };

  return (
    <ModalWrapper isOpen={show} onClose={onClose} title="Ajouter des cartes en masse">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Format :{' '}
        <code className="px-1.5 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-900 rounded-md">
          Question / Réponse / Matière
        </code>
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
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Ajouter
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Annuler
        </button>
      </div>
    </ModalWrapper>
  );
};

export default BulkAddModal;
