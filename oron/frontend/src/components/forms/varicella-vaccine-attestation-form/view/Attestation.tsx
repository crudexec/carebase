"use client";

import { useState, useEffect } from "react";
import FormInput from "@/components/input-fields/FormInput";
import Button from "@/components/button/Button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  VaricellaAttestationForm,
  VaricellaEmployeeInformation,
  VaricellaResponse,
} from "@/types/form-types/VaricellaFormTypes";
import {
  handleVaricellaAttestationFormSubmmision,
  handleVaricellaInformationFormSubmission,
} from "@/actions/forms";
import FormBanner from "@/components/banner/FormBanner";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { User } from "@/types/UserTypes";
import {
  PneumococcalVaccinationEmployeeInformationFormData,
  pneumococcalVaccinationEmployeeInformationSchema,
} from "@/utils/schemas";
import { validateForm, validationEngine } from "@/utils/validators";
import { formatDateToUTCString } from "@/utils/date-utils";

const Attestation = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  method,
  refetch,
  data,
  formCompleted,
  status,
  reviewNote,
  user,
  informationMethod,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  method: "POST" | "PATCH";
  refetch: any;
  data: VaricellaResponse | boolean | undefined;
  formCompleted: boolean;
  status: FormattedFormStatus;
  reviewNote: string;
  user: User;
  informationMethod: "POST" | "PATCH";
}) => {
  const [userSelectOther, setUserSelectOther] = useState<boolean>(false);

  let formDisabled = false;

  let attestation: VaricellaAttestationForm | undefined;
  if (typeof data === "boolean") {
    attestation = undefined;
  } else {
    if (
      data?.data?.status === "awaiting_approval" ||
      data?.data?.status === "approved"
    ) {
      formDisabled = true;
    }

    attestation = data?.data.varicellaAttestationForm;
  }

  let information: VaricellaEmployeeInformation | undefined;
  if (typeof data === "boolean") {
    information = undefined;
  } else {
    if (
      data?.data?.status === "awaiting_approval" ||
      data?.data?.status === "approved"
    ) {
      formDisabled = true;
    }

    information = data?.data.varicellaEmployeeInformation;
  }

  const [options, setOptions] = useState<string[]>(() => {
    const initialOptions: string[] = [];

    if (attestation) {
      if (attestation.had_chicken_pox) {
        initialOptions.push("I already have had chickenpox");
      }
      if (attestation.will_not_contract_chicken_pox) {
        initialOptions.push("I do not think I will contract chickenpox");
      }
      if (attestation.chicken_pox_not_serious_disease) {
        initialOptions.push("I do not think chickenpox is a serious disease");
      }
      if (attestation.side_effects_from_chicken_pox_vaccine) {
        initialOptions.push(
          "I had side effects when I was vaccinated against chickenpox in the past"
        );
      }
      if (attestation.will_stay_home_if_infected) {
        initialOptions.push(
          "I will stay home if I get chickenpox so I will not spread it to patients or colleagues"
        );
      }
      if (attestation.other && attestation.other.length > 1) {
        initialOptions.push("other");
      }
    }

    return initialOptions;
  });

  const { toast } = useToast();
  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });

  useEffect(() => {
    if (attestation && attestation.other) {
      setUserSelectOther(attestation.other.length > 1);
    }
  }, [attestation]);

  const handleSubmit = async (formData: FormData) => {
    if (formDisabled) {
      handleChangeIndex(currentIndex + 1);
      handleNewCompletedSection(currentIndex);
      return;
    }

    try {
      const token = localStorage.getItem("token") as string;

      const other = formData.get("other") as string;

      const lastName = formData.get("lastName") as string;
      const firstName = formData.get("firstName") as string;
      const jobTitle = "";

      const data: PneumococcalVaccinationEmployeeInformationFormData = {
        lastName,
        firstName,
        jobTitle,
        todayDate: formatDateToUTCString(new Date()),
      };

      const validationResult = validationEngine(
        data,
        validateForm,
        pneumococcalVaccinationEmployeeInformationSchema
      );

      if (validationResult.field.length > 0) {
        setError(validationResult);
        toast({
          variant: "destructive",
          description: "Please complete all required fields.",
        });
        return;
      }

      if (options.length === 0) {
        setError({
          field: ["option"],
          message: ["option"],
        });
        toast({
          variant: "destructive",
          description: "Please complete all required fields.",
        });
        return;
      }

      if (options.includes("other") && !other) {
        setError({
          field: ["other"],
          message: ["Please specify here"],
        });
        toast({
          variant: "destructive",
          description: "Please complete all required fields.",
        });
        return;
      }

      setError({
        field: [],
        message: [],
      });

      const informationResponse =
        await handleVaricellaInformationFormSubmission(
          data,
          token,
          informationMethod
        );

      if (!informationResponse.status) {
        toast({
          variant: "destructive",
          description: informationResponse.errorMessage,
        });
        return;
      }

      refetch();

      const response = await handleVaricellaAttestationFormSubmmision(
        options,
        token,
        other,
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

      handleChangeIndex(currentIndex + 1);
      handleNewCompletedSection(currentIndex);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  return (
    <section className="flex-1 h-fit lg:pb-[150px] lg:min-h-[70vh] flex flex-col gap-10 lg:pl-10 mt-[5vh]">
      {status === "Awaiting Approval" && (
        <FormBanner
          variant="success"
          text="Your Varicella Vaccine Attestation Form has been successfully submitted. We'll notify you once it's approved."
        />
      )}

      {status === "Correction Required" && (
        <FormBanner variant="warning" text={reviewNote} />
      )}

      <form className="flex flex-col gap-10" action={handleSubmit}>
        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <FormInput
            disabled={formDisabled}
            defaultValue={information?.last_name ?? user?.data.last_name ?? ""}
            name="lastName"
            placeholder="Doe"
            type="text"
            labelText="Last Name (Family Name)"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Last")
            )}
            isError={!!error.field.find((field) => field.includes("Last"))}
          />
          <FormInput
            disabled={formDisabled}
            defaultValue={
              information?.first_name ?? user?.data.first_name ?? ""
            }
            name="firstName"
            placeholder="Sandra"
            type="text"
            labelText="First Name (Given Name)"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("First")
            )}
            isError={!!error.field.find((field) => field.includes("First"))}
          />
        </div>

        <div className="flex flex-col gap-5">
          <h3 className="text-[#0F172A] text-[18px] font-[600]">Attestation</h3>
          <p className="text-[#334155] text-[16px] font-[400]">
            I have read, or have had read to me, information concerning the
            varicella vaccine, and I have had an opportunity to ask questions
            about it. I understand the benefits and risks of varicella
            vaccination as described. However, I do not want the vaccine at this
            time. I also understand that, because I work in a health care
            environment, I may put patients and co-workers at risk if I work
            while infected with varicella (chickenpox).
            <br />
            <br />
            By declining this vaccine, I acknowledge that I will be at risk of
            acquiring varicella and spreading it to others. Reason(s) I do not
            wish to take the vaccine.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-[#0F172A] text-[16px] font-[500]">
            Check All That Apply
          </p>

          <div className="flex items-center gap-2 rounded-md">
            <Checkbox
              id="1"
              disabled={formDisabled}
              defaultChecked={
                options.includes("I already have had chickenpox") ||
                attestation?.had_chicken_pox
              }
              onCheckedChange={(e) => {
                if (
                  e === true &&
                  !options.includes("I already have had chickenpox")
                ) {
                  setOptions([...options, "I already have had chickenpox"]);
                } else {
                  setOptions((prevOptions) =>
                    prevOptions.filter(
                      (option) => option !== "I already have had chickenpox"
                    )
                  );
                }
              }}
            />
            <Label
              htmlFor="1"
              className={`text-[16px] font-[400] text-[#09090B] ${
                error.field.find((field) => field.includes("option")) &&
                "text-[#EF4444]"
              } `}
            >
              I already have had chickenpox
            </Label>
          </div>

          <div className="flex items-center gap-2 rounded-md">
            <Checkbox
              id="2"
              disabled={formDisabled}
              defaultChecked={
                options.includes("I do not think I will contract chickenpox") ||
                attestation?.will_not_contract_chicken_pox
              }
              onCheckedChange={(e) => {
                if (
                  e === true &&
                  !options.includes("I do not think I will contract chickenpox")
                ) {
                  setOptions([
                    ...options,
                    "I do not think I will contract chickenpox",
                  ]);
                } else {
                  setOptions((prevOptions) =>
                    prevOptions.filter(
                      (option) =>
                        option !== "I do not think I will contract chickenpox"
                    )
                  );
                }
              }}
            />
            <Label
              htmlFor="2"
              className={`text-[16px] font-[400] text-[#09090B] ${
                error.field.find((field) => field.includes("option")) &&
                "text-[#EF4444]"
              } `}
            >
              I do not think I will contract chickenpox
            </Label>
          </div>

          <div className="flex items-center gap-2 rounded-md">
            <Checkbox
              id="3"
              disabled={formDisabled}
              defaultChecked={
                options.includes(
                  "I do not think chickenpox is a serious disease"
                ) || attestation?.chicken_pox_not_serious_disease
              }
              onCheckedChange={(e) => {
                if (
                  e === true &&
                  !options.includes(
                    "I do not think chickenpox is a serious disease"
                  )
                ) {
                  setOptions([
                    ...options,
                    "I do not think chickenpox is a serious disease",
                  ]);
                } else {
                  setOptions((prevOptions) =>
                    prevOptions.filter(
                      (option) =>
                        option !==
                        "I do not think chickenpox is a serious disease"
                    )
                  );
                }
              }}
            />
            <Label
              htmlFor="3"
              className={`text-[16px] font-[400] text-[#09090B] ${
                error.field.find((field) => field.includes("option")) &&
                "text-[#EF4444]"
              } `}
            >
              I do not think chickenpox is a serious disease
            </Label>
          </div>
          <div className="flex items-center gap-2 rounded-md">
            <Checkbox
              id="4"
              disabled={formDisabled}
              defaultChecked={
                options.includes(
                  "I had side effects when I was vaccinated against chickenpox in the past"
                ) || attestation?.side_effects_from_chicken_pox_vaccine
              }
              onCheckedChange={(e) => {
                if (
                  e === true &&
                  !options.includes(
                    "I had side effects when I was vaccinated against chickenpox in the past"
                  )
                ) {
                  setOptions([
                    ...options,
                    "I had side effects when I was vaccinated against chickenpox in the past",
                  ]);
                } else {
                  setOptions((prevOptions) =>
                    prevOptions.filter(
                      (option) =>
                        option !==
                        "I had side effects when I was vaccinated against chickenpox in the past"
                    )
                  );
                }
              }}
            />
            <Label
              htmlFor="4"
              className={`text-[16px] font-[400] text-[#09090B] ${
                error.field.find((field) => field.includes("option")) &&
                "text-[#EF4444]"
              } `}
            >
              I had side effects when I was vaccinated against chickenpox in the
              past
            </Label>
          </div>
          <div className="flex items-center gap-2 rounded-md">
            <Checkbox
              id="5"
              disabled={formDisabled}
              defaultChecked={
                options.includes(
                  "I will stay home if I get chickenpox so I will not spread it to patients or colleagues"
                ) || attestation?.will_stay_home_if_infected
              }
              onCheckedChange={(e) => {
                if (
                  e === true &&
                  !options.includes(
                    "I will stay home if I get chickenpox so I will not spread it to patients or colleagues"
                  )
                ) {
                  setOptions([
                    ...options,
                    "I will stay home if I get chickenpox so I will not spread it to patients or colleagues",
                  ]);
                } else {
                  setOptions((prevOptions) =>
                    prevOptions.filter(
                      (option) =>
                        option !==
                        "I will stay home if I get chickenpox so I will not spread it to patients or colleagues"
                    )
                  );
                }
              }}
            />
            <Label
              htmlFor="5"
              className={`text-[16px] font-[400] text-[#09090B] ${
                error.field.find((field) => field.includes("option")) &&
                "text-[#EF4444]"
              } `}
            >
              I will stay home if I get chickenpox so I will not spread it to
              patients or colleagues
            </Label>
          </div>
          <div className="flex items-center gap-2 rounded-md">
            <Checkbox
              id="6"
              disabled={formDisabled}
              defaultChecked={
                !!(
                  options.includes("other") ||
                  (attestation?.other && attestation?.other?.length > 1)
                )
              }
              onCheckedChange={(e) => {
                setUserSelectOther(!userSelectOther);
                if (e === true && !options.includes("other")) {
                  setOptions([...options, "other"]);
                } else {
                  setOptions((prevOptions) =>
                    prevOptions.filter((option) => option !== "other")
                  );
                }
              }}
            />
            <Label
              htmlFor="6"
              className={`text-[16px] font-[400] text-[#09090B] ${
                error.field.find((field) => field.includes("option")) &&
                "text-[#EF4444]"
              } `}
            >
              Other
            </Label>
          </div>

          {userSelectOther && (
            <div className="xl:ml-5">
              <FormInput
                disabled={formDisabled}
                defaultValue={attestation?.other ?? ""}
                name="other"
                placeholder="Please specify"
                type="text"
                labelText=""
                isAuth={false}
                errorMessage={error.message.find((message) =>
                  message.includes("specify")
                )}
                isError={!!error.field.find((field) => field.includes("other"))}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
            <Button
              onClick={() => handleChangeIndex(currentIndex - 1)}
              type="button"
              disabled={currentIndex === 1}
              variant="light"
            >
              Previous Section
            </Button>

            {currentIndex !== 3 && <Button type="submit">Next Section</Button>}
          </div>
        </div>
      </form>
    </section>
  );
};

export default Attestation;
