import React from 'react';
import modalStyles from './Modal.module.css';

const SignOutConfirmationModal = ({ show, onClose, onConfirm }) => {
  if (!show) {
    return null;
  }

  return (
    <div className={modalStyles.overlay} onClick={onClose}>
      <div className={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={modalStyles.title}>Confirmer la déconnexion</h2>
        <p>
          Êtes-vous sûr de vouloir vous déconnecter ? Toutes les données locales non synchronisées seront perdues.
        </p>
        <div className={modalStyles.buttonRow}>
          <button onClick={onConfirm} className={`${modalStyles.button} ${modalStyles.dangerButton}`}>
            Se déconnecter
          </button>
          <button onClick={onClose} className={`${modalStyles.button} ${modalStyles.secondaryButton}`}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOutConfirmationModal;
