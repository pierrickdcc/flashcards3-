
import React from 'react';
import { Edit, Trash2, Check, X } from 'lucide-react';

const CardTable = ({
  filteredCards,
  editingCard,
  setEditingCard,
  updateCardWithSync,
  deleteCardWithSync,
  subjects
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {['Question', 'Réponse', 'Matière', 'Prochaine', 'Révisions', 'Actions'].map((header) => (
                <th key={header} scope="col" className="px-6 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCards.map((card) => (
              <tr key={card.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4" data-label="Question">
                  {editingCard?.id === card.id ? (
                    <input
                      value={editingCard.question}
                      onChange={(e) => setEditingCard({ ...editingCard, question: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span className="font-medium text-gray-900 dark:text-white">{card.question}</span>
                  )}
                </td>
                <td className="px-6 py-4" data-label="Réponse">
                  {editingCard?.id === card.id ? (
                    <input
                      value={editingCard.answer}
                      onChange={(e) => setEditingCard({ ...editingCard, answer: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span>{card.answer}</span>
                  )}
                </td>
                <td className="px-6 py-4" data-label="Matière">
                  {editingCard?.id === card.id ? (
                    <select
                      value={editingCard.subject}
                      onChange={(e) => setEditingCard({ ...editingCard, subject: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {(subjects || []).map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                      {card.subject}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4" data-label="Prochaine">
                  {new Date(card.nextReview).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-center" data-label="Révisions">
                  {card.reviewCount}
                </td>
                <td className="px-6 py-4" data-label="Actions">
                  <div className="flex items-center space-x-2">
                    {editingCard?.id === card.id ? (
                      <>
                        <button onClick={() => updateCardWithSync(card.id, editingCard)} className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-gray-700 rounded-md">
                          <Check size={18} />
                        </button>
                        <button onClick={() => setEditingCard(null)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingCard(card)} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-md">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => deleteCardWithSync(card.id)} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-gray-700 rounded-md">
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
