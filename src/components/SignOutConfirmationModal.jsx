
import React, { useEffect } from 'react';

const SignOutConfirmationModal = ({ show, onClose, onConfirm }) => {
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Confirmer la déconnexion</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Êtes-vous sûr de vouloir vous déconnecter ? Toutes les données locales non synchronisées seront perdues.
        </p>
        <div className="flex gap-4">
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
            Se déconnecter
          </button>
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOutConfirmationModal;
