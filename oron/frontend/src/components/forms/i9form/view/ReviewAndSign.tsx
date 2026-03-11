"use client";

import { useState } from "react";
import Button from "@/components/button/Button";
import { EditIcon } from "lucide-react";
import Image from "next/image";
import { DotFilledIcon } from "@radix-ui/react-icons";
import {
  INineFormResponse,
  PersonalInformation,
  Citizenship,
  Document,
  FormattedFormStatus,
} from "@/types/form-types/FormTypes";
import Signature from "./Signature";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import FormBanner from "@/components/banner/FormBanner";
import { submitForm } from "@/actions/forms/submit-form";
import FormSuggestionDialog from "@/components/FormSuggestionDialog";

const ReviewAndSign = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  data,
  signatureMethod,
  refetch,
  signatureDisabled,
  status,
  refetchFormStatus,
  suggestionOpen,
  handleToggleSuggestion,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  data: boolean | INineFormResponse | undefined;
  signatureMethod: "POST" | "PATCH";
  refetch: any;
  signatureDisabled: boolean;
  status: FormattedFormStatus;
  refetchFormStatus: any;
  suggestionOpen: boolean;
  handleToggleSuggestion: (status: boolean) => void;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const token = localStorage.getItem("token") as string;
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  let personalInformation: PersonalInformation | undefined;
  let citizenship: Citizenship | undefined;
  let document: Document | Document[] | undefined;

  if (typeof data === "boolean" || !data) {
    personalInformation = undefined;
    citizenship = undefined;
    document = undefined;
  } else {
    personalInformation = data?.data.personalInformation;
    citizenship = data?.data.citizenship;
    document = data.data.documents;
  }

  const getListName = (index: number): string => {
    let listName = "";

    if (Array.isArray(document)) {
      if (document.length === 2) {
        listName = index === 0 ? "List B Document" : "List C Document";
      } else if (index === 0) {
        listName = "List A Document";
      } else if (index === 1) {
        listName = "List B Document";
      } else {
        listName = "List C Document";
      }
    }
    return listName;
  };

  return (
    <section className="flex-1 h-fit flex flex-col gap-5 lg:pl-10  mt-[5vh]">
      {openModal && (
        <FormSuggestionDialog
          formName="i - 9 Form"
          openModal={openModal}
          closeModal={() => setOpenModal(false)}
          formId="i9"
        />
      )}

      {signatureMethod !== "PATCH" && (
        <FormBanner
          variant="warning"
          text="Review your responses carefully. You will not be able to edit this form after submission"
        />
      )}

      {signatureMethod === "PATCH" && (
        <FormBanner
          variant="warning"
          text="Your form has been submitted successfully and is now undergoing approval. We will notify you once the review process is complete. Please note that editing the form is no longer possible at this stage."
        />
      )}

      <Signature
        handleNewCompletedSection={handleNewCompletedSection}
        data={data}
        method={signatureMethod}
        refetch={refetch}
        signatureDisabled={signatureDisabled}
        status={status}
      />

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
            signatureDisabled ||
            status === "Awaiting Approval" ||
            status === "Approved" ||
            isLoading
            // ||            signatureMethod === "POST"
          }
          onClick={async () => {
            setIsLoading(true);
            const response = await submitForm(token, "i9form");

            refetchFormStatus();

            if (!response.status) {
              toast({
                variant: "destructive",
                description: response.errorMessage,
              });
              setIsLoading(false);
              return;
            }

            handleToggleSuggestion(true);
            setOpenModal(true);
          }}
          type="button"
        >
          Submit
        </Button>
      </div>
    </section>
  );
};

