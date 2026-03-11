"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/button/Button";
import FormSelect from "@/components/input-fields/FormSelect";
import { DoubleArrowLeftIcon } from "@radix-ui/react-icons";
import FormInput from "@/components/input-fields/FormInput";
import FormTextArea from "@/components/input-fields/FormTextArea";
import { StepThreeTable } from "./Table";
import { StepThreeTableType } from "./Columns";
import { convertGoals, convertStringArrayToSelectArray } from "@/utils/helpers";
import { VISITING_FORM_THREE } from "@/constants";
import { useVisitingFormContext } from "../../store/visiting-form-context";
import { REDUCER_ACTION_TYPE, ReducerAction } from "../../store/reducer";
import useVisitingFormSubmission from "../../logic";
import { Dispatch, useEffect, useState } from "react";
import { ThirdFormSchema } from "../../logic/schema";
import { useModalContext } from "@/context/modal/ModalProvider";
import useModal from "@/context/modal";
import ConfirmModal from "@/components/ConfirmDialog";
import { toast } from "@/components/ui/use-toast";
import Loader from "@/components/Loader";
import { Loader2 } from "lucide-react";

type FormData = z.infer<typeof ThirdFormSchema>;

export const ConfirmSubmission = ({
  dispatch,
  admin,
}: {
  dispatch: Dispatch<ReducerAction>;
  admin?: boolean;
}) => {
  const { closeModal, data } = useModal("CONFIRM_MODAL");
  const [loading, setLoading] = useState(false);

  const index = data?.index;
  return (
    <ConfirmModal
      isLoading={loading}
      confirmationText="Submitting this form will prevent you from further editing"
      handleConfirm={async () => {
        try {
          setLoading(true);
          await data?.submitThirdForm(data?.data, false, admin);
        } catch (error) {}
        setLoading(false);
        closeModal();
      }}
      confirmMationHeader={`Are you sure you want to submit ?`}
      testId="submit-confirmation"
    />
  );
};
const StepThree = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  username,
  handleChangeStep,
  admin,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  username: string;
  handleChangeStep: (val: number) => void;
  admin?: boolean;
}) => {
  const { dispatch, state } = useVisitingFormContext();
  const { openModal } = useModal("CONFIRM_MODAL");

  const { retrieveGoalData, submitThirdForm } = useVisitingFormSubmission(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex
  );

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    // resolver: zodResolver(ThirdFormSchema),
    defaultValues: { forms: state.step_three_form },
  });

  const [loading, setLoading] = useState(false);

  const [goalDataLoading, setGoalDataLoading] = useState(false);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const onSubmit = async (data: FormData) => {
    // Clear previous errors
    setValidationErrors([]);

    // Import validation at the top of the file
    const { validateVisitGoalsForSubmission } = await import("@/utils/visitValidation");

    // Run validation
    const validationResult = validateVisitGoalsForSubmission(
      state.step_three_form,
      data.forms
    );

    if (!validationResult.valid) {
      // Set errors to display on page
      setValidationErrors(validationResult.errors);

      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Also show toast for immediate feedback
      toast({
        variant: "destructive",
        title: "Validation Failed",
        description: "Please review the errors below and fix them before submitting.",
      });
      return;
    }

    // Clear errors and proceed with submission
    setValidationErrors([]);
    openModal({ data: data.forms, submitThirdForm });
  };

  const { isFormDisabled: stateDis } = state;
  // Also disable if status is approved
  const isApproved = state?.status?.toLowerCase() === "approved";
  const isFormDisabled = stateDis || isApproved;
  const saveDraft = async () => {
    setLoading(true);

    const data = getValues();
    try {
      await submitThirdForm(data.forms, true, admin);
    } catch (error) {}
    setLoading(false);
  };

  const handleInputChange = (
    index: number,
    field: keyof FormData["forms"][number],
    value: any
  ) => {
    dispatch({
      type: REDUCER_ACTION_TYPE.UPDATE_STEP_THREE_FORM,
      payload: { index, field, value },
    });
  };

  useEffect(() => {
    const fetchGoalData = async () => {
      setGoalDataLoading(true);

      if (state.formFetched === "loaded") {
        const res = await retrieveGoalData();

        if (res && res.length > 0) {
          dispatch({
            type: REDUCER_ACTION_TYPE.RETRIEVE_GOAL_DATA,
            payload: {
              RetrieveGoalData: state.step_three_form.map((data, index) => ({
                ...data,
                short_term_objective: res[index].short_term_objective,
                goal_background: res[index].goal_background,
                current_skill_level: res[index].current_skill_level,
                target_performance_level: res[index].target_performance_level,
                number_of_trials: res[index].number_of_trials,
                goal_frequency: res[index].goal_frequency,
                target_skill: res[index].target_skill,
              })),
            },
          });
        }
      }
      try {
        if (state.formFetched === "loaded_no_res") {
          const res = await retrieveGoalData();

          if (res && res.length > 0) {
            const convertedData = convertGoals(res);
            dispatch({
              type: REDUCER_ACTION_TYPE.RETRIEVE_GOAL_DATA,
              payload: {
                RetrieveGoalData: convertedData,
              },
            });
          }
        }
      } catch (error) {
        console.error(error);
      }
      setGoalDataLoading(false);
    };

    fetchGoalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (errors?.forms) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);

  return (
    <>
      {/* Validation Errors Display */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6 shadow-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Validation Failed - Please Fix the Following Errors:
              </h3>
              <ul className="list-disc list-inside space-y-2">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-red-700 text-sm leading-relaxed">
                    {error}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-red-600 italic">
                Please correct these issues and try submitting again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Review Notes */}
      {state.review_notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-amber-900 mb-2">
            Admin Review Notes:
          </h4>
          <p className="text-amber-800">{state.review_notes}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10"
      >
      {goalDataLoading ? (
        <div className="w-full flex items-center justify-center h-10">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        state.step_three_form.map((formData, index) => (
          <div
            key={index + 1}
            className="flex flex-col gap-7 h-fit w-full border-[1px] border-[#EAECF0] shadow-md p-5 rounded-[12px]"
          >
            <h3
              data-testid={`goal-${index + 1}-header`}
              className="text-[#0F172A] text-[24px] font-[600]"
            >
              Goal {index + 1}
            </h3>
            <h4 className="text-[#09090B] text-[18px] font-[600]">
              {username} {formData.short_term_objective} (from{" "}
              {formData.current_skill_level}) to{" "}
              {formData.target_performance_level} in {formData.number_of_trials}{" "}
              trials for a {formData.goal_frequency}
            </h4>
            <h4 className="text-[#09090B] text-[18px] font-[600]">
              Target Skill: {formData.target_skill}
            </h4>
            <h4 className="text-[#09090B] text-[18px] font-[600]">
              Short Term Objective: {formData.short_term_objective || ""}
            </h4>
            <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
              <Controller
                name={`forms.${index}.activityLocation`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    data-testid={`activity-location-${index + 1}`}
                    disabled={isFormDisabled}
                    labelText="Where was this activity practiced?"
                    placeholder="Please select"
                    selectContent={convertStringArrayToSelectArray(
                      VISITING_FORM_THREE.activityPracticed
                    )}
                    isError={!!errors.forms?.[index]?.activityLocation}
                    errorMessage={
                      errors.forms?.[index]?.activityLocation?.message
                    }
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleInputChange(index, "activityLocation", value);
                    }}
                  />
                )}
              />
              <Controller
                name={`forms.${index}.circumstanceLeadingToActivity`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    data-testid={`circumstances-${index + 1}`}
                    disabled={isFormDisabled}
                    labelText="Indicate circumstances/ Antecedant leading to activity"
                    placeholder="Select options"
                    selectContent={convertStringArrayToSelectArray(
                      VISITING_FORM_THREE.circumstances
                    )}
                    isError={
                      !!errors.forms?.[index]?.circumstanceLeadingToActivity
                    }
                    errorMessage={
                      errors.forms?.[index]?.circumstanceLeadingToActivity
                        ?.message
                    }
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleInputChange(
                        index,
                        "circumstanceLeadingToActivity",
                        value
                      );
                    }}
                  />
                )}
              />
            </div>
            <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
              <Controller
                name={`forms.${index}.clientResponse`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    data-testid={`client-response-${index + 1}`}
                    labelText="Client's response/ reaction was"
                    placeholder="Select options"
                    selectContent={convertStringArrayToSelectArray(
                      VISITING_FORM_THREE.response
                    )}
                    disabled={isFormDisabled}
                    isError={!!errors.forms?.[index]?.clientResponse}
                    errorMessage={
                      errors.forms?.[index]?.clientResponse?.message
                    }
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleInputChange(index, "clientResponse", value);
                    }}
                  />
                )}
              />
              <Controller
                name={`forms.${index}.consequentlyClient`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    data-testid={`consequently-client-${index + 1}`}
                    disabled={isFormDisabled}
                    labelText="Consequently, client"
                    placeholder="Please select"
                    selectContent={convertStringArrayToSelectArray(
                      VISITING_FORM_THREE.consequently
                    )}
                    isError={!!errors.forms?.[index]?.consequentlyClient}
                    errorMessage={
                      errors.forms?.[index]?.consequentlyClient?.message
                    }
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleInputChange(index, "consequentlyClient", value);
                    }}
                  />
                )}
              />
            </div>
            <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
              <Controller
                name={`forms.${index}.totalTime`}
                control={control}
                render={({ field }) => (
                  <FormInput
                    {...field}
                    data-testid={`total-time-${index + 1}`}
                    disabled={isFormDisabled}
                    labelText="Total time spent on activity (minutes)"
                    placeholder="Enter time here"
                    type="text"
                    isError={!!errors.forms?.[index]?.totalTime}
                    errorMessage={errors.forms?.[index]?.totalTime?.message}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleInputChange(index, "totalTime", e.target.value);
                    }}
                  />
                )}
              />
              <Controller
                name={`forms.${index}.clientReward`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    data-testid={`client-reward-${index + 1}`}
                    labelText="Client's Reward"
                    placeholder="Please select"
                    selectContent={convertStringArrayToSelectArray(
                      VISITING_FORM_THREE.reward
                    )}
                    disabled={isFormDisabled}
                    isError={!!errors.forms?.[index]?.clientReward}
                    errorMessage={errors.forms?.[index]?.clientReward?.message}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleInputChange(index, "clientReward", value);
                    }}
                  />
                )}
              />
            </div>
            <Controller
              name={`forms.${index}.tableData`}
              control={control}
              render={({ field }) => (
                <StepThreeTable
                  data={formData.tableData}
                  onDataChange={(newData) => {
                    field.onChange(newData);
                    handleInputChange(index, "tableData", newData);
                  }}
                  goalIndex={index + 1}
                />
              )}
            />
            <Controller
              name={`forms.${index}.additionalComment`}
              control={control}
              render={({ field }) => (
                <FormTextArea
                  {...field}
                  data-testid={`additional-comment-${index + 1}`}
                  disabled={isFormDisabled}
                  labelText="Any additional comments (Optional)"
                  placeholder="Enter here..."
                  isError={!!errors.forms?.[index]?.additionalComment}
                  errorMessage={
                    errors.forms?.[index]?.additionalComment?.message
                  }
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange(
                      index,
                      "additionalComment",
                      e.target.value
                    );
                  }}
                />
              )}
            />
          </div>
        ))
      )}

      <ConfirmSubmission dispatch={dispatch} admin={admin} />
      <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%]">
        <Button
          variant="light"
          onClick={() => handleChangeStep(2)}
          type="button"
          data-testid="previous-section-button"
        >
          <DoubleArrowLeftIcon className="w-5 h-5" />
          Previous Section
        </Button>
        {!isFormDisabled && (
          <Button
            variant="light"
            type="button"
            isLoading={loading}
            onClick={() => saveDraft()}
            data-testid="save-draft-button"
          >
            Save Draft
          </Button>
        )}
        {!isApproved ? (
          <Button
            type="submit"
            isLoading={loading}
            disabled={isFormDisabled}
            data-testid="submit-button"
          >
            Submit
          </Button>
        ) : (
          <div className="text-green-600 font-medium">
            This visit has been approved and is now read-only
          </div>
        )}
      </div>
    </form>
    </>
  );
};

export default StepThree;
