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
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { submitFamilyDiscussionForm } from "@/actions/clients/fc-visit/familyDiscussion";
import { FullFcVisitForm } from "@/types/Visit";

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  username: string;
  handleChangeStep: any;
  formId: string;
  visitForms: FullFcVisitForm | undefined;
}

const formSchema = z
  .object({
    accomplishmentSelf: z.string().optional(),
    accomplishmentFamily: z.string().optional(),
    discussionTopics: z.string().optional(),
  })
  .refine(
    (data) => {
      return (
        data.accomplishmentSelf ||
        data.accomplishmentFamily ||
        data.discussionTopics
      );
    },
    {
      message: "At least one field must be filled.",
      path: ["accomplishmentSelf"],
    }
  );

export type FamilyDiscussionFormData = z.infer<typeof formSchema>;

const FcFamilyDiscussion = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  username,
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
  } = useForm<FamilyDiscussionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accomplishmentSelf: "",
      accomplishmentFamily: "",
      discussionTopics: "",
    },
  });

  useEffect(() => {
    if (!visitForms) return;

    const { data } = visitForms;
    const { familyDiscussion } = data;

    if (familyDiscussion && Object.keys(familyDiscussion)?.length > 0) {
      setMethod("PATCH");

      setValue(
        "accomplishmentSelf",
        familyDiscussion?.accomplishments_client_made_void_of_family_consultation_treatment ??
          ""
      );
      setValue(
        "accomplishmentFamily",
        familyDiscussion?.accomplishments_client_family_made_void_of_family_consultation_treatment ??
          ""
      );
      setValue(
        "discussionTopics",
        familyDiscussion?.topic_not_related_discussed_during_family_consultation ??
          ""
      );
    }
  }, [visitForms, setValue]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      toast({
        variant: "destructive",
        description: "At least one field must be filled.",
      });
    }
  }, [errors]);

  const onSubmit = async (data: FamilyDiscussionFormData) => {
    try {
      const token = localStorage.getItem("token") as string;
      const response = await submitFamilyDiscussionForm(
        token,
        data,
        formId,
        visitForms?.data?.familyDiscussion?.id ?? "-",
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
      handleChangeStep(2);
    } catch (err) {
      console.error("ERROR SUBMITTING SESSION HIGHLIGHTS", err);
    }
  };

  const handleDraftSubmit = async () => {
    const data = getValues();
    try {
      setIsSubmittingDraft(true);
      const token = localStorage.getItem("token") as string;
      const response = await submitFamilyDiscussionForm(
        token,
        data,
        formId,
        visitForms?.data?.familyDiscussion?.id ?? "-",
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
      console.error("ERROR SUBMITTING SESSION HIGHLIGHTS", err);
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 static">
      <div className="flex flex-col gap-2">
        <h3
          data-testid="fc-family-discussion-header"
          className="text-[#0F172A] text-[24px] font-[600]"
        >
          Family General Discussion
        </h3>
        <p className="text-[16px] font-[400] text-[#334155]">
          Please complete at least one (1) category from this section
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <Controller
          name="accomplishmentSelf"
          control={control}
          render={({ field }) => (
            <FormTextArea
              {...field}
              labelText={`Accomplishment(s) ${username} made that may or may not have been on the Family Consultation Treatment Plan`}
              placeholder="Enter here.."
              errorMessage={errors.accomplishmentSelf?.message || ""}
              isError={!!errors.accomplishmentSelf}
              disabled={isFormDisabled}
              data-testid="fc-accomplishment-self"
            />
          )}
        />

        <Controller
          name="accomplishmentFamily"
          control={control}
          render={({ field }) => (
            <FormTextArea
              {...field}
              labelText={`Accomplishment(s) ${username}'s family made that may or may not have been on the Family Consultation Treatment Plan`}
              placeholder="Enter here.."
              errorMessage={errors.accomplishmentFamily?.message || ""}
              isError={!!errors.accomplishmentFamily}
              disabled={isFormDisabled}
              data-testid="fc-accomplishment-family"
            />
          )}
        />

        <Controller
          name="discussionTopics"
          control={control}
          render={({ field }) => (
            <FormTextArea
              {...field}
              labelText={`A concern or any other Topic(s) not related to the Family Consultation Treatment Plan discussed during the session`}
              placeholder="Enter here.."
              errorMessage={errors.discussionTopics?.message || ""}
              isError={!!errors.discussionTopics}
              disabled={isFormDisabled}
              data-testid="fc-discussion-topics"
            />
          )}
        />

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            data-testid="previous-section-button"
          >
            <DoubleArrowLeftIcon className="w-5 h-5" />
            Previous Section
          </Button>

          {!isFormDisabled && (
            <Button
              onClick={handleDraftSubmit}
              disabled={isSubmittingDraft}
              isLoading={isSubmittingDraft}
              variant="light"
              type="button"
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
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
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

export default FcFamilyDiscussion;
