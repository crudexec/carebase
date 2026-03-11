"use client";

import FormBanner from "@/components/banner/FormBanner";
import Button from "@/components/button/Button";
import { DatePicker } from "@/components/calendar/CalendarSelect";
import FormInput from "@/components/input-fields/FormInput";
import FormTextArea from "@/components/input-fields/FormTextArea";
import {
  FormCitySelect,
  FormCountrySelect,
  FormStateSelect,
} from "@/components/location-selectors";
import { TreatmentPlan } from "@/types/Events";
import { IntakeType } from "@/types/IntakeForm";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatPhoneNumber, revertFormattedPhoneNumber } from "@/utils/helpers";
import { submitBasicInformationForm } from "@/actions/clients/treatment-plan/basicInformation";
import { toast } from "@/components/ui/use-toast";
import { validateField } from "@/lib/api-utils";
import { TreatmentPlanType } from "./TreatmentPlanWrapper";
import FormSelect from "@/components/input-fields/FormSelect";
import { formatDate } from "@/utils/helpers";
import { Checkbox } from "@/components/ui/checkbox";

export const basicInformationFormschema = z.object({
  participant_first_name: z.string().optional(),
  participant_last_name: z.string().optional(),
  participant_father_name: z.string().optional(),
  participant_mother_name: z.string().optional(),
  father_mobile_number: z.string().optional(),
  mother_mobile_number: z.string().optional(),
  address_street_information: z.string().optional(),
  county: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  apartment_number: z.string().optional(),
  zip_code: z.string().optional(),
  tp_type: z.string().optional(),
  tp_implemented_by: z.string().optional(),
  implementation_start_date: z.string().optional(),
  implementation_stop_date: z.string().optional(),
  participant_background_information: z
    .string()
    .nonempty("Background Information is required"),
  behavior_intervention_protocol: z.string().optional(),
  transport_requirements_and_recommendations: z.string().optional(),
  statement_of_family_strength_and_resources: z.string().optional(),
  requires_data_collection: z.boolean().optional().default(false),
  meeting_attendance: z.string().optional(),
  introduction: z.string().optional(),
});

export type BasicInformationFormData = z.infer<
  typeof basicInformationFormschema
>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  user: IntakeType | undefined;
  treatmentPlanData: TreatmentPlan | undefined;
  username: string;
  clientId: string;
  formType: TreatmentPlanType;
  formId: string;
  refetchTreatmentPlan: any;
}

