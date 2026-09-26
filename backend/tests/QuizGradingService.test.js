import { describe, it, expect } from 'vitest';
import QuizGradingService from '../services/QuizGradingService.js';

describe('QuizGradingService', () => {
    const form = {
        settings: { passingScore: 50 },
        fields: [
            { id: 'q1', type: 'quiz-mcq', marks: 1, correctAnswer: 'A' },
            { id: 'q2', type: 'quiz-mcq', marks: 2, negativeMarks: 1, correctAnswer: 'B' },
            { id: 'q3', type: 'quiz-multiselect', marks: 2, correctAnswer: ['A', 'C'] },
            { id: 'q4', type: 'quiz-boolean', marks: 1, correctAnswer: true }
        ]
    };

    it('should calculate all answers correct', () => {
        const answers = [
            { fieldId: 'q1', value: 'A' },
            { fieldId: 'q2', value: 'B' },
            { fieldId: 'q3', value: ['A', 'C'] },
            { fieldId: 'q4', value: true }
        ];
        const result = QuizGradingService.gradeQuiz(form, answers);
        expect(result.totalMarks).toBe(6);
        expect(result.obtainedMarks).toBe(6);
        expect(result.percentage).toBe(100);
        expect(result.passed).toBe(true);
    });

    it('should calculate all answers wrong with negative marking where applicable', () => {
        const answers = [
            { fieldId: 'q1', value: 'B' },
            { fieldId: 'q2', value: 'A' },
            { fieldId: 'q3', value: ['A', 'B'] },
            { fieldId: 'q4', value: false }
        ];
        const result = QuizGradingService.gradeQuiz(form, answers);
        expect(result.totalMarks).toBe(6);
        expect(result.obtainedMarks).toBe(0); // Assuming bounded at 0
        expect(result.percentage).toBe(0);
        expect(result.passed).toBe(false);
    });

    it('should calculate mixed correct and incorrect', () => {
        const answers = [
            { fieldId: 'q1', value: 'A' }, // 1
            { fieldId: 'q2', value: 'A' }, // -1
            { fieldId: 'q3', value: ['A', 'C'] }, // 2
            { fieldId: 'q4', value: false } // 0
        ];
        const result = QuizGradingService.gradeQuiz(form, answers);
        expect(result.totalMarks).toBe(6);
        expect(result.obtainedMarks).toBe(2);
        expect(result.percentage).toBe(33.33); // 2/6 = 33% (integer depending on implementation)
        expect(result.passed).toBe(false);
    });

    it('should fail if exact multiple-select match is missing', () => {
        const answers = [
            { fieldId: 'q3', value: ['A'] }
        ];
        const result = QuizGradingService.gradeQuiz(form, answers);
        expect(result.obtainedMarks).toBe(0);
    });

    it('should pass if score meets passing threshold', () => {
        const customForm = {
            settings: { passingScore: 40 },
            fields: [{ id: 'q1', type: 'quiz-mcq', marks: 10, correctAnswer: 'A' }]
        };
        const result = QuizGradingService.gradeQuiz(customForm, [{ fieldId: 'q1', value: 'A' }]);
        expect(result.passed).toBe(true);
    });
});
