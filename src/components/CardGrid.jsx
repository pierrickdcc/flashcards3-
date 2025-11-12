import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CardGrid = ({ filteredCards, setEditingCard, deleteCardWithSync }) => {
  if (filteredCards.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Aucune carte à afficher</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Ajoutez de nouvelles cartes ou sélectionnez une autre matière.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCards.map(card => (
        <motion.div
          key={card.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-col space-y-4 border border-transparent hover:border-blue-500 transition-all"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3 }}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-start justify-between">
            <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-full">
              {card.subject}
            </span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setEditingCard(card)} 
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Modifier"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => deleteCardWithSync(card.id)} 
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Question</p>
            <p className="mt-1 text-gray-800 dark:text-white">{card.question}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Réponse</p>
            <p className="mt-1 text-gray-800 dark:text-white">{card.answer}</p>
          </div>
          
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span>{card.reviewCount} révisions</span>
            <span>{new Date(card.nextReview).toLocaleDateString('fr-FR')}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CardGrid;
