"use client";

import { ChangeEvent, Dispatch, useEffect, useState } from "react";
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
import {
  BEHAVIOUR_MANAGEMENT,
  REDUCER_ACTION_TYPE,
  ReducerAction,
} from "../../store/reducer";
import { useVisitingFormContext } from "../../store/visiting-form-context";
import {
  NUMBER_OF_TIMES,
  VISITING_CONSEQUENCES,
  VISITING_SETTINGS,
  VISITING_SEVERITY,
  VISTING_ANTECEDENT,
  behaviour_type as behaviourType,
} from "@/constants";
import { convertStringArrayToSelectArray } from "@/utils/helpers";
import useVisitingFormSubmission from "../../logic";
import { behaviourManagementSchema } from "../../logic/schema";
import DeleteModal from "@/components/DeleteDialog";
import useModal from "@/context/modal";
import FormTimePicker from "@/components/input-fields/FormTimePicker";
import { useToast } from "@/components/ui/use-toast";

export const GoalDeleteModal = ({
  dispatch,
  remove,
  "data-testid": dataTestId,
}: {
  dispatch: Dispatch<ReducerAction>;
  remove: (index: number) => void;
  "data-testid"?: string;
}) => {
  const { closeModal, data } = useModal("DELETE_MODAL");
  const index = data?.index;
  return (
    <DeleteModal
      isLoading={false}
      confirmationText="Deleting a behavior also deletes the selected responses in the form fields. This action cannot be undone"
      handleConfirm={() => {
        if (typeof index === "number") {
          dispatch({
            type: REDUCER_ACTION_TYPE.DELETE_FIELD,
            payload: {
              index: index,
            },
          });
          remove(index);
        }
        closeModal();
      }}
      confirmMationHeader={`Delete Behavior ${index + 1}?`}
      data-testid={dataTestId}
    />
  );
};

