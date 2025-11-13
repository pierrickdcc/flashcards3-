// src/components/CourseList.jsx
import React, { useMemo } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { motion } from 'framer-motion';
import { DEFAULT_SUBJECT } from '../constants/app';

const CourseList = ({ onCourseSelect }) => {
  const { courses } = useDataSync();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  // Grouper les cours par matière directement depuis les cours
  const coursesBySubject = useMemo(() => {
    return (courses || []).reduce((acc, course) => {
      const subjectName = course.subject || DEFAULT_SUBJECT; // Utilise le sujet par défaut
      if (!acc[subjectName]) {
        acc[subjectName] = [];
      }
      acc[subjectName].push(course);
      return acc;
    }, {});
  }, [courses]);

  // Obtenir les noms des matières à partir des groupes
  const subjectNames = Object.keys(coursesBySubject).sort();

  if (!courses || courses.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500 dark:text-gray-400">
        Aucun cours à afficher.
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {subjectNames.map(subjectName => {
        const subjectCourses = coursesBySubject[subjectName];
        if (subjectCourses.length === 0) return null;

        return (
          <div key={subjectName}>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 border-b-2 border-blue-500 pb-2">
              {subjectName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {subjectCourses.map(course => (
                <motion.button
                  key={course.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-left w-full h-full flex items-center justify-center text-center font-semibold text-gray-700 dark:text-gray-200"
                  onClick={() => onCourseSelect(course)}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {course.title}
                </motion.button>
              ))}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
};

export default CourseList;
