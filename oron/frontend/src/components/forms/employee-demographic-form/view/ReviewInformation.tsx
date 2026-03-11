"use client";

import Button from "@/components/button/Button";
import { EditIcon } from "lucide-react";
import { EmployeeDemographicFormResponse } from "@/types/form-types/EmployeeDemographicFormTypes";
import { useRouter } from "next/navigation";
import { useToast } from "../../../ui/use-toast";
import FormBanner from "@/components/banner/FormBanner";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { useState } from "react";
import { submitForm } from "@/actions/forms/submit-form";
import { formatDate } from "@/utils";
import FormSuggestionDialog from "@/components/FormSuggestionDialog";

const ReviewInformation = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  formInfo,
  method,
  justFilled,
  status,
  refetchFormStatus,
  suggestionOpen,
  handleToggleSuggestion,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  formInfo: boolean | EmployeeDemographicFormResponse | undefined;
  method: {
    personalInformation: "POST" | "PATCH";
    emergencyContactInfo: "POST" | "PATCH";
  };
  justFilled: boolean;
  status: FormattedFormStatus;
  refetchFormStatus: any;
  suggestionOpen: boolean;
  handleToggleSuggestion: (status: boolean) => void;
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const token = localStorage.getItem("token") as string;
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  let processedForm: EmployeeDemographicFormResponse | undefined;

  if (typeof formInfo === "boolean") {
    processedForm = undefined;
  } else {
    processedForm = formInfo;
  }

  return (
    <section className="flex-1 h-fit flex flex-col gap-10 lg:pl-10 lg:mt-[5vh]">
      {openModal && (
        <FormSuggestionDialog
          formName="Employee Demographic Form"
          openModal={openModal}
          closeModal={() => setOpenModal(false)}
          formId="employeeDemographic"
        />
      )}

      {method.emergencyContactInfo === "POST" &&
        method.personalInformation === "POST" && (
          <FormBanner
            variant="warning"
            text="Review your responses carefully. You will not be able to edit this form after submission"
          />
        )}

      {status === "Awaiting Approval" && (
        <FormBanner
          variant="warning"
          text="Your form has been submitted successfully and is now undergoing approval. We will notify you once the review process is complete. Please note that editing the form is no longer possible at this stage."
        />
      )}

      <h2 className="text-[18px] font-[600] text-[#0F172A] mt-5">
        Review Information
      </h2>

      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 h-fit py-10 p-5 rounded-[12px]">
        <div className="flex justify-between items-center flex-wrap gap-5">
          <h2 className="text-[18px] font-[600] text-[#0F172A]">
            Personal Information
          </h2>
          <button
            onClick={() => handleChangeIndex(1)}
            className="text-[14px] font-[500] text-[#2563EB] flex items-center gap-1"
          >
            Edit <EditIcon className="w-4 h-4 text-[#2563EB]" />
          </button>
        </div>

        <div className="xl:w-[80%] flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Last Name (Family Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {processedForm?.data?.employeeDemographicInformation
                  ?.last_name ?? "-"}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Social Security Number
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {processedForm?.data?.employeeDemographicInformation
                  ?.social_security_number ?? "-"}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Cell Phone Number
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {processedForm?.data?.employeeDemographicInformation?.phone ??
                  "-"}
              </p>
            </div>
          </div>

          <div className="flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                First Name (Given Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {" "}
                {processedForm?.data?.employeeDemographicInformation
                  ?.first_name ?? "-"}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Date of Birth
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {processedForm?.data?.employeeDemographicInformation
                  ?.date_of_birth
                  ? formatDate(
                      new Date(
                        processedForm?.data?.employeeDemographicInformation?.date_of_birth
                      )
                    )
                  : "-"}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Home Phone Number
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {processedForm?.data?.employeeDemographicInformation
                  ?.home_phone_number ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-[17px] font-[700] text-[#0F172A]">
            Street Address
          </h2>
          <p className="text-[14px] font-[400] text-[#0F172A]">
            {processedForm?.data?.employeeDemographicInformation
              ?.street_address ?? "-"}
          </p>
        </div>

        <div className="flex flex-col gap-5 xl:w-full lg:justify-self-center lg:grid lg:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-[17px] font-[700] text-[#0F172A]">City</h2>
            <p className="text-[14px] font-[400] text-[#0F172A]">
              {" "}
              {processedForm?.data?.employeeDemographicInformation?.city ?? "-"}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-[17px] font-[700] text-[#0F172A]">State</h2>
            <p className="text-[14px] font-[400] text-[#0F172A]">
              {" "}
              {processedForm?.data?.employeeDemographicInformation?.state ??
                "-"}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-[17px] font-[700] text-[#0F172A]">Zip Code</h2>
            <p className="text-[14px] font-[400] text-[#0F172A]">
              {" "}
              {processedForm?.data?.employeeDemographicInformation?.zip_code ??
                "-"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-[17px] font-[700] text-[#0F172A]">
            Race And Ethnicity
          </h2>
          <p className="text-[14px] font-[400] text-[#0F172A]">
            {processedForm?.data?.employeeDemographicInformation
              ?.race_or_ethinicity ?? "-"}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-[17px] font-[700] text-[#0F172A]">Gender</h2>
          <p className="text-[14px] font-[400] text-[#0F172A]">
            {" "}
            {processedForm?.data?.employeeDemographicInformation?.gender ?? "-"}
          </p>
        </div>
      </div>

      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 mt-[5vh] h-fit py-10 p-5 rounded-[12px]">
        <div className="flex justify-between items-center flex-wrap gap-5">
          <h2 className="text-[18px] font-[600] text-[#0F172A]">
            Emergency Contact Information
          </h2>
          <button
            onClick={() => handleChangeIndex(2)}
            className="text-[14px] font-[500] text-[#2563EB] flex items-center gap-1"
          >
            Edit <EditIcon className="w-4 h-4 text-[#2563EB]" />
          </button>
        </div>

        <div className="xl:w-[80%] flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                First Name (Given Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {" "}
                {processedForm?.data?.emergencyContactInformation?.first_name ??
                  "-"}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Phone Number
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {processedForm?.data?.emergencyContactInformation?.phone ?? "-"}
              </p>
            </div>
          </div>

          <div className="flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Last Name (Family Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {" "}
                {processedForm?.data?.emergencyContactInformation?.last_name ??
                  "-"}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Relationship To Employee
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {" "}
                {processedForm?.data?.emergencyContactInformation
                  ?.relationship_to_employee ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-[17px] font-[700] text-[#0F172A]">
            Street Address
          </h2>
          <p className="text-[14px] font-[400] text-[#0F172A]">
            {processedForm?.data?.emergencyContactInformation?.street_address ??
              "-"}
          </p>
        </div>

        <div className="flex flex-col gap-5 xl:w-full lg:justify-self-center lg:grid lg:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-[17px] font-[700] text-[#0F172A]">City</h2>
            <p className="text-[14px] font-[400] text-[#0F172A]">
              {" "}
              {processedForm?.data?.emergencyContactInformation?.city ?? "-"}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-[17px] font-[700] text-[#0F172A]">State</h2>
            <p className="text-[14px] font-[400] text-[#0F172A]">
              {" "}
              {processedForm?.data?.emergencyContactInformation?.state ?? "-"}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-[17px] font-[700] text-[#0F172A]">Zip Code</h2>
            <p className="text-[14px] font-[400] text-[#0F172A]">
              {" "}
              {processedForm?.data?.emergencyContactInformation?.zip_code ??
                "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-5 justify-end mt-auto pt-20">
        {currentIndex !== 1 && (
          <Button
            onClick={() => handleChangeIndex(currentIndex - 1)}
            variant="light"
            type="button"
          >
            Previous Section
          </Button>
        )}

        <Button
          disabled={
            method.personalInformation === "POST" ||
            method.emergencyContactInfo === "POST" ||
            status === "Awaiting Approval" ||
            status === "Approved" ||
            isLoading
          }
          onClick={async () => {
            setIsLoading(true);
            const response = await submitForm(token, "employeeform");

            refetchFormStatus();

            if (!response.status) {
              toast({
                variant: "destructive",
                description: response.errorMessage,
              });
              setIsLoading(false);
              return;
            }

            setIsLoading(false);
            handleToggleSuggestion(true);
            setOpenModal(true);
          }}
          type="button"
        >
          Submit Form
        </Button>
      </div>
    </section>
  );
};

export default ReviewInformation;
