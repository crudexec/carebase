import { zodResolver } from "@hookform/resolvers/zod";
import { PatientInsurance } from "@prisma/client";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Detail from "@/components/detail";
import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  Modal,
  RadioInput,
  SelectInput,
  Textarea,
} from "@/components/ui";
import {
  assignmentStatuses,
  billTypes,
  genderOptions,
  insuranceTypes,
  patientRelationships,
  relationshipOptions,
  yesNoOptions,
} from "@/constants";
import {
  useCreateInsurance,
  useGetPayers,
  useGetUsers,
  usePopulateForm,
  useUpdateInsurance,
} from "@/hooks";
import { cn, filterArray, formatDate, getFullName, pickValues } from "@/lib";
import {
  insuranceDefaultValue,
  InsuranceForm,
  insuranceSchema,
} from "@/schema";
import { PatientResponse } from "@/types";

const InsuranceModal = ({
  title,
  open,
  modalClose,
  refresh,
  selected,
  patient,
}: {
  title: string;
  open: boolean;
  modalClose: () => void;
  refresh: () => void;
  selected?: PatientInsurance;
  patient?: PatientResponse;
}) => {
  const { data: caregivers } = useGetUsers({ tab: "caregiver" });
  const { data: insuranceCaseManagers } = useGetUsers({
    tab: "insurance_case_manager",
  });
  const [includeInactive, setIncludeInactive] = React.useState(false);
  const { data: payers } = useGetPayers({
    inactivePayer: includeInactive,
  });
  const methods = useForm<InsuranceForm>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: insuranceDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "relatedCaregiver",
  });

  const { data, trigger, isMutating } = useCreateInsurance();
  const {
    data: updateResponse,
    trigger: updateInsurance,
    isMutating: isUpdating,
  } = useUpdateInsurance();

  const closeModal = () => {
    methods.reset(insuranceDefaultValue);
    modalClose();
  };
  useEffect(() => {
    if (data?.success || updateResponse?.success) {
      if (!selected?.id && data?.success) {
        toast.success("Insurance created successfully");
      } else {
        toast.success("Insurance updated successfully");
      }
      refresh();
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, updateResponse]);

  usePopulateForm<InsuranceForm, PatientInsurance>(methods.reset, selected);

  return (
    <Modal
      title={title}
      open={open}
      onClose={() => {
        closeModal();
      }}
      className="md:max-w-[60%] sm:max-w-full"
    >
      <Form {...methods}>
        <form
          className="h-[80vh] overflow-auto flex flex-col gap-5 scrollbar-hide px-1"
          onSubmit={methods.handleSubmit(async (formData) => {
            if (selected?.id) {
              await updateInsurance({
                ...formData,
                id: selected?.id,
                relatedCaregiver: filterArray(formData.relatedCaregiver),
              });
            } else {
              await trigger(
                pickValues({
                  ...formData,
                  patientId: patient?.id,
                  relatedCaregiver: filterArray(formData.relatedCaregiver),
                }),
              );
            }
          })}
        >
          <div>
            <p className="text-2xl font-semibold pb-2">
              {getFullName(patient?.firstName, patient?.lastName)}
            </p>
            <div className="bg-secondary flex flex-col border">
              <div className="border-b p-2">
                <Detail title="PAN" detail={patient?.pan} />
              </div>

              <div className="p-2">
                <Detail
                  title="Admit Date"
                  detail={
                    patient?.patientAdmission[0]?.createdAt
                      ? formatDate(patient?.patientAdmission[0]?.createdAt)
                      : ""
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <FormHeader className="mt-4"> Payer Related Information</FormHeader>
            <div className="grid grid-col-1 md:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"payerId"}
                render={({ field }) => (
                  <FormRender label={"Payer"}>
                    <SelectInput
                      options={
                        payers?.data?.map((payer) => ({
                          label: payer.name as string,
                          value: payer.id,
                        })) || []
                      }
                      field={field}
                    />
                  </FormRender>
                )}
              />
              <div className="flex gap-2 items-center">
                <Checkbox
                  checked={includeInactive}
                  onCheckedChange={(value) => setIncludeInactive(!!value)}
                />
                <span className="text-sm">Include Inactive Payers</span>
              </div>

              <FormField
                control={methods.control}
                name={"payerResponsibility"}
                render={({ field }) => (
                  <FormRender label={"Payer Responsibility"}>
                    <SelectInput options={insuranceTypes} field={field} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"memberId"}
                render={({ field }) => (
                  <FormRender label={"Member ID"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"groupName"}
                render={({ field }) => (
                  <FormRender label={"Group (Plan) Name"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"groupNumber"}
                render={({ field }) => (
                  <FormRender label={"Group Number"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      type="number"
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"insuranceCaseManagerId"}
                render={({ field }) => (
                  <FormRender label={"Insurance Case Manager"}>
                    <SelectInput
                      options={
                        insuranceCaseManagers?.data?.users?.map((manager) => ({
                          label: `${manager.firstName} ${manager.lastName}`,
                          value: manager.id,
                        })) || []
                      }
                      field={field}
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"billType"}
                render={({ field }) => (
                  <FormRender label={"Type of Bill"}>
                    <SelectInput options={billTypes} field={field} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"assignBenefits"}
                render={({ field }) => (
                  <FormRender label={"Assign Benefits?"}>
                    <SelectInput options={yesNoOptions} field={field} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"providerAcceptAssignment"}
                render={({ field }) => (
                  <FormRender label={"Provider Accept Assignment?"}>
                    <SelectInput options={assignmentStatuses} field={field} />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <FormHeader> Insurance Covered Dates for this Admission</FormHeader>

            <div className="grid grid-col-1 md:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"effectiveFrom"}
                render={({ field }) => (
                  <FormRender label={"Effective From"}>
                    <DateInput {...field} value={field.value as Date} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"effectiveThrough"}
                render={({ field }) => (
                  <FormRender label={"Effective Through"}>
                    <DateInput {...field} value={field.value as Date} />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <FormHeader> Subscriber Information</FormHeader>

            <div className="grid grid-col-1 md:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"patientRelationship"}
                render={({ field }) => (
                  <FormRender label={"Patient's Relationship to Insured"}>
                    <SelectInput options={relationshipOptions} field={field} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"lastName"}
                render={({ field }) => (
                  <FormRender label={"Last"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"firstName"}
                render={({ field }) => (
                  <FormRender label={"First"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"middleName"}
                render={({ field }) => (
                  <FormRender label={"Middle"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"suffix"}
                render={({ field }) => (
                  <FormRender label={"Suffix"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"dob"}
                render={({ field }) => (
                  <FormRender label={"Date of Birth"}>
                    <DateInput {...field} value={field.value as Date} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"sex"}
                render={({ field }) => (
                  <FormRender label={"Sex"}>
                    <SelectInput options={genderOptions} field={field} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"address1"}
                render={({ field }) => (
                  <FormRender label={"Address Line 1"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"address2"}
                render={({ field }) => (
                  <FormRender label={"Address Line 2"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"city"}
                render={({ field }) => (
                  <FormRender label={"City"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"state"}
                render={({ field }) => (
                  <FormRender label={"State"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"zip"}
                render={({ field }) => (
                  <FormRender label={"Zip"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      type="number"
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <FormHeader> Family / Related Caregivers</FormHeader>

            <p className="text-xs pb-2">
              If this patient is receiving care from a family member, spouse, or
              other related entity, record that information here. Any caregiver
              not specified as a relation will be indicated as “Other“ if the
              relationship is required for claim information.
            </p>
            <div>
              {fields.map((item, index) => (
                <div key={item.id}>
                  <div className="grid grid-col-1 md:grid-cols-2 gap-5">
                    {" "}
                    <FormField
                      control={methods.control}
                      name={`relatedCaregiver.${index}.caregiverId`}
                      render={({ field }) => (
                        <FormRender label={`Related Caregiver ${index + 1}`}>
                          <SelectInput
                            options={
                              caregivers?.data?.users?.map((caregiver) => ({
                                label: `${caregiver.firstName} ${caregiver.lastName}`,
                                value: caregiver.id,
                              })) || []
                            }
                            field={field}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={`relatedCaregiver.${index}.relationShip`}
                      render={({ field }) => (
                        <FormRender
                          label={`Relationship to Patient ${index + 1}`}
                        >
                          <SelectInput
                            options={patientRelationships}
                            field={field}
                          />
                        </FormRender>
                      )}
                    />
                  </div>

                  <div className={cn("flex space-x-3 items-center  mt-2")}>
                    {index === fields.length - 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() =>
                          append(insuranceDefaultValue.relatedCaregiver[0])
                        }
                      >
                        <PlusIcon className="size-4" />
                        Add More
                      </Button>
                    )}
                    {fields.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        type="button"
                        onClick={() => remove(index)}
                        className="!py-0"
                      >
                        <MinusIcon className="size-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <FormHeader>Copayment</FormHeader>
            <div className="grid grid-col-1 md:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"copayType"}
                render={({ field }) => (
                  <FormRender label={"Copay Type"}>
                    <RadioInput
                      className="grid md:grid-cols-2  items-center"
                      {...field}
                      options={[
                        { value: "fixed-amount", label: "Fixed Amount" },
                        {
                          value: "percentage-visit",
                          label: "Percentage of Visit Charge",
                        },
                        { value: "hourly-rate", label: "Hourly Rate" },
                      ]}
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"copayAmount"}
                render={({ field }) => (
                  <FormRender label={"Copay Amount/Percentage/Rate"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      type="number"
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <FormHeader>Comments</FormHeader>
            <div className="flex flex-col gap-5">
              <FormField
                control={methods.control}
                name={`comment`}
                render={({ field }) => (
                  <FormRender>
                    <Textarea {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <Button type="submit" loading={isMutating || isUpdating}>
            Submit
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default InsuranceModal;
