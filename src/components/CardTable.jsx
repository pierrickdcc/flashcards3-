import React from 'react';
import { Edit, Trash2, Check, X } from 'lucide-react';
import styles from './CardTable.module.css';

const CardTable = ({
  filteredCards,
  editingCard,
  setEditingCard,
  updateCardWithSync,
  deleteCardWithSync,
  subjects
}) => {
  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {['Question', 'Réponse', 'Matière', 'Prochaine', 'Révisions', 'Actions'].map((header) => (
                <th key={header} className={styles.th}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCards.map((card) => (
              <tr key={card.id} className={styles.tr}>
                <td className={styles.td} data-label="Question">
                  {editingCard?.id === card.id ? (
                    <input
                      value={editingCard.question}
                      onChange={(e) => setEditingCard({ ...editingCard, question: e.target.value })}
                      className={styles.input}
                    />
                  ) : (
                    <span>{card.question}</span>
                  )}
                </td>
                <td className={styles.td} data-label="Réponse">
                  {editingCard?.id === card.id ? (
                    <input
                      value={editingCard.answer}
                      onChange={(e) => setEditingCard({ ...editingCard, answer: e.target.value })}
                      className={styles.input}
                    />
                  ) : (
                    <span>{card.answer}</span>
                  )}
                </td>
                <td className={styles.td} data-label="Matière">
                  {editingCard?.id === card.id ? (
                    <select
                      value={editingCard.subject}
                      onChange={(e) => setEditingCard({ ...editingCard, subject: e.target.value })}
                      className={styles.select}
                    >
                      {(subjects || []).map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={styles.subjectTag}>
                      {card.subject}
                    </span>
                  )}
                </td>
                <td className={`${styles.td} ${styles.smallText}`} data-label="Prochaine">
                  {new Date(card.nextReview).toLocaleDateString('fr-FR')}
                </td>
                <td className={`${styles.td} ${styles.centerText}`} data-label="Révisions">
                  {card.reviewCount}
                </td>
                <td className={styles.td} data-label="Actions">
                  <div className={styles.actionCell}>
                    {editingCard?.id === card.id ? (
                      <>
                        <button onClick={() => updateCardWithSync(card.id, editingCard)} className={`${styles.actionButton} ${styles.checkButton}`}>
                          <Check size={18} />
                        </button>
                        <button onClick={() => setEditingCard(null)} className={styles.actionButton}>
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingCard(card)} className={styles.actionButton}>
                          <Edit size={18} />
                        </button>
                        <button onClick={() => deleteCardWithSync(card.id)} className={`${styles.actionButton} ${styles.deleteButton}`}>
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CardTable;
