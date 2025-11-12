// src/components/CourseList.jsx
import React, { useMemo } from 'react';
import { useFlashcard } from '../context/FlashcardContext';
import styles from './CourseList.module.css';
import { motion } from 'framer-motion';
import { DEFAULT_SUBJECT } from '../constants/app';

const CourseList = ({ onCourseSelect }) => {
  const { courses } = useFlashcard();

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
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Aucun cours à afficher.
      </div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {subjectNames.map(subjectName => {
        const subjectCourses = coursesBySubject[subjectName];
        if (subjectCourses.length === 0) return null;

        return (
          <div key={subjectName} className={styles.subjectSection}>
            <h2 className={styles.subjectTitle}>{subjectName}</h2>
            <div className={styles.courseGrid}>
              {subjectCourses.map(course => (
                <motion.button
                  key={course.id}
                  className={styles.courseCard}
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
