"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import MotherContact from "./MotherContact";
import Button from "@/components/button/Button";
import FatherContact from "./FatherContact";
import EmergencyContact from "./EmergencyContact";
import SchoolContactInformation from "./SchoolContactInformation";
import {
  ContactSchema,
  ContactFormData,
  ParentContactFormData,
  SchoolContactFormData,
} from "@/utils/schemas";
import { validationEngine, validateForm } from "@/utils/validators";
import { useToast } from "@/components/ui/use-toast";
import { handleContactFormSubmission } from "@/actions/clients/new-intake/contact-information";
import { IntakeType } from "@/types/IntakeForm";
import { formatPhoneNumber } from "@/utils/helpers";

const ContactInformation = ({
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

  const [motherContactForm, setMotherContactForm] =
    useState<ParentContactFormData>({
      contactFirstName: "",
      contactLastName: "",
      relationship: "",
      email: "",
      streetAddress: "",
      country: "US",
      state: "",
      city: "",
      apartmentNumber: "",
      zipCode: "",
      cellPhone: "",
      homePhone: "",
      workPhone: "",
    });

  const [fatherContactForm, setFatherContactForm] =
    useState<ParentContactFormData>({
      contactFirstName: "",
      contactLastName: "",
      relationship: "",
      email: "",
      streetAddress: "",
      country: "US",
      state: "",
      city: "",
      apartmentNumber: "",
      zipCode: "",
      cellPhone: "",
      homePhone: "",
      workPhone: "",
    });

  const [emergencyContactForm, setEmergencyContactForm] =
    useState<ParentContactFormData>({
      contactFirstName: "",
      contactLastName: "",
      relationship: "",
      email: "",
      streetAddress: "",
      country: "US",
      state: "",
      city: "",
      apartmentNumber: "",
      zipCode: "",
      cellPhone: "",
      homePhone: "",
      workPhone: "",
    });

  const [schoolContactForm, setSchoolContactForm] =
    useState<SchoolContactFormData>({
      nameOfSchool: "",
      schoolAddress: "",
      telephone: "",
      emailAddress: "",
      contactPerson: "",
    });

  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });

  const [requestMethod, setRequestMethod] = useState<"POST" | "PATCH">("POST");
  const [isSavingToDraft, setIsSavingToDraft] = useState(false);

  const prefillMotherContact = useCallback(() => {
    setMotherContactForm({
      contactFirstName: intakeForm?.motherContactInformation?.first_name ?? "",
      contactLastName: intakeForm?.motherContactInformation?.last_name ?? "",
      relationship: intakeForm?.motherContactInformation?.relationship ?? "",
      email: intakeForm?.motherContactInformation?.email ?? "",
      streetAddress:
        intakeForm?.motherContactInformation?.street_number_and_house_address ??
        "",
      country: intakeForm?.motherContactInformation?.country ?? "US",
      state: intakeForm?.motherContactInformation?.state ?? "",
      city: intakeForm?.motherContactInformation?.city ?? "",
      apartmentNumber:
        intakeForm?.motherContactInformation?.apartment_number ?? "",
      zipCode: intakeForm?.motherContactInformation?.zip_code ?? "",
      cellPhone: formatPhoneNumber(
        intakeForm?.motherContactInformation?.phone ?? ""
      ),
      homePhone: formatPhoneNumber(
        intakeForm?.motherContactInformation?.home_phone_number ?? ""
      ),
      workPhone: formatPhoneNumber(
        intakeForm?.motherContactInformation?.work_phone_number ?? ""
      ),
    });
  }, [intakeForm]);

  const prefillFatherContact = useCallback(() => {
    setFatherContactForm({
      contactFirstName: intakeForm?.fatherContactInformation?.first_name ?? "",
      contactLastName: intakeForm?.fatherContactInformation?.last_name ?? "",
      relationship: intakeForm?.fatherContactInformation?.relationship ?? "",
      email: intakeForm?.fatherContactInformation?.email ?? "",
      streetAddress:
        intakeForm?.fatherContactInformation?.street_number_and_house_address ??
        "",
      country: intakeForm?.fatherContactInformation?.country ?? "US",
      state: intakeForm?.fatherContactInformation?.state ?? "",
      city: intakeForm?.fatherContactInformation?.city ?? "",
      apartmentNumber:
        intakeForm?.fatherContactInformation?.apartment_number ?? "",
      zipCode: intakeForm?.fatherContactInformation?.zip_code ?? "",
      cellPhone: formatPhoneNumber(
        intakeForm?.fatherContactInformation?.phone ?? ""
      ),
      homePhone: formatPhoneNumber(
        intakeForm?.fatherContactInformation?.home_phone_number ?? ""
      ),
      workPhone: formatPhoneNumber(
        intakeForm?.fatherContactInformation?.work_phone_number ?? ""
      ),
    });
  }, [intakeForm]);

  const prefillEmergencyContact = useCallback(() => {
    setEmergencyContactForm({
      contactFirstName:
        intakeForm?.emergencyContactInformation?.first_name ?? "",
      contactLastName: intakeForm?.emergencyContactInformation?.last_name ?? "",
      relationship: intakeForm?.emergencyContactInformation?.relationship ?? "",
      email: intakeForm?.emergencyContactInformation?.email ?? "",
      streetAddress:
        intakeForm?.emergencyContactInformation
          ?.street_number_and_house_address ?? "",
      country: intakeForm?.emergencyContactInformation?.country ?? "US",
      state: intakeForm?.emergencyContactInformation?.state ?? "",
      city: intakeForm?.emergencyContactInformation?.city ?? "",
      apartmentNumber:
        intakeForm?.emergencyContactInformation?.apartment_number ?? "",
      zipCode: intakeForm?.emergencyContactInformation?.zip_code ?? "",
      cellPhone: formatPhoneNumber(
        intakeForm?.emergencyContactInformation?.phone ?? ""
      ),
      homePhone: formatPhoneNumber(
        intakeForm?.emergencyContactInformation?.home_phone_number ?? ""
      ),
      workPhone: formatPhoneNumber(
        intakeForm?.emergencyContactInformation?.work_phone_number ?? ""
      ),
    });
  }, [intakeForm]);

  const prefillSchoolContact = useCallback(() => {
    setSchoolContactForm({
      nameOfSchool: intakeForm?.schoolContactInformation?.name_of_school ?? "",
      schoolAddress: intakeForm?.schoolContactInformation?.school_address ?? "",
      telephone: formatPhoneNumber(
        intakeForm?.schoolContactInformation?.phone ?? ""
      ),
      emailAddress: intakeForm?.schoolContactInformation?.school_email ?? "",
      contactPerson: intakeForm?.schoolContactInformation?.contact_person ?? "",
    });
  }, [intakeForm]);

  useEffect(() => {
    if (
      intakeForm &&
      typeof intakeForm === "object" &&
      Object.keys(intakeForm).length > 0 &&
      intakeForm?.mother_contact_information_id &&
      intakeForm?.father_contact_information_id &&
      intakeForm?.emergency_contact_information_id &&
      intakeForm?.school_contact_information_id
    ) {
      prefillMotherContact();
      prefillFatherContact();
      prefillEmergencyContact();
      prefillSchoolContact();
      setRequestMethod("PATCH");
    }
  }, [
    prefillMotherContact,
    prefillFatherContact,
    prefillEmergencyContact,
    prefillSchoolContact,
    intakeForm,
  ]);

  const prefillFatherAddressWithMotherAddress = useCallback(
    (state: boolean) => {
      if (state === true) {
        setFatherContactForm((prevState) => ({
          ...prevState,
          streetAddress: motherContactForm.streetAddress,
          country: motherContactForm.country,
          state: motherContactForm.state,
          city: motherContactForm.city,
          apartmentNumber: motherContactForm.apartmentNumber,
          zipCode: motherContactForm.zipCode,
          homePhone: motherContactForm.homePhone,
        }));
      } else {
        setFatherContactForm((prevState) => ({
          ...prevState,
          streetAddress: "",
          country: "US",
          state: "",
          city: "",
          apartmentNumber: "",
          zipCode: "",
          cellPhone: "",
          homePhone: "",
          workPhone: "",
        }));
      }
    },
    [motherContactForm]
  );

  const prefillMotherAddressWithIntake = useCallback(
    (state: boolean) => {
      if (state === true) {
        setMotherContactForm((prevState) => ({
          ...prevState,
          streetAddress: intakeForm?.clientInformation?.address_or_street ?? "",
          country: intakeForm?.clientInformation?.country ?? "",
          state: intakeForm?.clientInformation?.state ?? "",
          city: intakeForm?.clientInformation?.city ?? "",
          apartmentNumber:
            intakeForm?.clientInformation?.apartment_number?.toString() ?? "",
          zipCode: intakeForm?.clientInformation?.zip_code?.toString() ?? "",
        }));
      } else {
        setMotherContactForm((prevState) => ({
          ...prevState,
          streetAddress: "",
          country: "US",
          state: "",
          city: "",
          apartmentNumber: "",
          zipCode: "",
        }));
      }
    },
    [intakeForm]
  );

  const handleChange = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement> | string,
      section: keyof ContactFormData,
      field: keyof ParentContactFormData | keyof SchoolContactFormData
    ) => {
      if (event && section && field) {
        let value: string;
        if (typeof event === "string") {
          value = event;
        } else {
          value = event.target.value;
        }

        const isPhoneField =
          field === "cellPhone" ||
          field === "homePhone" ||
          field === "workPhone" ||
          field === "telephone";

        if (section === "motherContact") {
          setMotherContactForm((prevState) => ({
            ...prevState,
            [field]: isPhoneField ? formatPhoneNumber(value) : value,
          }));
        } else if (section === "fatherContact") {
          setFatherContactForm((prevState) => ({
            ...prevState,
            [field]: isPhoneField ? formatPhoneNumber(value) : value,
          }));
        } else if (section === "emergencyContact") {
          setEmergencyContactForm((prevState) => ({
            ...prevState,
            [field]: isPhoneField ? formatPhoneNumber(value) : value,
          }));
        } else if (section === "schoolContact") {
          setSchoolContactForm((prevState) => ({
            ...prevState,
            [field]: isPhoneField ? formatPhoneNumber(value) : value,
          }));
        }
      }
    },
    []
  );

  const handleSubmit = async () => {
    if (isViewing) {
      handleChangeIndex(currentIndex + 1);
      return;
    }

    const data: ContactFormData = {
      motherContact: motherContactForm,
      fatherContact: fatherContactForm,
      emergencyContact: emergencyContactForm,
      schoolContact: schoolContactForm,
    };

    if (isSavingToDraft) {
      const token = localStorage.getItem("token") as string;
      const response = await handleContactFormSubmission(
        data,
        token,
        requestMethod,
        prevSectionId && prevSectionId?.length > 1
          ? prevSectionId
          : intakeForm?.intake_information_id ?? "-",
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
    //   ContactSchema
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

    const response = await handleContactFormSubmission(
      data,
      token,
      requestMethod,
      prevSectionId && prevSectionId?.length > 1
        ? prevSectionId
        : intakeForm?.intake_information_id ?? "-",
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
  };

  const MotherContactMemo = useMemo(
    () => (
      <MotherContact
        formData={motherContactForm}
        handleChange={handleChange}
        error={error}
        isViewing={isViewing}
        prefillMotherAddressWithIntake={prefillMotherAddressWithIntake}
      />
    ),
    [
      motherContactForm,
      handleChange,
      error,
      isViewing,
      prefillMotherAddressWithIntake,
    ]
  );

  const FatherContactMemo = useMemo(
    () => (
      <FatherContact
        formData={fatherContactForm}
        handleChange={handleChange}
        error={error}
        prefillFatherAddressWithMotherAddress={
          prefillFatherAddressWithMotherAddress
        }
        isViewing={isViewing}
      />
    ),
    [
      fatherContactForm,
      handleChange,
      error,
      prefillFatherAddressWithMotherAddress,
      isViewing,
    ]
  );

  const EmergencyContactMemo = useMemo(
    () => (
      <EmergencyContact
        formData={emergencyContactForm}
        handleChange={handleChange}
        error={error}
        isViewing={isViewing}
      />
    ),
    [emergencyContactForm, handleChange, error, isViewing]
  );

  const SchoolContactInformationMemo = useMemo(
    () => (
      <SchoolContactInformation
        formData={schoolContactForm}
        handleChange={handleChange}
        error={error}
        isViewing={isViewing}
      />
    ),
    [schoolContactForm, handleChange, error, isViewing]
  );

  return (
    <form
      action={handleSubmit}
      className="flex-1 h-fit flex flex-col gap-10 lg:pl-10 mt-[5vh]"
    >
      <div className="flex flex-col gap-10 lg:pb-[10vh]">
        {MotherContactMemo}
        {FatherContactMemo}
        {EmergencyContactMemo}
        {SchoolContactInformationMemo}
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

export default ContactInformation;
