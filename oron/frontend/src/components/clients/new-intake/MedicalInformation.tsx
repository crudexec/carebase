"use client";

import { useEffect, useState } from "react";
import Button from "@/components/button/Button";
import { useToast } from "@/components/ui/use-toast";
import {
  MedicalInformationSchema,
  MedicalInformationFormData,
} from "@/utils/schemas";
import { validationEngine, validateForm } from "@/utils/validators";
import FormTextArea from "@/components/input-fields/FormTextArea";
import { handleMedicalInformationSubmission } from "@/actions/clients/new-intake/medical-information";
import { IntakeType } from "@/types/IntakeForm";

const MedicalInformation = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  prevSectionId,
  handleChangeSectionid,
  intakeForm,
  isEditing,
  isViewing,
  refetch,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  prevSectionId: string;
  handleChangeSectionid: (newId: string) => void;
  intakeForm: IntakeType | undefined;
  isEditing?: boolean;
  isViewing?: boolean;
  refetch: any;
}) => {
  const { toast } = useToast();
  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });

  const [requestMethod, setRequestMethod] = useState<"POST" | "PATCH">("POST");
  const [isSavingToDraft, setIsSavingToDraft] = useState(false);

  useEffect(() => {
    if (
      intakeForm &&
      typeof intakeForm === "object" &&
      Object.keys(intakeForm).length > 0 &&
      intakeForm?.medical_information_id
    ) {
      setRequestMethod("PATCH");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intakeForm]);

  const handleSubmit = async (formData: FormData) => {
    if (isViewing) {
      handleChangeIndex(currentIndex + 1);
      return;
    }

    try {
      const diagnosis = formData.get("diagnosis") as string;
      const medicalHistoryAllergies = formData.get(
        "medicalHistoryAllergies"
      ) as string;
      const medications = formData.get("medications") as string;
      const otherComments = formData.get("otherComments") as string;

      const data: MedicalInformationFormData = {
        diagnosis,
        medicalHistoryAllergies,
        medications,
        otherComments,
      };

      if (isSavingToDraft === true) {
        const token = localStorage.getItem("token") as string;
        const response = await handleMedicalInformationSubmission(
          data,
          token,
          requestMethod,
          prevSectionId && prevSectionId?.length > 1
            ? prevSectionId
            : intakeForm?.more_about_information_id ?? "-",
          intakeForm?.medical_information_id ?? "-",
          intakeForm?.id ?? "-"
        );

        await refetch();

        setIsSavingToDraft(false);

        if (!response.status) {
          toast({
            variant: "destructive",
            description: response.errorMessage,
          });
          return;
        }

        toast({
          variant: "success",
          description: "Draft Saved Successfully",
        });
        return;
      }

      // const validationResult = validationEngine(
      //   data,
      //   validateForm,
      //   MedicalInformationSchema
      // );

      // if (validationResult.field.length > 0) {
      //   setError(validationResult);
      //   toast({
      //     variant: "destructive",
      //     description: "Please complete all required fields.",
      //   });
      //   return;
      // }

      setError({
        field: [],
        message: [],
      });

      const token = localStorage.getItem("token") as string;
      const response = await handleMedicalInformationSubmission(
        data,
        token,
        requestMethod,
        prevSectionId && prevSectionId?.length > 1
          ? prevSectionId
          : intakeForm?.more_about_information_id ?? "-",
        intakeForm?.medical_information_id ?? "-",
        intakeForm?.id ?? "-"
      );

      await refetch();

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleChangeSectionid(response.errorMessage);
      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  return (
    <form
      action={handleSubmit}
      className="flex-1 h-fit flex flex-col gap-10 lg:pl-10 mt-[5vh]"
    >
      <h3
        data-testid="medical-info-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Medical Information
      </h3>

      <div className="w-full flex flex-col gap-5 pb-20">
        <FormTextArea
          defaultValue={intakeForm?.medicalInformation?.diagnosis ?? ""}
          labelText="Diagnosis"
          placeholder="Enter here.."
          name="diagnosis"
          errorMessage={error.message.find((message) =>
            message.includes("Diagnosis")
          )}
          isError={!!error.field.find((field) => field.includes("Diagnosis"))}
          disabled={isViewing}
          data-testid="diagnosis-textarea"
        />

        <FormTextArea
          defaultValue={
            intakeForm?.medicalInformation?.medical_history_or_allergies ?? ""
          }
          labelText="Medical History/Allergies"
          placeholder="Enter here.."
          name="medicalHistoryAllergies"
          errorMessage={error.message.find((message) =>
            message.includes("Medical History/Allergies")
          )}
          isError={
            !!error.field.find((field) =>
              field.includes("Medical History/Allergies")
            )
          }
          disabled={isViewing}
          data-testid="medical-history-textarea"
        />

        <FormTextArea
          defaultValue={intakeForm?.medicalInformation?.medications ?? ""}
          labelText="Medications"
          placeholder="Enter here.."
          name="medications"
          errorMessage={error.message.find((message) =>
            message.includes("Medications")
          )}
          isError={!!error.field.find((field) => field.includes("Medications"))}
          disabled={isViewing}
          data-testid="medications-textarea"
        />

        <FormTextArea
          defaultValue={intakeForm?.medicalInformation?.other_comments ?? ""}
          labelText="Other Comments"
          placeholder="Enter here.."
          name="otherComments"
          errorMessage={error.message.find((message) =>
            message.includes("Other comments")
          )}
          isError={
            !!error.field.find((field) => field.includes("Other comments"))
          }
          disabled={isViewing}
          data-testid="other-comments-textarea"
        />
      </div>

      <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-full">
        <Button
          variant="light"
          onClick={() => handleChangeIndex(currentIndex - 1)}
          type="button"
          disabled={currentIndex === 1}
          data-testid="previous-section-button"
        >
          Previous Section
        </Button>

        {!isViewing && (
          <Button
            disabled={isViewing}
            variant="light"
            type="submit"
            onClick={() => {
              setIsSavingToDraft(true);
            }}
            data-testid="save-draft-button"
          >
            Save Draft
          </Button>
        )}

        <Button data-testid="next-section-button" type="submit">
          Next Section
        </Button>
      </div>
    </form>
  );
};

export default MedicalInformation;
