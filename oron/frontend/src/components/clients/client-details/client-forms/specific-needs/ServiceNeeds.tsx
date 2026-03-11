"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import FormInput from "@/components/input-fields/FormInput";
import { formatPhoneNumber, revertFormattedPhoneNumber } from "@/utils/helpers";
import { submitServiceNeedsForm } from "@/actions/clients/specific-needs/specificNeeds";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { validateField } from "@/lib/api-utils";
import { FullSpecificNeedsForm } from "@/types/SpecificNeeds";

const serviceNeedsSchema = z
  .object({
    services: z
      .array(z.string())
      .min(1, "At least one service must be selected."),
    transportation: z
      .array(z.string())
      .min(1, "At least one transportation must be selected."),
    during_transportation: z.enum(
      ["no_supervision", "need_harness", "need_supervision"],
      {
        required_error: "Please select a transportation option",
      }
    ),
    has_preferred_caregiver: z.enum(["yes", "no"], {
      required_error: "Please indicate if you have a preferred caregiver",
    }),
    preferred_caregiver_name: z.string().optional(),
    preferred_caregiver_phone: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.has_preferred_caregiver === "yes") {
        return (
          !!data.preferred_caregiver_name &&
          data.preferred_caregiver_name.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Caregiver name is required when 'Yes' is selected",
      path: ["preferred_caregiver_name"],
    }
  )
  .refine(
    (data) => {
      if (data.has_preferred_caregiver === "yes") {
        return (
          !!data.preferred_caregiver_phone &&
          data.preferred_caregiver_phone.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Please enter a valid phone number",
      path: ["preferred_caregiver_phone"],
    }
  );

type ServiceNeedsFormData = z.infer<typeof serviceNeedsSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  clientId: string;
  specificNeedsData: FullSpecificNeedsForm | undefined;
  refetchSpecificNeeds: any;
}

const ServiceNeeds = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  clientId,
  specificNeedsData,
  refetchSpecificNeeds,
}: Props) => {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isFormDisabled = mode === "view";

  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
    reset,
    setValue,
  } = useForm<ServiceNeedsFormData>({
    resolver: zodResolver(serviceNeedsSchema),
    defaultValues: {
      services: [],
      transportation: [],
      during_transportation: undefined,
      has_preferred_caregiver: undefined,
      preferred_caregiver_name: "",
      preferred_caregiver_phone: "",
    },
  });

  useEffect(() => {
    if (!specificNeedsData) return;

    const data = specificNeedsData?.data;
    const serviceNeeds = data?.serviceNeeds;

    if (serviceNeeds) {
      setMethod("PATCH");

      // Prepare and set services array
      const selectedServices = [];
      if (serviceNeeds.iiss) selectedServices.push("iiss");
      if (serviceNeeds.therapeuticServices)
        selectedServices.push("therapeutic_services");
      if (serviceNeeds.respite) selectedServices.push("respite");
      if (serviceNeeds.familyTraining) selectedServices.push("family_training");
      setValue("services", selectedServices);

      // Prepare and set transportation array
      const selectedTransportation = [];
      if (serviceNeeds.transportToSchoolMorning)
        selectedTransportation.push("to_school");
      if (serviceNeeds.transportFromTIToHome)
        selectedTransportation.push("from_ti_to_home");
      if (serviceNeeds.transportFromSchoolToTI)
        selectedTransportation.push("from_school_to_ti");
      if (serviceNeeds.transportToCommunity)
        selectedTransportation.push("to_community");
      setValue("transportation", selectedTransportation);

      // Set during transportation value
      if (serviceNeeds.noSupervisionNeeded) {
        setValue("during_transportation", "no_supervision");
      } else if (serviceNeeds.harnessNeeded) {
        setValue("during_transportation", "need_harness");
      } else if (serviceNeeds.supervisionNeeded) {
        setValue("during_transportation", "need_supervision");
      }

      // Set preferred caregiver information
      setValue(
        "has_preferred_caregiver",
        serviceNeeds.hasPreferredCaregiver ? "yes" : "no"
      );
      if (serviceNeeds.hasPreferredCaregiver) {
        setValue(
          "preferred_caregiver_name",
          serviceNeeds.preferredCaregiverName || ""
        );
        setValue(
          "preferred_caregiver_phone",
          serviceNeeds.preferredCaregiverPhone || ""
        );
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specificNeedsData]);

  const hasPreferredCaregiver = watch("has_preferred_caregiver");

  const provideServiceOptions = [
    { label: "IISS", value: "iiss" },
    { label: "Respite", value: "respite" },
    { label: "Therapeutic Services (TI)", value: "therapeutic_services" },
    { label: "Family Training (FT)", value: "family_training" },
  ];

  const transportationServiceOptions = [
    { label: "To school in the morning", value: "to_school" },
    { label: "From TI center to home", value: "from_ti_to_home" },
    { label: "From school to TI center", value: "from_school_to_ti" },
    { label: "To community", value: "to_community" },
  ];

  const duringTransportationOptions = [
    { label: "I do NOT need supervision", value: "no_supervision" },
    { label: "I need a harness", value: "need_harness" },
    { label: "I need supervision", value: "need_supervision" },
  ];

  const preferredCareGiverOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  const onSubmit = async (formData: ServiceNeedsFormData) => {
    try {
      setIsLoading(true);

      const serviceNeeds = specificNeedsData?.data?.serviceNeeds;
      const token = localStorage.getItem("token") as string;

      const requestBody = {
        services: formData.services,
        transportation: formData.transportation,
        during_transportation: validateField(formData.during_transportation),
        has_preferred_caregiver: validateField(
          formData.has_preferred_caregiver
        ),
        preferred_caregiver_name: validateField(
          formData.preferred_caregiver_name
        ),
        preferred_caregiver_phone: validateField(
          revertFormattedPhoneNumber(formData.preferred_caregiver_phone!)
        ),
      };

      const { status, errorMessage } = await submitServiceNeedsForm(
        token,
        requestBody,
        clientId,
        method,
        serviceNeeds?.id,
        specificNeedsData?.data?.id!
      );

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
      console.error("Error submitting form:", err);
      toast({
        variant: "destructive",
        description: "An error occurred while submitting the form",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftSubmit = async () => {
    const formData = getValues();
    try {
      setIsSubmittingDraft(true);

      const serviceNeeds = specificNeedsData?.data?.serviceNeeds;
      const token = localStorage.getItem("token") as string;

      const requestBody = {
        services: formData.services,
        transportation: formData.transportation,
        during_transportation: validateField(formData.during_transportation),
        has_preferred_caregiver: validateField(
          formData.has_preferred_caregiver
        ),
        preferred_caregiver_name: validateField(
          formData.preferred_caregiver_name
        ),
        preferred_caregiver_phone: validateField(
          revertFormattedPhoneNumber(formData.preferred_caregiver_phone!)
        ),
      };

      const { status, errorMessage } = await submitServiceNeedsForm(
        token,
        requestBody,
        clientId,
        method,
        serviceNeeds?.id,
        specificNeedsData?.data?.id!
      );

      await refetchSpecificNeeds();

      if (!status) {
        toast({
          variant: "destructive",
          description: errorMessage,
        });
        return;
      }

      toast({
        description: "Draft saved successfully",
      });
    } catch (err) {
      console.error("Error saving draft:", err);
      toast({
        variant: "destructive",
        description: "An error occurred while saving the draft",
      });
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 mt-[4vh]"
    >
      <div className="flex flex-col gap-3">
        <h3
          data-testid="service-needs-header"
          className="text-[#0F172A] text-[24px] font-[600]"
        >
          Service Needs
        </h3>
        <p className="text-[16px] font-[400] text-[#334155]">
          Please provide details about the services needed
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <h4 className="text-[16px] font-[600] text-[#0F172A]">
          I&apos;d like Oron to provide the following services
        </h4>
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
          {provideServiceOptions.map(({ label, value }) => (
            <Controller
              key={value}
              name={`services`}
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={value}
                    checked={field.value.includes(value)}
                    onCheckedChange={(checked) => {
                      field.onChange(
                        checked
                          ? [...field.value, value] // Add value if checked
                          : field.value.filter((v) => v !== value) // Remove value if unchecked
                      );
                    }}
                    disabled={isFormDisabled}
                    data-testid={`service-${value}-checkbox`}
                  />

                  <Label
                    className="text-[14px] font-[400] text-[#09090B]"
                    htmlFor={value}
                  >
                    {label}
                  </Label>
                </div>
              )}
            />
          ))}
        </div>

        {errors.services && (
          <span className="text-red-500 text-sm">
            {errors.services.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <h4 className="text-[16px] font-[600] text-[#0F172A]">
          I&apos;d need transportation services
        </h4>
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
          {transportationServiceOptions.map(({ label, value }) => (
            <Controller
              key={value}
              name={`transportation`}
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={value}
                    checked={field.value.includes(value)}
                    onCheckedChange={(checked) => {
                      field.onChange(
                        checked
                          ? [...field.value, value] // Add value if checked
                          : field.value.filter((v) => v !== value) // Remove value if unchecked
                      );
                    }}
                    disabled={isFormDisabled}
                    data-testid={`transportation-${value}-checkbox`}
                  />
                  <Label
                    className="text-[14px] font-[400] text-[#09090B]"
                    htmlFor={value}
                  >
                    {label}
                  </Label>
                </div>
              )}
            />
          ))}
        </div>

        {errors.transportation && (
          <span className="text-red-500 text-sm">
            {errors.transportation.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <h4 className="text-[16px] font-[600] text-[#0F172A]">
          During Transportation
        </h4>
        <Controller
          name="during_transportation"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              disabled={isFormDisabled}
              className="grid gap-5 grid-cols-1 md:grid-cols-2"
              data-testid="during-transportation-radio"
            >
              {duringTransportationOptions.map(({ label, value }) => (
                <div key={value} className="flex items-center gap-2">
                  <RadioGroupItem id={value} value={value} />
                  <Label
                    className="text-[16px] font-[400] text-[#09090B]"
                    htmlFor={value}
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
        {errors.during_transportation && (
          <span className="text-red-500 text-sm">
            {errors.during_transportation.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <h4 className="text-[16px] font-[600] text-[#0F172A]">
          I currently have a preferred caregiver
        </h4>
        <Controller
          name="has_preferred_caregiver"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              disabled={isFormDisabled}
              className="grid gap-5 grid-cols-1 md:grid-cols-2"
              data-testid="preferred-caregiver-radio"
            >
              {preferredCareGiverOptions.map(({ label, value }) => (
                <div key={value} className="flex items-center gap-2">
                  <RadioGroupItem id={value} value={value} />
                  <Label
                    className="text-[16px] font-[400] text-[#09090B]"
                    htmlFor={value}
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
        {errors.has_preferred_caregiver && (
          <span className="text-red-500 text-sm">
            {errors.has_preferred_caregiver.message}
          </span>
        )}
      </div>

      {hasPreferredCaregiver === "yes" && (
        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <Controller
            name="preferred_caregiver_name"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                disabled={isFormDisabled}
                placeholder="Enter name"
                type="text"
                labelText="Preferred caregiver's name *"
                isAuth={false}
                errorMessage={errors.preferred_caregiver_name?.message}
                isError={!!errors.preferred_caregiver_name}
                data-testid="preferred-caregiver-name"
              />
            )}
          />

          <Controller
            name="preferred_caregiver_phone"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                value={formatPhoneNumber(field.value!)}
                disabled={isFormDisabled}
                placeholder="+1 (555) 000-0000"
                type="text"
                labelText="Preferred Caregiver's Phone *"
                isAuth={false}
                withSelect={true}
                selectDefaultValue="US"
                selectValue={["US"]}
                isPhoneNumber
                errorMessage={errors.preferred_caregiver_phone?.message}
                isError={!!errors.preferred_caregiver_phone}
                data-testid="preferred-caregiver-phone"
              />
            )}
          />
        </div>
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
            onClick={handleDraftSubmit}
            type="button"
            data-testid="save-draft-button"
            disabled={isSubmittingDraft}
            isLoading={isSubmittingDraft}
          >
            Save Draft
          </Button>
        )}

        {isFormDisabled ? (
          <Button
            onClick={() => handleChangeIndex(2)}
            data-testid="next-section-button"
          >
            Next Section <DoubleArrowRightIcon className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            isLoading={isLoading}
            disabled={isLoading}
            data-testid="next-section-button"
            type="submit"
          >
            Next Section <DoubleArrowRightIcon className="w-5 h-5" />
          </Button>
        )}
      </div>
    </form>
  );
};

export default ServiceNeeds;
