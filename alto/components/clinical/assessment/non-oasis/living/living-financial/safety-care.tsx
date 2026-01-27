import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Form,
  FormField,
  FormRender,
  Input,
  Textarea,
} from "@/components/ui";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { parseData, parseDateString } from "@/lib";
import {
  safetyCareDefaultValues,
  SafetyCareForm,
  safetyCareSchema,
} from "@/schema/clinical/assessment/non-oasis/living/living-financial/safety-care";

const SafetyCare = ({
  assessmentId,
  data,
  livingFinancial,
  callback,
  caregiver,
  disabled,
  dateCompleted,
  patientId,
}: {
  assessmentId?: string;
  data: SafetyCareForm;
  livingFinancial: object;
  patientId: string;
  callback: (assessmentId?: string) => void;
  caregiver?: User;
  disabled?: boolean;
  dateCompleted?: Date;
}) => {
  const { data: response, trigger, isMutating } = useSaveAssessment();
  const methods = useForm<SafetyCareForm>({
    resolver: zodResolver(safetyCareSchema),
    defaultValues: safetyCareDefaultValues,
    mode: "onChange",
    shouldUnregister: false,
  });

  useEffect(() => {
    if (response?.success) {
      toast.success("Data saved successfully!");
      callback(response?.data?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  usePopulateForm<SafetyCareForm, SafetyCareForm>(methods.reset, data);

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(async (formData) => {
          await trigger({
            livingFinancial: {
              ...livingFinancial,
              ...parseData({ safetyCare: formData }),
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
          <div className="grid gap-5">
            <div>
              <p className="text-sm font-semibold pb-2">
                Skilled Nursing Assessment, Evaluation
              </p>
              <FormField
                control={methods.control}
                name={"skilledNursing"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      disabled={disabled}
                      options={[
                        { value: "vital-signs", label: "Vital Signs" },
                        {
                          value: "emotional-status",
                          label: "Mental, Emotional Status",
                        },
                        { value: "safety-at-home", label: "Safety at Home" },
                        {
                          value: "ability-of-caregiver",
                          label:
                            "Ability of Caregiver/Family to provide care for patient",
                        },
                        {
                          value: "medication-safety",
                          label: "Medication Safety",
                        },
                      ]}
                      name={"skilledNursing"}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div>
              <p className="text-sm font-semibold pb-2">
                Skilled Nursing Instructions/Teaching
              </p>
              <FormField
                control={methods.control}
                name={"instructions"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      disabled={disabled}
                      options={[
                        { value: "medical-safety", label: "Medical Safety" },
                        {
                          value: "Seizure precaution and Safety",
                          label: "seizure-precaution",
                        },
                        {
                          value: "ambulation-safety",
                          label: "Ambulation safety, fall precaution",
                        },
                        {
                          value: "anticoagulation-safety",
                          label: "Anticoagulation Safety and precaution",
                        },
                        {
                          value: "cardiac-precaution",
                          label: "Cardiac precaution and Safety",
                        },
                        {
                          value: "infection-control",
                          label:
                            "Infection control/precaution, Universal Precaution",
                        },
                        { value: "oxygen-use", label: "Oxygen use safety" },
                        {
                          value: "emergency-information",
                          label: "Emergency Information",
                        },
                        {
                          value: "hazardous-materials",
                          label: "Hazardous materials",
                        },
                        {
                          value: "orthopedic-safety",
                          label:
                            "Orthopedic Safety(for joint replacement/spinal surgery patients)",
                        },
                        {
                          value: "emergency-planning",
                          label: "Emergency Preparedness Planning",
                        },
                      ]}
                      name={"instructions"}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>
        </div>
        <div>
          <FormHeader>Safety Goals</FormHeader>
          <div className="grid lg:grid-cols-2 gap-5 items-center">
            <FormField
              control={methods.control}
              name={"patientSafe"}
              render={({ field }) => (
                <FormRender formClassName="mt-4  md:col-span-2">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">
                      Patient will remain safe at home during plan of care
                    </span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"patientVerbalize"}
              render={({ field }) => (
                <FormRender formClassName="mt-4">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">
                      Patient will verbalize understanding about safety measure
                      within
                    </span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"patientVerbalizeValue"}
              render={({ field }) => (
                <FormRender label={""}>
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={disabled || !methods.watch("patientVerbalize")}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"patientDemonstrate"}
              render={({ field }) => (
                <FormRender formClassName="mt-4">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">
                      Patient will demonstrate correct safety techniques related
                      to care within{" "}
                    </span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"patientDemonstrateValue"}
              render={({ field }) => (
                <FormRender label={""}>
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={disabled || !methods.watch("patientDemonstrate")}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"patientKnowledgeable"}
              render={({ field }) => (
                <FormRender formClassName="mt-4">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">
                      Patient will be knowledgeable about emergency information,
                      emergency Preparedness plan within
                    </span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"patientKnowledgeableValue"}
              render={({ field }) => (
                <FormRender label={""}>
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={
                      disabled || !methods.watch("patientKnowledgeableValue")
                    }
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"other"}
              render={({ field }) => (
                <FormRender formClassName="mt-4">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">Other</span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"otherValue"}
              render={({ field }) => (
                <FormRender label={""}>
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />
          </div>
        </div>
        <div>
          <FormHeader>Safety Measures</FormHeader>

          <div className="flex flex-col gap-5">
            <FormField
              control={methods.control}
              name={"safeMeasures"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    disabled={disabled}
                    options={[
                      {
                        value: "fall-precautions",
                        label: "Fall Precautions/Transfer Safty",
                      },
                      {
                        value: "seizure-precaution",
                        label: "Seizure precaution",
                      },
                      {
                        value: "aspiration-precaution",
                        label: "Aspiration precaution",
                      },
                      {
                        value: "universal-precaution",
                        label: "Uniersal/Infection precaution",
                      },
                      { value: "keep-pathway", label: "Keep pathways clear" },
                      {
                        value: "anticoagulation-precaution",
                        label: "Anticoagulation precaution",
                      },
                      { value: "keep-side", label: "Keep side rails up" },
                      {
                        value: "oxygen-usage",
                        label: "Oxygen usage precaution",
                      },
                      {
                        value: "proper-use",
                        label: "Proper use of assistive devices",
                      },
                      { value: "supervision", label: "Supervision for " },
                      { value: "other", label: "Other" },
                    ]}
                    name={"safeMeasures"}
                  />
                </FormRender>
              )}
            />

            <div className="grid lg:grid-cols-2 gap-5">
              {methods.watch("safeMeasures")?.includes("supervision") && (
                <FormField
                  disabled={disabled}
                  control={methods.control}
                  name={"safetyMeasureHours"}
                  render={({ field }) => (
                    <FormRender label={"Hours"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              )}

              {methods.watch("safeMeasures")?.includes("other") && (
                <FormField
                  disabled={disabled}
                  control={methods.control}
                  name={"otherSafeMeasures"}
                  render={({ field }) => (
                    <FormRender label={"Other"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              )}
            </div>

            <FormField
              disabled={disabled}
              control={methods.control}
              name={"comments"}
              render={({ field }) => (
                <FormRender label={"Comments"}>
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />
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

export default SafetyCare;
