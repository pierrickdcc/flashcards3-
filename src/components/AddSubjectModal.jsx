import React, { useState, useEffect } from 'react';
import modalStyles from './Modal.module.css';
import styles from './AddSubjectModal.module.css';
import { useFlashcard } from '../context/FlashcardContext';

const AddSubjectModal = ({ show, onClose }) => {
  const { addSubject } = useFlashcard();
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!show) return null;

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
    <div className={modalStyles.overlay} onClick={onClose}>
      <div className={`${modalStyles.modal} ${styles.subjectModal}`} onClick={(e) => e.stopPropagation()}>
        <h2 className={modalStyles.title}>Nouvelle matière</h2>
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nom de la matière"
        />
        <div className={modalStyles.buttonRow}>
          <button onClick={handleSubmit} className={`${modalStyles.button} ${modalStyles.primaryButton}`}>
            Ajouter
          </button>
          <button onClick={onClose} className={`${modalStyles.button} ${modalStyles.secondaryButton}`}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSubjectModal;
