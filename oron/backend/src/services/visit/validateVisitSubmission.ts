import { getRepository, In } from 'typeorm';
import { VisitFullForm } from 'orm/entities/VisitLog/visitFullForm';
import { VisitGoal } from 'orm/entities/VisitLog/stepThree/visitGoal';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateVisitForSubmission = async (
  visit_full_form_id: string,
): Promise<ValidationResult> => {
  const errors: string[] = [];

  try {
    const visitFullFormRepository = getRepository(VisitFullForm);
    const visitGoalRepository = getRepository(VisitGoal);

    // Fetch visit form
    const visitFullForm = await visitFullFormRepository.findOne({
      where: { id: visit_full_form_id },
    });

    if (!visitFullForm) {
      errors.push('Visit form not found');
      return { valid: false, errors };
    }

    const { visit_goal_ids } = visitFullForm;

    // Check if visit_goal_ids exists and has at least 2 goals
    if (!Array.isArray(visit_goal_ids) || visit_goal_ids.length < 2) {
      errors.push('Visit requires at least 2 goals to submit');
      return { valid: false, errors };
    }

    // Fetch all visit goals
    const visitGoals = await visitGoalRepository.find({
      where: { id: In(visit_goal_ids) },
    });

    if (visitGoals.length < 2) {
      errors.push('Visit requires at least 2 goals to submit');
      return { valid: false, errors };
    }

    // Validate each goal has at least one valid "Yes" step
    visitGoals.forEach((goal, index) => {
      const goalNum = index + 1;

      // Parse goal_steps if it's stored as JSON string
      let goalSteps: any[] = [];

      if (typeof goal.goal_steps === 'string') {
        try {
          goalSteps = JSON.parse(goal.goal_steps);
        } catch (e) {
          goalSteps = [];
        }
      } else if (Array.isArray(goal.goal_steps)) {
        goalSteps = goal.goal_steps;
      }

      // Find at least one step with response="Yes" and all required fields filled
      const validSteps = goalSteps.filter((step: any) => {
        if (step.response === 'Yes' || step.response === 'yes') {
          // Check if prompt_used is filled
          if (!step.prompt_used || step.prompt_used.trim() === '') {
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

      // If no valid "Yes" steps found, add error
      if (validSteps.length === 0) {
        errors.push(
          `Goal ${goalNum}: Must have at least one step with response "Yes" and all fields filled (prompt used, success 1-10, opportunities 1-10)`,
        );
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (err) {
    errors.push('Error validating visit: ' + (err.message || 'Unknown error'));
    return { valid: false, errors };
  }
};
