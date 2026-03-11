"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormInput from "@/components/input-fields/FormInput";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import FormSelect from "@/components/input-fields/FormSelect";
import { PlusIcon, Trash } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import DeleteModal from "@/components/DeleteDialog";
import useModal from "@/context/modal";
import FormTimePicker from "@/components/input-fields/FormTimePicker";
import {
  VISTING_ANTECEDENT,
  VISITING_CONSEQUENCES,
  VISITING_SETTINGS,
  VISITING_SEVERITY,
  OTHER_CRISIS_INTERVENTION,
  NUMBER_OF_TIMES,
  behaviour_type,
} from "@/constants";
import { convertStringArrayToSelectArray } from "@/utils/helpers";
import { submitRespiteBehaviourManagement } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";

const behaviourSchema = z.object({
  behavior_type: z.string().min(1, { message: "Please select behavior type" }),
  behavior_description: z
    .string()
    .min(1, { message: "Please select behavior description" }),
  what_time_did_behavior_occur: z
    .string()
    .min(1, { message: "Please enter time" }),
  antecedent: z.string().min(1, { message: "Please select antecedent" }),
  consequence: z.string().min(1, { message: "Please select consequence" }),
  setting: z.string().min(1, { message: "Please select setting" }),
  how_many_times_did_behavior_occur: z
    .string()
    .min(1, { message: "Please select frequency" }),
  for_how_long_did_behavior_occur: z
    .string()
    .min(1, { message: "Please select duration" }),
  severity: z.string().min(1, { message: "Please select severity" }),
  other_crisis_intervention: z
    .string()
    .min(1, { message: "Please select intervention" }),
  other_specific_description: z.string().optional(),
});

const behaviourManagementSchema = z.object({
  behaviours: z.array(behaviourSchema),
});

type BehaviourFormData = z.infer<typeof behaviourManagementSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  tiForm: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

export const BehaviorDeleteModal = () => {
  const { closeModal, data } = useModal("DELETE_MODAL");
  const { onConfirm } = data || {};

  return (
    <DeleteModal
      isLoading={false}
      confirmationText="Deleting a behavior also deletes the selected responses in the form fields. This action cannot be undone"
      handleConfirm={() => {
        if (onConfirm) onConfirm();
        closeModal();
      }}
      confirmMationHeader="Delete Behavior?"
    />
  );
};

