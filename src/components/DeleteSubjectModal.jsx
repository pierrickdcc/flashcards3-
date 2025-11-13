
import React from 'react';
import ModalWrapper from './ModalWrapper';

const DeleteSubjectModal = ({ show, onClose, onDelete, onReassign, subjectToDelete }) => {
  return (
    <ModalWrapper isOpen={show} onClose={onClose} title={`Supprimer : ${subjectToDelete}`}>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Que souhaitez-vous faire des cartes associées à cette matière ?
      </p>
      <div className="flex flex-col gap-4">
        <button
          onClick={onDelete}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
        >
          Supprimer les cartes
        </button>
        <button
          onClick={onReassign}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Réassigner à "Non classé"
        </button>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Annuler
        </button>
      </div>
    </ModalWrapper>
  );
};

export default DeleteSubjectModal;
