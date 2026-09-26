class QuizGradingService {
  gradeQuiz(form, submittedAnswers, timeTaken = 0) {
    let totalMarks = 0;
    let obtainedMarks = 0;
    const questionResults = [];

    // Create a map of fields for fast lookup
    const fieldMap = (form.fields || []).reduce((acc, f) => {
      acc[f.id] = f;
      return acc;
    }, {});

    for (const ans of submittedAnswers) {
      const field = fieldMap[ans.fieldId];
      // Only grade specific quiz fields
      if (!field || !['quiz-mcq', 'quiz-boolean', 'quiz-multiselect'].includes(field.type)) {
        continue;
      }

      const marks = Number(field.marks) || 1;
      const negMarks = Number(field.negativeMarks) || 0;
      totalMarks += marks;

      let isCorrect = false;

      // Type-specific grading
      if (field.type === 'quiz-mcq' || field.type === 'quiz-boolean') {
        // Exact string match (handles booleans converted to strings too)
        isCorrect = String(field.correctAnswer) === String(ans.value);
      } else if (field.type === 'quiz-multiselect') {
        const correctArr = Array.isArray(field.correctAnswer) ? field.correctAnswer : [];
        const studentArr = Array.isArray(ans.value) 
          ? ans.value 
          : (typeof ans.value === 'string' && ans.value ? ans.value.split(',').map(s => s.trim()) : []);
        
        const correctSet = new Set(correctArr);
        const studentSet = new Set(studentArr);
        
        // Exact array match
        if (correctSet.size === studentSet.size && [...correctSet].every(x => studentSet.has(x))) {
          isCorrect = true;
        }
      }

      let awarded = 0;
      if (isCorrect) {
        awarded = marks;
        obtainedMarks += marks;
      } else {
        // Check if unanswered
        const isUnanswered = ans.value === undefined || ans.value === null || ans.value === '' || (Array.isArray(ans.value) && ans.value.length === 0);
        
        if (isUnanswered) {
          awarded = 0;
        } else {
          awarded = -negMarks;
          obtainedMarks -= negMarks;
        }
      }

      questionResults.push({
        fieldId: field.id,
        isCorrect,
        awarded,
        correctAnswer: field.correctAnswer,
        studentAnswer: ans.value,
        marks,
        negativeMarks: negMarks
      });
    }

    // Requirements: "Do not allow negative total score. Minimum obtained score: 0"
    if (obtainedMarks < 0) obtainedMarks = 0;

    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    
    const settings = form.settings || {};
    const passingScore = Number(settings.passingScore) || 0; // Default to 0 if not set
    const passed = percentage >= passingScore;

    return {
      totalMarks,
      obtainedMarks,
      percentage: Math.round(percentage * 100) / 100,
      passed,
      timeTaken,
      questionResults
    };
  }
}

export default new QuizGradingService();
