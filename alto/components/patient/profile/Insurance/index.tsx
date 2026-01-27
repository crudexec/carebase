"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import useSWRMutation from "swr/mutation";

import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  Form,
  FormField,
  FormRender,
  Input,
  MultiSelect,
  SelectInput,
} from "@/components/ui";
import { serviceRequiredOptions } from "@/constants";
import {
  useGetPayers,
  usePopulateForm,
  useUpdatePatientInsurance,
} from "@/hooks";
import { cn } from "@/lib";
import {
  patientInsuranceDefaultValue,
  PatientInsuranceForm,
  patientInsuranceSchema,
} from "@/schema";

const Insurance = ({
  data,
  patientId,
  mutate,
}: {
  data?: PatientInsuranceForm;
  patientId?: string;
  mutate: () => void;
}) => {
  const {
    data: updatePatient,
    trigger,
    isMutating,
  } = useSWRMutation("/api/patient/insurance", useUpdatePatientInsurance);
  const { data: payers } = useGetPayers({});
  const methods = useForm<PatientInsuranceForm>({
    resolver: zodResolver(patientInsuranceSchema),
    defaultValues: patientInsuranceDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  usePopulateForm<PatientInsuranceForm, PatientInsuranceForm>(
    methods.reset,
    data as PatientInsuranceForm,
  );

  useEffect(() => {
    if (updatePatient?.success) {
      mutate();
      toast.success(`Success|${updatePatient?.message}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatePatient]);

  return (
    <Form {...methods}>
      <form
        className="mt-2 justify-between flex flex-col scrollbar-hide max-h-[calc(100vh-130px)] md:max-h-[calc(100vh-180px)] overflow-auto pb-8"
        onSubmit={methods.handleSubmit(async (formData) => {
          await trigger({
            ...formData,
            patientId,
          });
        })}
      >
        <div className="md:px-8 px-2 bg-background border-b border-b-border flex justify-between items-center uppercase  font-semibold  text-white  py-2 mx-2 mb-4 sticky top-0 z-[1]">
          <p className="text-foreground">Insurance Information</p>
          <Button
            type="submit"
            className={cn("py-2 text-white")}
            loading={isMutating}
          >
            Save Changes
          </Button>
        </div>
        <FormHeader className="mt-2">
          INSTITUTIONAL UB04 (Medicare - HCPCS Codes Only)
        </FormHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4 items-end">
          <FormField
            control={methods.control}
            name={"MEDICARE.status"}
            render={({ field }) => (
              <FormRender formClassName="self-center">
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">Medicare</span>
                </div>
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"MEDICARE.daysPerEpisode"}
            render={({ field }) => (
              <FormRender label={"Days Per Episode"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          {methods.watch("MEDICARE.status") && (
            <FormField
              control={methods.control}
              name={"MEDICARE.serviceRequired"}
              render={({ field }) => (
                <FormRender label={"Services Required"}>
                  <MultiSelect
                    options={serviceRequiredOptions}
                    value={field.value as string[]}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                  />
                </FormRender>
              )}
            />
          )}
        </div>
        <FormHeader>
          INSTITUTIONAL UB04 (Medicare Advantage - HMO, HCPCS Codes Only)
        </FormHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4 items-end">
          <FormField
            control={methods.control}
            name={"NON_MEDICARE.status"}
            render={({ field }) => (
              <FormRender formClassName="self-center">
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">Non-Medicare (Episodic) UB04</span>
                </div>
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"NON_MEDICARE.daysPerEpisode"}
            render={({ field }) => (
              <FormRender label={"Days Per Episode"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"NON_MEDICARE.noOfVisitAuthorized"}
            render={({ field }) => (
              <FormRender label={"No. of Visits Authorized"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          {methods.watch("NON_MEDICARE.status") && (
            <>
              <FormField
                control={methods.control}
                name={"NON_MEDICARE.serviceRequired"}
                render={({ field }) => (
                  <FormRender label={"Services Required"}>
                    <MultiSelect
                      options={[
                        {
                          label: "Physical Therapist",
                          value: "physical-therapist",
                        },
                        {
                          label: "Occupational Therapist",
                          value: "occupational-therapist",
                        },
                        {
                          label: "Speech Therapist",
                          value: "speech-therapist",
                        },
                        {
                          label: "Psychiatric Caregivers",
                          value: "psychiatric-caregivers",
                        },
                        {
                          label: "Skilled Nurse",
                          value: "skilled-nurse",
                        },
                        {
                          label: "Medical Social Worker",
                          value: "medical-social-worker",
                        },
                        {
                          label: "Home Health Aide",
                          value: "home-health-aide",
                        },
                      ]}
                      value={field.value as string[]}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                    />
                  </FormRender>
                )}
              />{" "}
              <FormField
                control={methods.control}
                name={"NON_MEDICARE.company"}
                render={({ field }) => (
                  <FormRender label={"Company"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"NON_MEDICARE.payerId"}
                render={({ field }) => (
                  <FormRender label={"Payer ID"}>
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
              <FormField
                control={methods.control}
                name={"NON_MEDICARE.insuredId"}
                render={({ field }) => (
                  <FormRender label={"Patient Insured ID"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"NON_MEDICARE.clearingClaims"}
                render={({ field }) => (
                  <FormRender label={"Clearing House to send claims"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </>
          )}
        </div>
        <FormHeader>
          MANAGED CARE (No set dates limit, CPT/HCPCS, modifiers and
          authorizations )
        </FormHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4 items-end">
          <FormField
            control={methods.control}
            name={"MANAGED_CARE.status"}
            render={({ field }) => (
              <FormRender formClassName="self-center">
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">
                    Managed Care (Non Episodic) UB04
                  </span>
                </div>
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"MANAGED_CARE.daysPerEpisode"}
            render={({ field }) => (
              <FormRender label={"Days Per Episode"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"MANAGED_CARE.noOfVisitAuthorized"}
            render={({ field }) => (
              <FormRender label={"No. of Visits Authorized"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          {methods.watch("MANAGED_CARE.status") && (
            <>
              <FormField
                control={methods.control}
                name={"MANAGED_CARE.serviceRequired"}
                render={({ field }) => (
                  <FormRender label={"Services Required"}>
                    <MultiSelect
                      options={serviceRequiredOptions}
                      value={field.value as string[]}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                    />
                  </FormRender>
                )}
              />{" "}
              <FormField
                control={methods.control}
                name={"MANAGED_CARE.company"}
                render={({ field }) => (
                  <FormRender label={"Company"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"MANAGED_CARE.payerId"}
                render={({ field }) => (
                  <FormRender label={"Payer ID"}>
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
              <FormField
                control={methods.control}
                name={"MANAGED_CARE.insuredId"}
                render={({ field }) => (
                  <FormRender label={"Patient Insured ID"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              {/* <FormField
                control={methods.control}
                name={'MANAGED_CARE.clearingClaims'}
                render={({ field }) => (
                  <FormRender label={'Clearing House to send claims'}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              /> */}
            </>
          )}
        </div>

        <FormHeader>
          PROFESSIONAL CMS-1500 (No set dates limit, CPT/HCPCS, modifiers,
          authorizations - Medicaid, Hospital etc )
        </FormHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4 items-end">
          <FormField
            control={methods.control}
            name={"CMS.status"}
            render={({ field }) => (
              <FormRender formClassName="self-center">
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">CMS 1500</span>
                </div>
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"CMS.daysPerEpisode"}
            render={({ field }) => (
              <FormRender label={"Days Per Episode"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          {methods.watch("CMS.status") && (
            <>
              <FormField
                control={methods.control}
                name={"CMS.serviceRequired"}
                render={({ field }) => (
                  <FormRender label={"Services Required"}>
                    <MultiSelect
                      options={serviceRequiredOptions}
                      value={field.value as string[]}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                    />
                  </FormRender>
                )}
              />{" "}
              <FormField
                control={methods.control}
                name={"CMS.company"}
                render={({ field }) => (
                  <FormRender label={"Company"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"CMS.payerId"}
                render={({ field }) => (
                  <FormRender label={"Payer ID"}>
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
              <FormField
                control={methods.control}
                name={"CMS.clearingClaims"}
                render={({ field }) => (
                  <FormRender label={"Clearing House to send claims"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </>
          )}
        </div>

        <FormHeader>
          Hospice (Medicare, CPT/HCPCS, modifiers and authorizations )
        </FormHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4 items-end">
          <FormField
            control={methods.control}
            name={"HOSPICE.status"}
            render={({ field }) => (
              <FormRender formClassName="self-center">
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">Hospice</span>
                </div>
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"HOSPICE.daysPerEpisode"}
            render={({ field }) => (
              <FormRender label={"Days Per Episode"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          {methods.watch("HOSPICE.status") && (
            <>
              <FormField
                control={methods.control}
                name={"HOSPICE.serviceRequired"}
                render={({ field }) => (
                  <FormRender label={"Services Required"}>
                    <MultiSelect
                      options={serviceRequiredOptions}
                      value={field.value as string[]}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                    />
                  </FormRender>
                )}
              />
            </>
          )}
        </div>
      </form>
    </Form>
  );
};

export default Insurance;
