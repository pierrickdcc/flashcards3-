
import React from 'react';
import { X } from 'lucide-react';
import { useFlashcard } from '../context/FlashcardContext'; // <-- Importer

// Supprimez l'import de .module.css

const CourseViewer = ({ course, onClose }) => {
  const { darkMode } = useFlashcard(); // <-- Récupérer le thème

  // Styles à injecter
  const iframeStyles = `
    <style>
      body {
        font-family: system-ui, sans-serif;
        line-height: 1.6;
        padding: 1.5rem;
        color: ${darkMode ? '#F9FAFB' : '#0E1116'};
      }
      * { color: inherit; }
    </style>
  `;
  const iframeContent = `${iframeStyles}${course.content}`;

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="text-xl font-bold dark:text-white">{course.title}</h2>
        <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
          <X size={24} />
        </button>
      </div>
      <iframe
        srcDoc={iframeContent} // <-- Utiliser le contenu stylé
        sandbox="allow-styles"
        className="flex-grow w-full h-full border-none"
        title={course.title}
      />
    </div>
  );
};

export default CourseViewer;
