"use client";

import { useState, useEffect } from "react";
import FormInput from "@/components/input-fields/FormInput";
import Button from "@/components/button/Button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  MMRAttestationForm,
  MMREmployeeInformation,
  MMRFormResponse,
} from "@/types/form-types/MMRFormTypes";
import {
  handleMMRAttestationSubmmision,
  handleMMRInformationSubmission,
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
  informationMethod,
  refetch,
  data,
  formCompleted,
  status,
  reviewNote,
  user,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  method: "POST" | "PATCH";
  informationMethod: "POST" | "PATCH";
  refetch: any;
  data: MMRFormResponse | boolean | undefined;
  formCompleted: boolean;
  status: FormattedFormStatus;
  reviewNote: string;
  user: User;
}) => {
  const [userSelectOther, setUserSelectOther] = useState<boolean>(false);

  let formDisabled = false;

  let attestation: MMRAttestationForm | undefined;
  if (typeof data === "boolean") {
    attestation = undefined;
  } else {
    if (
      data?.data?.status === "awaiting_approval" ||
      data?.data?.status === "approved"
    ) {
      formDisabled = true;
    }

    attestation = data?.data.mmrAttestationForm;
  }

  const [options, setOptions] = useState<string[]>(() => {
    const initialOptions: string[] = [];

    if (attestation) {
      if (attestation.do_not_think_will_contract_mumps) {
        initialOptions.push(
          "I do not think I will contract measles, mumps, and/or rubella"
        );
      }
      if (attestation.do_not_think_serious_disease) {
        initialOptions.push("I do not think these are serious illnesses");
      }
      if (attestation.side_effects_from_vaccine) {
        initialOptions.push(
          "I had side effects after I received the vaccine in the past"
        );
      }
      if (attestation.will_stay_home_if_infected) {
        initialOptions.push(
          "I will stay home if I get any of these illnesses so I will not spread it to patients or colleagues past"
        );
      }
      if (attestation.other) {
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

      const informationResponse = await handleMMRInformationSubmission(
        data,
        token,
        informationMethod
      );

      refetch();

      if (!informationResponse.status) {
        toast({
          variant: "destructive",
          description: informationResponse.errorMessage,
        });
        return;
      }

      const response = await handleMMRAttestationSubmmision(
        options,
        other,
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

      handleChangeIndex(currentIndex + 1);
      handleNewCompletedSection(currentIndex);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  let information: MMREmployeeInformation | undefined;
  if (typeof data === "boolean") {
    information = undefined;
  } else {
    information = data?.data.mmrEmployeeInformation;
  }

  return (
    <form
      action={handleSubmit}
      className="flex-1 h-fit lg:pb-[150px] lg:min-h-[70vh] flex flex-col gap-10 lg:pl-10 mt-[5vh]"
    >
      {!formCompleted && status === "Not Filled" && (
        <FormBanner text="Review prefilled fields to make sure they are correct for this form " />
      )}

      {status === "Awaiting Approval" && (
        <FormBanner
          variant="success"
          text="Your MMR Vaccine Attestation Form has been successfully submitted. We'll notify you once it's approved."
        />
      )}

      {status === "Correction Required" && (
        <FormBanner variant="warning" text={reviewNote} />
      )}

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
          defaultValue={information?.first_name ?? user?.data.first_name ?? ""}
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
          I have read, or have had read to me, information concerning the MMR
          vaccine, and I have had an opportunity to ask questions about it. I
          understand the benefits and risks of MMR vaccination as described.
          However, I do not want the vaccine given to me.
          <br />
          <br />I also understand that, because I work in a health care
          environment, I may place patients and co-workers at risk if I work
          while infected with measles, mumps, and/or rubella (German measles).
          <br />
          <br />
          By declining this vaccine, I acknowledge that I will be at risk of
          acquiring measles, mumps, and/or rubella and spreading it to others.
          Reason(s) I do not wish to take the vaccine.
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
              options.includes(
                "I do not think I will contract measles, mumps, and/or rubella"
              ) || attestation?.do_not_think_will_contract_mumps
            }
            onCheckedChange={(e) => {
              if (
                e === true &&
                !options.includes(
                  "I do not think I will contract measles, mumps, and/or rubella"
                )
              ) {
                setOptions([
                  ...options,
                  "I do not think I will contract measles, mumps, and/or rubella",
                ]);
              } else {
                setOptions((prevOptions) =>
                  prevOptions.filter(
                    (option) =>
                      option !==
                      "I do not think I will contract measles, mumps, and/or rubella"
                  )
                );
              }
            }}
          />
          <Label
            className={`text-[16px] font-[400] text-[#09090B] ${
              error.field.find((field) => field.includes("option")) &&
              "text-[#EF4444]"
            } `}
            htmlFor="1"
          >
            I do not think I will contract measles, mumps, and/or rubella
          </Label>
        </div>

        <div className="flex items-center gap-2 rounded-md">
          <Checkbox
            id="2"
            disabled={formDisabled}
            defaultChecked={
              options.includes("I do not think these are serious illnesses") ||
              attestation?.do_not_think_serious_disease
            }
            onCheckedChange={(e) => {
              if (
                e === true &&
                !options.includes("I do not think these are serious illnesses")
              ) {
                setOptions([
                  ...options,
                  "I do not think these are serious illnesses",
                ]);
              } else {
                setOptions((prevOptions) =>
                  prevOptions.filter(
                    (option) =>
                      option !== "I do not think these are serious illnesses"
                  )
                );
              }
            }}
          />
          <Label
            className={`text-[16px] font-[400] text-[#09090B] ${
              error.field.find((field) => field.includes("option")) &&
              "text-[#EF4444]"
            } `}
            htmlFor="2"
          >
            I do not think these are serious illnesses
          </Label>
        </div>

        <div className="flex items-center gap-2 rounded-md">
          <Checkbox
            id="3"
            disabled={formDisabled}
            defaultChecked={
              options.includes(
                "I had side effects after I received the vaccine in the past"
              ) || attestation?.side_effects_from_vaccine
            }
            onCheckedChange={(e) => {
              if (
                e === true &&
                !options.includes(
                  "I had side effects after I received the vaccine in the past"
                )
              ) {
                setOptions([
                  ...options,
                  "I had side effects after I received the vaccine in the past",
                ]);
              } else {
                setOptions((prevOptions) =>
                  prevOptions.filter(
                    (option) =>
                      option !==
                      "I had side effects after I received the vaccine in the past"
                  )
                );
              }
            }}
          />
          <Label
            className={`text-[16px] font-[400] text-[#09090B] ${
              error.field.find((field) => field.includes("option")) &&
              "text-[#EF4444]"
            } `}
            htmlFor="3"
          >
            I had side effects after I received the vaccine in the past
          </Label>
        </div>
        <div className="flex items-center gap-2 rounded-md">
          <Checkbox
            id="4"
            disabled={formDisabled}
            defaultChecked={
              options.includes(
                "I will stay home if I get any of these illnesses so I will not spread it to patients or colleagues past"
              ) || attestation?.will_stay_home_if_infected
            }
            onCheckedChange={(e) => {
              if (
                e === true &&
                !options.includes(
                  "I will stay home if I get any of these illnesses so I will not spread it to patients or colleagues past"
                )
              ) {
                setOptions([
                  ...options,
                  "I will stay home if I get any of these illnesses so I will not spread it to patients or colleagues past",
                ]);
              } else {
                setOptions((prevOptions) =>
                  prevOptions.filter(
                    (option) =>
                      option !==
                      "I will stay home if I get any of these illnesses so I will not spread it to patients or colleagues past"
                  )
                );
              }
            }}
          />
          <Label
            className={`text-[16px] font-[400] text-[#09090B] ${
              error.field.find((field) => field.includes("option")) &&
              "text-[#EF4444]"
            } `}
            htmlFor="4"
          >
            I will stay home if I get any of these illnesses so I will not
            spread it to patients or colleagues past
          </Label>
        </div>

        <div className="flex items-center gap-2 rounded-md">
          <Checkbox
            id="5"
            disabled={formDisabled}
            defaultChecked={
              options.includes("other") ||
              (attestation?.other && attestation?.other?.length > 1)
                ? true
                : undefined
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
            className={`text-[16px] font-[400] text-[#09090B] ${
              error.field.find((field) => field.includes("option")) &&
              "text-[#EF4444]"
            } `}
            htmlFor="5"
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

          {currentIndex !== 2 && <Button type="submit">Next Section</Button>}
        </div>
      </div>
    </form>
  );
};

export default Attestation;
