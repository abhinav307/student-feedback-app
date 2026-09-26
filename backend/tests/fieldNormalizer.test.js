import { normalizeScaleField, normalizeFormFields } from '../utils/fieldNormalizer.js';

describe('fieldNormalizer', () => {
    it('1. Default Star Rating configuration = 1-5', () => {
        const field = { type: 'rating', min: '', max: '' };
        const normalized = normalizeScaleField(field);
        expect(normalized.min).toBe(1);
        expect(normalized.max).toBe(5);
        expect(normalized.step).toBe(1);
    });

    it('2. Default Emoji Rating configuration = 1-5', () => {
        const field = { type: 'emoji' };
        const normalized = normalizeScaleField(field);
        expect(normalized.min).toBe(1);
        expect(normalized.max).toBe(5);
        expect(normalized.step).toBe(1);
    });

    it('3. Default Slider configuration = 0-100', () => {
        const field = { type: 'slider', min: null, max: undefined };
        const normalized = normalizeScaleField(field);
        expect(normalized.min).toBe(0);
        expect(normalized.max).toBe(100);
        expect(normalized.step).toBe(1);
    });

    it('10. Custom ranges persist', () => {
        const field = { type: 'rating', min: 2, max: 10, step: 2 };
        const normalized = normalizeScaleField(field);
        expect(normalized.min).toBe(2);
        expect(normalized.max).toBe(10);
        expect(normalized.step).toBe(2);
    });

    it('11. Legacy malformed ranges are normalized', () => {
        const field = { type: 'slider', min: 0, max: 0, step: 'invalid' };
        const normalized = normalizeScaleField(field);
        expect(normalized.min).toBe(0);
        expect(normalized.max).toBe(100); // Because min >= max is invalid for slider, it resets to default
        expect(normalized.step).toBe(1);
    });
});
