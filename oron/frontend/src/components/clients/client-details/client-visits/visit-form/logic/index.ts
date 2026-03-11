"use client";

import { useToast } from "@/components/ui/use-toast";
import {
  createSessionHighlights,
  handleBehaviourManagement,
  handleCommunication,
  handleConcernAndChallenges,
  handleFinalSubmit,
  handleMealTime,
  handlePersonalCare,
  handlePersonalWork,
  handlePlayLeisure,
  handleRetrieveStepThree,
  handleSafety,
  handleSelfManagement,
  handleSensoryNeeds,
  handleSkillTraining,
  handleSocialization,
  handleSubmitThirdForm,
  handleUtilzation,
} from "@/use-cases/clients/new-visit";
import { useParams, useSearchParams } from "next/navigation";
import { useVisitingFormContext } from "../store/visiting-form-context";
import { validateVisitGoalsForSubmission } from "@/utils/visitValidation";
import {
  BEHAVIOUR_MANAGEMENT,
  COMMUNICATION,
  CONCERN_AND_CHALLENGES,
  DOMESTIC_TRAINING,
  MEAL_TIME_FORM,
  PERSONAL_CARE,
  PERSONAL_WORK_FORM,
  REDUCER_ACTION_TYPE,
  SAFETY,
  SELF_MANAGEMENT,
  SENSORY_NEEDS,
  SESSION_HIGHLIGHT_FORM,
  SOCIALIZATION,
  UTILIZATION,
} from "../store/reducer";
import { useRouter } from "next/navigation";
import useSaveToDraft from "@/hooks/forms/useSaveToDraft";
import {
  ChoresOutput,
  convertDataForm,
  LeisureOutput,
  PersonalCareOutput,
  PersonalWorkOutput,
  SensoryNeedsOutput,
  SocializationOutput,
  SurvivalSkillsOutput,
  UtilizationOfMoneyOutput,
} from "@/utils/helpers";
import moment from "moment";
import isOnline from "is-online";

export const useVisitFormDraftHandler = () => {
  const { saveToDraft, retrieveDraft } = useSaveToDraft<any>();

  const { toast } = useToast();
  const key = {
    basicInfo: "VISITING_BASIC_INFORMATION",
    sessionHighlight: "VISITING_SESSION_HIGHTLIGHT",
    concernAndChanlleges: "VISITING_CONCERN_AND_CHALLENGES",
    selfManagement: "VISIING_SELF_MANAGEMENT",
    behaviour: "VISITING_BASIC_MANAGEMENT",
    communication: "VISITING_COMMUNICATION",
  };

  const saveBasicInformationToDraft = (item: SESSION_HIGHLIGHT_FORM) => {
    saveToDraft(key.basicInfo, item);
    toast({
      variant: "success",
      description: "Draft saved successfully",
    });
  };
  const saveSessionHighlights = (item: SESSION_HIGHLIGHT_FORM | null) => {
    saveToDraft(key.sessionHighlight, item);
    toast({
      variant: "success",
      description: "Draft saved successfully",
    });
  };
  const saveConcernAndChallenges = (item: CONCERN_AND_CHALLENGES) => {
    saveToDraft(key.concernAndChanlleges, item);
    toast({
      variant: "success",
      description: "Draft saved successfully",
    });
  };
  const saveSelfManagement = (item: SELF_MANAGEMENT) => {
    saveToDraft(key.selfManagement, item);
    toast({
      variant: "success",
      description: "Draft saved successfully",
    });
  };
  const saveBehaviourManagement = (item: BEHAVIOUR_MANAGEMENT) => {
    saveToDraft(key.behaviour, item);
    toast({
      variant: "success",
      description: "Draft saved successfully",
    });
  };
  const saveCommunication = (item: any) => {
    saveToDraft(key.communication, item);
    toast({
      variant: "success",
      description: "Draft saved successfully",
    });
  };

  const retrieveBasicInformationToDraft = retrieveDraft(key.basicInfo);
  const retrieveSessionHighlights = retrieveDraft(key.sessionHighlight);
  const retrieveConcernAndChallenges = retrieveDraft(key.concernAndChanlleges);
  const retrieveSelfManagement = retrieveDraft(key.selfManagement);
  const retrieveBehaviourManagement = retrieveDraft(key.behaviour);
  const retrieveCommunication = retrieveDraft(key.communication);

  return {
    saveBasicInformationToDraft,
    saveSessionHighlights,
    saveConcernAndChallenges,
    saveSelfManagement,
    saveBehaviourManagement,
    saveCommunication,
    retrieveBasicInformationToDraft,
    retrieveSessionHighlights,
    retrieveConcernAndChallenges,
    retrieveSelfManagement,
    retrieveBehaviourManagement,
    retrieveCommunication,
  };
};

