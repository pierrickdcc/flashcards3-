import React from 'react';
import { X } from 'lucide-react';
import styles from './CourseViewer.module.css';

const CourseViewer = ({ course, onClose }) => {
  return (
    <div className={styles.viewerContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>{course.title}</h2>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={24} />
        </button>
      </div>
      <iframe
        srcDoc={course.content}
        sandbox="allow-scripts"
        className={styles.iframe}
        title={course.title}
      />
    </div>
  );
};

export default CourseViewer;
