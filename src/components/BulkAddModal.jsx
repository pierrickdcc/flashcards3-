import React, { useState, useEffect } from 'react';
import modalStyles from './Modal.module.css';
import styles from './BulkAddModal.module.css';
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
    <div className={modalStyles.overlay} onClick={onClose}>
      <div className={`${modalStyles.modal} ${styles.bulkModal}`} onClick={(e) => e.stopPropagation()}>
        <h2 className={modalStyles.title}>Ajouter des cartes</h2>
        <p className={styles.helpText}>
          Format : <code className={styles.code}>Question / Réponse / Matière</code>
          <br />
          Une carte par ligne.
        </p>
        <textarea
          value={bulkAdd}
          onChange={(e) => setBulkAdd(e.target.value)}
          placeholder="Qu'est-ce qu'une cellule? / Unité de base du vivant / Sciences&#10;Capitale de la France? / Paris / Histoire"
          className={styles.textarea}
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

export default BulkAddModal;
