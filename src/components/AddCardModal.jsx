
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDataSync } from '../context/DataSyncContext';
import ModalWrapper from './ModalWrapper';

const AddCardModal = ({ show, onClose }) => {
  const { subjects, addCard } = useDataSync();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (show && subjects && subjects.length > 0 && !subject) {
      setSubject(subjects[0].name);
    }
  }, [show, subjects, subject]);

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
    <ModalWrapper isOpen={show} onClose={onClose} title="Ajouter une carte">
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question"
        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Réponse"
        className="w-full px-4 py-2 mt-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-24"
      />
      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full px-4 py-2 mt-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {(subjects || []).map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>
      <div className="flex gap-4 pt-4">
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Ajouter
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

export default AddCardModal;