const useVisitingFormSubmission = (
  handleNewCompletedSection: (newSection: number) => void,
  currentIndex: number,
  handleChangeIndex: (newIndex: number) => void,
  handleChangeStep?: (index: number) => void
) => {
  const { toast } = useToast();
  const { clientId }: { clientId: string } = useParams();
  const { state, dispatch } = useVisitingFormContext();
  const search = useSearchParams();
  const router = useRouter();

  const formId = search.get("formId");

  const token = localStorage.getItem("token") ?? "";

  const submitBasicInformation = async () => {};
  const submitSessionHighlight = async (
    formData: SESSION_HIGHLIGHT_FORM,
    isDraft: boolean = false
  ) => {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }

    if (formId) {
      const data = {
        ...formData,
        client_hospitalized_in_care_today:
          formData.client_hospitalized_in_care_today === "yes"
            ? true
            : formData.client_hospitalized_in_care_today === "no"
            ? false
            : null,
        client_placed_themselves_in_harm_by_leaving_my_care:
          formData.client_placed_themselves_in_harm_by_leaving_my_care === "yes"
            ? true
            : formData.client_placed_themselves_in_harm_by_leaving_my_care ===
              "no"
            ? false
            : null,
      };

      try {
        const res = await createSessionHighlights(
          token,
          data,
          formId,
          state.formMethod.sessionHighlightMethod,
          state.step_one_form.session_highlight_id
        );

        if (res.status === false) {
          toast({
            variant: "destructive",
            description: "Error Submitting",
          });
          return;
        }

        dispatch({
          type: REDUCER_ACTION_TYPE.RETRIEVE_STEP_ONE_DATA,
          payload: {
            sessionHighlights: {
              id: res.errorMessage,
              ...data,
            },
          },
        });

        if (!isDraft) {
          handleNewCompletedSection(currentIndex);
          handleChangeIndex(currentIndex + 1);
        } else {
          toast({
            variant: "success",
            description: "Draft Saved Successfully",
          });
        }
      } catch (error) {}
    }
  };
  const submitConcern = async (
    formData: CONCERN_AND_CHALLENGES,
    isDraft: boolean = false
  ) => {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }
    try {
      if (formId) {
        const data = {
          ...formData,
          supervisor_to_contact_during_session:
            formData.supervisor_to_contact_during_session === "yes"
              ? true
              : formData.supervisor_to_contact_during_session === "no"
              ? false
              : null,
          was_there_any_concerns_or_challenges:
            formData.was_there_any_concerns_or_challenges === "yes"
              ? true
              : formData.was_there_any_concerns_or_challenges === "no"
              ? false
              : null,
        };

        const res = await handleConcernAndChallenges(
          token,
          data,
          formId,
          state.formMethod.concernsAndChallengesMethod,
          state.step_one_form.concern_and_challenges_id
        );

        if (res.status === false) {
          toast({
            variant: "destructive",
            description: "Error Submitting Concern",
          });
          return;
        }

        dispatch({
          type: REDUCER_ACTION_TYPE.RETRIEVE_STEP_ONE_DATA,
          payload: {
            concernAndChallenges: {
              id: res.errorMessage,
              ...data,
            },
          },
        });

        if (!isDraft) {
          handleNewCompletedSection(currentIndex);
          handleChangeIndex(currentIndex + 1);
        } else {
          toast({
            variant: "success",
            description: "Draft Saved Successfully",
          });
        }
      }
    } catch (error) {}
  };
  const submitSelfManagement = async (
    formData: SELF_MANAGEMENT,
    isDraft: boolean = false
  ) => {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }
    if (formId) {
      try {
        const res = await handleSelfManagement(
          token,
          formData,
          formId,
          state.formMethod.selfManagementMethod,
          state.step_one_form.self_management_id
        );

        if (res.status === false) {
          toast({
            variant: "destructive",
            description: "Error Submitting Self management",
          });
          return;
        }

        dispatch({
          type: REDUCER_ACTION_TYPE.RETRIEVE_STEP_ONE_DATA,
          payload: {
            selfManagement: { id: res.errorMessage, ...formData },
          },
        });

        if (!isDraft) {
          handleNewCompletedSection(currentIndex);
          handleChangeIndex(currentIndex + 1);
        } else {
          toast({
            variant: "success",
            description: "Draft Saved Successfully",
          });
        }
      } catch (error) {}
    }
  };
  const submitBehaviourManagement = async (
    formData: BEHAVIOUR_MANAGEMENT[],
    isDraft: boolean = false
  ) => {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }
    if (formId) {
      try {
        const data = formData.map((d) => ({
          ...d,
          visit_full_form_id: formId,
          ...(d.id && { behavior_management_id: d.id }),
        }));

        const res = await handleBehaviourManagement(
          token,
          data,
          formId,
          state.formMethod.behaviourManagementMethod,
          state.step_one_form.communication_id
        );

        if (res.status === false) {
          toast({
            variant: "destructive",
            description: "Error Submitting Behaviour Management",
          });
          return;
        }

        dispatch({
          type: REDUCER_ACTION_TYPE.RETRIEVE_STEP_ONE_DATA,
          payload: {
            defBehaviorManagement: formData,
          },
        });

        if (!isDraft) {
          handleNewCompletedSection(currentIndex);
          handleChangeIndex(currentIndex + 1);
        } else {
          toast({
            variant: "success",
            description: "Draft Saved Successfully",
          });
        }
      } catch (error) {
        throw error;
      }
    }
  };
  const submitCommunication = async (
    formData: COMMUNICATION,
    isDraft: boolean = false
  ) => {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }
    if (formId) {
      try {
        const res = await handleCommunication(
          token,
          formData,
          formId,
          state.formMethod.communicationMethod,
          state.step_one_form.communication_id
        );

        if (res.status === false) {
          toast({
            variant: "destructive",
            description: "Error Submitting Communication",
          });
          return;
        }

        dispatch({
          type: REDUCER_ACTION_TYPE.RETRIEVE_STEP_ONE_DATA,
          payload: {
            communication: {
              id: res.errorMessage,
              ...formData,
            },
          },
        });

        if (!isDraft) {
          handleNewCompletedSection(currentIndex);
          if (handleChangeStep) {
            handleChangeStep(2);
          }
        } else {
          toast({
            variant: "success",
            description: "Draft Saved Successfully",
          });
        }
      } catch (error) {}
    }
  };

  const submitMealTime = async (
    formData: MEAL_TIME_FORM,
    isDraft: boolean = false
  ) => {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }
    if (formId) {
      try {
        const res = await handleMealTime(
          token,
          formData,
          formId,
          state.formMethod.snackMealMethod,
          state.step_two_form.mealTime.id
        );

        if (res.status === false) {
          toast({
            variant: "destructive",
            description: "Error Submitting",
          });
          return;
        }

        dispatch({
          type: REDUCER_ACTION_TYPE.RETRIEVE_STEP_ONE_DATA,
          payload: {
            snackMealTime: { id: res.errorMessage, ...formData },
          },
        });
        if (!isDraft) {
          handleNewCompletedSection(currentIndex);
          handleChangeIndex(currentIndex + 1);
        } else {
          toast({
            variant: "success",
            description: "Draft Saved Successfully",
          });
        }
      } catch (error) {}
    }
  };
  const submitDomesticSkillTraining = async (
    formData: ChoresOutput,
    isDraft: boolean = false
  ) => {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }
    if (formId) {
      try {
        const res = await handleSkillTraining(
          token,
          formData,
          formId,
          state.formMethod.domesticSkillTrainingMethod,
          state.step_two_form.domestic.id
        );

        if (res.status === false) {
          toast({
            variant: "destructive",
            description: "Error Submitting",
          });
          return;
        }

        dispatch({
          type: REDUCER_ACTION_TYPE.RETRIEVE_STEP_ONE_DATA,
          payload: {
            domesticSkillTraining: {
              id: res.errorMessage,
              ...(formData as any),
            },
          },
        });

        if (!isDraft) {
          handleNewCompletedSection(currentIndex);
          handleChangeIndex(currentIndex + 1);
        } else {
          toast({
            variant: "success",
            description: "Draft Saved Successfully",
          });
        }
      } catch (error) {}
    }
  };
  const submitPlay = async (
    formData: LeisureOutput,
    isDraft: boolean = false
  ) => {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }
    if (formId) {
      try {
        const res = await handlePlayLeisure(
          token,
          formData,
          formId,
          state.formMethod.playMethod,
          state.step_two_form.play.id
        );

        if (res.status === false) {
          toast({
            variant: "destructive",
            description: "Error Submitting",
          });
          return;
        }

        dispatch({
          type: REDUCER_ACTION_TYPE.RETRIEVE_STEP_ONE_DATA,
          payload: {
            playLeisure: { id: res.errorMessage, ...(formData as any) },
          },
        });
        if (!isDraft) {
          handleNewCompletedSection(currentIndex);
          handleChangeIndex(currentIndex + 1);
        } else {
          toast({
            variant: "success",
            description: "Draft Saved Successfully",
          });
        }
      } catch (error) {}
    }
  };
  const submitPersonalWork = async (
    formData: PersonalWorkOutput,
    isDraft: boolean = false
  ) => {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }
    if (formId) {
      try {
        const res = await handlePersonalWork(
          token,
          formData,
          formId,
          state.formMethod.personalWorkMethod,
          state.step_two_form.personalWork.id
        );

        if (res.status === false) {
          toast({
            variant: "destructive",
            description: "Error Submitting",
          });
          return;
        }

        dispatch({
          type: REDUCER_ACTION_TYPE.RETRIEVE_STEP_ONE_DATA,
          payload: {
            personalWorkReading: { id: res.errorMessage, ...(formData as any) },
          },
        });

        if (!isDraft) {
          handleNewCompletedSection(currentIndex);
          handleChangeIndex(currentIndex + 1);
        } else {
          toast({
            variant: "success",
            description: "Draft Saved Successfully",
          });
        }
      } catch (error) {}
    }
  };
  const submitPersonal = async (
    formData: PersonalCareOutput,
    isDraft: boolean = false
  ) => {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }
    if (formId) {
      try {
        const res = await handlePersonalCare(
          token,
          formData,
          formId,
          state.formMethod.personalCareMethod,
          state.step_two_form.personalCare.id
        );

        if (res.status === false) {
          toast({
            variant: "destructive",
            description: "Error Submitting",
          });
          return;
        }

        dispatch({
          type: REDUCER_ACTION_TYPE.RETRIEVE_STEP_ONE_DATA,
          payload: {
            personalCareAndBladderControl: {
              id: res.errorMessage,
              ...(formData as any),
            },
          },
        });

        if (!isDraft) {
          handleNewCompletedSection(currentIndex);
          handleChangeIndex(currentIndex + 1);
        } else {
          toast({
            variant: "success",
            description: "Draft Saved Successfully",
          });
        }
      } catch (error) {}
    }
  };
  const submitSensory = async (
    formData: SensoryNeedsOutput,
    isDraft: boolean = false
  ) => {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }
    if (formId) {
      try {
        const res = await handleSensoryNeeds(
          token,
          formData,
          formId,
          state.formMethod.sensoryNeedsMethod,
          state.step_two_form.sensoryNeed.id
        );

        if (res.status === false) {
          toast({
            variant: "destructive",
            description: "Error Submitting",
          });
          return;
        }

        dispatch({
          type: REDUCER_ACTION_TYPE.RETRIEVE_STEP_ONE_DATA,
          payload: {
            sensoryNeedAndMotorDevelopment: {
              id: res.errorMessage,
              ...(formData as any),
            },
          },
        });
        if (!isDraft) {
          handleNewCompletedSection(currentIndex);
          handleChangeIndex(currentIndex + 1);
        } else {
          toast({
            variant: "success",
            description: "Draft Saved Successfully",
          });
        }
      } catch (error) {}
    }
  };
  const submitSocialization = async (
    formData: SocializationOutput,
    isDraft: boolean = false
  ) => {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }
    if (formId) {
      try {
        const res = await handleSocialization(
          token,
          formData,
          formId,
          state.formMethod.socializationMethod,
          state.step_two_form.socialization.id
        );

        if (res.status === false) {
          toast({
            variant: "destructive",
            description: "Error Submitting",
          });
          return;
        }

        dispatch({
          type: REDUCER_ACTION_TYPE.RETRIEVE_STEP_ONE_DATA,
          payload: {
            socialization: { id: res.errorMessage, ...(formData as any) },
          },
        });

        if (!isDraft) {
          handleNewCompletedSection(currentIndex);
          handleChangeIndex(currentIndex + 1);
        } else {
          toast({
            variant: "success",
            description: "Draft Saved Successfully",
          });
        }
      } catch (error) {}
    }
  };
  const submitSafety = async (
    formData: SurvivalSkillsOutput,
    isDraft: boolean = false
  ) => {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }
    if (formId) {
      try {
        const res = await handleSafety(
          token,
          formData,
          formId,
          state.formMethod.safetySkillsMethod,
          state.step_two_form.safty.id
        );

        if (res.status === false) {
          toast({
            variant: "destructive",
            description: "Error Submitting",
          });
          return;
        }

        dispatch({
          type: REDUCER_ACTION_TYPE.RETRIEVE_STEP_ONE_DATA,
          payload: {
            safetyAndSurvivalSkills: {
              id: res.errorMessage,
              ...(formData as any),
            },
          },
        });

        if (!isDraft) {
          handleNewCompletedSection(currentIndex);
          handleChangeIndex(currentIndex + 1);
        } else {
          toast({
            variant: "success",
            description: "Draft Saved Successfully",
          });
        }
      } catch (error) {}
    }
  };
  const submitUtilization = async (
    formData: UtilizationOfMoneyOutput,
    isDraft: boolean = false
  ) => {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }
    if (formId) {
      try {
        const res = await handleUtilzation(
          token,
          formData,
          formId,
          state.formMethod.utilzationMethod,
          state.step_two_form.utilization.id
        );

        if (res.status === false) {
          toast({
            variant: "destructive",
            description: "Error Submitting",
          });
          return;
        }

        dispatch({
          type: REDUCER_ACTION_TYPE.RETRIEVE_STEP_ONE_DATA,
          payload: {
            utilizationOfMoney: {
              id: res.errorMessage,
              ...(formData as any),
            },
          },
        });

        if (!isDraft) {
          handleNewCompletedSection(currentIndex);
          if (handleChangeStep) {
            handleChangeStep(3);
          }
        } else {
          toast({
            variant: "success",
            description: "Draft Saved Successfully",
          });
        }
      } catch (error) {
        console.error("ERROR", error);
      }
    }
  };

  const submitThirdForm = async (
    formData: any[],
    isDraft: boolean = false,
    admin?: boolean
  ) => {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }
    if (formId) {
      try {
        // Validate before submission (only if not draft)
        if (!isDraft) {
          const validationResult = validateVisitGoalsForSubmission(
            state.step_three_form,
            formData
          );

          if (!validationResult.valid) {
            toast({
              variant: "destructive",
              title: "Validation Failed",
              description: validationResult.errors.join(", "),
            });
            return;
          }
        }

        const convD = convertDataForm(formData, formId, state.step_three_form);

        const res = await handleSubmitThirdForm(
          token,
          convD,
          state.formMethod.goalMethod
        );

        if (res.status === false) {
          toast({
            variant: "destructive",
            description: res?.errorMessage ?? "Error Submitting Visit Goal",
          });
          return;
        }

        if (!isDraft) {
          const fin = await handleFinalSubmit(token, formId);

          if (fin.status === false) {
            toast({
              variant: "destructive",
              description: "Error Submitting Visit Goal",
            });
            return;
          }

          toast({
            variant: "success",
            description: `${
              state?.user?.clientInformation?.first_name ??
              state?.user?.first_name ??
              "-"
            } ${
              state?.user?.clientInformation?.last_name ??
              state?.user?.last_name ??
              "-"
            } on ${moment().format(
              "dddd, MMMM Do, YYYY"
            )} successfully submitted - Awaiting Admin Approval.`,
          });
          router.push(
            admin ? `/admin/clients/${clientId}` : `/clients/${clientId}`
          );
        } else {
          toast({
            variant: "success",
            description: "Draft Saved Successfully",
          });
        }
      } catch (error) {
        console.error("ERROR SUBMITTING STEP THREE", error);
        toast({
          variant: "destructive",
          description: "Error Submitting Visit Goal",
        });
      }
    }
  };

  const retrieveGoalData = async () => {
    const online = await isOnline();
    if (!online) {
      return {
        status: false,
        errorMessage:
          "No internet connection. Please check your connection and try again.",
      };
    }
    if (formId) {
      try {
        const res = await handleRetrieveStepThree(clientId, token);
        if (res.status === false) {
          toast({
            variant: "destructive",
            description: "Error Retrieving Goal Data",
          });
          return;
        }

        return res.data;
      } catch (error) {
        toast({
          description:
            "Error Retriving treatment goal, please reload this page",
          variant: "destructive",
        });
        throw error;
      }
    }
  };

  return {
    submitThirdForm,
    submitBasicInformation,
    submitSessionHighlight,
    submitConcern,
    submitSelfManagement,
    submitBehaviourManagement,
    submitCommunication,
    submitMealTime,
    submitDomesticSkillTraining,
    submitPlay,
    submitPersonalWork,
    submitPersonal,
    submitSensory,
    submitSocialization,
    submitSafety,
    submitUtilization,
    retrieveGoalData,
  };
};

export default useVisitingFormSubmission;
