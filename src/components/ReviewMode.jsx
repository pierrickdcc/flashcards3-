
import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';

const ReviewMode = () => {
  const { getCardsToReview, reviewCard } = useDataSync();
  const { setReviewMode, selectedSubject } = useUIState();
  const [cardsToReview, setCardsToReview] = useState(getCardsToReview(selectedSubject));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [direction, setDirection] = useState(0);
  const controls = useAnimation();

  const currentCard = cardsToReview[currentIndex];

  useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById('review-card')?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleAnswer = async (quality) => {
    await reviewCard(currentCard, quality);
    
    if (currentIndex < cardsToReview.length - 1) {
      setDirection(quality >= 3 ? 1 : -1);
      await controls.start({
        x: quality >= 3 ? 1000 : -1000,
        opacity: 0,
        transition: { duration: 0.3 }
      });
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setDirection(0);
      controls.start({ x: 0, opacity: 1 });
    } else {
      setReviewMode(false);
    }
  };

  const handleSwipe = async (event, info) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) {
        handleAnswer(4); // Swipe droit = Facile
      } else {
        handleAnswer(2); // Swipe gauche = Difficile
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setShowAnswer(true);
    }
  };

  if (!currentCard) {
    // This can happen if all cards are reviewed and the component hasn't been unmounted yet.
    // Or if there were no cards to review in the first place.
    useEffect(() => {
        setReviewMode(false);
    }, []);
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setReviewMode(false)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-sm font-medium dark:text-white">
          {currentIndex + 1} / {cardsToReview.length}
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          id="review-card"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="w-full max-w-2xl h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none"
          drag="x"
          dragConstraints={{ left: -100, right: 100 }}
          dragElastic={0.1}
          onDragEnd={handleSwipe}
          animate={controls}
          initial={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
            {currentCard.subject}
          </div>
          
          <div className="flex-1 flex items-center justify-center w-full">
            <p className="text-2xl font-light text-center dark:text-white">
              {showAnswer ? currentCard.answer : currentCard.question}
            </p>
          </div>

          <div className="absolute bottom-4 text-xs text-gray-400">
            {showAnswer ? 'Swipe → Facile | ← Difficile' : 'Cliquez pour révéler'}
          </div>
        </motion.div>
      </div>

      {!showAnswer ? (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Afficher la réponse
          </button>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleAnswer(2)}
              className="py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
            >
              Oublié
            </button>
            <button
              onClick={() => handleAnswer(3)}
              className="py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
            >
              Difficile
            </button>
            <button
              onClick={() => handleAnswer(4)}
              className="py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              Moyen
            </button>
            <button
              onClick={() => handleAnswer(5)}
              className="py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
            >
              Facile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewMode;
