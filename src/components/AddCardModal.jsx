import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import modalStyles from './Modal.module.css';
import { useFlashcard } from '../context/FlashcardContext';

const AddCardModal = ({ show, onClose }) => {
  const { subjects, addCard } = useFlashcard();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (show && subjects && subjects.length > 0 && !subject) {
      setSubject(subjects[0].name);
    }
  }, [show, subjects, subject]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error('La question et la réponse sont obligatoires');
      return;
    }
    addCard({ question: question.trim(), answer: answer.trim(), subject });
    onClose();
  };

  return (
    <div className={modalStyles.overlay} onClick={onClose}>
      <div className={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={modalStyles.title}>Ajouter une carte</h2>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Question"
        />
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Réponse"
        />
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          {(subjects || []).map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
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

export default AddCardModal;
