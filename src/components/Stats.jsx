
import React from 'react';

const Stats = ({ stats }) => {
  const statItems = [
    { label: 'Total', value: stats.total, color: 'text-blue-500' },
    { label: 'À réviser', value: stats.toReview, color: 'text-yellow-500' },
    { label: 'Matières', value: stats.subjects, color: 'text-green-500' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {statItems.map((stat, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</div>
          <div className={`text-3xl font-bold ${stat.color}`}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;
