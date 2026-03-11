"use client";

import { FcGoalsFormSchema } from "@/components/clients/client-details/client-visits/fc-visit-form/FcGoals";
import { API_BASE_URL } from "@/constants";
import { validateField } from "@/lib/api-utils";
import { FormMutationResponse } from "@/types/GeneralTypes";
import isOnline from "is-online";

export const submitFcVisitGoalsForm = async (
  token: string,
  formData: FcGoalsFormSchema,
  visitId: string,
  method: "POST" | "PATCH"
): Promise<FormMutationResponse> => {
  try {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const url =
      method === "POST"
        ? `${API_BASE_URL}/fcVisit/add/visit-goal`
        : `${API_BASE_URL}/fcVisit/edit/visit-goal`;

    const visitGoalArray = formData.goals.map((goal) => {
      return {
        short_term_objective: validateField(goal.shortTermObjective),
        family_members_goal_discussed_with: goal.familyMembersInvolved,
        current_teaching_methods_or_strategies:
          goal.goalImplementationDetails.currentTeachingMethods.map((item) => {
            return {
              current_teaching_methods: validateField(item.method),
              discussed_at_fc_session: validateField(item.discussedAtSession),
            };
          }),
        parent_or_family_members_challenges_when_implementing_strategies:
          validateField(goal.goalImplementationDetails.parentChallenges),
        training_instruction_provided_to_parent_or_family_member_on_how_to_implement_strategies:
          validateField(goal.goalImplementationDetails.trainingProvided),
        additional_comments: validateField(
          goal.goalImplementationDetails.additionalComments
        ),
        visit_full_form_id: visitId,
        visit_goal_id: goal?.visit_goal_id,
      };
    });

    const requestBody = {
      visitGoalArray: visitGoalArray,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: false,
        errorMessage: errorData?.errorMessage ?? "Invalid response status",
      };
    }

    return {
      status: true,
      errorMessage: "",
    };
  } catch (err: any) {
    console.error("ERROR SUBMITTING SESSION HIGHLIGHTS", err);
    return {
      status: false,
      errorMessage: err?.errorMessage ?? "Server Error",
    };
  }
};
