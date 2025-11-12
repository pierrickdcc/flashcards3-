
import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { BookOpen, Table, BarChart, Trash2, BookCopy, Search } from 'lucide-react';
import { useFlashcard } from '../context/FlashcardContext';

const Filters = ({ view, setView, subjects, onDeleteSubject }) => {
  const { selectedSubject, setSelectedSubject, searchTerm, setSearchTerm } = useFlashcard();

  const debouncedSearch = useDebouncedCallback((value) => {
    setSearchTerm(value);
  }, 300);

  const baseButtonClass = "p-2 rounded-lg transition-colors duration-200";
  const activeButtonClass = "bg-blue-600 text-white";
  const inactiveButtonClass = "hover:bg-gray-200 dark:hover:bg-gray-700";

  return (
    <div className="my-6 flex flex-wrap items-center gap-4">
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        <button
          onClick={() => setView('courses')}
          className={`${baseButtonClass} ${view === 'courses' ? activeButtonClass : inactiveButtonClass}`}
        >
          <BookCopy size={18} />
        </button>
        <button
          onClick={() => setView('cards')}
          className={`${baseButtonClass} ${view === 'cards' ? activeButtonClass : inactiveButtonClass}`}
        >
          <BookOpen size={18} />
        </button>
        <button
          onClick={() => setView('table')}
          className={`${baseButtonClass} ${view === 'table' ? activeButtonClass : inactiveButtonClass}`}
        >
          <Table size={18} />
        </button>
        <button
          onClick={() => setView('dashboard')}
          className={`${baseButtonClass} ${view === 'dashboard' ? activeButtonClass : inactiveButtonClass}`}
        >
          <BarChart size={18} />
        </button>
      </div>

      {(view === 'cards' || view === 'table') && (
        <div className="relative flex-grow min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher des cartes..."
            defaultValue={searchTerm}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      )}

      {view !== 'dashboard' && view !== 'courses' && (
        <div className="flex items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Toutes les matières</option>
            {(subjects || []).map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
          {selectedSubject !== 'all' && (
            <button
              onClick={() => onDeleteSubject(selectedSubject)}
              className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Filters;
