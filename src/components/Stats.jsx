import React from 'react';
import styles from './Stats.module.css';

const Stats = ({ stats }) => {
  const statItems = [
    { label: 'Total', value: stats.total, color: 'var(--accent)' },
    { label: 'À réviser', value: stats.toReview, color: '#F59E0B' },
    { label: 'Matières', value: stats.subjects, color: '#10B981' }
  ];

  return (
    <div className={styles.statsGrid}>
      {statItems.map((stat, idx) => (
        <div key={idx} className={styles.statCard}>
          <div className={styles.statLabel}>{stat.label}</div>
          <div className={styles.statValue} style={{ color: stat.color }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;