import React, { useState, useEffect } from 'react';
import modalStyles from './Modal.module.css';
import styles from './ConfigModal.module.css';
import { useFlashcard } from '../context/FlashcardContext';
import { db } from '../db';

const ConfigModal = ({ show, onClose }) => {
  const { workspaceId, setWorkspaceId, syncToCloud } = useFlashcard();
  const [localWorkspaceId, setLocalWorkspaceId] = useState(workspaceId);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!show) return null;

  const handleSave = async () => {
    if (localWorkspaceId !== workspaceId) {
      setWorkspaceId(localWorkspaceId);
      await db.delete();
      await db.open();
      syncToCloud();
    }
    onClose();
  };

  return (
    <div className={modalStyles.overlay} onClick={onClose}>
      <div className={`${modalStyles.modal} ${styles.configModal}`} onClick={(e) => e.stopPropagation()}>
        <h2 className={modalStyles.title}>Configuration</h2>
        
        <div className={styles.form}>
          <div>
            <label className={styles.label}>Workspace ID</label>
            <input
              type="text"
              value={localWorkspaceId}
              onChange={(e) => setLocalWorkspaceId(e.target.value)}
              placeholder="mon-groupe-revision"
            />
            <p className={styles.helpText}>
              Changer de Workspace ID videra vos données locales et synchronisera avec le nouveau groupe.
            </p>
          </div>
        </div>

        <div className={modalStyles.buttonRow}>
          <button onClick={handleSave} className={`${modalStyles.button} ${modalStyles.primaryButton}`}>
            Enregistrer
          </button>
          <button onClick={onClose} className={`${modalStyles.button} ${modalStyles.secondaryButton}`}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
