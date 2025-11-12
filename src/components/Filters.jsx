import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { BookOpen, Table, BarChart, Trash2, BookCopy, Search } from 'lucide-react';
import styles from './Filters.module.css';

const Filters = ({ view, setView, selectedSubject, setSelectedSubject, subjects, onDeleteSubject, searchTerm, setSearchTerm }) => {
  const debouncedSearch = useDebouncedCallback((value) => {
    setSearchTerm(value);
  }, 300);

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.viewToggle}>
        <button
          onClick={() => setView('courses')}
          className={`${styles.toggleButton} ${view === 'courses' ? styles.active : ''}`}
        >
          <BookCopy size={18} />
        </button>
        <button
          onClick={() => setView('cards')}
          className={`${styles.toggleButton} ${view === 'cards' ? styles.active : ''}`}
        >
          <BookOpen size={18} />
        </button>
        <button
          onClick={() => setView('table')}
          className={`${styles.toggleButton} ${view === 'table' ? styles.active : ''}`}
        >
          <Table size={18} />
        </button>
        <button
          onClick={() => setView('dashboard')}
          className={`${styles.toggleButton} ${view === 'dashboard' ? styles.active : ''}`}
        >
          <BarChart size={18} />
        </button>
      </div>

      {(view === 'cards' || view === 'table') && (
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher des cartes..."
            defaultValue={searchTerm}
            onChange={(e) => debouncedSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      )}

      {view !== 'dashboard' && view !== 'courses' && (
        <>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className={styles.subjectSelect}
          >
            <option value="all">Toutes les matières</option>
            {(subjects || []).map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
          {selectedSubject !== 'all' && (
            <button
              onClick={() => onDeleteSubject(selectedSubject)}
              className={styles.deleteButton}
            >
              <Trash2 size={18} />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Filters;