const TIVisitBehaviourManagement = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  tiForm,
  isViewing,
  isEditing,
  username = "Client",
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [isAddingBehaviour, setIsAddingBehaviour] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const isFormDisabled = isViewing;
  const { openModal } = useModal("DELETE_MODAL");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<BehaviourFormData>({
    resolver: zodResolver(behaviourManagementSchema),
    defaultValues: {
      behaviours: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "behaviours",
  });

  const getMappedBehaviours = useMemo(() => {
    if (!tiForm?.behaviorManagement) return [];

    return tiForm.behaviorManagement.map((behavior: any) => ({
      behavior_type: behavior.behavior_type || "",
      behavior_description: behavior.behavior_description || "",
      what_time_did_behavior_occur: behavior.what_time_did_behavior_occur || "",
      antecedent: behavior.antecedent || "",
      consequence: behavior.consequence || "",
      setting: behavior.setting || "",
      how_many_times_did_behavior_occur:
        behavior.how_many_times_did_behavior_occur || "",
      for_how_long_did_behavior_occur:
        behavior.for_how_long_did_behavior_occur || "",
      severity: behavior.severity || "",
      other_crisis_intervention: behavior.other_crisis_intervention || "",
      other_specific_description: behavior.other_specific_description || "",
    }));
  }, [tiForm]);

  useEffect(() => {
    if (getMappedBehaviours.length > 0) {
      setMethod("PATCH");
      replace(getMappedBehaviours);
    }
  }, [getMappedBehaviours, replace]);

  const handleAddBehaviour = async () => {
    if (tiForm?.behaviorManagement?.length === 0) {
      append({
        behavior_type: "",
        behavior_description: "",
        what_time_did_behavior_occur: "",
        antecedent: "",
        consequence: "",
        setting: "",
        how_many_times_did_behavior_occur: "",
        for_how_long_did_behavior_occur: "",
        severity: "",
        other_crisis_intervention: "",
        other_specific_description: "",
      });
    } else {
      try {
        setIsAddingBehaviour(true);
        const token = localStorage.getItem("token") as string;

        const requestBody = [
          {
            behavior_type: "",
            behavior_description: "",
            what_time_did_behavior_occur: "",
            antecedent: "",
            consequence: "",
            setting: "",
            how_many_times_did_behavior_occur: "",
            for_how_long_did_behavior_occur: "",
            severity: "",
            other_crisis_intervention: "",
            other_specific_description: "",
          },
        ];
      } catch (err) {
        console.error("ERROR ADDING BEHAVIOUR", err);
        toast({
          variant: "destructive",
          description: "Failed to add new behavior",
        });
      } finally {
        setIsAddingBehaviour(false);
      }
    }
  };

  const onSubmit = async (data: BehaviourFormData) => {
    try {
      if (
        data.behaviours?.length === 0 &&
        tiForm?.behaviorManagement?.length === 0
      ) {
        handleNewCompletedSection(currentIndex);
        handleChangeIndex(currentIndex + 1);
      } else {
        const token = localStorage.getItem("token") as string;

        const transformedData = data.behaviours.map((behavior) => ({
          behavior_type: behavior.behavior_type,
          behavior_description: behavior.behavior_description,
          what_time_did_behavior_occur: behavior.what_time_did_behavior_occur,
          antecedent: behavior.antecedent,
          consequence: behavior.consequence,
          setting: behavior.setting,
          how_many_times_did_behavior_occur:
            behavior.how_many_times_did_behavior_occur,
          for_how_long_did_behavior_occur:
            behavior.for_how_long_did_behavior_occur,
          severity: behavior.severity,
          other_crisis_intervention: behavior.other_crisis_intervention,
          other_specific_description: behavior.other_specific_description,
        }));

        const response = await submitRespiteBehaviourManagement(
          token,
          transformedData,
          tiForm?.id || "",
          method,
          tiForm?.behaviorManagement?.[0]?.id
        );

        if (!response.status) {
          toast({
            variant: "destructive",
            description: response.errorMessage,
          });
          return;
        }

        handleNewCompletedSection(currentIndex);
        handleChangeIndex(currentIndex + 1);
      }
    } catch (err) {
      console.error("ERROR SUBMITTING BEHAVIOUR MANAGEMENT", err);
      toast({
        variant: "destructive",
        description: "Failed to submit form",
      });
    }
  };

  const handleDraftSubmit = async () => {
    try {
      setIsSubmittingDraft(true);
      const data = getValues();
      const token = localStorage.getItem("token") as string;

      const transformedData = data.behaviours.map((behavior) => ({
        behavior_type: behavior.behavior_type,
        behavior_description: behavior.behavior_description,
        what_time_did_behavior_occur: behavior.what_time_did_behavior_occur,
        antecedent: behavior.antecedent,
        consequence: behavior.consequence,
        setting: behavior.setting,
        how_many_times_did_behavior_occur:
          behavior.how_many_times_did_behavior_occur,
        for_how_long_did_behavior_occur:
          behavior.for_how_long_did_behavior_occur,
        severity: behavior.severity,
        other_crisis_intervention: behavior.other_crisis_intervention,
        other_specific_description: behavior.other_specific_description,
      }));

      const response = await submitRespiteBehaviourManagement(
        token,
        transformedData,
        tiForm?.id || "",
        method,
        tiForm?.behaviorManagement?.[0]?.id
      );

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      toast({
        description: "Draft saved successfully",
      });
    } catch (err) {
      console.error("ERROR SAVING DRAFT", err);
      toast({
        variant: "destructive",
        description: "Failed to save draft",
      });
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Behavior Management
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col gap-7 border-[1px] border-[#EAECF0] shadow-md p-5 rounded-[12px]"
          >
            <div className="flex items-center gap-5 justify-between flex-wrap">
              <h4 className="text-[#0F172A] text-[20px] font-[600]">
                Behavior {index + 1}
              </h4>

              <button
                type="button"
                disabled={isFormDisabled}
                className="disabled:text-gray-500 disabled:cursor-not-allowed text-black"
                onClick={() => openModal({ onConfirm: () => remove(index) })}
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
              <Controller
                name={`behaviours.${index}.behavior_type`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    labelText="Behavior Type"
                    placeholder="Select type"
                    selectContent={Object.keys(behaviour_type).map((type) => ({
                      label: type,
                      value: type,
                    }))}
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isFormDisabled}
                    isError={!!errors.behaviours?.[index]?.behavior_type}
                    errorMessage={
                      errors.behaviours?.[index]?.behavior_type?.message
                    }
                  />
                )}
              />

              <Controller
                name={`behaviours.${index}.behavior_description`}
                control={control}
                render={({ field }) => {
                  const behaviorType = watch(
                    `behaviours.${index}.behavior_type`
                  );
                  const descriptions = behaviorType
                    ? behaviour_type[
                        behaviorType as keyof typeof behaviour_type
                      ] || []
                    : [];

                  return (
                    <FormSelect
                      labelText="Behavior Description"
                      placeholder="Select description"
                      selectContent={descriptions.map((desc: string) => ({
                        label: desc,
                        value: desc,
                      }))}
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isFormDisabled || !behaviorType}
                      isError={
                        !!errors.behaviours?.[index]?.behavior_description
                      }
                      errorMessage={
                        errors.behaviours?.[index]?.behavior_description
                          ?.message
                      }
                    />
                  );
                }}
              />
            </div>

            {watch(`behaviours.${index}.behavior_description`) ===
              "Other, please specify" && (
              <div className="w-full">
                <Controller
                  name={`behaviours.${index}.other_specific_description`}
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      {...field}
                      labelText=""
                      placeholder="Please specify"
                      type="text"
                      isAuth={false}
                      disabled={isFormDisabled}
                    />
                  )}
                />
              </div>
            )}

            <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
              <Controller
                name={`behaviours.${index}.what_time_did_behavior_occur`}
                control={control}
                render={({ field }) => (
                  <FormTimePicker
                    name={`behaviours.${index}.what_time_did_behavior_occur`}
                    labelText="What Time Did The Behaviour Occur?"
                    placeholder="Enter time here"
                    onChange={field.onChange}
                    value={field.value}
                    disabled={isFormDisabled}
                    isError={
                      !!errors.behaviours?.[index]?.what_time_did_behavior_occur
                    }
                    errorMessage={
                      errors.behaviours?.[index]?.what_time_did_behavior_occur
                        ?.message
                    }
                  />
                )}
              />

              <Controller
                name={`behaviours.${index}.antecedent`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    labelText="Antecedent"
                    placeholder="Select"
                    selectContent={convertStringArrayToSelectArray(
                      VISTING_ANTECEDENT
                    )}
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isFormDisabled}
                    isError={!!errors.behaviours?.[index]?.antecedent}
                    errorMessage={
                      errors.behaviours?.[index]?.antecedent?.message
                    }
                  />
                )}
              />
            </div>

            <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
              <Controller
                name={`behaviours.${index}.consequence`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    labelText="Consequences"
                    placeholder="Select"
                    selectContent={convertStringArrayToSelectArray(
                      VISITING_CONSEQUENCES
                    )}
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isFormDisabled}
                    isError={!!errors.behaviours?.[index]?.consequence}
                    errorMessage={
                      errors.behaviours?.[index]?.consequence?.message
                    }
                  />
                )}
              />

              <Controller
                name={`behaviours.${index}.setting`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    labelText="Setting"
                    placeholder="Select"
                    selectContent={convertStringArrayToSelectArray(
                      VISITING_SETTINGS
                    )}
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isFormDisabled}
                    isError={!!errors.behaviours?.[index]?.setting}
                    errorMessage={errors.behaviours?.[index]?.setting?.message}
                  />
                )}
              />
            </div>

            <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
              <Controller
                name={`behaviours.${index}.how_many_times_did_behavior_occur`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    labelText="How Many Times Did The Behaviour Occur?"
                    placeholder="Select"
                    selectContent={convertStringArrayToSelectArray(
                      NUMBER_OF_TIMES
                    )}
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isFormDisabled}
                    isError={
                      !!errors.behaviours?.[index]
                        ?.how_many_times_did_behavior_occur
                    }
                    errorMessage={
                      errors.behaviours?.[index]
                        ?.how_many_times_did_behavior_occur?.message
                    }
                  />
                )}
              />

              <Controller
                name={`behaviours.${index}.for_how_long_did_behavior_occur`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    labelText="For How Long Did The Behaviour Occur?"
                    placeholder="Select"
                    selectContent={convertStringArrayToSelectArray(
                      NUMBER_OF_TIMES
                    )}
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isFormDisabled}
                    isError={
                      !!errors.behaviours?.[index]
                        ?.for_how_long_did_behavior_occur
                    }
                    errorMessage={
                      errors.behaviours?.[index]
                        ?.for_how_long_did_behavior_occur?.message
                    }
                  />
                )}
              />
            </div>

            <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
              <Controller
                name={`behaviours.${index}.severity`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    labelText="Severity / Magnitude"
                    placeholder="Select"
                    selectContent={convertStringArrayToSelectArray(
                      VISITING_SEVERITY
                    )}
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isFormDisabled}
                    isError={!!errors.behaviours?.[index]?.severity}
                    errorMessage={errors.behaviours?.[index]?.severity?.message}
                  />
                )}
              />

              <Controller
                name={`behaviours.${index}.other_crisis_intervention`}
                control={control}
                render={({ field }) => (
                  <FormSelect
                    labelText="Other Crisis Intervention"
                    placeholder="Select"
                    selectContent={convertStringArrayToSelectArray(
                      OTHER_CRISIS_INTERVENTION
                    )}
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isFormDisabled}
                    isError={
                      !!errors.behaviours?.[index]?.other_crisis_intervention
                    }
                    errorMessage={
                      errors.behaviours?.[index]?.other_crisis_intervention
                        ?.message
                    }
                  />
                )}
              />
            </div>
          </div>
        ))}

        <BehaviorDeleteModal />

        {!isFormDisabled && (
          <button
            type="button"
            className="bg-[#F1F5F9] shadow-sm rounded-md px-[16px] py-[8px] w-fit h-fit flex gap-3 items-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddBehaviour}
            disabled={isAddingBehaviour}
          >
            {isAddingBehaviour ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <PlusIcon className="text-black w-5 h-5" />
            )}
            {isAddingBehaviour ? "Adding..." : "Add"}
          </button>
        )}

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
          >
            <DoubleArrowLeftIcon className="w-5 h-5" />
            Previous Section
          </Button>

          {!isFormDisabled && (
            <Button
              variant="light"
              type="button"
              onClick={handleDraftSubmit}
              disabled={isSubmittingDraft}
              isLoading={isSubmittingDraft}
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button onClick={() => handleChangeIndex(currentIndex + 1)}>
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default TIVisitBehaviourManagement;
