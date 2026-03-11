"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { capitalizeFirstLetter } from "@/utils";
import { STEP_ONE_SIDEBAR, STEP_TWO_SIDEBAR } from "./constant";
import { handleDisplayForm } from "./display-forms";
import { useQuery } from "@tanstack/react-query";
import { retrieveClientById } from "@/use-cases/clients";
import { FullIntakeType } from "@/types/IntakeForm";
import { retriveVisitFormData } from "@/use-cases/clients/new-visit";
import { useVisitingFormContext } from "../../store/visiting-form-context";
import { REDUCER_ACTION_TYPE } from "../../store/reducer";
import {
  selfManagementSchema,
  SessionHighlightSchema,
  validateBehaviourManagement,
  validateConcernAndChallenges,
  validateMealTime,
  validatePersonalCare,
  validatePersonalWork,
  validateSensoryNeeds,
  validateSessionHighlight,
  validateSocialization,
  validateUtilization,
  validateWithSchema,
} from "../schema";

const useWrapperLogic = (admin = false) => {
  const router = useRouter();
  const params = useParams<{ clientId: string }>();

  const token = localStorage.getItem("token") as string;
  const { data, isLoading } = useQuery<FullIntakeType>({
    queryKey: ["clientDetail", params.clientId],
    queryFn: async () => await retrieveClientById(token, params.clientId),
  });

  const { dispatch } = useVisitingFormContext();
  const user = data?.data[0];

  const searchParama = useSearchParams();

  const formId = searchParama.get("formId");
  const mode = searchParama.get("mode");

  const firstName =
    user?.clientInformation?.first_name ?? user?.first_name ?? "";
  const lastName = user?.clientInformation?.last_name ?? user?.last_name ?? "";

  const username = capitalizeFirstLetter(
    `${firstName?.toLowerCase()} ${lastName?.toLowerCase()}`
  );

  const [currentIndex, setCurrentIndex] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSections, setCompletedSections] = useState<{
    [key: number]: Set<number>;
  }>({
    1: new Set(),
    2: new Set(),
    3: new Set(),
  });
  const [stepCompletions, setStepCompletions] = useState<{
    [key: number]: Set<number>;
  }>({
    1: new Set(),
    2: new Set(),
    3: new Set(),
  });

  const handleChangeIndex = (newIndex: number) => {
    setCurrentIndex(newIndex);
    router.push("#");
  };

  const handleNewCompletedSection = useCallback(
    (newSection: number) => {
      setCompletedSections((prevSections) => ({
        ...prevSections,
        [currentStep]: new Set(prevSections[currentStep]).add(newSection),
      }));

      setStepCompletions((prevStepCompletions) => ({
        ...prevStepCompletions,
        [1]: new Set(prevStepCompletions[1]).add(
          currentStep === 1 ? newSection : newSection + 5
        ),
      }));

      router.push("#");
    },
    [currentStep, router]
  );
  const handleChangeStep = (newStep: number) => {
    setCurrentStep(newStep);
    setCurrentIndex(1);
    router.push("#");
  };

  useEffect(() => {
    if (mode === "view") {
      dispatch({
        type: REDUCER_ACTION_TYPE.SET_IS_FORM_DISABLED,
        payload: {
          isFormDisabled: true,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const retrivedVisitDraft = async () => {
    dispatch({
      type: REDUCER_ACTION_TYPE.SET_LOADING,
      payload: {
        loadingState: true,
      },
    });
    try {
      if (formId) {
        const token = localStorage.getItem("token") as string;
        const res = await retriveVisitFormData(formId, token);

        if (res.status) {
          const {
            id,
            sessionHighlights,
            concernAndChallenges,
            selfManagement,
            behaviorManagement,
            communication,
            snackMealTime,
            domesticSkillTraining,
            playLeisure,
            personalCareAndBladderControl,
            personalWorkReading,
            sensoryNeedAndMotorDevelopment,
            socialization,
            safetyAndSurvivalSkills,
            utilizationOfMoney,
            visitGoals,
            status,
          } = res.data;

          // if (status === "completed") {
          //   dispatch({
          //     type: REDUCER_ACTION_TYPE.SET_IS_FORM_DISABLED,
          //     payload: {
          //       isFormDisabled: true,
          //     },
          //   });
          // }

          const newCompletedSections = new Set<number>();
          const newStepCompletions = { ...stepCompletions };

          setCompletedSections((prev) => {
            if (sessionHighlights?.id) {
              newCompletedSections.add(1);
              newStepCompletions[1].add(1);
              prev[1].add(1);
            }
            if (concernAndChallenges?.id) {
              newCompletedSections.add(2);
              newStepCompletions[1].add(2);
              prev[1].add(2);
            }
            if (selfManagement?.id) {
              newCompletedSections.add(3);
              newStepCompletions[1].add(3);
              prev[1].add(3);
            }
            if (validateBehaviourManagement(behaviorManagement)) {
              newCompletedSections.add(4);
              newStepCompletions[1].add(4);
              prev[1].add(4);
            }
            if (communication) {
              newCompletedSections.add(5);
              prev[1].add(5);
              newStepCompletions[1].add(5);
            }

            if (snackMealTime?.id) {
              newCompletedSections.add(1);
              newStepCompletions[1].add(6);

              prev[2].add(1);
            }

            if (personalWorkReading?.id) {
              newCompletedSections.add(4);
              prev[2].add(4);
              newStepCompletions[1].add(7);
            }

            if (personalCareAndBladderControl?.id) {
              newCompletedSections.add(5);
              prev[2].add(5);
              newStepCompletions[1].add(8);
            }

            if (sensoryNeedAndMotorDevelopment?.id) {
              newCompletedSections.add(6);
              prev[2].add(6);
              newStepCompletions[1].add(9);
            }

            if (socialization?.id) {
              newCompletedSections.add(7);
              prev[2].add(7);
              newStepCompletions[1].add(1);
            }
            if (safetyAndSurvivalSkills) {
              newCompletedSections.add(8);
              prev[2].add(8);
              newStepCompletions[1].add(10);
            }
            if (utilizationOfMoney) {
              newCompletedSections.add(9);
              prev[2].add(9);
              newStepCompletions[1].add(11);
            }
            if (domesticSkillTraining) {
              prev[2].add(2);
              newCompletedSections.add(2);
              newStepCompletions[1].add(12);
            }
            if (playLeisure) {
              prev[2].add(3);
              newCompletedSections.add(3);
              newStepCompletions[1].add(13);
            }

            if (visitGoals?.length > 0) {
              newStepCompletions[1].add(14);
              prev[3].add(1);
            }

            return prev;
          });

          setStepCompletions(newStepCompletions);

          dispatch({
            type: REDUCER_ACTION_TYPE.RETRIEVE_STEP_ONE_DATA,
            payload: {
              form_one_id: id,
              sessionHighlights,
              concernAndChallenges,
              selfManagement,
              defBehaviorManagement: behaviorManagement,
              communication,
              snackMealTime,
              domesticSkillTraining,
              playLeisure,
              personalCareAndBladderControl,
              personalWorkReading,
              sensoryNeedAndMotorDevelopment,
              socialization,
              safetyAndSurvivalSkills,
              utilizationOfMoney,
              RetrieveGoalData: visitGoals,
            },
          });
        }
      }
    } catch (error) {
      console.error("ERROR", error);
    }

    dispatch({
      type: REDUCER_ACTION_TYPE.SET_LOADING,
      payload: {
        loadingState: false,
      },
    });
  };
  const handleShowSidebarForms = (): {
    id: number;
    name: string;
  }[] => {
    switch (currentStep) {
      case 1:
        return STEP_ONE_SIDEBAR;
      case 2:
        return STEP_TWO_SIDEBAR;
      default:
        return STEP_ONE_SIDEBAR;
    }
  };

  const TOTAL_SECTIONS =
    {
      1: 4,
      2: 9,
      3: 1,
    }[currentStep] || 0;

  const completedPercentage = Math.floor((stepCompletions[1].size / 14) * 100);

  return {
    params,
    username,
    currentIndex,
    completedPercentage,
    completedSections,
    handleChangeIndex,
    handleNewCompletedSection,
    currentStep,
    handleChangeStep,
    handleShowSidebarForms,
    isLoading,
    retrivedVisitDraft,
    admin,
    formId,
    handleDisplayForm: handleDisplayForm(
      currentIndex,
      handleNewCompletedSection,
      handleChangeIndex,
      currentStep,
      username,
      handleChangeStep,
      admin
    ),
  };
};

export default useWrapperLogic;
