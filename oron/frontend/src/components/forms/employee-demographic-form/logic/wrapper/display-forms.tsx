import ReviewInformation from "../../view/ReviewInformation";
import PersonalInformation from "../../view/PersonalInformation";
import EmergencyContactInfo from "../../view/EmergencyContactInfo";
import { User } from "@/types/UserTypes";
import { MethodState } from "./useWrapperLogic";
import { EmployeeDemographicFormResponse } from "@/types/form-types/EmployeeDemographicFormTypes";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";

const handleDisplayForm = (
  currentIndex: number,
  user: User,
  method: MethodState,
  completedSections: Set<number>,
  formInfo: EmployeeDemographicFormResponse | undefined | boolean,
  justFilled: boolean,
  func: {
    handleNewCompletedSection: (newSection: number) => void;
    handleChangeIndex: (newIndex: number) => void;
    refetch: any;
    handleToggleSign: (status: boolean) => void;
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
    handleToggleSign,
    status,
    refetchFormStatus,
    suggestionOpen,
    handleToggleSuggestion,
  } = func;

  let reviewNote: string = "";

  if (typeof formInfo === "boolean") {
    reviewNote = "";
  } else {
    reviewNote =
      formInfo?.data?.employeeDemographicInformation?.review_notes ?? "";
  }

  switch (currentIndex) {
    case 1:
      return (
        <PersonalInformation
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          handleNewCompletedSection={handleNewCompletedSection}
          user={user}
          method={method.personalInformation}
          personalInformation={formInfo}
          refetch={refetch}
          status={status}
          reviewNote={reviewNote}
        />
      );
    case 2:
      return (
        <EmergencyContactInfo
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          handleNewCompletedSection={handleNewCompletedSection}
          method={method.emergencyContactInfo}
          contactInformation={formInfo}
          refetch={refetch}
          handleToggleSign={handleToggleSign}
        />
      );
    case 3:
      return (
        <ReviewInformation
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          handleNewCompletedSection={handleNewCompletedSection}
          formInfo={formInfo}
          method={method}
          justFilled={justFilled}
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
