import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Flex from "@/components/flex";
import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Form,
  FormField,
  FormRender,
  Input,
  RadioInput,
  Textarea,
} from "@/components/ui";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { parseData, parseDateString } from "@/lib";
import { HistoryAndDiagnosisForm } from "@/schema";
import {
  medicalHistoryDefaultValues,
  MedicalHistoryForm,
  medicalHistorySchema,
} from "@/schema/clinical/assessment/non-oasis/medical-history";

const MedicalHistory = ({
  assessmentId,
  data,
  historyAndDiagnosis,
  callback,
  caregiver,
  disabled,
  dateCompleted,
  patientId,
}: {
  assessmentId?: string;
  data: MedicalHistoryForm;
  historyAndDiagnosis: HistoryAndDiagnosisForm;
  patientId: string;
  callback: (assessmentId?: string) => void;
  caregiver?: User;
  disabled?: boolean;
  dateCompleted?: Date;
}) => {
  const methods = useForm<MedicalHistoryForm>({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: medicalHistoryDefaultValues,
    mode: "onChange",
    shouldUnregister: false,
  });

  const { data: response, trigger, isMutating } = useSaveAssessment();

  useEffect(() => {
    if (response?.success) {
      toast.success("Data saved successfully!");
      callback(response?.data?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  usePopulateForm<MedicalHistoryForm, MedicalHistoryForm>(methods.reset, data);

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(async (formData) => {
          await trigger({
            historyAndDiagnosis: {
              ...historyAndDiagnosis,
              ...parseData({ medHistoryData: formData }),
            },
            id: assessmentId,
            caregiverId: caregiver?.id as string,
            dateCompleted: parseDateString(dateCompleted),
            patientId,
            source: "NON_OASIS",
          });
        })}
      >
        <div>
          <div className="flex justify-end text-end mt-2">
            <Button className="px-6" disabled={disabled} loading={isMutating}>
              Save Changes{" "}
            </Button>
          </div>
          <FormHeader className="mt-4">Advanced Directives</FormHeader>

          <div className="grid lg:grid-cols-2 gap-5">
            <Flex className="items-center justify-between">
              <p className="text-sm">Does the patient have a living will</p>
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"isLivingWill"}
                render={({ field }) => {
                  return (
                    <FormRender>
                      <RadioInput
                        className="flex-row flex-wrap gap-5 lg:items-center"
                        {...field}
                        value={field.value as string}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        options={[
                          { value: "yes", label: "Yes" },
                          { value: "no", label: "No" },
                        ]}
                      />
                    </FormRender>
                  );
                }}
              />
            </Flex>
            <Flex className="items-center justify-between">
              <p className="text-sm">Was a copy requested</p>
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"isCopyRequested"}
                render={({ field }) => {
                  return (
                    <FormRender>
                      <RadioInput
                        className="flex-row flex-wrap gap-5 lg:items-center"
                        {...field}
                        value={field.value as string}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        options={[
                          { value: "yes", label: "Yes" },
                          { value: "no", label: "No" },
                        ]}
                      />
                    </FormRender>
                  );
                }}
              />
            </Flex>
            <Flex className="items-center justify-between">
              <p className="text-sm">Does the patient have DPOA</p>
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"isDPOA"}
                render={({ field }) => {
                  return (
                    <FormRender>
                      <RadioInput
                        className="flex-row flex-wrap gap-5 lg:items-center"
                        {...field}
                        value={field.value as string}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        options={[
                          { value: "yes", label: "Yes" },
                          { value: "no", label: "No" },
                        ]}
                      />
                    </FormRender>
                  );
                }}
              />
            </Flex>
            <Flex className="items-center justify-between">
              <p className="text-sm">Education Material provided</p>
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"isMaterialProvided"}
                render={({ field }) => {
                  return (
                    <FormRender>
                      <RadioInput
                        className="flex-row flex-wrap gap-5 lg:items-center"
                        {...field}
                        value={field.value as string}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        options={[
                          { value: "yes", label: "Yes" },
                          { value: "no", label: "No" },
                        ]}
                      />
                    </FormRender>
                  );
                }}
              />
            </Flex>
            <Flex className="items-center justify-between">
              <p className="text-sm">Was a copy provided to the agency</p>
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"isAgencyCopy"}
                render={({ field }) => {
                  return (
                    <FormRender>
                      <RadioInput
                        className="flex-row flex-wrap gap-5 lg:items-center"
                        {...field}
                        value={field.value as string}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        options={[
                          { value: "yes", label: "Yes" },
                          { value: "no", label: "No" },
                        ]}
                      />
                    </FormRender>
                  );
                }}
              />
            </Flex>
          </div>
        </div>
        <div>
          <FormHeader>Medical History</FormHeader>
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="grid gap-5 items-center">
              <Flex className="items-center justify-between">
                <p className="text-sm">
                  Does the patient/Family understand present diagnoses
                </p>
                <FormField
                  disabled={disabled}
                  control={methods.control}
                  name={"isDiagnosesUnderstood"}
                  render={({ field }) => {
                    return (
                      <FormRender>
                        <RadioInput
                          className="flex-row flex-wrap gap-5 lg:items-center"
                          {...field}
                          value={field.value as string}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                          options={[
                            { value: "yes", label: "Yes" },
                            { value: "no", label: "No" },
                          ]}
                        />
                      </FormRender>
                    );
                  }}
                />
              </Flex>
            </div>
            <FormField
              control={methods.control}
              name={"significantMedicalHistory"}
              render={({ field }) => (
                <FormRender label={"Significant Medical History"}>
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
        </div>
        <div>
          <FormHeader> Homebound Status</FormHeader>

          <div className="flex flex-col gap-5">
            <FormField
              control={methods.control}
              name={"homeboundReason"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    disabled={disabled}
                    options={[
                      {
                        value: "requires-assistance",
                        label: "Requires assistance for most to all ADL",
                      },
                      {
                        value: "unsafe-to-leave",
                        label: "Unsafe to leave home unassisted",
                      },
                      {
                        value: "patient-is-bedridden",
                        label: "Patient is Bedridden",
                      },
                      {
                        value: "medical-restriction",
                        label: "Medical restrictions",
                      },
                      {
                        value: "taxing-effort",
                        label: "Taxing effort to leave home",
                      },
                      {
                        value: "residual-weakness",
                        label: "Residual Weakness",
                      },
                      {
                        value: "depended-upon-device",
                        label: "Dependent upon supportive device(s)",
                      },
                      { value: "sob-on-exertion", label: "SOB on exertion" },
                      { value: "other", label: "Other" },
                    ]}
                    name={"homeboundReason"}
                  />
                </FormRender>
              )}
            />

            {methods.watch("homeboundReason")?.includes("other") && (
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"otherHomeBoundReason"}
                render={({ field }) => (
                  <FormRender label={"Other"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            )}
          </div>
        </div>
        <div>
          <FormHeader>Allergies</FormHeader>

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <FormField
                control={methods.control}
                name={"nkda"}
                render={({ field }) => (
                  <FormRender formClassName="">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={disabled}
                      />
                      <span className="text-sm">NKDA</span>
                    </div>
                  </FormRender>
                )}
              />
              <p className="text-sm text-primary">
                Replace from Patient Admission {">"} Allergies
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"drugAllergies"}
                render={({ field }) => (
                  <FormRender label={"Drug Allergies"}>
                    <Textarea {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"foodAllergies"}
                render={({ field }) => (
                  <FormRender label={"Food Allergies"}>
                    <Textarea {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end text-end my-2">
          <Button className="px-6" disabled={disabled} loading={isMutating}>
            Save Changes{" "}
          </Button>
        </div>{" "}
      </form>
    </Form>
  );
};

export default MedicalHistory;
