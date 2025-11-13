
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { VIEW_MODE, LOCAL_STORAGE_KEYS } from '../constants/app';

const UIStateContext = createContext();

export const UIStateProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(VIEW_MODE.GRID);

  const debouncedSetSearchTerm = useDebouncedCallback((value) => {
    setSearchTerm(value);
  }, 300);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, darkMode ? 'dark' : 'light');
    document.body.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  useEffect(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME);
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  const value = {
    darkMode, setDarkMode,
    showConfigModal, setShowConfigModal,
    showBulkAddModal, setShowBulkAddModal,
    showAddSubjectModal, setShowAddSubjectModal,
    showAddCardModal, setShowAddCardModal,
    showAddCourseModal, setShowAddCourseModal,
    reviewMode, setReviewMode,
    selectedSubject, setSelectedSubject,
    searchTerm, setSearchTerm,
    viewMode, setViewMode,
    debouncedSetSearchTerm,
  };

  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
};

export const useUIState = () => {
  const context = useContext(UIStateContext);
  if (context === undefined) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  return context;
};
