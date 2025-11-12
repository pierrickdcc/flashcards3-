/**
 * Calculates the next review date for a flashcard based on user performance.
 * @param {number} quality - The quality of the review (0-5).
 * @param {number} interval - The current interval in days.
 * @param {number} easiness - The current easiness factor.
 * @returns {{interval: number, easiness: number, nextReview: string}} - The new interval, easiness factor, and next review date.
 */
export const calculateNextReview = (quality, interval, easiness) => {
  if (quality < 3) {
    return { interval: 1, easiness, nextReview: new Date().toISOString() };
  }

  let newEasiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEasiness < 1.3) newEasiness = 1.3;

  let newInterval;
  if (interval === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.ceil(interval * newEasiness);
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return { interval: newInterval, easiness: newEasiness, nextReview: nextReview.toISOString() };
};