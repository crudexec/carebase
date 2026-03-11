"use client";

import Button from "@/components/button/Button";
import FormTextArea from "@/components/input-fields/FormTextArea";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { submitOtherTrainingsForm } from "@/actions/clients/fc-visit/otherTrainings";
import { toast } from "@/components/ui/use-toast";
import { FullFcVisitForm } from "@/types/Visit";

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  handleChangeStep: any;
  formId: string;
  visitForms: FullFcVisitForm | undefined;
}

const formSchema = z.object({
  trainingAAC: z.string().optional(),
  trainingCommunication: z.string().optional(),
  trainingBehavior: z.string().optional(),
  trainingSafety: z.string().optional(),
  otherTraining: z.string().optional(),
});

export type FcVisitOtherTrainingsFormSchema = z.infer<typeof formSchema>;

const FcOtherTrainings = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  handleChangeStep,
  formId,
  visitForms,
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const isFormDisabled = false;

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
  } = useForm<FcVisitOtherTrainingsFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainingAAC: "",
      trainingCommunication: "",
      trainingBehavior: "",
      trainingSafety: "",
      otherTraining: "",
    },
  });

  useEffect(() => {
    if (!visitForms) return;

    const { data } = visitForms;
    const { otherTraining } = data;

    if (otherTraining && Object.keys(otherTraining)?.length > 0) {
      setMethod("PATCH");

      setValue(
        "trainingAAC",
        otherTraining?.training_and_consultation_provided_on_use_of_augmentative_and_alternative_communication ??
          ""
      );
      setValue(
        "trainingCommunication",
        otherTraining?.training_and_consultation_provided_on_communication_strategies ??
          ""
      );
      setValue(
        "trainingBehavior",
        otherTraining?.training_and_consultation_provided_on_behavior_intervention_strategies ??
          ""
      );
      setValue(
        "trainingSafety",
        otherTraining?.training_and_consultation_provided_on_safety_at_home_and_in_the_community ??
          ""
      );
      setValue(
        "otherTraining",
        otherTraining?.any_other_training_and_consultation_topics ?? ""
      );
    }
  }, [visitForms, setValue]);

  const onSubmit = async (data: FcVisitOtherTrainingsFormSchema) => {
    try {
      const token = localStorage.getItem("token") as string;
      const response = await submitOtherTrainingsForm(
        token,
        data,
        formId,
        visitForms?.data?.otherTraining?.id ?? "-",
        method
      );

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleChangeIndex(currentIndex + 1);
      handleNewCompletedSection(currentIndex);
    } catch (err) {
      console.error("ERROR SUBMITTING FC VISIT OTHER TRAININGS", err);
    }
  };

  const handleDraftSubmit = async () => {
    const data = getValues();
    try {
      setIsSubmittingDraft(true);
      const token = localStorage.getItem("token") as string;
      const response = await submitOtherTrainingsForm(
        token,
        data,
        formId,
        visitForms?.data?.otherTraining?.id ?? "-",
        method
      );

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      toast({
        variant: "success",
        description: "Draft saved successfully",
      });
    } catch (err) {
      console.error("ERROR SUBMITTING FC VISIT OTHER TRAININGS", err);
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 static">
      <div className="flex flex-col gap-2">
        <h3
          data-testid="fc-other-trainings-header"
          className="text-[#0F172A] text-[24px] font-[600]"
        >
          Other Trainings & Consulting Services Provided
        </h3>
        <p className="text-[16px] font-[400] text-[#334155]">
          Please complete where applicable
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <Controller
          name="trainingAAC"
          control={control}
          render={({ field }) => (
            <FormTextArea
              {...field}
              labelText={`Training & Consultation Provided on Use of Augmentative and Alternative Communication (AAC) (Optional)`}
              placeholder="Enter here.."
              errorMessage={errors.trainingAAC?.message || ""}
              isError={!!errors.trainingAAC}
              disabled={isFormDisabled}
              data-testid="fc-training-aac"
            />
          )}
        />

        <Controller
          name="trainingCommunication"
          control={control}
          render={({ field }) => (
            <FormTextArea
              {...field}
              labelText={`Training & Consultation Provided on Communication Strategies (Optional)`}
              placeholder="Enter here.."
              errorMessage={errors.trainingCommunication?.message || ""}
              isError={!!errors.trainingCommunication}
              disabled={isFormDisabled}
              data-testid="fc-training-communication"
            />
          )}
        />

        <Controller
          name="trainingBehavior"
          control={control}
          render={({ field }) => (
            <FormTextArea
              {...field}
              labelText={`Training & Consultation Provided on Behavior Intervention Strategies (Optional)`}
              placeholder="Enter here.."
              errorMessage={errors.trainingBehavior?.message || ""}
              isError={!!errors.trainingBehavior}
              disabled={isFormDisabled}
              data-testid="fc-training-behavior"
            />
          )}
        />

        <Controller
          name="trainingSafety"
          control={control}
          render={({ field }) => (
            <FormTextArea
              {...field}
              labelText={`Training & Consultation Provided on Safety at Home and in the Community (Optional)`}
              placeholder="Enter here.."
              errorMessage={errors.trainingSafety?.message || ""}
              isError={!!errors.trainingSafety}
              disabled={isFormDisabled}
              data-testid="fc-training-safety"
            />
          )}
        />

        <Controller
          name="otherTraining"
          control={control}
          render={({ field }) => (
            <FormTextArea
              {...field}
              labelText={`Any Other Training and Consultation Topics (Optional)`}
              placeholder="Enter here.."
              errorMessage={errors.otherTraining?.message || ""}
              isError={!!errors.otherTraining}
              disabled={isFormDisabled}
              data-testid="fc-other-training"
            />
          )}
        />

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
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
              onClick={handleDraftSubmit}
              variant="light"
              type="button"
              disabled={isSubmittingDraft}
              isLoading={isSubmittingDraft}
              data-testid="save-draft-button"
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
              disabled={isSubmitting}
              isLoading={isSubmitting}
              type="submit"
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default FcOtherTrainings;