export const PreReview = ({
  handleChangeIndex,
  personalInformation,
  citizenship,
  getListName,
  document,
}: any) => {
  return (
    <>
      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 mt-[5vh] h-fit py-10 p-5 rounded-[12px]">
        <div className="flex justify-between items-center flex-wrap gap-5">
          <h2 className="text-[18px] font-[600] text-[#0F172A]">
            Personal Information
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
                Last Name (Family Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {personalInformation?.last_name ?? "-"}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Middle Initial (If any)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {" "}
                {personalInformation?.middle_name ?? "-"}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Email Address
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {personalInformation?.email ?? "-"}
              </p>
            </div>
          </div>

          <div className="flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                First Name (Given Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {personalInformation?.first_name ?? "-"}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Other last names used (if any)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {" "}
                {personalInformation?.other_last_name ?? "-"}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Phone Number
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {personalInformation?.phone ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-[17px] font-[700] text-[#0F172A]">Address</h2>
          <p className="text-[14px] font-[400] text-[#0F172A]">
            {personalInformation?.address ?? "-"}
          </p>
        </div>

        <div className="xl:w-[66%] flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Apartment Number (If any)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {personalInformation?.apartment_number ?? "-"}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">State</h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {personalInformation?.state ?? "-"}
              </p>
            </div>
          </div>

          <div className="flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                City Or Town
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {personalInformation?.city ?? "-"}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Zip Code
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {personalInformation?.zip_code ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-[17px] font-[700] text-[#0F172A]">
            US Social Security number
          </h2>
          <p className="text-[14px] font-[400] text-[#0F172A]">
            {personalInformation?.social_security_number ?? "-"}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-5 border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 h-fit py-10 p-5 rounded-[12px]">
        <div className="flex justify-between items-center flex-wrap gap-5">
          <h2 className="text-[18px] font-[600] text-[#0F172A]">Citzenship</h2>
          <button
            onClick={() => handleChangeIndex(3)}
            className="text-[14px] font-[500] text-[#2563EB] flex items-center gap-1"
          >
            Edit <EditIcon className="w-4 h-4 text-[#2563EB]" />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-[17px] font-[700] text-[#0F172A]">
            Select one of the following to attest to your citizenship or
            immigration status.
          </h2>
          <p className="text-[14px] font-[400] text-[#0F172A]">
            {citizenship?.citizenship_status ?? "-"}
          </p>
        </div>

        {citizenship?.uscis_number && (
          <ul
            style={{
              listStyleType: "disc",
              paddingLeft: "1.5em",
            }}
            className="list-disc pl-3"
          >
            <li className="flex items-start gap-1">
              <DotFilledIcon className="w-5 h-5 mt-1" />
              <div className="flex flex-col gap-1">
                <h2 className="text-[17px] font-[700] text-[#0F172A]">
                  USCIS / A- Number
                </h2>
                <p className="text-[14px] font-[400] text-[#0F172A]">
                  {citizenship?.uscis_number ?? "-"}
                </p>
              </div>
              {citizenship?.work_license_expiry_date && (
                <div className="flex flex-col gap-1">
                  <h2 className="text-[17px] font-[700] text-[#0F172A]">
                    Exp. date
                  </h2>
                  <p className="text-[14px] font-[400] text-[#0F172A]">
                    {citizenship?.work_license_expiry_date ?? "-"}
                  </p>
                </div>
              )}
              {citizenship?.i_94_number && (
                <div className="flex flex-col gap-1">
                  <h2 className="text-[17px] font-[700] text-[#0F172A]">
                    Form i-94 Admission Number
                  </h2>
                  <p className="text-[14px] font-[400] text-[#0F172A]">
                    {citizenship?.i_94_number ?? "-"}
                  </p>
                </div>
              )}
              {citizenship?.foreign_passport_number && (
                <div className="flex flex-col gap-1">
                  <h2 className="text-[17px] font-[700] text-[#0F172A]">
                    Foreign Passport Number and Country of issuance
                  </h2>
                  <p className="text-[14px] font-[400] text-[#0F172A]">
                    {citizenship?.foreign_passport_number ?? "-"}
                  </p>
                </div>
              )}
            </li>
          </ul>
        )}
      </div>
      <div className="flex flex-col gap-5 border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 h-fit py-10 p-5 rounded-[12px]">
        <div className="flex justify-between items-center flex-wrap gap-5">
          <h2 className="text-[18px] font-[600] text-[#0F172A]">Documents</h2>
          <button
            onClick={() => handleChangeIndex(4)}
            className="text-[14px] font-[500] text-[#2563EB] flex items-center gap-1"
          >
            Edit <EditIcon className="w-4 h-4 text-[#2563EB]" />
          </button>
        </div>
        <div className="flex flex-col gap-6">
          {Array.isArray(document) ? (
            document.map((item, index) => (
              <div className="flex flex-col gap-3" key={item.id}>
                <h2 className="text-[17px] font-[700] text-[#0F172A]">
                  {getListName(index)}
                </h2>
                <div className="xl:w-[480px] h-[60px] p-5 flex items-center gap-5 border-[1px] border-[#E4E4E7] rounded-[12px]">
                  <Image
                    src="/assets/images/dashboard/fileIcon.svg"
                    width={30}
                    height={30}
                    alt="file icon"
                  />
                  <span className="text-[14px] font-[600] text-[#2563EB]">
                    {item?.title ?? "-"}
                  </span>
                  <a
                    className="text-gray-400 hover:text-black ml-auto text-[13px] font-[400] underline"
                    href={item?.file_url}
                    target="_blank"
                  >
                    View in another page
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div>
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                List A Document
              </h2>
              <div className="xl:w-[480px] h-[60px] p-5 flex items-center gap-5 border-[1px] border-[#E4E4E7] rounded-[12px]">
                <Image
                  src="/assets/images/dashboard/fileIcon.svg"
                  width={30}
                  height={30}
                  alt="file icon"
                />
                <span className="text-[14px] font-[600] text-[#2563EB]">
                  {document?.title ?? "-"}
                </span>

                <a
                  className="text-gray-400 hover:text-black ml-auto text-[13px] font-[400] underline"
                  href={document?.file_url}
                  target="_blank"
                >
                  View in another page
                </a>
              </div>
            </div>
          )}
        </div>
      </div>{" "}
    </>
  );
};
export default ReviewAndSign;
