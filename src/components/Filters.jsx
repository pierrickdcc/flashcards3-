
import React from 'react';
import { useFlashcard } from '../context/FlashcardContext';
import { Search, LayoutGrid, List } from 'lucide-react';
import { VIEW_MODE } from '../constants/app';

// PAS D'IMPORT DE .module.css

const Filters = () => {
  const {
    subjects,
    selectedSubject,
    setSelectedSubject,
    searchTerm,
    debouncedSetSearchTerm,
    viewMode,
    setViewMode,
  } = useFlashcard();

  const handleSearchChange = (e) => {
    debouncedSetSearchTerm(e.target.value);
  };

  const baseButtonClass = "p-2 rounded-lg transition-colors";
  const activeButtonClass = "bg-blue-600 text-white";
  const inactiveButtonClass = "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600";

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4">
      <div className="flex flex-col md:flex-row gap-4">

        {/* Barre de recherche */}
        <div className="relative flex-grow">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
            <Search size={20} />
          </span>
          <input
            type="text"
            placeholder="Rechercher des cartes..."
            defaultValue={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filtres et Vues */}
        <div className="flex flex-shrink-0 gap-2">
          {/* Selecteur de Matière */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="flex-grow md:flex-grow-0 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les matières</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>

          {/* Boutons de Vue */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode(VIEW_MODE.GRID)}
              className={`${baseButtonClass} ${viewMode === VIEW_MODE.GRID ? activeButtonClass : inactiveButtonClass}`}
              aria-label="Grid View"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode(VIEW_MODE.TABLE)}
              className={`${baseButtonClass} ${viewMode === VIEW_MODE.TABLE ? activeButtonClass : inactiveButtonClass}`}
              aria-label="Table View"
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
