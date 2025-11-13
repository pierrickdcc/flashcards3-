
import React from 'react';
import ModalWrapper from './ModalWrapper';

const SignOutConfirmationModal = ({ show, onClose, onConfirm }) => {
  return (
    <ModalWrapper isOpen={show} onClose={onClose} title="Confirmer la déconnexion">
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Êtes-vous sûr de vouloir vous déconnecter ? Toutes les données locales non
        synchronisées seront perdues.
      </p>
      <div className="flex gap-4">
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
        >
          Se déconnecter
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

export default SignOutConfirmationModal;
