import React from "react";

import FormHeader from "@/components/form-header";
import {
  CheckboxGroup,
  FormField,
  FormRender,
  RadioInput,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { additionalFieldOneSchema } from "@/schema/assessment/soc-assess/addtional-field-one";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof additionalFieldOneSchema>;

const FallRisAssessment = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4">FALL RISK ASSESSMENT</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"historyOfFall"}
            render={({ field }) => (
              <FormRender label="History of falls?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <div>
            <p className="text-sm font-semibold pb-2">Education provided to:</p>
            <FormField
              control={methods.control}
              name={"historyOfFallEducationProvidedTo"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    disabled={!methods.watch("historyOfFall")?.includes("YES")}
                    methods={methods}
                    options={[
                      { value: "patient", label: "Patient" },
                      { value: "caregiver", label: "Caregiver" },
                    ]}
                    name={"historyOfFallEducationProvidedTo"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"over65"}
            render={({ field }) => (
              <FormRender label="Over 65?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <div>
            <p className="text-sm font-semibold pb-2">Education provided to:</p>
            <FormField
              control={methods.control}
              name={"over65EducationProvidedTo"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    disabled={!methods.watch("over65")?.includes("YES")}
                    methods={methods}
                    options={[
                      { value: "patient", label: "Patient" },
                      { value: "caregiver", label: "Caregiver" },
                    ]}
                    name={"over65EducationProvidedTo"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"multipleMedications"}
            render={({ field }) => (
              <FormRender label="Multiple medications?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <div>
            <p className="text-sm font-semibold pb-2">Education provided to:</p>
            <FormField
              control={methods.control}
              name={"multipleMedicationsEducationProvidedTo"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    disabled={
                      !methods.watch("multipleMedications")?.includes("YES")
                    }
                    methods={methods}
                    options={[
                      { value: "patient", label: "Patient" },
                      { value: "caregiver", label: "Caregiver" },
                    ]}
                    name={"multipleMedicationsEducationProvidedTo"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"mentalImpairments"}
            render={({ field }) => (
              <FormRender label="Mental impairments?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <div>
            <p className="text-sm font-semibold pb-2">Education provided to:</p>
            <FormField
              control={methods.control}
              name={"mentalImpairmentsEducationProvidedTo"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    disabled={
                      !methods.watch("mentalImpairments")?.includes("YES")
                    }
                    methods={methods}
                    options={[
                      { value: "patient", label: "Patient" },
                      { value: "caregiver", label: "Caregiver" },
                    ]}
                    name={"mentalImpairmentsEducationProvidedTo"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"incontinenceUrgency"}
            render={({ field }) => (
              <FormRender label="Incontinence/Urgency?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <div>
            <p className="text-sm font-semibold pb-2">Education provided to:</p>
            <FormField
              control={methods.control}
              name={"incontinenceUrgencyEducationProvidedTo"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    disabled={
                      !methods.watch("incontinenceUrgency")?.includes("YES")
                    }
                    methods={methods}
                    options={[
                      { value: "patient", label: "Patient" },
                      { value: "caregiver", label: "Caregiver" },
                    ]}
                    name={"incontinenceUrgencyEducationProvidedTo"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"impairedMobility"}
            render={({ field }) => (
              <FormRender label="Impaired mobility?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <div>
            <p className="text-sm font-semibold pb-2">Education provided to:</p>
            <FormField
              control={methods.control}
              name={"impairedMobilityEducationProvidedTo"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    disabled={
                      !methods.watch("impairedMobility")?.includes("YES")
                    }
                    methods={methods}
                    options={[
                      { value: "patient", label: "Patient" },
                      { value: "caregiver", label: "Caregiver" },
                    ]}
                    name={"impairedMobilityEducationProvidedTo"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"impairedTransferring"}
            render={({ field }) => (
              <FormRender label="Impaired transferring?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <div>
            <p className="text-sm font-semibold pb-2">Education provided to:</p>
            <FormField
              control={methods.control}
              name={"impairedTransferringEducationProvidedTo"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    disabled={
                      !methods.watch("impairedTransferring")?.includes("YES")
                    }
                    methods={methods}
                    options={[
                      { value: "patient", label: "Patient" },
                      { value: "caregiver", label: "Caregiver" },
                    ]}
                    name={"impairedTransferringEducationProvidedTo"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"evironmentalHazards"}
            render={({ field }) => (
              <FormRender label="Environmental hazards?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <div>
            <p className="text-sm font-semibold pb-2">Education provided to:</p>
            <FormField
              control={methods.control}
              name={"evironmentalHazardsEducationProvidedTo"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    disabled={
                      !methods.watch("evironmentalHazards")?.includes("YES")
                    }
                    methods={methods}
                    options={[
                      { value: "patient", label: "Patient" },
                      { value: "caregiver", label: "Caregiver" },
                    ]}
                    name={"evironmentalHazardsEducationProvidedTo"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"gender"}
            render={({ field }) => (
              <FormRender label="Gender:">
                <SelectInput
                  allowClear
                  options={[
                    { value: "normal", label: "< 10 seconds = normal" },
                    {
                      value: "not-a-fall-risk",
                      label: "< 14 seconds = not a fall risk",
                    },
                    {
                      value: "increased-risk-of-fall",
                      label: "> 14 seconds = increased risk of fall",
                    },
                  ]}
                  field={field}
                />
              </FormRender>
            )}
          />

          <FormField
            control={methods.control}
            name={"fallRiskAssessmentDocumentation"}
            render={({ field }) => (
              <FormRender label="Supporting Documentation:">
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default FallRisAssessment;
