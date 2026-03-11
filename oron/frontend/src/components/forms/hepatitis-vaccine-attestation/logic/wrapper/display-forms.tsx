import Attestation from "../../view/Attestation";
import Information from "../../view/Information";
import { User } from "@/types/UserTypes";
import { MethodState } from "./useWrapperLogic";
import { HepatitisResponse } from "@/types/form-types/HepatitisFormTypes";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import ReviewAndSign from "../../view/ReviewAndSign";

const handleDisplayForm = (
  currentIndex: number,
  user: User,
  method: MethodState,
  completedSections: Set<number>,
  formInfo: HepatitisResponse | undefined | boolean,
  func: {
    handleNewCompletedSection: (newSection: number) => void;
    handleChangeIndex: (newIndex: number) => void;
    refetch: any;
    status: FormattedFormStatus;
    refetchFormStatus: any;
    suggestionOpen: boolean;
    handleToggleSuggestion: (status: boolean) => void;
  }
) => {
  const {
    handleNewCompletedSection,
    handleChangeIndex,
    refetch,
    status,
    refetchFormStatus,
    suggestionOpen,
    handleToggleSuggestion,
  } = func;

  let reviewNote: string;
  if (typeof formInfo === "boolean") {
    reviewNote = "";
  } else {
    reviewNote = formInfo?.data.hepatitisBFullForm.review_notes ?? "";
  }

  switch (currentIndex) {
    case 1:
      return (
        <Attestation
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          handleNewCompletedSection={handleNewCompletedSection}
          refetch={refetch}
          method={method.attestation}
          data={formInfo}
          formCompleted={completedSections.size === 2}
          status={status}
          reviewNote={reviewNote}
          informationMethod={method.information}
          user={user}
        />
      );
    case 2:
      return (
        <ReviewAndSign
          handleChangeIndex={handleChangeIndex}
          handleNewCompletedSection={handleNewCompletedSection}
          user={user}
          refetch={refetch}
          method={method.signature}
          data={formInfo}
          currentIndex={currentIndex}
          signatureDisabled={!completedSections.has(1)}
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
