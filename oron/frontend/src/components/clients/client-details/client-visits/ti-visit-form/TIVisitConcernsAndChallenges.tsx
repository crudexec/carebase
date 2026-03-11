"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import FormTextArea from "@/components/input-fields/FormTextArea";
import { submitRespiteConcernsAndChallenges } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  tiForm?: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

const concernsAndChallengesSchema = z.object({
  hadChallenges: z.enum(["yes", "no"], {
    required_error: "Please select if there were any challenges",
  }),
  challengeDescription: z.string().optional().nullable(),
  needsSupervisorContact: z.enum(["yes", "no"], {
    required_error: "Please select if you need supervisor contact",
  }),
});

type ConcernsAndChallengesFormData = z.infer<
  typeof concernsAndChallengesSchema
>;

const TIVisitConcernsAndChallenges = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  tiForm,
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
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ConcernsAndChallengesFormData>({
    resolver: zodResolver(concernsAndChallengesSchema),
    defaultValues: {
      hadChallenges: "no",
      challengeDescription: "",
      needsSupervisorContact: "no",
    },
  });

  const watchChallenges = watch("hadChallenges");

  useEffect(() => {
    if (!tiForm?.concernAndChallenges) return;

    setMethod("PATCH");
    const { concernAndChallenges } = tiForm;

    setValue(
      "hadChallenges",
      concernAndChallenges.was_there_any_concerns_or_challenges ? "yes" : "no"
    );
    setValue(
      "challengeDescription",
      concernAndChallenges.describe_circumstances_involved || ""
    );
    setValue(
      "needsSupervisorContact",
      concernAndChallenges.supervisor_to_contact_during_session ? "yes" : "no"
    );
  }, [tiForm, setValue]);

  const onSubmit = async (data: ConcernsAndChallengesFormData) => {
    try {
      const token = localStorage.getItem("token") as string;

      const transformedData = {
        was_there_any_concerns_or_challenges: data.hadChallenges === "yes",
        supervisor_to_contact_during_session:
          data.needsSupervisorContact === "yes",
        describe_circumstances_involved:
          data.hadChallenges === "yes" ? data.challengeDescription || "" : "",
      };

      const response = await submitRespiteConcernsAndChallenges(
        token,
        transformedData,
        tiForm?.id || "",
        method,
        tiForm?.concernAndChallenges?.id
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
      console.error("ERROR SUBMITTING CONCERNS AND CHALLENGES", err);
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
        was_there_any_concerns_or_challenges: data.hadChallenges === "yes",
        supervisor_to_contact_during_session:
          data.needsSupervisorContact === "yes",
        describe_circumstances_involved: data.challengeDescription || "",
      };

      const response = await submitRespiteConcernsAndChallenges(
        token,
        transformedData,
        tiForm?.id || "",
        method,
        tiForm?.concernAndChallenges?.id
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

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 static">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Concerns and challenges
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <div className="flex flex-col gap-5">
          <Controller
            name="hadChallenges"
            control={control}
            render={({ field }) => (
              <RadioGroup
                className="flex flex-col gap-5"
                onValueChange={field.onChange}
                value={field.value}
                disabled={isFormDisabled}
              >
                <h4 className="text-[16px] font-[400] text-[#09090B]">
                  Were There Any Challenges/ Concerns During This Session?
                </h4>
                <div className="flex items-center flex-wrap gap-5">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="challenges_yes" value="yes" />
                    <Label
                      className="text-[16px] font-[400] text-[#09090B]"
                      htmlFor="challenges_yes"
                    >
                      Yes
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="challenges_no" value="no" />
                    <Label
                      className="text-[16px] font-[400] text-[#09090B]"
                      htmlFor="challenges_no"
                    >
                      No
                    </Label>
                  </div>
                </div>
                {errors.hadChallenges && (
                  <span className="text-red-500">
                    {errors.hadChallenges.message}
                  </span>
                )}
              </RadioGroup>
            )}
          />

          {watchChallenges === "yes" && (
            <Controller
              name="challengeDescription"
              control={control}
              render={({ field }) => (
                <FormTextArea
                  {...field}
                  value={field.value ?? ""}
                  labelText="Describe The Circumstances Involved"
                  placeholder="Describe here.."
                  isError={!!errors.challengeDescription}
                  disabled={isFormDisabled}
                  errorMessage={errors.challengeDescription?.message}
                />
              )}
            />
          )}
        </div>

        <Controller
          name="needsSupervisorContact"
          control={control}
          render={({ field }) => (
            <RadioGroup
              className="flex flex-col gap-5"
              onValueChange={field.onChange}
              value={field.value}
              disabled={isFormDisabled}
            >
              <h4 className="text-[16px] font-[400] text-[#09090B]">
                Would You Like A Supervisor To Contact You Regarding This
                Session?
              </h4>
              <div className="flex items-center flex-wrap gap-5">
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="supervisor_yes" value="yes" />
                  <Label
                    className="text-[16px] font-[400] text-[#09090B]"
                    htmlFor="supervisor_yes"
                  >
                    Yes
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem id="supervisor_no" value="no" />
                  <Label
                    className="text-[16px] font-[400] text-[#09090B]"
                    htmlFor="supervisor_no"
                  >
                    No
                  </Label>
                </div>
              </div>
              {errors.needsSupervisorContact && (
                <span className="text-red-500">
                  {errors.needsSupervisorContact.message}
                </span>
              )}
            </RadioGroup>
          )}
        />

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

export default TIVisitConcernsAndChallenges;
