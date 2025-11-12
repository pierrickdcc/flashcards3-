import React, { useEffect } from 'react';
import modalStyles from './Modal.module.css';

const DeleteSubjectModal = ({ show, onClose, onDelete, onReassign }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!show) return null;

  return (
    <div className={modalStyles.overlay} onClick={onClose}>
      <div className={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={modalStyles.title}>Delete Subject</h2>
        <p>What would you like to do with the cards in this subject?</p>
        <div className={modalStyles.buttonRow}>
          <button onClick={onDelete} className={`${modalStyles.button} ${modalStyles.dangerButton}`}>
            Delete Cards
          </button>
          <button onClick={onReassign} className={`${modalStyles.button} ${modalStyles.primaryButton}`}>
            Reassign to Unclassified
          </button>
          <button onClick={onClose} className={`${modalStyles.button} ${modalStyles.secondaryButton}`}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSubjectModal;