const BasicInformation = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  user,
  treatmentPlanData,
  username,
  clientId,
  formType,
  formId,
  refetchTreatmentPlan,
}: Props) => {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isFormDisabled = mode === "view";

  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<BasicInformationFormData>({
    resolver: zodResolver(basicInformationFormschema),
    disabled: isLoading,
    defaultValues: {
      country: "US",
      tp_implemented_by:
        formType === "fc"
          ? "Family Consultant"
          : formType === "iiss"
          ? "Intensive Individual Support Services (IISS)"
          : formType === "ti"
          ? "TI Technician"
          : "",
      requires_data_collection: false,
    },
  });

  const prefillBasicInformationWithClientData = () => {
    const prefillClientInfo = () => {
      setValue("participant_first_name", user?.first_name ?? "");
      setValue("participant_last_name", user?.last_name ?? "");

      if (!user?.clientInformation) return;

      const {
        first_name,
        last_name,
        country,
        state,
        city,
        county,
        address_or_street,
      } = user.clientInformation;

      setValue("participant_first_name", first_name ?? "");
      setValue("participant_last_name", last_name ?? "");
      setValue("country", country ?? "US");
      setValue("state", state ?? "");
      setValue("city", city ?? "");
      setValue("county", county ?? "");
      setValue("address_street_information", address_or_street ?? "");
    };

    const prefillFatherContactInfo = () => {
      if (!user?.fatherContactInformation) return;

      const { first_name, last_name, phone, apartment_number, zip_code } =
        user.fatherContactInformation;

      setValue(
        "participant_father_name",
        `${first_name ?? ""} ${last_name ?? ""}`.trim()
      );
      setValue("father_mobile_number", phone ?? "");
      setValue("apartment_number", apartment_number ?? "");
      setValue("zip_code", zip_code ?? "");
    };

    const prefillMotherContactInfo = () => {
      if (!user?.motherContactInformation) return;

      const { first_name, last_name, phone } = user.motherContactInformation;

      setValue(
        "participant_mother_name",
        `${first_name ?? ""} ${last_name ?? ""}`.trim()
      );
      setValue("mother_mobile_number", phone ?? "");
    };

    const prefillWaiverService = () => {
      if (!user?.waiverService || user.waiverService.length === 0) return;

      const { service_start_date, service_end_date } = user.waiverService[0];

      setValue("implementation_start_date", service_start_date);
      setValue("implementation_stop_date", service_end_date);
    };

    prefillClientInfo();
    prefillFatherContactInfo();
    prefillMotherContactInfo();
    prefillWaiverService();
  };

  useEffect(() => {
    if (!treatmentPlanData) return;

    const treatmentPlanArray = treatmentPlanData?.data?.treatmentPlans;
    const data = treatmentPlanArray.find((item) => item.id === formId)!;

    const basicInformation = data?.basicInformation;

    

    // setValue(
    //   "participant_first_name",
    //   basicInformation?.participant_first_name ?? ""
    // );
    // setValue(
    //   "participant_last_name",
    //   basicInformation?.participant_last_name ?? ""
    // );
    // setValue(
    //   "participant_father_name",
    //   basicInformation?.participant_father_name ?? ""
    // );
    // setValue(
    //   "participant_mother_name",
    //   basicInformation?.participant_mother_name ?? ""
    // );
    // setValue(
    //   "father_mobile_number",
    //   basicInformation?.father_mobile_number ?? ""
    // );
    // setValue(
    //   "mother_mobile_number",
    //   basicInformation?.mother_mobile_number ?? ""
    // );
    // setValue(
    //   "address_street_information",
    //   basicInformation?.address_street_information ?? ""
    // );
    // setValue("county", basicInformation?.county ?? "");
    // setValue("country", basicInformation?.country ?? "US");
    // setValue("state", basicInformation?.state ?? "");
    // setValue("city", basicInformation?.city ?? "");
    // setValue("apartment_number", basicInformation?.apartment_number ?? "");
    // setValue("zip_code", basicInformation?.zip_code ?? "");

    prefillBasicInformationWithClientData();

    if (!basicInformation) return;

    setMethod("PATCH");

    setValue("tp_type", basicInformation?.tp_type ?? "");
    setValue("tp_implemented_by", basicInformation?.tp_implemented_by ?? "");
    if (basicInformation?.implementation_start_date) {
      setValue(
        "implementation_start_date",
        basicInformation?.implementation_start_date ?? ""
      );
    }

    if (basicInformation?.implementation_stop_date) {
      setValue(
        "implementation_stop_date",
        basicInformation?.implementation_stop_date ?? ""
      );
    }

    setValue(
      "participant_background_information",
      basicInformation?.participant_background_information ?? ""
    );
    setValue(
      "behavior_intervention_protocol",
      basicInformation?.behavior_intervention_protocol ?? ""
    );
    setValue(
      "transport_requirements_and_recommendations",
      basicInformation?.transport_requirements_and_recommendations ?? ""
    );
    setValue(
      "statement_of_family_strength_and_resources",
      basicInformation?.statement_of_family_strength_and_resources ?? ""
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treatmentPlanData]);

  const onSubmit = async (formData: BasicInformationFormData) => {
    try {
      setIsLoading(true);

      const treatmentPlanArray = treatmentPlanData?.data?.treatmentPlans || [];
      const data = treatmentPlanArray.find((item) => item.id === formId)!;
      const basicInformation = data?.basicInformation;

      const token = localStorage.getItem("token") as string;

      const requestBody: any = {
        participant_first_name: validateField(formData.participant_first_name),
        participant_last_name: validateField(formData.participant_last_name),
        participant_father_name: validateField(
          formData.participant_father_name
        ),
        participant_mother_name: validateField(
          formData.participant_mother_name
        ),
        father_mobile_number: validateField(
          revertFormattedPhoneNumber(formData.father_mobile_number!)
        ),
        mother_mobile_number: validateField(
          revertFormattedPhoneNumber(formData.mother_mobile_number!)
        ),
        address_street_information: validateField(
          formData.address_street_information
        ),
        country: validateField(formData.country),
        state: validateField(formData.state),
        city: validateField(formData.city),
        apartment_number: validateField(formData.apartment_number),
        zip_code: validateField(formData.zip_code),
        tp_type: validateField(formData.tp_type),
        tp_implemented_by: validateField(formData.tp_implemented_by),
        implementation_start_date: validateField(
          formData.implementation_start_date,
          true
        ),
        implementation_stop_date: validateField(
          formData.implementation_stop_date,
          true
        ),
        participant_background_information: validateField(
          formData.participant_background_information
        ),
        behavior_intervention_protocol: validateField(
          formData.behavior_intervention_protocol
        ),
        transport_requirements_and_recommendations: validateField(
          formData.transport_requirements_and_recommendations
        ),
        county: validateField(formData.county),
        statement_of_family_strength_and_resources: validateField(
          formData.statement_of_family_strength_and_resources
        ),
        requires_data_collection: formData.requires_data_collection,
        meeting_attendance: validateField(formData.meeting_attendance),
        introduction: validateField(formData.introduction),
      };

      const { status, errorMessage } = await submitBasicInformationForm(
        token,
        requestBody,
        clientId,
        method,
        basicInformation?.id,
        formType,
        formId
      );

      await refetchTreatmentPlan();

      if (!status) {
        toast({
          variant: "destructive",
          description: errorMessage,
        });
        return;
      }

      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    } catch (err) {
      console.error("ERROR SUBMITTING BASIC INFORMATION", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftSubmit = async () => {
    const formData = getValues();
    try {
      setIsSubmittingDraft(true);

      const treatmentPlanArray = treatmentPlanData?.data?.treatmentPlans || [];
      const data = treatmentPlanArray.find((item) => item.id === formId)!;
      const basicInformation = data?.basicInformation;
      const token = localStorage.getItem("token") as string;

      const requestBody: any = {
        participant_first_name: validateField(formData.participant_first_name),
        participant_last_name: validateField(formData.participant_last_name),
        participant_father_name: validateField(
          formData.participant_father_name
        ),
        participant_mother_name: validateField(
          formData.participant_mother_name
        ),
        father_mobile_number: validateField(
          revertFormattedPhoneNumber(formData.father_mobile_number!)
        ),
        mother_mobile_number: validateField(
          revertFormattedPhoneNumber(formData.mother_mobile_number!)
        ),
        address_street_information: validateField(
          formData.address_street_information
        ),
        country: validateField(formData.country),
        state: validateField(formData.state),
        city: validateField(formData.city),
        apartment_number: validateField(formData.apartment_number),
        zip_code: validateField(formData.zip_code),
        tp_type: validateField(formData.tp_type),
        tp_implemented_by: validateField(formData.tp_implemented_by),
        implementation_start_date: validateField(
          formData.implementation_start_date,
          true
        ),
        implementation_stop_date: validateField(
          formData.implementation_stop_date,
          true
        ),
        participant_background_information: validateField(
          formData.participant_background_information
        ),
        behavior_intervention_protocol: validateField(
          formData.behavior_intervention_protocol
        ),
        transport_requirements_and_recommendations: validateField(
          formData.transport_requirements_and_recommendations
        ),
        county: validateField(formData.county),
        statement_of_family_strength_and_resources: validateField(
          formData.statement_of_family_strength_and_resources
        ),
        requires_data_collection: formData.requires_data_collection,
        meeting_attendance: validateField(formData.meeting_attendance),
        introduction: validateField(formData.introduction),
      };

      const { status, errorMessage } = await submitBasicInformationForm(
        token,
        requestBody,
        clientId,
        method,
        basicInformation?.id,
        formType,
        formId
      );

      await refetchTreatmentPlan();

      if (!status) {
        toast({
          variant: "destructive",
          description: errorMessage,
        });
        return;
      }

      toast({
        variant: "success",
        description: "Draft saved successfully",
      });
    } catch (err) {
      console.error("ERROR SUBMITTING BASIC INFORMATION", err);
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields.",
      });
    }
  }, [errors]);

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 mt-[5vh]">
      <FormBanner
        variant="warning"
        text="Review prefilled fields to make sure they are correct for this form "
      />

      <div className="bg-white border rounded-lg shadow-sm">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 flex justify-between items-center"
        >
          <h3
            data-testid="basic-info-header"
            className="text-[#0F172A] text-[20px] font-[600]"
          >
            {formType === "ti" ? "Introduction" : "Basic Information"}
          </h3>
          <ChevronDownIcon
            className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>

        <div
          ref={contentRef}
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6 border-[#EEEFF1]">
            <div className="grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
              <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                <p className="text-[#0F172A] text-[14px] font-[600]">
                  Participant Name
                </p>
                <p className="text-[#475569] text-[14px] font-[400]">
                  {`${user?.clientInformation?.first_name || ""} ${
                    user?.clientInformation?.last_name || ""
                  }`}
                </p>
              </div>

              <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                <p className="text-[#0F172A] text-[14px] font-[600]">
                  Date of Birth
                </p>
                <p className="text-[#475569] text-[14px] font-[400]">
                  {user?.clientInformation?.date_of_birth
                    ? formatDate(user?.clientInformation?.date_of_birth)
                    : ""}
                </p>
              </div>

              <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                <p className="text-[#0F172A] text-[14px] font-[600]">Age</p>
                <p className="text-[#475569] text-[14px] font-[400]">
                  {user?.clientInformation?.date_of_birth
                    ? Math.floor(
                        (new Date().getTime() -
                          new Date(
                            user.clientInformation.date_of_birth
                          ).getTime()) /
                          3.15576e10
                      )
                    : ""}
                </p>
              </div>

              <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                <p className="text-[#0F172A] text-[14px] font-[600]">Gender</p>
                <p className="text-[#475569] text-[14px] font-[400]">
                  {user?.clientInformation?.sex || ""}
                </p>
              </div>

              <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                <p className="text-[#0F172A] text-[14px] font-[600]">
                  Father&apos;s Name
                </p>
                <p className="text-[#475569] text-[14px] font-[400]">
                  {`${user?.fatherContactInformation?.first_name || ""} ${
                    user?.fatherContactInformation?.last_name || ""
                  }`}
                </p>
              </div>

              <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                <p className="text-[#0F172A] text-[14px] font-[600]">
                  Mother&apos;s Name
                </p>
                <p className="text-[#475569] text-[14px] font-[400]">
                  {`${user?.motherContactInformation?.first_name || ""} ${
                    user?.motherContactInformation?.last_name || ""
                  }`}
                </p>
              </div>

              <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                <p className="text-[#0F172A] text-[14px] font-[600]">
                  Father&apos;s Mobile No
                </p>
                <p className="text-[#475569] text-[14px] font-[400]">
                  {formatPhoneNumber(
                    user?.fatherContactInformation?.phone || ""
                  )}
                </p>
              </div>

              <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                <p className="text-[#0F172A] text-[14px] font-[600]">
                  Mother&apos;s Mobile No
                </p>
                <p className="text-[#475569] text-[14px] font-[400]">
                  {formatPhoneNumber(
                    user?.motherContactInformation?.phone || ""
                  )}
                </p>
              </div>

              <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                <p className="text-[#0F172A] text-[14px] font-[600]">
                  Address/Street
                </p>
                <p className="text-[#475569] text-[14px] font-[400]">
                  {user?.clientInformation?.address_or_street || ""}
                </p>
              </div>

              <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                <p className="text-[#0F172A] text-[14px] font-[600]">City</p>
                <p className="text-[#475569] text-[14px] font-[400]">
                  {user?.clientInformation?.city || ""}
                </p>
              </div>

              <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                <p className="text-[#0F172A] text-[14px] font-[600]">Country</p>
                <p className="text-[#475569] text-[14px] font-[400]">
                  {user?.clientInformation?.country || ""}
                </p>
              </div>

              <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                <p className="text-[#0F172A] text-[14px] font-[600]">
                  Zip Code
                </p>
                <p className="text-[#475569] text-[14px] font-[400]">
                  {user?.clientInformation?.zip_code || ""}
                </p>
              </div>

              <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                <p className="text-[#0F172A] text-[14px] font-[600]">County</p>
                <p className="text-[#475569] text-[14px] font-[400]">
                  {user?.clientInformation?.county || ""}
                </p>
              </div>

              <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                <p className="text-[#0F172A] text-[14px] font-[600]">
                  Apartment Number
                </p>
                <p className="text-[#475569] text-[14px] font-[400]">
                  {user?.clientInformation?.apartment_number || ""}
                </p>
              </div>

              <div className="flex justify-between py-2 border-b border-[#EEEFF1]">
                <p className="text-[#0F172A] text-[14px] font-[600]">State</p>
                <p className="text-[#475569] text-[14px] font-[400]">
                  {user?.clientInformation?.state || ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        {formType !== "alp" && (
          <>
            <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
              <Controller
                name="tp_type"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    onValueChange={(value: string) => field.onChange(value)}
                    labelText="TP Type"
                    placeholder="Select Option"
                    selectContent={[
                      { label: "Initial", value: "Initial" },
                      { label: "Provisional", value: "Provisional" },
                      { label: "Annual", value: "Annual" },
                    ]}
                    isError={Boolean(errors.tp_type?.message)}
                    errorMessage={errors.tp_type?.message}
                    data-testid="tp-type-select"
                  />
                )}
              />
              <Controller
                name="tp_implemented_by"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    onValueChange={(value: string) => {
                      field.onChange(value);
                    }}
                    labelText="TP Implemented By"
                    placeholder="Select Option"
                    selectContent={[
                      {
                        label: "Family Consultant",
                        value: "Family Consultant",
                      },
                      { label: "TI Technician", value: "TI Technician" },
                      {
                        label: "Adult Life Planner",
                        value: "Adult Life Planner",
                      },
                      {
                        label: "Intensive Individual Support Services (IISS)",
                        value: "Intensive Individual Support Services (IISS)",
                      },
                      {
                        label: "DSP (Direct Care Worker)",
                        value: "DSP (Direct Care Worker)",
                      },
                      {
                        label: "On-Call Professional",
                        value: "On-Call Professional",
                      },
                    ]}
                    isError={Boolean(errors.tp_implemented_by?.message)}
                    errorMessage={errors.tp_implemented_by?.message}
                    data-testid="tp-implemented-by-select"
                  />
                )}
              />
            </div>

            <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
              <Controller
                name="implementation_start_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    disabled={isFormDisabled}
                    defaultDate={
                      field.value ? new Date(field.value) : undefined
                    }
                    label="Implementation Start Date"
                    getDate={(date) => field.onChange(date.toDateString())}
                    isError={Boolean(errors.implementation_start_date?.message)}
                    errorMessage={errors.implementation_start_date?.message}
                    data-testid="implementation-start-date"
                  />
                )}
              />
              <Controller
                name="implementation_stop_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    disabled={isFormDisabled}
                    defaultDate={
                      field.value ? new Date(field.value) : undefined
                    }
                    label="Implementation Stop Date"
                    getDate={(date) => field.onChange(date.toDateString())}
                    isError={Boolean(errors.implementation_stop_date?.message)}
                    errorMessage={errors.implementation_stop_date?.message}
                    data-testid="implementation-end-date"
                  />
                )}
              />
            </div>
          </>
        )}

        <Controller
          name="participant_background_information"
          control={control}
          render={({ field }) => (
            <FormTextArea
              {...field}
              disabled={isFormDisabled}
              labelText="Participant Background Information"
              placeholder="Enter here.."
              isError={Boolean(
                errors.participant_background_information?.message
              )}
              errorMessage={errors.participant_background_information?.message}
              data-testid="background-information"
            />
          )}
        />

        {formType === "alp" && (
          <>
            <Controller
              name="meeting_attendance"
              control={control}
              render={({ field }) => (
                <FormTextArea
                  {...field}
                  disabled={isFormDisabled}
                  labelText="Meeting Attendance"
                  placeholder="Enter here.."
                  isError={Boolean(errors.meeting_attendance?.message)}
                  errorMessage={errors.meeting_attendance?.message}
                  data-testid="meeting-attendance"
                />
              )}
            />

            <Controller
              name="introduction"
              control={control}
              render={({ field }) => (
                <FormTextArea
                  {...field}
                  disabled={isFormDisabled}
                  labelText="Introduction"
                  placeholder="Enter here.."
                  isError={Boolean(errors.introduction?.message)}
                  errorMessage={errors.introduction?.message}
                  data-testid="introduction"
                />
              )}
            />
          </>
        )}

        {formType !== "alp" && (
          <>
            <Controller
              name="behavior_intervention_protocol"
              control={control}
              render={({ field }) => (
                <FormTextArea
                  {...field}
                  disabled={isFormDisabled}
                  labelText="Behaviour Intervention Protocol and recommendation"
                  placeholder="Enter here.."
                  isError={Boolean(
                    errors.behavior_intervention_protocol?.message
                  )}
                  errorMessage={errors.behavior_intervention_protocol?.message}
                  data-testid="behavior-intervention-protocol"
                />
              )}
            />

            <Controller
              name="transport_requirements_and_recommendations"
              control={control}
              render={({ field }) => (
                <FormTextArea
                  {...field}
                  disabled={isFormDisabled}
                  labelText="Transportation requirements and recommendation"
                  placeholder="Enter here.."
                  isError={Boolean(
                    errors.transport_requirements_and_recommendations?.message
                  )}
                  errorMessage={
                    errors.transport_requirements_and_recommendations?.message
                  }
                  data-testid="transport-requirements"
                />
              )}
            />
          </>
        )}

        {formType === "fc" && (
          <Controller
            name="statement_of_family_strength_and_resources"
            control={control}
            render={({ field }) => (
              <FormTextArea
                {...field}
                disabled={isFormDisabled}
                labelText="Statement of family's strengths & resources"
                placeholder="Enter here.."
                isError={Boolean(
                  errors.statement_of_family_strength_and_resources?.message
                )}
                errorMessage={
                  errors.statement_of_family_strength_and_resources?.message
                }
                data-testid="statement-of-family-strength-and-resources"
              />
            )}
          />
        )}

        {formType === "ti" && (
          <Controller
            name="requires_data_collection"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isFormDisabled}
                />
                <p className="text-[16px] font-[400] text-[#0F172A]">
                  <span className="font-[700]">{username}</span> has behaviours
                  that require data collection and monitoring
                </p>
              </div>
            )}
          />
        )}

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
            data-testid="previous-section-button"
          >
            <DoubleArrowLeftIcon className="w-5 h-5" />
            Previous Section
          </Button>

          {!isFormDisabled && (
            <Button
              variant="light"
              type="button"
              isLoading={isSubmittingDraft}
              disabled={isSubmittingDraft}
              onClick={handleDraftSubmit}
              data-testid="save-draft-button"
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button
              onClick={() => {
                handleChangeIndex(2);
              }}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              data-testid="next-section-button"
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default BasicInformation;
