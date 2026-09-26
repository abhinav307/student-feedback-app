import { describe, it, expect } from 'vitest';
import { validateAnswers } from '../services/FormAnswerValidator.js';

describe('FormAnswerValidator', () => {
    it('should validate valid short text', () => {
        const form = { fields: [{ id: 'f1', type: 'text', label: 'Name', required: true }] };
        const result = validateAnswers(form, [{ fieldId: 'f1', value: 'John' }]);
        expect(result.valid).toBe(true);
        expect(result.answers[0].value).toBe('John');
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should reject missing required text', () => {
        const form = { fields: [{ id: 'f1', type: 'text', label: 'Name', required: true }] };
        const result = validateAnswers(form, []);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(expect.objectContaining({ type: 'required_field' }));
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should accept optional missing field', () => {
        const form = { fields: [{ id: 'f1', type: 'text', label: 'Name', required: false }] };
        const result = validateAnswers(form, []);
        expect(result.valid).toBe(true);
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should reject invalid email', () => {
        const form = { fields: [{ id: 'f1', type: 'email', label: 'Email', required: true }] };
        const result = validateAnswers(form, [{ fieldId: 'f1', value: 'invalid-email' }]);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(expect.objectContaining({ type: 'invalid_email' }));
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should validate valid email', () => {
        const form = { fields: [{ id: 'f1', type: 'email', label: 'Email', required: true }] };
        const result = validateAnswers(form, [{ fieldId: 'f1', value: 'test@example.com' }]);
        expect(result.valid).toBe(true);
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should reject invalid number', () => {
        const form = { fields: [{ id: 'f1', type: 'number', label: 'Age' }] };
        const result = validateAnswers(form, [{ fieldId: 'f1', value: 'abc' }]);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(expect.objectContaining({ type: 'invalid_number' }));
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should reject number outside configured range', () => {
        const form = { fields: [{ id: 'f1', type: 'number', label: 'Age', min: 10, max: 20 }] };
        const result = validateAnswers(form, [{ fieldId: 'f1', value: '25' }]);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(expect.objectContaining({ type: 'number_too_large' }));
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should validate valid number', () => {
        const form = { fields: [{ id: 'f1', type: 'number', label: 'Age', min: 10, max: 20 }] };
        const result = validateAnswers(form, [{ fieldId: 'f1', value: '15' }]);
        expect(result.valid).toBe(true);
        expect(result.answers[0].value).toBe(15);
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should reject invalid radio option', () => {
        const form = { fields: [{ id: 'f1', type: 'radio', label: 'Choice', options: ['A', 'B'] }] };
        const result = validateAnswers(form, [{ fieldId: 'f1', value: 'C' }]);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(expect.objectContaining({ type: 'invalid_option' }));
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should validate valid radio option', () => {
        const form = { fields: [{ id: 'f1', type: 'radio', label: 'Choice', options: ['A', 'B'] }] };
        const result = validateAnswers(form, [{ fieldId: 'f1', value: 'A' }]);
        expect(result.valid).toBe(true);
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should reject invalid dropdown option', () => {
        const form = { fields: [{ id: 'f1', type: 'dropdown', label: 'Choice', options: ['A', 'B'] }] };
        const result = validateAnswers(form, [{ fieldId: 'f1', value: 'C' }]);
        expect(result.valid).toBe(false);
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should reject invalid checkbox option', () => {
        const form = { fields: [{ id: 'f1', type: 'checkbox', label: 'Choice', options: ['A', 'B'] }] };
        const result = validateAnswers(form, [{ fieldId: 'f1', value: ['A', 'C'] }]);
        expect(result.valid).toBe(false);
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should remove duplicate checkbox options automatically and validate', () => {
        const form = { fields: [{ id: 'f1', type: 'checkbox', label: 'Choice', options: ['A', 'B'] }] };
        const result = validateAnswers(form, [{ fieldId: 'f1', value: ['A', 'A'] }]);
        expect(result.valid).toBe(true);
        expect(result.answers[0].value).toEqual(['A']);
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should reject invalid rating', () => {
        const form = { fields: [{ id: 'f1', type: 'rating', label: 'Rate' }] }; // defaults to 1-5
        const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
        expect(result.valid).toBe(false);
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should validate valid rating', () => {
        const form = { fields: [{ id: 'f1', type: 'rating', label: 'Rate' }] };
        const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
        expect(result.valid).toBe(true);
        expect(result.answers[0].value).toBe(4);
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should reject invalid field ID', () => {
        const form = { fields: [{ id: 'f1', type: 'text', label: 'Name' }] };
        const result = validateAnswers(form, [{ fieldId: 'fake', value: 'John' }]);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(expect.objectContaining({ type: 'invalid_field' }));
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should reject duplicate field ID', () => {
        const form = { fields: [{ id: 'f1', type: 'text', label: 'Name' }] };
        const result = validateAnswers(form, [{ fieldId: 'f1', value: 'John' }, { fieldId: 'f1', value: 'Doe' }]);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(expect.objectContaining({ type: 'duplicate_field' }));
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should ignore section layout fields without requiring answers', () => {
        const form = { fields: [{ id: 'f1', type: 'section', label: 'Section' }, { id: 'f2', type: 'text', label: 'T', required: true }] };
        const result = validateAnswers(form, [{ fieldId: 'f2', value: 'Ans' }]);
        expect(result.valid).toBe(true);
        expect(result.answers.length).toBe(1);
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should reject oversized text', () => {
        const form = { fields: [{ id: 'f1', type: 'text', label: 'Name' }] };
        const longText = 'a'.repeat(2001);
        const result = validateAnswers(form, [{ fieldId: 'f1', value: longText }]);
        expect(result.valid).toBe(false);
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});
    
    it('should validate quiz MCQ valid option', () => {
        const form = { fields: [{ id: 'q1', type: 'quiz-mcq', label: 'Q', options: ['A', 'B', 'C'] }] };
        const result = validateAnswers(form, [{ fieldId: 'q1', value: 'B' }]);
        expect(result.valid).toBe(true);
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should reject quiz MCQ invalid option', () => {
        const form = { fields: [{ id: 'q1', type: 'quiz-mcq', label: 'Q', options: ['A', 'B'] }] };
        const result = validateAnswers(form, [{ fieldId: 'q1', value: 'C' }]);
        expect(result.valid).toBe(false);
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});

    it('should validate quiz boolean valid value', () => {
        const form = { fields: [{ id: 'q1', type: 'quiz-boolean', label: 'Q' }] };
        const result = validateAnswers(form, [{ fieldId: 'q1', value: 'true' }]);
        expect(result.valid).toBe(true);
        expect(result.answers[0].value).toBe(true);
        describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});
    describe('Schema Bug Fix: Rating / Emoji / Slider', () => {
        it('4. Valid rating accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '4' }]);
            expect(result.valid).toBe(true);
        });

        it('5. Invalid rating rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'rating', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: '6' }]);
            expect(result.valid).toBe(false);
            expect(result.errors[0].type).toBe('out_of_range');
        });

        it('6. Valid emoji accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 1 }]);
            expect(result.valid).toBe(true);
        });

        it('7. Invalid emoji rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'emoji', min: 1, max: 5 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 0 }]);
            expect(result.valid).toBe(false);
        });

        it('8. Valid slider accepted', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 50 }]);
            expect(result.valid).toBe(true);
        });

        it('9. Invalid slider rejected', () => {
            const form = { fields: [{ id: 'f1', type: 'slider', min: 0, max: 100 }] };
            const result = validateAnswers(form, [{ fieldId: 'f1', value: 101 }]);
            expect(result.valid).toBe(false);
        });
    });
});
