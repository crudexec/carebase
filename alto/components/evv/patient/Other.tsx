import { zodResolver } from "@hookform/resolvers/zod";
import { PatientOtherInfo, Physician } from "@prisma/client";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import React, { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useSWR from "swr";

import AppLoader from "@/components/app-loader";
import FormHeader from "@/components/form-header";
import { CreatePhysicianModal } from "@/components/patient";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  SelectInput,
  Textarea,
} from "@/components/ui";
import {
  evacuationLevel,
  patientConditionRelatedTo,
  regionOptions,
  signatureSourceCodes,
  yesNoOptions,
} from "@/constants";
import { useGetOtherInfo, usePopulateForm, useSaveOtherInfo } from "@/hooks";
import { cn, filterArray, getFullName, modifyDateFields } from "@/lib";
import {
  otherInfoDefaultValue,
  OtherInfoForm,
  otherInfoSchema,
} from "@/schema";
import { ApiResponse } from "@/types";

const Others = ({ patientId }: { patientId: string }) => {
  const methods = useForm<OtherInfoForm>({
    resolver: zodResolver(otherInfoSchema),
    defaultValues: otherInfoDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { data: meta, mutate: mutatePatientMeta } =
    useSWR<ApiResponse<Physician[]>>(`/api/physician`);
  const [action, setAction] = useState("");
  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "otherPhysician",
  });
  const { data, isLoading, mutate } = useGetOtherInfo({ patientId });
  const { data: saveResponse, trigger, isMutating } = useSaveOtherInfo();
  const infoData = useMemo(() => {
    const newData = {
      ...data?.data,
      otherPhysician: data?.data?.otherPhysician?.length
        ? data?.data.otherPhysician.map((item) => ({ ...item }))
        : otherInfoDefaultValue.otherPhysician,
    };
    return modifyDateFields(newData as PatientOtherInfo);
  }, [data]);

  usePopulateForm<OtherInfoForm, PatientOtherInfo>(methods.reset, infoData);

  useEffect(() => {
    if (saveResponse?.success) {
      toast.success(`Success|${saveResponse?.message}`);
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveResponse]);

  return (
    <Form {...methods}>
      <AppLoader loading={isLoading} />
      <CreatePhysicianModal
        mode={"create"}
        title={"Create Physician"}
        open={action === "create-physician"}
        modalClose={() => {
          mutatePatientMeta();
          setAction("");
        }}
      />
      <form
        className="overflow-auto flex flex-col gap-2 scrollbar-hide px-2"
        onSubmit={methods.handleSubmit(async (formData) => {
          await trigger({
            ...formData,
            patientId: patientId,
            id: data?.data?.id,
            otherPhysician: filterArray(formData.otherPhysician),
          });
        })}
      >
        <div className="flex justify-end text-end my-2">
          <Button loading={isMutating}>Save Changes</Button>
        </div>
        <div>
          <FormHeader className="mt-4">Comments</FormHeader>
          <div className="flex flex-col gap-5">
            <FormField
              control={methods.control}
              name={"comment"}
              render={({ field }) => (
                <FormRender>
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
        </div>

        <div>
          <FormHeader> Other</FormHeader>
          <div className="grid grid-col-1 md:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"noPublicity"}
              render={({ field }) => (
                <FormRender formClassName="self-end">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm">CAHPS No publicity</span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"telephony"}
              render={({ field }) => (
                <FormRender formClassName="self-end">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm">Telephony</span>
                  </div>
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"referralDate"}
              render={({ field }) => (
                <FormRender label={"Referral Date"}>
                  <DateInput {...field} value={field.value as Date} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={`region`}
              render={({ field }) => (
                <FormRender label={"Region"}>
                  <SelectInput options={regionOptions} field={field} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"sentDate"}
              render={({ field }) => (
                <FormRender label={"F2FE Sheet Sent Date"}>
                  <DateInput {...field} value={field.value as Date} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"receivedDate"}
              render={({ field }) => (
                <FormRender label={"F2FE Signed Sheet Received Date"}>
                  <DateInput {...field} value={field.value as Date} />
                </FormRender>
              )}
            />
          </div>

          <div className="mt-5">
            <p className="text-sm pb-2 font-semibold">Pharmacy Information</p>
            <div className="grid grid-col-1 md:grid-cols-2 gap-5 border border-dashed rounded-md p-3">
              <FormField
                control={methods.control}
                name={"pharmacyName"}
                render={({ field }) => (
                  <FormRender
                    label={"Pharmacy Name"}
                    formClassName="md:col-span-2"
                  >
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"pharmacyPhone"}
                render={({ field }) => (
                  <FormRender label={"Pharmacy Phone"}>
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
                name={"pharmacyFax"}
                render={({ field }) => (
                  <FormRender label={"Pharmacy Fax"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div className="mt-5 border border-dashed rounded-md p-3">
            <p className="text-sm pb-2 font-semibold">CareConnect</p>

            <FormField
              control={methods.control}
              name={"excludeCareConnect"}
              render={({ field }) => (
                <FormRender formClassName="self-end">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm">
                      Exclude this patient from CareConnect
                    </span>
                  </div>
                </FormRender>
              )}
            />
          </div>
        </div>

        <div>
          <FormHeader>Emergency Preparedness</FormHeader>
          <div>
            <FormField
              control={methods.control}
              name={`evacuationLevel`}
              render={({ field }) => (
                <FormRender label={"Evacuation Level"}>
                  <SelectInput options={evacuationLevel} field={field} />
                </FormRender>
              )}
            />
          </div>
        </div>

        <div>
          <FormHeader> Referring/Certifying Physician</FormHeader>
          <div className="flex flex-col gap-5">
            <FormField
              control={methods.control}
              name={`physicianId`}
              render={({ field }) => (
                <FormRender>
                  <SelectInput
                    options={[
                      ...(meta?.data?.map((item) => ({
                        value: item.id as string,
                        label: getFullName(
                          item?.lastName,
                          item?.firstName,
                          "Name not available",
                        ),
                      })) ?? []),
                      {
                        value: "create-physician",
                        label: "+ Create new physician",
                      },
                    ]}
                    field={{
                      ...field,
                      onChange: (value) => {
                        if (value === "create-physician") {
                          setAction("create-physician");
                        } else {
                          field.onChange(value);
                        }
                      },
                    }}
                    placeholder="Enter Physician Name"
                  />
                </FormRender>
              )}
            />
            <p className="text-sm p-5 border  border-l-[5px] rounded border-l-primary">
              Please select the referring/certifying physician to be included on
              the claim. If you select the wrong physician, you may use the X to
              clear the field or simply select another physician
            </p>
          </div>
        </div>

        <div>
          <FormHeader> Other Physicians</FormHeader>

          <div className="grid grid-col-1 md:grid-cols-2 gap-5">
            {fields.map((item, index) => (
              <div key={item.id}>
                <div
                  className={cn(
                    "grid grid-cols-1 gap-x-7 gap-y-4  w-full",
                    "lg:grid-cols-2",
                  )}
                >
                  <FormField
                    control={methods.control}
                    name={`otherPhysician.${index}.physicianId`}
                    render={({ field }) => (
                      <FormRender label={`Other Physician ${index + 1}`}>
                        <SelectInput
                          options={[
                            ...(meta?.data?.map((item) => ({
                              value: item.id as string,
                              label: getFullName(
                                item?.lastName,
                                item?.firstName,
                                "Name not available",
                              ),
                            })) ?? []),
                            {
                              value: "create-physician",
                              label: "+ Create new physician",
                            },
                          ]}
                          field={{
                            ...field,
                            onChange: (value) => {
                              if (value === "create-physician") {
                                setAction("create-physician");
                              } else {
                                field.onChange(value);
                              }
                            },
                          }}
                        />
                      </FormRender>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name={`otherPhysician.${index}.comment`}
                    render={({ field }) => (
                      <FormRender label={`Comment ${index + 1}`}>
                        <Input {...field} value={field.value as string} />
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
                        append(otherInfoDefaultValue.otherPhysician[0])
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
          <FormHeader> Required for UB-04 and CMS-1500 claims</FormHeader>

          <div className="flex flex-col gap-5">
            <FormField
              control={methods.control}
              name={`releaseInformation`}
              render={({ field }) => (
                <FormRender label={"Release Information?"}>
                  <SelectInput options={yesNoOptions} field={field} />
                </FormRender>
              )}
            />

            <p className="text-sm p-5 border  border-l-[5px] rounded border-l-primary">
              Indicate if provider has on file a signed statement by patient
              authorizing release of medical data to other organizations
            </p>
          </div>
        </div>

        <div>
          <FormHeader> Required for CMS-1500 claims</FormHeader>
          <div className="flex flex-col gap-5">
            <FormField
              control={methods.control}
              name={`patientSignatureSourceCode`}
              render={({ field }) => (
                <FormRender label={"Patient Signature Source Code"}>
                  <SelectInput options={signatureSourceCodes} field={field} />
                </FormRender>
              )}
            />
            <p className="text-sm p-5 border  border-l-[5px] rounded border-l-primary">
              Indicate how patient or subscriber authorization signatures were
              obtained and how they are being retained by provider
            </p>
          </div>
        </div>

        <div>
          <FormHeader> Patient's condition is related to</FormHeader>

          <div className="grid grid-col-1 md:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"patientConditions"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={patientConditionRelatedTo}
                    name={"patientConditions"}
                  />
                </FormRender>
              )}
            />
            {(methods.watch("patientConditions")?.includes("auto-accident") ||
              methods
                .watch("patientConditions")
                ?.includes("other-accident")) && (
              <FormField
                control={methods.control}
                name={"patientConditionState"}
                render={({ field }) => (
                  <FormRender label={"State"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            )}

            <FormField
              control={methods.control}
              name={"patientConditionDate"}
              render={({ field }) => (
                <FormRender label={"Date of Accident"}>
                  <DateInput {...field} value={field.value as Date} />
                </FormRender>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end text-end my-2">
          <Button loading={isMutating}>Save Changes</Button>
        </div>
      </form>
    </Form>
  );
};

export default Others;
