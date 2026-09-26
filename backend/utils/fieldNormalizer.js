function normalizeScaleField(field) {
    if (!['rating', 'emoji', 'slider'].includes(field.type)) return field;

    let min = field.min;
    let max = field.max;

    const isInvalid = (val) => val === undefined || val === null || val === '' || isNaN(Number(val));

    if (isInvalid(min)) {
        min = field.type === 'slider' ? 0 : 1;
    } else {
        min = Number(min);
    }

    if (isInvalid(max)) {
        max = field.type === 'slider' ? 100 : 5;
    } else {
        max = Number(max);
    }

    if (min >= max) {
        if (field.type === 'slider') {
            min = 0; max = 100;
        } else {
            min = 1; max = 5;
        }
    }

    let step = field.step;
    if (isInvalid(step) || Number(step) <= 0) {
        step = 1;
    } else {
        step = Number(step);
    }

    return { ...field, min, max, step };
}

function normalizeFormFields(formBody) {
    if (!formBody || !Array.isArray(formBody.fields)) return formBody;
    const newFields = formBody.fields.map(normalizeScaleField);
    return { ...formBody, fields: newFields };
}

export { normalizeScaleField, normalizeFormFields };
