import EmployeeInformation from "../../view/EmployeeInformation";
import VaccineInformation from "../../view/VaccineInformation";
import ReviewAndSign from "../../view/ReviewAndSign";
import { User } from "@/types/UserTypes";
import { MethodState } from "./useWrapperLogic";
import { FluVaccineFormResponse } from "@/types/form-types/FluVaccineFormTypes";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";

const handleDisplayForm = (
  currentIndex: number,
  user: User,
  method: MethodState,
  completedSections: Set<number>,
  formInfo: FluVaccineFormResponse | undefined | boolean,
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
    reviewNote = formInfo?.data.fluFullForm.review_notes ?? "";
  }

  switch (currentIndex) {
    case 1:
      return (
        <EmployeeInformation
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          handleNewCompletedSection={handleNewCompletedSection}
          user={user}
          refetch={refetch}
          method={method.employeeInformation}
          data={formInfo}
          formCompleted={completedSections.size === 3}
          status={status}
          reviewNote={reviewNote}
        />
      );
    case 2:
      return (
        <VaccineInformation
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          handleNewCompletedSection={handleNewCompletedSection}
          user={user}
          refetch={refetch}
          method={method.vaccineInformation}
          data={formInfo}
        />
      );
    case 3:
      return (
        <ReviewAndSign
          handleNewCompletedSection={handleNewCompletedSection}
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          user={user}
          refetch={refetch}
          method={method.signature}
          data={formInfo}
          signatureDisabled={
            !completedSections.has(1) || !completedSections.has(2)
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
