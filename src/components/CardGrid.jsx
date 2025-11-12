import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import styles from './CardGrid.module.css';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CardGrid = ({ filteredCards, setEditingCard, deleteCardWithSync }) => {
  if (filteredCards.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>Aucune carte à afficher</h3>
        <p>Ajoutez de nouvelles cartes ou sélectionnez une autre matière.</p>
      </div>
    );
  }

  return (
    <div className={styles.cardGrid}>
      {filteredCards.map(card => (
        <motion.div
          key={card.id}
          className={styles.card}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3 }}
          whileHover={{ y: -5 }}
        >
          <div className={styles.cardHeader}>
            <span className={styles.subjectTag}>
              {card.subject}
            </span>
            <div className={styles.cardActions}>
              <button 
                onClick={() => setEditingCard(card)} 
                className={styles.actionButton}
                title="Modifier"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => deleteCardWithSync(card.id)} 
                className={`${styles.actionButton} ${styles.deleteButton}`}
                title="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          
          <div className={styles.cardContent}>
            <p className={styles.contentLabel}>Question</p>
            <p>{card.question}</p>
          </div>
          
          <div className={styles.cardContent}>
            <p className={styles.contentLabel}>Réponse</p>
            <p>{card.answer}</p>
          </div>
          
          <div className={styles.cardFooter}>
            <span>{card.reviewCount} révisions</span>
            <span>{new Date(card.nextReview).toLocaleDateString('fr-FR')}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CardGrid;
