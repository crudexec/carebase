import React from "react";

import FormHeader from "@/components/form-header";
import {
  CheckboxGroup,
  FormField,
  FormRender,
  Input,
  RadioInput,
  Textarea,
} from "@/components/ui";
import { additionalFieldOneSchema } from "@/schema/assessment/soc-assess/addtional-field-one";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof additionalFieldOneSchema>;

const SafetyStatus = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4">485 SAFETY MEASURES</FormHeader>
        <div className="grid gap-5">
          <div>
            <p className="text-sm font-semibold pb-2">Precautions for:</p>
            <FormField
              control={methods.control}
              name={"safetyMeasure"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      { value: "falls", label: "Falls" },
                      { value: "oxygen", label: "Oxygen" },
                      { value: "anticoagulation", label: "Anticoagulation" },
                      { value: "seizures", label: "Seizures" },
                      { value: "aspiration", label: "Aspiration" },
                      {
                        value: "infection-control",
                        label: "Infection control/Standard Precaution",
                      },
                    ]}
                    name={"safetyMeasure"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"otherSafetyMeasure"}
            render={({ field }) => (
              <FormRender label="Other:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">SENSORY STATUS</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"visualImpairment"}
            render={({ field }) => (
              <FormRender label="Visual Impairment?">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"glassContact"}
            render={({ field }) => (
              <FormRender label="Glass or/and Contacts">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"burningOfEyes"}
            render={({ field }) => (
              <FormRender label="Redness, itching, burning of eyes?">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"earDischarge"}
            render={({ field }) => (
              <FormRender label="Ear discharge or pain?">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"surgeryOnEyesOrEars"}
            render={({ field }) => (
              <FormRender label="Surgery on eyes or ears?">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"specifySurgery"}
            render={({ field }) => (
              <FormRender label="Specify Surgery (Ear or Eyes)">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={
                    !methods.watch("surgeryOnEyesOrEars")?.includes("YES")
                  }
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"dentures"}
            render={({ field }) => (
              <FormRender label="Dentures?">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"ptLimitedEducationBackground"}
            render={({ field }) => (
              <FormRender label="PT Limited educational background?">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"cgLimitedEducationBackground"}
            render={({ field }) => (
              <FormRender label="C/G Limited educational background?">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"ptReadingWritingProblems"}
            render={({ field }) => (
              <FormRender label="PT Reading or writing problems?">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"cgReadingWritingProblems"}
            render={({ field }) => (
              <FormRender label="C/G Reading or writing problems?">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"ptSlowLearner"}
            render={({ field }) => (
              <FormRender label="PT Slow learner?">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"cgSlowLearner"}
            render={({ field }) => (
              <FormRender label="C/G Slow learner?">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"primaryLanguage"}
            render={({ field }) => (
              <FormRender label="Primary Language:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"sensoryStatusDocumentation"}
            render={({ field }) => (
              <FormRender
                label="Supporting Documentation:"
                formClassName="lg:col-span-2"
              >
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default SafetyStatus;
