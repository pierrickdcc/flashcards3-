
import React, { useState, useEffect } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { DEFAULT_SUBJECT } from '../constants/app';
import ModalWrapper from './ModalWrapper';

const AddCourseModal = ({ show, onClose }) => {
  const { subjects, addCourse } = useDataSync();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (show) {
      if (subjects && subjects.length > 0) {
        setSubject(subjects[0].name);
      } else {
        setSubject(DEFAULT_SUBJECT);
      }
    }
  }, [show, subjects]);

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
    <ModalWrapper isOpen={show} onClose={onClose} title="Ajouter un cours">
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre du cours"
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {subjects && subjects.length > 0 ? (
            subjects.map((s) => (
              <option key={s.id || s.name} value={s.name}>
                {s.name}
              </option>
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
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <div className="flex gap-4 pt-2">
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
      </div>
    </ModalWrapper>
  );
};

export default AddCourseModal;
