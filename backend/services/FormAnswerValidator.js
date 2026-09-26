export function validateAnswers(form, submittedAnswers) {
    if (!Array.isArray(submittedAnswers)) {
        return { valid: false, errors: [{ message: 'Answers payload must be an array.', code: 'INVALID_PAYLOAD' }] };
    }

    if (submittedAnswers.length > 300) {
        return { valid: false, errors: [{ message: 'Too many answers submitted.', code: 'PAYLOAD_TOO_LARGE' }] };
    }

    const errors = [];
    const sanitizedAnswers = [];
    
    const fieldMap = new Map();
    (form.fields || []).forEach(f => fieldMap.set(f.id, f));

    const seenFieldIds = new Set();

    for (const ans of submittedAnswers) {
        if (!ans || typeof ans !== 'object') continue;

        const fieldId = ans.fieldId;
        if (!fieldId) continue;

        if (seenFieldIds.has(fieldId)) {
            errors.push({ fieldId, type: 'duplicate_field', message: 'A field was submitted more than once.' });
            continue;
        }
        
        const field = fieldMap.get(fieldId);
        if (!field) {
            errors.push({ fieldId, type: 'invalid_field', message: 'Submitted field does not belong to this form.' });
            continue;
        }

        if (['section', 'image', 'video'].includes(field.type)) continue;

        seenFieldIds.add(fieldId);

        let value = ans.value;
        const isMissing = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

        if (field.required && isMissing) {
            errors.push({ fieldId, type: 'required_field', message: 'This field is required.' });
            continue;
        }

        if (isMissing) {
            sanitizedAnswers.push({ fieldId: field.id, fieldLabel: field.label, fieldType: field.type, value: null });
            continue;
        }

        let valid = true;
        let sanitizedValue = value;

        switch (field.type) {
            case 'text':
            case 'email':
            case 'phone':
            case 'date':
            case 'time':
                if (typeof value !== 'string' && typeof value !== 'number') {
                    valid = false;
                } else {
                    sanitizedValue = String(value).trim();
                    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedValue)) {
                        errors.push({ fieldId, type: 'invalid_email', message: 'Please provide a valid email address.' });
                        valid = false;
                    }
                    if (sanitizedValue.length > 2000) {
                        errors.push({ fieldId, type: 'text_too_long', message: 'Text exceeds maximum length of 2000 characters.' });
                        valid = false;
                    }
                }
                break;
            case 'longtext':
                if (typeof value !== 'string' && typeof value !== 'number') {
                    valid = false;
                } else {
                    sanitizedValue = String(value).trim();
                    if (sanitizedValue.length > 20000) {
                        errors.push({ fieldId, type: 'text_too_long', message: 'Text exceeds maximum length of 20000 characters.' });
                        valid = false;
                    }
                }
                break;
            case 'number': {
                const num = Number(value);
                if (isNaN(num)) {
                    errors.push({ fieldId, type: 'invalid_number', message: 'Please provide a valid number.' });
                    valid = false;
                } else {
                    sanitizedValue = num;
                    if (field.min !== undefined && num < Number(field.min)) {
                        errors.push({ fieldId, type: 'number_too_small', message: `Value must be at least ${field.min}.` });
                        valid = false;
                    }
                    if (field.max !== undefined && num > Number(field.max)) {
                        errors.push({ fieldId, type: 'number_too_large', message: `Value must be at most ${field.max}.` });
                        valid = false;
                    }
                }
                break;
            }
            case 'radio':
            case 'dropdown':
            case 'quiz-mcq':
                if (typeof value !== 'string' && typeof value !== 'number') {
                    valid = false;
                } else {
                    sanitizedValue = String(value).trim();
                    const options = Array.isArray(field.options) ? field.options : [];
                    if (!options.includes(sanitizedValue)) {
                        errors.push({ fieldId, type: 'invalid_option', message: 'Selected option is not available for this field.' });
                        valid = false;
                    }
                }
                break;
            case 'checkbox':
            case 'quiz-multiselect':
                if (!Array.isArray(value)) {
                    errors.push({ fieldId, type: 'invalid_type', message: 'Expected an array of options.' });
                    valid = false;
                } else {
                    sanitizedValue = [...new Set(value.map(v => String(v).trim()))];
                    const options = Array.isArray(field.options) ? field.options : [];
                    for (const v of sanitizedValue) {
                        if (!options.includes(v)) {
                            errors.push({ fieldId, type: 'invalid_option', message: `Option '${v}' is not available.` });
                            valid = false;
                            break;
                        }
                    }
                }
                break;
            case 'rating':
            case 'emoji':
            case 'slider': {
                const rating = Number(value);
                if (isNaN(rating)) {
                    errors.push({ fieldId, type: 'invalid_rating', message: 'Please provide a valid rating.' });
                    valid = false;
                } else {
                    sanitizedValue = rating;
                    const min = field.min !== undefined ? Number(field.min) : (field.type === 'slider' ? 0 : 1);
                    const max = field.max !== undefined ? Number(field.max) : (field.type === 'slider' ? 100 : 5);
                    if (rating < min || rating > max) {
                        errors.push({ fieldId, type: 'out_of_range', message: `Value must be between ${min} and ${max}.` });
                        valid = false;
                    }
                }
                break;
            }
            case 'yesno':
            case 'quiz-boolean': {
                const strVal = String(value).toLowerCase().trim();
                if (!['true', 'false', 'yes', 'no'].includes(strVal)) {
                    errors.push({ fieldId, type: 'invalid_boolean', message: 'Please provide a valid yes/no answer.' });
                    valid = false;
                } else {
                    sanitizedValue = (strVal === 'true' || strVal === 'yes');
                }
                break;
            }
            default:
                sanitizedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                break;
        }

        if (!valid && !errors.find(e => e.fieldId === fieldId)) {
            errors.push({ fieldId, type: 'invalid_type', message: 'Invalid answer format.' });
        }

        if (valid) {
            sanitizedAnswers.push({ fieldId: field.id, fieldLabel: field.label, fieldType: field.type, value: sanitizedValue });
        }
    }

    for (const field of (form.fields || [])) {
        if (['section', 'image', 'video'].includes(field.type)) continue;
        if (field.required && !seenFieldIds.has(field.id)) {
            errors.push({ fieldId: field.id, type: 'required_field', message: 'This field is required.' });
        }
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    return { valid: true, answers: sanitizedAnswers };
}
