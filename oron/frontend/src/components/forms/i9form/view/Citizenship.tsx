"use client";

import Button from "@/components/button/Button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useToast } from "@/components/ui/use-toast";
import FormInput from "@/components/input-fields/FormInput";
import { useState, useEffect } from "react";
import { handleI9FormCitizenshipSubmission } from "@/actions/forms";
import { INineFormResponse } from "@/types/form-types/FormTypes";
import { DatePicker } from "../../../calendar/CalendarSelect";
import { validationEngine, validateForm } from "@/utils/validators";
import {
  LawfulPermanentCitizenFormData,
  lawfulPermanentCitizenSchema,
  NonCitizenFormData,
  nonCitizenSchema,
} from "@/utils/schemas";
import useCustomMutation from "@/hooks/useCustomMutation";
import FormBanner from "@/components/banner/FormBanner";
import { formatDateToUTCString } from "@/utils/date-utils";

const Citizenship = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  data,
  method,
  refetch,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  data: boolean | INineFormResponse | undefined;
  method: "POST" | "PATCH";
  refetch: any;
}) => {
  const token = localStorage.getItem("token") as string;

  const { toast } = useToast();
  const [selectedCitizenship, setSelectedCitizenship] = useState("");
  const [expDate, setExpDate] = useState("");
  const [uscis, setUscis] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [passportNo, setPassportNo] = useState("");
  const [lawfulUscis, setLawfulUscis] = useState("");

  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });

  const formDisabled = false;

  useEffect(() => {
    if (data && typeof data !== "boolean" && data?.data?.citizenship) {
      const { citizenship } = data.data;
      if (Object.keys(citizenship).length > 0) {
        const {
          citizenship_status,
          uscis_number,
          work_license_expiry_date,
          i_94_number,
          foreign_passport_number,
        } = citizenship;

        setSelectedCitizenship(
          citizenship_status !== null ? citizenship_status : ""
        );

        if (citizenship_status === "A lawful permanent resident") {
          setLawfulUscis(uscis_number ?? "");
        } else {
          setUscis(uscis_number ?? "");
          setPassportNo(foreign_passport_number ?? "");
          setAdmissionNo(i_94_number ?? "");
          setExpDate(work_license_expiry_date ?? "");
        }
      }
    }
  }, [data]);

  const handleLawfulPermanentCitizen = () => {
    const data: LawfulPermanentCitizenFormData = {
      lawfulUscis: lawfulUscis ?? "",
    };

    const validationResult = validationEngine(
      data,
      validateForm,
      lawfulPermanentCitizenSchema
    );

    if (validationResult.field.length > 0) {
      setError(validationResult);
      return false;
    }

    return true;
  };

  function validateFields(
    uscis: string,
    admissionNo: string,
    passportNo: string
  ) {
    const errors: {
      field: string[];
      message: string[];
    } = {
      field: [],
      message: [],
    };

    const filledFields = [];
    if (uscis.length > 0) filledFields.push("USCIS / A-Number");
    if (admissionNo.length > 0) filledFields.push("Admission Number");
    if (passportNo.length > 0) filledFields.push("Passport Number");

    if (filledFields.length !== 1) {
      errors.field = filledFields;
      errors.message = filledFields.map(
        (field) => `${field} is filled, but only one can be filled.`
      );
      setError(errors);
      return false;
    }

    return true;
  }

  const handleAuthorizedCitizen = () => {
    if (
      typeof uscis === "undefined" &&
      typeof admissionNo === "undefined" &&
      typeof passportNo === "undefined"
    ) {
      setError({
        field: [
          "USCIS / A-Number must have at least 1 character",
          "Admission Number must have at least 1 character",
          "Passport Number must have at least 1 character",
        ],
        message: [
          "USCIS / A-Number must have at least 1 character",
          "Admission Number must have at least 1 character",
          "Passport Number must have at least 1 character",
        ],
      });
    }

    if (uscis.length < 1 && admissionNo.length < 1 && passportNo.length < 1) {
      setError({
        field: [
          "USCIS / A-Number must have at least 1 character",
          "Admission Number must have at least 1 character",
          "Passport Number must have at least 1 character",
        ],
        message: [
          "USCIS / A-Number must have at least 1 character",
          "Admission Number must have at least 1 character",
          "Passport Number must have at least 1 character",
        ],
      });
      return false;
    }

    const isValid = validateFields(
      uscis ?? "",
      admissionNo ?? "",
      passportNo ?? ""
    );
    if (!isValid) {
      toast({
        variant: "destructive",
        description: "Please choose only one option from the three field",
      });
      return false;
    }

    const data: NonCitizenFormData = {
      expDate,
      selection: {
        uscis,
        admissionNo,
        passportNo,
      },
    };

    const validationResult = validationEngine(
      data,
      validateForm,
      nonCitizenSchema
    );

    if (validationResult.field.length > 0) {
      setError(validationResult);
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (formData: FormData) => {
    if (formDisabled) {
      handleChangeIndex(currentIndex + 1);
      handleNewCompletedSection(currentIndex);
      return;
    }

    try {
      const selectedCitizenship = formData.get("selectedCitizenship") as string;

      if (!selectedCitizenship || selectedCitizenship.length === 0) {
        toast({
          variant: "destructive",
          description: "Select your citizenship",
        });
        return;
      }

      let valid = false;
      let requestBody: any = {
        citizenship_status: selectedCitizenship,
      };

      if (selectedCitizenship.includes("permanent")) {
        valid = handleLawfulPermanentCitizen();
        requestBody = {
          ...requestBody,
          uscis_number: lawfulUscis,
        };
      } else if (selectedCitizenship.includes("authorized")) {
        valid = handleAuthorizedCitizen();

        requestBody = {
          ...requestBody,
          uscis_number: uscis,
          work_license_expiry_date: expDate,
          i_94_number: admissionNo,
          foreign_passport_number: passportNo,
          foreign_passport_issuing_country: passportNo.split(" ")[1],
        };
      }

      if (
        valid ||
        (!selectedCitizenship.includes("permanent") &&
          !selectedCitizenship.includes("authorized"))
      ) {
        setError({
          field: [],
          message: [],
        });

        const response = await handleI9FormCitizenshipSubmission(
          requestBody,
          token,
          method
        );

        refetch();

        // Handle submission response
        if (!response.status) {
          toast({
            variant: "destructive",
            description: response.errorMessage,
          });
          return;
        }

        toast({
          variant: "success",
          description: "Responses Saved",
        });

        handleChangeIndex(currentIndex + 1);
        handleNewCompletedSection(currentIndex);
        return;
      }
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const { mutate } = useCustomMutation<FormData>(handleFormSubmit, [
    "i9form",
    "formData",
    "offerLetter",
  ]);

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCitizenship(e.target.value);
  };

  const getExpDate = (date: Date) => {
    setExpDate(formatDateToUTCString(date));
  };

  return (
    <form
      action={mutate}
      className="flex-1 h-fit lg:min-h-[90vh] lg:pb-[100px] flex flex-col gap-10 lg:pl-10 mt-[5vh]"
    >
      {formDisabled && (
        <FormBanner
          variant="warning"
          text="Your form has been submitted successfully and is now undergoing approval. We will notify you once the review process is complete. Please note that editing the form is no longer possible at this stage."
        />
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-[28px] font-[600] text-[#0F172A]">Citizenship</h2>
        <p className="text-[16px] font-[400] text-[#334155]">
          Select one of the following to attest to your citizenship or
          immigration status.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <RadioGroup
          disabled={formDisabled}
          defaultValue={
            typeof data !== "boolean"
              ? data?.data?.citizenship?.citizenship_status
              : ""
          }
          onChange={handleRadioChange}
          name="selectedCitizenship"
          className="gap-8"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              disabled={formDisabled}
              value="A citizen of the United States"
              id="citizen"
            />
            <Label
              className="text-[16px] font-[400] text-[#334155]"
              htmlFor="citizen"
            >
              A citizen of the United States
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              disabled={formDisabled}
              value="A noncitizen national of the United States"
              id="nonCitizen"
            />
            <Label
              className="text-[16px] font-[400] text-[#334155]"
              htmlFor="nonCitizen"
            >
              A noncitizen national of the United States
            </Label>

            <HoverCard>
              <HoverCardTrigger>
                <QuestionMarkCircledIcon className="cursor-pointer w-5 h-5 hover:text-black text-[#98A2B3]" />
              </HoverCardTrigger>
              <HoverCardContent className="bg-[#0F172A] w-[320px] text-white text-[12px] font-[500]">
                A noncitizen national of the United States: An individual born
                in American Samoa, certain former citizens of the former Trust
                Territory of the Pacific Islands, and certain children of
                noncitizen nationals born abroad.
              </HoverCardContent>
            </HoverCard>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem
              disabled={formDisabled}
              value="A lawful permanent resident"
              id="permanent"
            />
            <Label
              className="text-[16px] font-[400] text-[#334155]"
              htmlFor="permanent"
            >
              A lawful permanent resident
            </Label>
            <HoverCard>
              <HoverCardTrigger>
                <QuestionMarkCircledIcon className="cursor-pointer w-5 h-5 hover:text-black text-[#98A2B3]" />
              </HoverCardTrigger>
              <HoverCardContent className="bg-[#0F172A] w-[320px] text-white text-[12px] font-[500]">
                A lawful permanent resident: An individual who is not a U.S.
                citizen and who resides in the United States under legally
                recognized and lawfully recorded permanent residence as an
                immigrant. Conditional residents should select this status.
                Asylees and refugees should NOT select this status; they should
                instead select “A noncitizen authorized to work.”
              </HoverCardContent>
            </HoverCard>
          </div>

          <div
            className={`flex items-center space-x-2 ${
              selectedCitizenship === "A lawful permanent resident" &&
              "relative top-[150px] lg:top-[100px]"
            } `}
          >
            <RadioGroupItem
              disabled={formDisabled}
              value="A non-citizen authorized to work"
              id="authorized"
            />
            <Label
              className="text-[16px] font-[400] text-[#334155]"
              htmlFor="authorized"
            >
              A non-citizen (other than the points above) authorized to work
            </Label>
            <HoverCard>
              <HoverCardTrigger>
                <QuestionMarkCircledIcon className="cursor-pointer w-5 h-5 hover:text-black text-[#98A2B3]" />
              </HoverCardTrigger>
              <HoverCardContent className="bg-[#0F172A] w-[320px] text-white text-[12px] font-[500]">
                A noncitizen (other than Item Numbers 2. and 3. above)
                authorized to work: An individual who has authorization to work
                but is not a U.S. citizen, noncitizen national, or lawful
                permanent resident. In most cases, your employment authorization
                expiration date is found on the documentation evidencing your
                employment authorization. If your employment authorization
                documentation has been automatically extended by the issuing
                authority, enter the expiration date of the automatic extension
                in this space.
                <br /> <br />
                Refugees, asylees, and certain citizens of the Federated States
                of Micronesia, the Republic of the Marshall Islands, or Palau,
                and other noncitizens authorized to work whose employment
                authorization does not have an expiration date, should enter N/A
                in the Expiration Date field.
              </HoverCardContent>
            </HoverCard>
          </div>
        </RadioGroup>
      </div>

      {selectedCitizenship === "A lawful permanent resident" && (
        <div className="relative top-[-90px] lg:top-[-70px]">
          <FormInput
            disabled={formDisabled}
            name="lawfulUscis"
            placeholder="Enter USCIS or A- Number"
            type="text"
            labelText="USCIS / A- Number"
            isAuth={false}
            value={lawfulUscis}
            onChange={(e) => setLawfulUscis(e.target.value)}
            errorMessage={error.message.find((message) =>
              message.includes("Your USCIS")
            )}
            isError={
              !!error.field.find((field) => field.includes("Your USCIS"))
            }
          />
        </div>
      )}

      {selectedCitizenship === "A non-citizen authorized to work" && (
        <div className="flex flex-col gap-5">
          <DatePicker
            disabled={formDisabled}
            getDate={getExpDate}
            label="Exp. date (If any)"
            defaultDate={expDate?.length > 1 ? new Date(expDate) : undefined}
          />

          <h2 className="text-[18px] font-[600] text-[#0F172A] mt-2">
            Enter one of these
          </h2>

          <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
            <FormInput
              disabled={formDisabled}
              name="uscis"
              placeholder="Enter USCIS or A- Number"
              type="text"
              labelText="USCIS / A- Number"
              isAuth={false}
              value={uscis}
              onChange={(e) => setUscis(e.target.value)}
              errorMessage={error.message.find((message) =>
                message.includes("A-Number")
              )}
              isError={
                !!error.field.find((field) => field.includes("A-Number"))
              }
            />
            <FormInput
              disabled={formDisabled}
              name="admissionNo"
              placeholder="Enter form i-94 Admission Number"
              type="text"
              labelText="Form i-94 Admission Number"
              isAuth={false}
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value)}
              errorMessage={error.message.find((message) =>
                message.includes("Admission")
              )}
              isError={
                !!error.field.find((field) => field.includes("Admission"))
              }
            />
          </div>

          <FormInput
            disabled={formDisabled}
            name="passportNo"
            placeholder="Enter foreign passport number and country of issuance"
            type="text"
            labelText="Foreign Passport Number and Country of issuance"
            isAuth={false}
            value={passportNo}
            onChange={(e) => setPassportNo(e.target.value)}
            errorMessage={error.message.find((message) =>
              message.includes("Passport")
            )}
            isError={!!error.field.find((field) => field.includes("Passport"))}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
        {currentIndex !== 1 && (
          <Button
            onClick={() => handleChangeIndex(currentIndex - 1)}
            variant="light"
            type="button"
          >
            Previous Section
          </Button>
        )}

        {currentIndex !== 6 && <Button type="submit">Next Section</Button>}
      </div>
    </form>
  );
};

export default Citizenship;