const BehaviourManagement = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  admin,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  admin?: boolean;
}) => {
  const { toast } = useToast();
  const { openModal } = useModal("DELETE_MODAL");
  const {
    state: { step_one_form, isFormDisabled: stateDis },

    dispatch,
  } = useVisitingFormContext();
  const { behaviour_management } = step_one_form;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<{ behaviours: BEHAVIOUR_MANAGEMENT[] }>({
    resolver:
      behaviour_management.length > 0
        ? zodResolver(behaviourManagementSchema)
        : undefined,
    defaultValues: {
      behaviours: [],
    },
  });

  const [loading, setLoading] = useState(false);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "behaviours",
  });

  const isFormDisabled = stateDis;

  const handleAddBehaviour = () => {
    dispatch({
      type: REDUCER_ACTION_TYPE.ADD_BEHAVIOUR_MANAGEMENT,
    });
  };

  const { submitBehaviourManagement } = useVisitingFormSubmission(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {}, [JSON.stringify(behaviour_management)]);

  const handleChangeBehaviour = (
    index: number,
    behaviourField: keyof BEHAVIOUR_MANAGEMENT,
    value: string
  ) => {
    dispatch({
      type: REDUCER_ACTION_TYPE.UPDATE_BEHAVIOUR_MANAGEMENT_FIELD,
      payload: {
        index,
        value,
        behaviourField,
      },
    });
  };

  const behaviourKeys = Object.keys(behaviourType).map((bah) => ({
    label: bah,
    value: bah,
  }));

  const onSubmit = async ({
    behaviours,
  }: {
    behaviours: BEHAVIOUR_MANAGEMENT[];
  }) => {
    if (behaviours.length === 0) {
      handleNewCompletedSection(4);
      handleChangeIndex(currentIndex + 1);
      return;
    }

    setLoading(true);
    await submitBehaviourManagement(behaviours as BEHAVIOUR_MANAGEMENT[]);
    setLoading(false);
  };

  const saveDraft = async () => {
    if (getValues().behaviours.length === 0) {
      handleNewCompletedSection(4);
      toast({
        variant: "success",
        description: "Draft Saved Successfully",
      });
      return;
    }

    setLoading(true);

    try {
      await submitBehaviourManagement(
        getValues().behaviours as unknown as BEHAVIOUR_MANAGEMENT[],
        true
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      behaviour_management &&
      Array.isArray(behaviour_management) &&
      behaviour_management?.length > 0
    ) {
      behaviour_management.forEach((item, id) => {
        setValue(`behaviours.${id}.id`, item.id);
        setValue(`behaviours.${id}.behavior_type`, item.behavior_type);
        setValue(`behaviours.${id}.antecedent`, item.antecedent);
        setValue(
          `behaviours.${id}.behavior_description`,
          item.behavior_description
        );
        setValue(`behaviours.${id}.consequence`, item.consequence);
        setValue(
          `behaviours.${id}.for_how_long_did_behavior_occur`,
          item.for_how_long_did_behavior_occur
        );
        setValue(
          `behaviours.${id}.how_many_times_did_behavior_occur`,
          item.how_many_times_did_behavior_occur
        );
        setValue(
          `behaviours.${id}.other_crisis_intervention`,
          item.other_crisis_intervention
        );
        setValue(`behaviours.${id}.setting`, item.setting);
        setValue(`behaviours.${id}.severity`, item.severity);
        setValue(
          `behaviours.${id}.what_time_did_behavior_occur`,
          item.what_time_did_behavior_occur
        );

        if (item.other_specific_description) {
          setValue(
            `behaviours.${id}.other_specific_description`,
            item.other_specific_description
          );
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (errors.behaviours) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3
        data-testid="behavior-management-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Behavior Management
      </h3>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        {behaviour_management &&
          Array.isArray(behaviour_management) &&
          behaviour_management?.length > 0 &&
          behaviour_management.map((item, index) => {
            return (
              <div
                key={`${item.behavior_type}${item.behavior_description}`}
                className="flex flex-col gap-7 border-[1px] border-[#EAECF0] shadow-md p-5 rounded-[12px]"
              >
                <div className="flex items-center gap-5 justify-between flex-wrap">
                  <h4 className="text-[#0F172A] text-[20px] font-[600]">
                    Behavior {index + 1}
                  </h4>

                  <button
                    disabled={
                      isFormDisabled
                      // || behaviour_management.length === 1
                    }
                    className="disabled:text-gray-500 disabled:cursor-not-allowed text-black"
                    type="button"
                    onClick={() => openModal({ index })}
                    data-testid={`open-delete-behaviour-${index}-modal`}
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
                        {...field}
                        onValueChange={(val) => {
                          field.onChange(val);
                          handleChangeBehaviour(index, "behavior_type", val);
                        }}
                        value={field.value}
                        labelText={`Behavior Type (${index + 1})`}
                        placeholder="Select Type"
                        selectContent={behaviourKeys}
                        defaultValue={item.behavior_type}
                        isError={!!errors.behaviours?.[index]?.behavior_type}
                        errorMessage={
                          errors.behaviours?.[index]?.behavior_type?.message
                        }
                        disabled={isFormDisabled}
                        data-testid={`behavior-${index}-behavior-type`}
                      />
                    )}
                  />
                  <Controller
                    name={`behaviours.${index}.behavior_description`}
                    control={control}
                    render={({ field }) => {
                      const selectContent = behaviourType[item.behavior_type]
                        ? behaviourType[item.behavior_type].map(
                            (val: string) => ({
                              label: val,
                              value: val,
                            })
                          )
                        : [{ label: "opt", value: "opt" }];

                      return (
                        <FormSelect
                          {...field}
                          disabled={
                            isFormDisabled || !Boolean(item.behavior_type)
                          }
                          onValueChange={(val) => {
                            field.onChange(val);
                            handleChangeBehaviour(
                              index,
                              "behavior_description",
                              val
                            );
                          }}
                          labelText="Behavior Description"
                          placeholder="Select Description"
                          defaultValue={item.behavior_description}
                          selectContent={selectContent}
                          isError={
                            !!errors.behaviours?.[index]?.behavior_description
                          }
                          errorMessage={
                            errors.behaviours?.[index]?.behavior_description
                              ?.message
                          }
                          data-testid={`behavior-${index}-behavior-description`}
                        />
                      );
                    }}
                  />
                </div>

                {item.behavior_description === "Other, please specify" && (
                  <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
                    <Controller
                      name={`behaviours.${index}.other_specific_description`}
                      control={control}
                      render={({ field }) => (
                        <FormInput
                          {...field}
                          value={
                            field.value === null || field.value === undefined
                              ? ""
                              : field.value
                          }
                          labelText=""
                          placeholder="Please specify"
                          type="text"
                          isAuth={false}
                          isError={
                            !!errors.behaviours?.[index]
                              ?.other_specific_description
                          }
                          errorMessage={
                            errors.behaviours?.[index]
                              ?.other_specific_description?.message
                          }
                          data-testid={`behavior-${index}-other-description`}
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
                        {...field}
                        name={`behaviours.${index}.what_time_did_behavior_occur`}
                        placeholder="Select"
                        labelText="What time did the behavior occur?"
                        onChange={(value) => {
                          if (value) {
                            field.onChange(value);
                            handleChangeBehaviour(
                              index,
                              "what_time_did_behavior_occur",
                              value
                            );
                          }
                        }}
                        value={field.value}
                        defaultValue={item.what_time_did_behavior_occur}
                        isError={
                          !!errors.behaviours?.[index]
                            ?.what_time_did_behavior_occur
                        }
                        errorMessage={
                          errors.behaviours?.[index]
                            ?.what_time_did_behavior_occur?.message
                        }
                        disabled={isFormDisabled}
                        data-testid={`behavior-${index}-time-behavior-occur`}
                      />
                    )}
                  />
                  <Controller
                    name={`behaviours.${index}.antecedent`}
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        {...field}
                        onValueChange={(val) => {
                          field.onChange(val);
                          handleChangeBehaviour(index, "antecedent", val);
                        }}
                        labelText="Antecedent"
                        placeholder="Select"
                        defaultValue={item.antecedent}
                        selectContent={convertStringArrayToSelectArray(
                          VISTING_ANTECEDENT
                        )}
                        isError={!!errors.behaviours?.[index]?.antecedent}
                        errorMessage={
                          errors.behaviours?.[index]?.antecedent?.message
                        }
                        disabled={isFormDisabled}
                        data-testid={`behavior-${index}-behavior-antecedent`}
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
                        {...field}
                        labelText="Consequences"
                        defaultValue={item.consequence}
                        onValueChange={(val) => {
                          field.onChange(val);
                          handleChangeBehaviour(index, "consequence", val);
                        }}
                        placeholder="Select"
                        selectContent={convertStringArrayToSelectArray(
                          VISITING_CONSEQUENCES
                        )}
                        isError={!!errors.behaviours?.[index]?.consequence}
                        errorMessage={
                          errors.behaviours?.[index]?.consequence?.message
                        }
                        disabled={isFormDisabled}
                        data-testid={`behavior-${index}-behavior-consequence`}
                      />
                    )}
                  />
                  <Controller
                    name={`behaviours.${index}.setting`}
                    control={control}
                    defaultValue={item.setting}
                    render={({ field }) => (
                      <FormSelect
                        {...field}
                        labelText="Setting"
                        onValueChange={(val) => {
                          field.onChange(val);
                          handleChangeBehaviour(index, "setting", val);
                        }}
                        placeholder="Select"
                        selectContent={convertStringArrayToSelectArray(
                          VISITING_SETTINGS
                        )}
                        isError={!!errors.behaviours?.[index]?.setting}
                        errorMessage={
                          errors.behaviours?.[index]?.setting?.message
                        }
                        disabled={isFormDisabled}
                        data-testid={`behavior-${index}-behavior-setting`}
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
                        {...field}
                        labelText="How many times did the behavior occur?"
                        placeholder="Select"
                        selectContent={convertStringArrayToSelectArray(
                          NUMBER_OF_TIMES
                        )}
                        onValueChange={(val) => {
                          field.onChange(val);
                          handleChangeBehaviour(
                            index,
                            "how_many_times_did_behavior_occur",
                            val
                          );
                        }}
                        isError={
                          !!errors.behaviours?.[index]
                            ?.how_many_times_did_behavior_occur
                        }
                        errorMessage={
                          errors.behaviours?.[index]
                            ?.how_many_times_did_behavior_occur?.message
                        }
                        disabled={isFormDisabled}
                        defaultValue={item.how_many_times_did_behavior_occur}
                        data-testid={`behavior-${index}-how-many-times-behavior-occur`}
                      />
                    )}
                  />
                  <Controller
                    name={`behaviours.${index}.for_how_long_did_behavior_occur`}
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        {...field}
                        labelText="How long did the behavior occur?"
                        placeholder="Select"
                        onValueChange={(val) => {
                          field.onChange(val);
                          handleChangeBehaviour(
                            index,
                            "for_how_long_did_behavior_occur",
                            val
                          );
                        }}
                        selectContent={convertStringArrayToSelectArray(
                          NUMBER_OF_TIMES
                        )}
                        isError={
                          !!errors.behaviours?.[index]
                            ?.for_how_long_did_behavior_occur
                        }
                        defaultValue={item.for_how_long_did_behavior_occur}
                        errorMessage={
                          errors.behaviours?.[index]
                            ?.for_how_long_did_behavior_occur?.message
                        }
                        disabled={isFormDisabled}
                        data-testid={`behavior-${index}-how-long-did-behavior-occur`}
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
                        {...field}
                        labelText="Severity / Magnitude"
                        placeholder="Select"
                        selectContent={convertStringArrayToSelectArray(
                          VISITING_SEVERITY
                        )}
                        onValueChange={(val) => {
                          field.onChange(val);
                          handleChangeBehaviour(index, "severity", val);
                        }}
                        isError={!!errors.behaviours?.[index]?.severity}
                        errorMessage={
                          errors.behaviours?.[index]?.severity?.message
                        }
                        defaultValue={item.severity}
                        disabled={isFormDisabled}
                        data-testid={`behavior-${index}-behavior-severity`}
                      />
                    )}
                  />
                  <Controller
                    name={`behaviours.${index}.other_crisis_intervention`}
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        {...field}
                        labelText="Other crisis intervention"
                        placeholder="Select"
                        defaultValue={item.other_crisis_intervention}
                        onValueChange={(val) => {
                          field.onChange(val);
                          handleChangeBehaviour(
                            index,
                            "other_crisis_intervention",
                            val
                          );
                        }}
                        selectContent={convertStringArrayToSelectArray([
                          "Verbal redirection",
                          "Blocking",
                        ])}
                        isError={
                          !!errors.behaviours?.[index]
                            ?.other_crisis_intervention
                        }
                        errorMessage={
                          errors.behaviours?.[index]?.other_crisis_intervention
                            ?.message
                        }
                        disabled={isFormDisabled}
                        data-testid={`behavior-${index}-other-crisis-intervention`}
                      />
                    )}
                  />
                </div>
              </div>
            );
          })}

        <GoalDeleteModal
          dispatch={dispatch}
          remove={remove}
          data-testid="behavior-delete"
        />

        {!isFormDisabled && (
          <button
            className="bg-[#F1F5F9] shadow-sm rounded-md px-[16px] py-[8px] w-fit h-fit flex gap-3 items-center"
            onClick={handleAddBehaviour}
            type="button"
            data-testid="add-behavior-button"
          >
            <PlusIcon className="text-black w-5 h-5" />
            Add
          </button>
        )}

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
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

          {isFormDisabled ? (
            <Button
              isLoading={loading}
              onClick={() => {
                handleChangeIndex(currentIndex + 1);
              }}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            currentIndex !== 6 && (
              <Button
                type="submit"
                isLoading={loading}
                data-testid="next-section-button"
              >
                Next Section <DoubleArrowRightIcon className="w-5 h-5" />
              </Button>
            )
          )}
        </div>
      </form>
    </section>
  );
};

export default BehaviourManagement;
