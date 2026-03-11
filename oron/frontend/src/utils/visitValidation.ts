export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

/**
 * Helper function to check if a goal has any user-entered data
 * Returns true if the goal has been started/documented, false if completely empty
 */
const hasGoalBeenDocumented = (goal: any, formData: any): boolean => {
  // Check if activityLocation is filled (not default/empty)
  if (formData?.activityLocation && formData.activityLocation !== '' && formData.activityLocation !== 'Please select') {
    return true;
  }

  // Check if circumstanceLeadingToActivity is filled
  if (formData?.circumstanceLeadingToActivity && formData.circumstanceLeadingToActivity !== '' && formData.circumstanceLeadingToActivity !== 'Select options') {
    return true;
  }

  // Check if response is filled
  if (formData?.response && formData.response !== '' && formData.response !== 'Select options') {
    return true;
  }

  // Check if any tableData (steps) have been filled with MEANINGFUL data
  const tableData = formData?.tableData || goal?.tableData || [];

  // Filter out empty/uninitialized steps first
  const nonEmptySteps = tableData.filter((step: any) => {
    // A step is considered "empty" if ALL of these are true:
    // - response is empty, null, undefined, or default value
    // - promptUsed is empty, null, undefined, or whitespace
    // - success is 0, empty, null, undefined, or invalid
    // - opportunities is 0, empty, null, undefined, or invalid

    // Check if response has actual content (must be a string, not array of options)
    const hasResponse = step.response &&
                       typeof step.response === 'string' &&
                       step.response !== '' &&
                       step.response !== 'Select response' &&
                       step.response !== 'Select' &&
                       step.response !== null &&
                       step.response !== undefined;

    // Check if promptUsed has actual content (must be a string, not array of options)
    const hasPrompt = step.promptUsed &&
                     typeof step.promptUsed === 'string' &&
                     !Array.isArray(step.promptUsed) &&
                     step.promptUsed.trim() !== '';

    // Check if success has meaningful value (> 0, must not be array of options)
    const successValue = typeof step.success === 'string' ? parseInt(step.success) : step.success;
    const hasSuccess = !Array.isArray(step.success) && !isNaN(successValue) && successValue > 0;

    // Check if opportunities has meaningful value (> 0, must not be array of options)
    const opportunitiesValue = typeof step.opportunities === 'string' ? parseInt(step.opportunities) : step.opportunities;
    const hasOpportunities = !Array.isArray(step.opportunities) && !isNaN(opportunitiesValue) && opportunitiesValue > 0;

    // Return true if ANY field has meaningful data
    return hasResponse || hasPrompt || hasSuccess || hasOpportunities;
  });

  // Goal is only documented if at least one step has meaningful data
  return nonEmptySteps.length > 0;
};

export const validateVisitGoalsForSubmission = (
  goals: any[],
  formData: any[]
): ValidationResult => {
  const errors: string[] = [];

  // Filter to only documented goals (goals that have any data entered)
  const documentedGoals = goals.filter((goal, index) => {
    return hasGoalBeenDocumented(goal, formData[index]);
  });

  // Check minimum 2 DOCUMENTED goals
  if (documentedGoals.length < 2) {
    errors.push('At least 2 goals must be documented to submit the visit');
    return { valid: false, errors };
  }

  // Check each DOCUMENTED goal has valid steps
  goals.forEach((goal, index) => {
    const goalFormData = formData[index];

    // Double-check: Skip validation if goal is not documented
    if (!hasGoalBeenDocumented(goal, goalFormData)) {
      return; // Skip this goal completely
    }

    const goalNum = index + 1;
    const tableData = goalFormData?.tableData || goal.tableData || [];

    // Filter out completely empty steps before validation
    // Note: fields may be arrays (options) when unselected, or strings when selected
    const nonEmptySteps = tableData.filter((step: any) => {
      const hasResponse = step.response && typeof step.response === 'string' && step.response !== '';
      const hasPrompt = step.promptUsed && typeof step.promptUsed === 'string' && !Array.isArray(step.promptUsed) && step.promptUsed.trim() !== '';
      const hasSuccess = !Array.isArray(step.success) && step.success && step.success !== 0 && step.success !== '0';
      const hasOpportunities = !Array.isArray(step.opportunities) && step.opportunities && step.opportunities !== 0 && step.opportunities !== '0';
      return hasResponse || hasPrompt || hasSuccess || hasOpportunities;
    });

    // If there are no non-empty steps, skip validation for this goal
    if (nonEmptySteps.length === 0) {
      return; // Skip this goal
    }

    // Find steps with "Yes" response and all required fields filled
    const validSteps = nonEmptySteps.filter((step: any) => {
      if (step.response === 'Yes' || step.response === 'yes') {
        // Check if promptUsed is filled (must be a string with content)
        if (!step.promptUsed || typeof step.promptUsed !== 'string' || step.promptUsed.trim() === '') {
          return false;
        }

        // Check if success is filled and is a valid number (1-10)
        const success = parseInt(step.success);
        if (isNaN(success) || success < 1 || success > 10) {
          return false;
        }

        // Check if opportunities is filled and is a valid number (1-10)
        const opportunities = parseInt(step.opportunities);
        if (isNaN(opportunities) || opportunities < 1 || opportunities > 10) {
          return false;
        }

        return true;
      }
      return false;
    });

    if (validSteps.length === 0) {
      errors.push(
        `Goal ${goalNum}: Must have at least one step with response "Yes" and all fields filled (prompt used, success 1-10, opportunities 1-10)`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};
