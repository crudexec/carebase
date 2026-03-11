import Instructions from "../../view/Instructions";
import PersonalInformation from "../../view/PersonalInformation";
import Citizenship from "../../view/Citizenship";
import Documents from "../../view/Documents";
import ReviewAndSign from "../../view/ReviewAndSign";
import { User } from "@/types/UserTypes";
import { MethodState } from "./useWrapperLogic";
import {
  FormattedFormStatus,
  INineFormResponse,
} from "@/types/form-types/FormTypes";
import I9FormPDFForm from "../../view/i9FormPDFForm";
import UploadINindeForm from "../../view/UploadINindeForm";

const handleDisplayForm = (
  currentIndex: number,
  user: User,
  method: MethodState,
  completedSections: Set<number>,
  formInfo: INineFormResponse | undefined | boolean,
  status: FormattedFormStatus,
  func: {
    handleNewCompletedSection: (newSection: number) => void;
    handleChangeIndex: (newIndex: number) => void;
    refetch: any;
    refetchFormStatus: any;
    suggestionOpen: boolean;
    handleToggleSuggestion: (status: boolean) => void;
  }
) => {
  const {
    handleNewCompletedSection,
    handleChangeIndex,
    refetch,
    refetchFormStatus,
    suggestionOpen,
    handleToggleSuggestion,
  } = func;

  let reviewNote: string;

  if (typeof formInfo === "boolean") {
    reviewNote = "";
  } else {
    reviewNote = formInfo?.data?.i9Form?.review_notes ?? "";
  }

  switch (currentIndex) {
    case 1:
      return (
        <Instructions
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          handleNewCompletedSection={handleNewCompletedSection}
          formCompleted={completedSections.size === 4}
          status={status}
          reviewNote={reviewNote}
        />
      );
    case 2:
      return (
        <I9FormPDFForm
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          handleNewCompletedSection={handleNewCompletedSection}
          pdfInfo={formInfo}
          user={user}
          method={method.stepOne}
          refetch={refetch}
          status={status}
          reviewNote={reviewNote}
        />
      );

    case 3:
      return (
        <Documents
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          handleNewCompletedSection={handleNewCompletedSection}
          data={formInfo}
          method={method.stepThree}
          refetch={refetch}
        />
      );

    case 4:
      return (
        <ReviewAndSign
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          handleNewCompletedSection={handleNewCompletedSection}
          data={formInfo}
          signatureMethod={method.stepTwo}
          refetch={refetch}
          signatureDisabled={
            !completedSections.has(1) ||
            !completedSections.has(2) ||
            !completedSections.has(3)
          }
          status={status}
          refetchFormStatus={refetchFormStatus}
          suggestionOpen={suggestionOpen}
          handleToggleSuggestion={handleToggleSuggestion}
        />
      );

    default:
      return null;
  }
};

export { handleDisplayForm };
