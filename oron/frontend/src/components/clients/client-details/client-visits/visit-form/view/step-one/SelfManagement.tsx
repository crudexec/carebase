"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FormInput from "@/components/input-fields/FormInput";
import useVisitingFormSubmission from "../../logic";
import { SELF_MANAGEMENT } from "../../store/reducer";
import { useVisitingFormContext } from "../../store/visiting-form-context";
import { selfManagementSchema } from "../../logic/schema";
import { checkFormData } from "@/utils/helpers";
import { toast } from "@/components/ui/use-toast";

type CheckedState = boolean | "indeterminate";

const responseLabels = [
  { label: "Responding to others", value: "responding_to_others" },
  { label: "Initiating interactions", value: "initiating_interactions" },
  {
    label: "Promoting daily living skills",
    value: "promoting_daily_living_skills",
  },
  {
    label: "Reducing the occurrence of interfering behaviors",
    value: "reducing_occurence_of_interfering_behavior",
  },
  { label: "Sharing", value: "sharing" },
  { label: "Conversing with others", value: "conversing_with_others" },
  { label: "Taking turns", value: "taking_turns" },
  {
    label: "Co-operate with peers in group activity",
    value: "cooperate_with_peers_in_group_activity",
  },
  {
    label: "Increasing on-task behaviors",
    value: "increasing_on_task_behavior",
  },
  { label: "Increasing play skills", value: "increasing_play_skills" },
  { label: "Following the rules", value: "following_the_rules" },
  { label: "Other", value: "other" },
  { label: "None of the above", value: "none" },
] as const;

type ResponseLabel = (typeof responseLabels)[number];

type SelfManagementFormData = z.infer<typeof selfManagementSchema>;

interface SelfManagementProps {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  username: string;
  handleChangeStep: (d: number) => void;
  admin?: boolean;
}

const SelfManagement: React.FC<SelfManagementProps> = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  username,
  handleChangeStep,
  admin,
}) => {
  const { submitSelfManagement } = useVisitingFormSubmission(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex,
    handleChangeStep
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SelfManagementFormData>({
    resolver: zodResolver(selfManagementSchema),
    defaultValues: {
      responses: Object.fromEntries(
        responseLabels.map(({ value }) => [value, false])
      ),
      other_description: "",
    },
  });

  const { state } = useVisitingFormContext();
  const { isFormDisabled: stateDis } = state;
  const isFormDisabled = stateDis;

  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async (data: SelfManagementFormData) => {
    setLoading(true);
    try {
      await submitSelfManagement(data as unknown as SELF_MANAGEMENT);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  });

  const saveDraft = async () => {
    setLoading(true);
    try {
      await submitSelfManagement(
        getValues() as unknown as SELF_MANAGEMENT,
        true
      );
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const watchOther = watch("responses.other");
  const watchNone = watch("responses.none");

  const formData: SELF_MANAGEMENT =
    state.step_one_form.self_management_response;

  useEffect(() => {
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === "boolean") {
          setValue(
            `responses.${key}` as FieldPath<SelfManagementFormData>,
            value
          );
        } else {
          setValue(key as FieldPath<SelfManagementFormData>, value);
        }
      }
    });

    // There's currently no field in the api to save the other description
    // if (formData.other) {
    //   setValue("other_description", formData.other);
    // }
  }, [setValue, state.step_one_form.self_management_response, formData]);

  useEffect(() => {
    if (watchNone) {
      responseLabels.forEach(({ value }) => {
        if (value !== "none") {
          setValue(
            `responses.${value}` as FieldPath<SelfManagementFormData>,
            false
          );
        }
      });
    }
  }, [watchNone, setValue]);

  useEffect(() => {
    if (errors.responses) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);

  useEffect(() => {
    if (
      checkFormData(
        "responses" in formData ? formData?.responses : formData,
        responseLabels
      ) === false &&
      state?.step_one_form?.self_management_id
    ) {
      setValue(`responses.none`, true);
    }
  }, [formData]);

  const handleCheckboxChange = (value: string, checked: CheckedState) => {
    if (value === "none" && checked) {
      responseLabels.forEach((item) => {
        if (item.value !== "none") {
          setValue(
            `responses.${item.value}` as FieldPath<SelfManagementFormData>,
            false
          );
        }
      });
    } else if (value !== "none") {
      setValue("responses.none" as FieldPath<SelfManagementFormData>, false);
    }

    setValue(
      `responses.${value}` as FieldPath<SelfManagementFormData>,
      checked === true
    );
  };

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3
        data-testid="self-management-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Self-Management
      </h3>

      <div className="flex flex-col gap-3">
        <p className="text-[18px] font-[400] text-[#0F172A]">
          Please answer the following question on self-management skills
        </p>

        <p className="text-[18px] font-[600] text-[#0F172A]">
          I observed {username} perform the following self-management skill(s)
          without any help from me:
        </p>
      </div>

      <form className="flex flex-col gap-7" onSubmit={onSubmit}>
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
          {responseLabels.map(({ label, value }) => (
            <div key={value} className="flex items-center gap-2">
              <Controller
                name={`responses.${value}` as FieldPath<SelfManagementFormData>}
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id={value}
                    checked={field.value as CheckedState}
                    onCheckedChange={(checked: CheckedState) =>
                      handleCheckboxChange(value, checked)
                    }
                    disabled={isFormDisabled}
                    data-testid={`observed-client-perform-${value}`}
                  />
                )}
              />
              <Label
                className="text-[14px] font-[400] text-[#09090B]"
                htmlFor={value}
              >
                {label}
              </Label>
            </div>
          ))}
        </div>

        {watchOther && (
          <Controller
            name="other_description"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                value={field.value === null ? "" : field.value}
                labelText=""
                placeholder="Please specify"
                type="text"
                isAuth={false}
                data-testid="other-observed-client-perform"
              />
            )}
          />
        )}

        <p className="text-red-700">{errors?.responses?.responses?.message}</p>

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
              onClick={() => saveDraft()}
              isLoading={loading}
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

export default SelfManagement;
