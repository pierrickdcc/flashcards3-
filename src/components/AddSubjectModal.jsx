
import React, { useState } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import ModalWrapper from './ModalWrapper';

const AddSubjectModal = ({ show, onClose }) => {
  const { addSubject } = useDataSync();
  const [newSubject, setNewSubject] = useState('');

  const handleSubmit = () => {
    addSubject(newSubject);
    setNewSubject('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <ModalWrapper isOpen={show} onClose={onClose} title="Nouvelle matière">
      <input
        type="text"
        value={newSubject}
        onChange={(e) => setNewSubject(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Nom de la matière"
        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

export default AddSubjectModal;
