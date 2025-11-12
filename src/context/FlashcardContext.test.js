import { describe, it, expect } from 'vitest';
import { calculateNextReview } from './FlashcardContext';

describe('calculateNextReview', () => {
    it('should reset interval to 1 for quality < 3', () => {
        const { interval, easiness } = calculateNextReview(2, 5, 2.5);
        expect(interval).toBe(1);
        expect(easiness).toBe(2.5); // Easiness should not change
    });

    it('should set interval to 6 for the first good review (quality >= 3)', () => {
        const { interval } = calculateNextReview(4, 1, 2.5);
        expect(interval).toBe(6);
    });

    it('should calculate a new interval for subsequent good reviews', () => {
        // First, new easiness is calculated: 2.6 + 0.1 = 2.7
        // Then, new interval: Math.ceil(6 * 2.7) = 17
        const { interval } = calculateNextReview(5, 6, 2.6);
        expect(interval).toBe(17);
    });

    it('should increase easiness for high quality reviews', () => {
        const { easiness } = calculateNextReview(5, 6, 2.5);
        expect(easiness).toBeCloseTo(2.6);
    });

    it('should decrease easiness for lower quality reviews (but >= 3)', () => {
        const { easiness } = calculateNextReview(3, 6, 2.5);
        expect(easiness).toBeCloseTo(2.36);
    });

    it('should not let easiness factor drop below 1.3', () => {
        const { easiness } = calculateNextReview(3, 6, 1.3);
        expect(easiness).toBe(1.3);
    });

    it('should return a future date for nextReview', () => {
        const { nextReview } = calculateNextReview(4, 1, 2.5);
        const nextReviewDate = new Date(nextReview);
        const now = new Date();
        expect(nextReviewDate).toBeInstanceOf(Date);
        expect(nextReviewDate > now).toBe(true);
    });
});
