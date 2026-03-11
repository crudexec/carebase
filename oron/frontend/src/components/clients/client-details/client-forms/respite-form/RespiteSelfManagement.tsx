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
import { toast } from "@/components/ui/use-toast";
import { checkFormData } from "@/utils/helpers";
import { submitRespiteSelfManagement } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";

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

const selfManagementSchema = z.object({
  responses: z.record(z.boolean()).refine(
    (data) => {
      return Object.values(data).some((value) => value === true);
    },
    {
      message: "Please select at least one option",
    }
  ),
  other_description: z.string().optional().nullable(),
});

type SelfManagementFormData = z.infer<typeof selfManagementSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  respiteForm: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

const RespiteSelfManagement = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  respiteForm,
  isViewing,
  isEditing,
  username = "Client",
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const isFormDisabled = isViewing;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SelfManagementFormData>({
    resolver: zodResolver(selfManagementSchema),
    defaultValues: {
      responses: Object.fromEntries(
        responseLabels.map(({ value }) => [value, false])
      ),
      other_description: "",
    },
  });

  const watchOther = watch("responses.other");
  const watchNone = watch("responses.none");

  useEffect(() => {
    if (!respiteForm?.selfManagement) return;

    setMethod("PATCH");
    const { selfManagement } = respiteForm;

    // Set checkbox values from API response
    setValue(
      "responses.responding_to_others",
      Boolean(selfManagement.responding_to_others)
    );
    setValue("responses.sharing", Boolean(selfManagement.sharing));
    setValue(
      "responses.increasing_on_task_behavior",
      Boolean(selfManagement.increasing_on_task_behavior)
    );
    setValue(
      "responses.initiating_interactions",
      Boolean(selfManagement.initiating_interactions)
    );
    setValue(
      "responses.conversing_with_others",
      Boolean(selfManagement.conversing_with_others)
    );
    setValue(
      "responses.increasing_play_skills",
      Boolean(selfManagement.increasing_play_skills)
    );
    setValue(
      "responses.promoting_daily_living_skills",
      Boolean(selfManagement.promoting_daily_living_skills)
    );
    setValue("responses.taking_turns", Boolean(selfManagement.taking_turns));
    setValue(
      "responses.following_the_rules",
      Boolean(selfManagement.following_the_rules)
    );
    setValue(
      "responses.reducing_occurence_of_interfering_behavior",
      Boolean(selfManagement.reducing_occurence_of_interfering_behavior)
    );
    setValue(
      "responses.cooperate_with_peers_in_group_activity",
      Boolean(selfManagement.cooperate_with_peers_in_group_activity)
    );
    setValue("responses.other", Boolean(selfManagement.other));
    setValue("responses.none", false);

    // Set other description if exists
    if (selfManagement.other) {
      setValue("other_description", selfManagement.other || "");
    }
  }, [respiteForm, setValue]);

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
    if (Object.keys(errors).length > 0) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);

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

  const onSubmit = async (data: SelfManagementFormData) => {
    try {
      const token = localStorage.getItem("token") as string;

      const transformedData = {
        responding_to_others: data.responses.responding_to_others,
        sharing: data.responses.sharing,
        increasing_on_task_behavior: data.responses.increasing_on_task_behavior,
        initiating_interactions: data.responses.initiating_interactions,
        conversing_with_others: data.responses.conversing_with_others,
        increasing_play_skills: data.responses.increasing_play_skills,
        promoting_daily_living_skills:
          data.responses.promoting_daily_living_skills,
        taking_turns: data.responses.taking_turns,
        following_the_rules: data.responses.following_the_rules,
        reducing_occurence_of_interfering_behavior:
          data.responses.reducing_occurence_of_interfering_behavior,
        cooperate_with_peers_in_group_activity:
          data.responses.cooperate_with_peers_in_group_activity,
        other: data.responses.other,
        other_description: data.responses.other ? data.other_description : null,
      };

      const response = await submitRespiteSelfManagement(
        token,
        transformedData,
        respiteForm?.id || "",
        method,
        respiteForm?.selfManagement?.id
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
    } catch (err) {
      console.error("ERROR SUBMITTING SELF MANAGEMENT", err);
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

      const transformedData = {
        responding_to_others: data.responses.responding_to_others,
        sharing: data.responses.sharing,
        increasing_on_task_behavior: data.responses.increasing_on_task_behavior,
        initiating_interactions: data.responses.initiating_interactions,
        conversing_with_others: data.responses.conversing_with_others,
        increasing_play_skills: data.responses.increasing_play_skills,
        promoting_daily_living_skills:
          data.responses.promoting_daily_living_skills,
        taking_turns: data.responses.taking_turns,
        following_the_rules: data.responses.following_the_rules,
        reducing_occurence_of_interfering_behavior:
          data.responses.reducing_occurence_of_interfering_behavior,
        cooperate_with_peers_in_group_activity:
          data.responses.cooperate_with_peers_in_group_activity,
        other: data.responses.other,
        other_description: data.responses.other ? data.other_description : null,
      };

      const response = await submitRespiteSelfManagement(
        token,
        transformedData,
        respiteForm?.id || "",
        method,
        respiteForm?.selfManagement?.id
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
      <h3 className="text-[#0F172A] text-[24px] font-[600]">Self-Management</h3>

      <div className="flex flex-col gap-3">
        <p className="text-[18px] font-[400] text-[#0F172A]">
          Please answer the following question on self-management skills
        </p>

        <p className="text-[18px] font-[600] text-[#0F172A]">
          I observed {username} perform the following self-management skill(s)
          without any help from me:
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
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
              />
            )}
          />
        )}

        {errors?.responses && (
          <p className="text-red-700">
            {String(
              errors.responses?.message || errors.responses?.root?.message
            )}
          </p>
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
              data-testid="save-draft-button"
              onClick={handleDraftSubmit}
              disabled={isSubmittingDraft}
              isLoading={isSubmittingDraft}
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button
              onClick={() => handleChangeIndex(currentIndex + 1)}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              data-testid="next-section-button"
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

export default RespiteSelfManagement;
