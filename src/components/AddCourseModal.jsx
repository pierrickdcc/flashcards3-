import React, { useState, useEffect } from 'react';
import modalStyles from './Modal.module.css';
import { useFlashcard } from '../context/FlashcardContext';
import { DEFAULT_SUBJECT } from '../constants/app';

const AddCourseModal = ({ show, onClose }) => {
  const { subjects, addCourse } = useFlashcard();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    // Set default subject when modal is shown or subjects change
    if (show) {
      if (subjects && subjects.length > 0) {
        setSubject(subjects[0].name);
      } else {
        setSubject(DEFAULT_SUBJECT);
      }
    }
  }, [show, subjects]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!show) return null;

  const handleSubmit = () => {
    if (!title.trim() || !subject.trim() || !htmlContent.trim()) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    addCourse({ title, subject, content: htmlContent });
    onClose();
    setTitle('');
    setSubject(subjects && subjects.length > 0 ? subjects[0].name : DEFAULT_SUBJECT);
    setHtmlContent('');
  };

  return (
    <div className={modalStyles.overlay} onClick={onClose}>
      <div className={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={modalStyles.title}>Ajouter un cours</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre du cours"
        />
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          {(subjects && subjects.length > 0) ? (
            subjects.map(s => (
              <option key={s.id || s.name} value={s.name}>{s.name}</option>
            ))
          ) : (
            <option value={DEFAULT_SUBJECT}>{DEFAULT_SUBJECT}</option>
          )}
        </select>
        <textarea
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          placeholder="Collez le contenu HTML ici"
          rows="10"
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

export default AddCourseModal;
