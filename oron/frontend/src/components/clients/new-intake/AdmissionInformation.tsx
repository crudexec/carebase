"use client";

import { useEffect, useState } from "react";
import Button from "@/components/button/Button";
import FormInput from "@/components/input-fields/FormInput";
import { DatePicker } from "../../calendar/CalendarSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AdmissionInformationSchema,
  AdmissionInformationFormData,
} from "@/utils/schemas";
import { validationEngine, validateForm } from "@/utils/validators";
import { handleAdmissionInformationSubmission } from "@/actions/clients/new-intake/admission-information";
import { IntakeType } from "@/types/IntakeForm";
import { capitalizeFirstLetter } from "@/utils";
import { cleanCurrencyInput, formatCurrency } from "@/utils/helpers";
import FormSelect from "@/components/input-fields/FormSelect";
import { formatDateToUTCString } from "@/utils/date-utils";

export type WaiverService = {
  select_waiver_system: string;
  service_start_date: string;
  service_end_date: string;
  amount_per_day_week_month: string;
  amount_per_year: string;
};

const AdmissionInformation = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  prevSectionId,
  intakeForm,
  isEditing,
  isViewing,
  refetch,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  prevSectionId: string;
  intakeForm: IntakeType | undefined;
  isEditing?: boolean;
  isViewing?: boolean;
  refetch: any;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });

  const [requestMethod, setRequestMethod] = useState<"POST" | "PATCH">("POST");
  const [pocStartDate, setPocStartDate] = useState<string>("");
  const [pocEndDate, setPocEndDate] = useState<string>("");
  const [waiverServices, setWaiverServices] = useState<WaiverService[]>([
    {
      select_waiver_system: "",
      service_start_date: "",
      service_end_date: "",
      amount_per_day_week_month: "",
      amount_per_year: "",
    },
  ]);
  const [isSavingToDraft, setIsSavingToDraft] = useState(false);

  useEffect(() => {
    if (
      intakeForm &&
      typeof intakeForm === "object" &&
      Object.keys(intakeForm).length > 0 &&
      intakeForm?.admission_information_id
    ) {
      setPocStartDate(intakeForm?.admissionInformation?.poc_start_date ?? "");
      setPocEndDate(intakeForm?.admissionInformation?.poc_end_date ?? "");

      if (intakeForm?.waiverService) {
        if (intakeForm?.waiverService?.length > 0) {
          const returnedWaiverService = intakeForm?.waiverService?.map(
            (item) => {
              return {
                select_waiver_system: item.select_waiver_system,
                service_start_date: item.service_start_date,
                service_end_date: item.service_end_date,
                amount_per_day_week_month: item.amount_per_day_week_month,
                amount_per_year: item.amount_per_year,
              };
            }
          );

          setWaiverServices(returnedWaiverService);
        }
      }

      setRequestMethod("PATCH");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intakeForm]);

  const addWaiverService = () => {
    setWaiverServices([
      ...waiverServices,
      {
        select_waiver_system: "",
        service_start_date: "",
        service_end_date: "",
        amount_per_day_week_month: "",
        amount_per_year: "",
      },
    ]);
  };

  const handleChangeWaiverService = (
    index: number,
    field: keyof WaiverService,
    value: string
  ) => {
    const updatedServices = [...waiverServices];

    const cleanedValue = cleanCurrencyInput(value);

    updatedServices[index] = {
      ...updatedServices[index],
      [field]:
        field === "amount_per_day_week_month" || field === "amount_per_year"
          ? cleanedValue
          : value,
    };

    setWaiverServices(updatedServices);
  };

  const handleSubmit = async (formData: FormData) => {
    if (isViewing) {
      handleChangeIndex(currentIndex + 1);
      return;
    }

    try {
      const pocAuthorizationNumber = formData.get(
        "pocAuthorizationNumber"
      ) as string;

      const data: AdmissionInformationFormData = {
        pocAuthorizationNumber,
        pocStartDate,
        pocEndDate,
      };

      if (isSavingToDraft === true) {
        const token = localStorage.getItem("token") as string;
        const response = await handleAdmissionInformationSubmission(
          data,
          waiverServices,
          token,
          requestMethod,
          prevSectionId && prevSectionId?.length > 1
            ? prevSectionId
            : intakeForm?.medical_information_id ?? "-",
          intakeForm?.admission_information_id ?? "-",
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
      //   AdmissionInformationSchema
      // );

      // if (validationResult.field.length > 0) {
      //   setError(validationResult);
      //   toast({
      //     variant: "destructive",
      //     description: "Please complete all required fields.",
      //   });
      //   return;
      // }

      // if (waiverServices.length === 0) {
      //   setError({
      //     field: ["services"],
      //     message: ["services"],
      //   });
      //   toast({
      //     variant: "destructive",
      //     description: "Please add at least one waiver service",
      //   });
      //   return;
      // }

      // const invalidServiceIndex = waiverServices.findIndex(
      //   (service) =>
      //     service.select_waiver_system.trim() === "" ||
      //     service.service_start_date.trim() === "" ||
      //     service.service_end_date.trim() === "" ||
      //     service.amount_per_day_week_month.trim() === "" ||
      //     service.amount_per_year.trim() === ""
      // );

      // if (invalidServiceIndex !== -1) {
      //   setError({
      //     field: ["services"],
      //     message: ["services"],
      //   });
      //   toast({
      //     variant: "destructive",
      //     description: `Waiver service ${
      //       invalidServiceIndex + 1
      //     } data is incomplete. Please fill in all fields.`,
      //   });
      //   return;
      // }

      setError({
        field: [],
        message: [],
      });

      const token = localStorage.getItem("token") as string;
      const response = await handleAdmissionInformationSubmission(
        data,
        waiverServices,
        token,
        requestMethod,
        prevSectionId && prevSectionId?.length > 1
          ? prevSectionId
          : intakeForm?.medical_information_id ?? "-",
        intakeForm?.admission_information_id ?? "-",
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

      handleNewCompletedSection(8);

      if (isEditing) {
        toast({
          variant: "success",
          description: `Intake has been updated successfully`,
        });
      } else {
        toast({
          variant: "success",
          description: `Intake ${capitalizeFirstLetter(
            `${intakeForm?.clientInformation?.first_name} ${intakeForm?.clientInformation?.last_name}`
          )} has been added successfully`,
        });
      }

      if (isViewing || isEditing) {
        router.push(`/admin/clients/${intakeForm?.id}`);
      } else {
        router.push("/admin/clients");
      }
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const getPOCStartDate = (date: Date) => {
    setPocStartDate(formatDateToUTCString(date));
  };
  const getPOCEndDate = (date: Date) => {
    setPocEndDate(formatDateToUTCString(date));
  };

  return (
    <form
      action={handleSubmit}
      className="flex-1 h-fit flex flex-col gap-10 lg:pl-10 mt-[5vh]"
      data-testid="admission-form"
    >
      <h3
        className="text-[#0F172A] text-[24px] font-[600]"
        data-testid="admission-info-header"
      >
        Admission Information
      </h3>

      <div className="flex flex-col gap-5">
        <FormInput
          defaultValue={
            intakeForm?.admissionInformation?.poc_authorization_number ?? ""
          }
          name="pocAuthorizationNumber"
          placeholder="Enter POC Authorization Number"
          type="text"
          labelText="POC Authorization Number"
          isAuth={false}
          errorMessage={error.message.find((message) =>
            message.includes("POC Authorization Number")
          )}
          isError={
            !!error.field.find((field) =>
              field.includes("POC Authorization Number")
            )
          }
          disabled={isViewing}
          data-testid="poc-authorization-input"
        />

        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <DatePicker
            defaultDate={
              pocStartDate.length > 1 ? new Date(pocStartDate) : undefined
            }
            errorMessage={error.message.find((message) =>
              message.includes("POC Start Date")
            )}
            isError={
              !!error.field.find((field) => field.includes("POC Start Date"))
            }
            label="POC Start Date"
            getDate={getPOCStartDate}
            disabled={isViewing}
            data-testid="poc-start-date-picker"
          />
          <DatePicker
            defaultDate={
              pocEndDate.length > 1 ? new Date(pocEndDate) : undefined
            }
            errorMessage={error.message.find((message) =>
              message.includes("POC End Date")
            )}
            isError={
              !!error.field.find((field) => field.includes("POC End Date"))
            }
            label="POC End Date (Day before recertification)"
            getDate={getPOCEndDate}
            disabled={isViewing}
            data-testid="poc-end-date-picker"
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 pb-[5vh]">
        <h3
          className={`text-[#0F172A] text-[24px] font-[600] ${
            !!error.field.find((field) => field.includes("services")) &&
            "text-[#EF4444]"
          } `}
          data-testid="service-section-title"
        >
          Service
        </h3>

        {waiverServices.map((service, index) => (
          <div
            key={service.select_waiver_system}
            className="flex flex-col gap-5 border-[1px] border-[#EAECF0] shadow-md p-5 rounded-[12px]"
            data-testid={`service-${index}`}
          >
            <FormSelect
              disabled={isViewing}
              defaultValue={service.select_waiver_system ?? ""}
              onValueChange={(e) =>
                handleChangeWaiverService(index, "select_waiver_system", e)
              }
              labelText={`Select Waiver Service ${index + 1}`}
              selectContent={[
                {
                  label: "Therapeutic Services (TI)",
                  value: "Therapeutic Services (TI)",
                },
                {
                  label: "Family Training (FT)",
                  value: "Family Training (FT)",
                },
                {
                  label: "IISS",
                  value: "IISS",
                },
                {
                  label: "Respite",
                  value: "Respite",
                },
              ]}
              placeholder="Select"
              data-testid={`service-select-${index}`}
            />

            <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
              <DatePicker
                defaultDate={
                  service.service_start_date.length > 1
                    ? new Date(service.service_start_date)
                    : undefined
                }
                label="Start Date"
                getDate={(date) =>
                  handleChangeWaiverService(
                    index,
                    "service_start_date",
                    formatDateToUTCString(date)
                  )
                }
                disabled={isViewing}
                data-testid={`service-start-date-picker-${index}`}
              />
              <DatePicker
                defaultDate={
                  service.service_end_date.length > 1
                    ? new Date(service.service_end_date)
                    : undefined
                }
                label="End Date"
                getDate={(date) =>
                  handleChangeWaiverService(
                    index,
                    "service_end_date",
                    formatDateToUTCString(date)
                  )
                }
                disabled={isViewing}
                data-testid={`service-end-date-picker-${index}`}
              />
            </div>
            <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
              <FormInput
                name={`amountPerDayWeekMonth${index}`}
                placeholder="$0.00"
                type="text"
                labelText="Amount Per Day/Week/Month"
                value={formatCurrency(service.amount_per_day_week_month)}
                onChange={(e) =>
                  handleChangeWaiverService(
                    index,
                    "amount_per_day_week_month",
                    formatCurrency(e.target.value)
                  )
                }
                isAuth={false}
                disabled={isViewing}
                data-testid={`amount-per-day-week-month-${index}`}
              />
              <FormInput
                name={`amountPerYear${index}`}
                placeholder="$0.00"
                type="text"
                labelText="Amount Per Year"
                value={formatCurrency(service.amount_per_year)}
                onChange={(e) =>
                  handleChangeWaiverService(
                    index,
                    "amount_per_year",
                    formatCurrency(e.target.value)
                  )
                }
                isAuth={false}
                disabled={isViewing}
                data-testid={`amount-per-year-${index}`}
              />
            </div>
          </div>
        ))}

        {!isViewing && (
          <Button
            disabled={isViewing}
            type="button"
            variant="light"
            onClick={addWaiverService}
            data-testid="add-waiver-service-button"
          >
            <PlusIcon className={`${isViewing && "text-gray-400"} w-5 h-5`} />
            Add Waiver Service
          </Button>
        )}
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

        {!isViewing && currentIndex === 8 && (
          <Button type="submit" data-testid={`submit-button-${intakeForm?.id}`}>
            {intakeForm?.status === "active" ? "Update" : "Save"}
          </Button>
        )}
      </div>
    </form>
  );
};

export default AdmissionInformation;
