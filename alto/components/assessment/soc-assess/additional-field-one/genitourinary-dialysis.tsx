import { isEmpty } from "lodash";
import React from "react";

import FormHeader from "@/components/form-header";
import {
  CheckboxGroup,
  DateInput,
  FormField,
  FormRender,
  Input,
  RadioInput,
  Textarea,
} from "@/components/ui";
import { additionalFieldOneSchema } from "@/schema/assessment/soc-assess/addtional-field-one";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof additionalFieldOneSchema>;

const GenitourinaryDialysis = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4">GENITOURINARY ASSESSMENT</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"urgencyFrequency"}
            render={({ field }) => (
              <FormRender label="Urgency/frequency?">
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
            name={"painfulUrination"}
            render={({ field }) => (
              <FormRender label="Burning or painful urination?">
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
            name={"genitourinaryRetention"}
            render={({ field }) => (
              <FormRender label="Retention?">
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
            name={"genitourinaryOliguria"}
            render={({ field }) => (
              <FormRender label="Oliguria?">
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
            name={"nocturia"}
            render={({ field }) => (
              <FormRender label="Nocturia?">
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
            name={"describeNocturia"}
            render={({ field }) => (
              <FormRender label="xNoc">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={!methods.watch("nocturia")?.includes("YES")}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"hematuria"}
            render={({ field }) => (
              <FormRender label="Hematuria?">
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
            name={"describeHematuria"}
            render={({ field }) => (
              <FormRender label="Describe">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={!methods.watch("hematuria")?.includes("YES")}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"externalCatheter"}
            render={({ field }) => (
              <FormRender label="External Catheter?">
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
            name={"describeExternalCatheter"}
            render={({ field }) => (
              <FormRender label="Assess Use:">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={!methods.watch("externalCatheter")?.includes("YES")}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"indwellingCatheter"}
            render={({ field }) => (
              <FormRender label="Indwelling Catheter?">
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
            name={"suprapubic"}
            render={({ field }) => (
              <FormRender label="Suprapubic?">
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
            name={"indwellingCatheterSize"}
            render={({ field }) => (
              <FormRender label="Indwelling Catheter Size:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"balloonSize"}
            render={({ field }) => (
              <FormRender label="Balloon Size:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={`indwellingCatheterLastChanged`}
            render={({ field }) => (
              <FormRender label="Last changed:">
                <DateInput
                  {...field}
                  value={field.value as Date}
                  className="flex-1"
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"requiresIrrigation"}
            render={({ field }) => (
              <FormRender label="Requires Irrigation?">
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
            name={"indwellingCatheterSolution"}
            render={({ field }) => (
              <FormRender label="Solution:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"indwellingCatheterAmount"}
            render={({ field }) => (
              <FormRender label="Amount:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"indwellingCatheterFrequency"}
            render={({ field }) => (
              <FormRender label="Frequency:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"selfCatheterization"}
            render={({ field }) => (
              <FormRender label="Self-Catheterization?">
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
            name={"catheterSize"}
            render={({ field }) => (
              <FormRender label="Catheter Size:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"catheterFrequency"}
            render={({ field }) => (
              <FormRender label="Frequency:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <div className="lg:col-span-2">
            <p className="text-sm pb-2 font-semibold">Performed by:</p>
            <FormField
              control={methods.control}
              name={"performedBy"}
              render={() => (
                <FormRender formClassName="flex  flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      { value: "patient", label: "Patient" },
                      { value: "caregiver", label: "Caregiver" },
                      { value: "SN", label: "SN" },
                    ]}
                    name={"performedBy"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"abnormalUrineOdor"}
            render={({ field }) => (
              <FormRender label="Abnormal urine odor or appearance?">
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
            name={"describeAbnormalUrineOdor"}
            render={({ field }) => (
              <FormRender label="Assess Use:">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={
                    !methods.watch("abnormalUrineOdor")?.includes("YES")
                  }
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"genitourinaryAssessmentDocumentation"}
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
      <div>
        <FormHeader className="mt-4">DIALYSIS</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"dialysis"}
            render={({ field }) => (
              <FormRender label="Dialysis?" formClassName="lg:col-span-2">
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
          <FormField
            control={methods.control}
            name={"dialysisOptions"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  disabled={!methods.watch("dialysis")?.includes("YES")}
                  options={[
                    { value: "hemo-with", label: "Hemo with" },
                    { value: "av-shunt", label: "AV Shunt" },
                    { value: "central-line", label: "Central Line" },
                    { value: "thrill", label: "Thrill" },
                    { value: "bruit", label: "Bruit" },
                  ]}
                  name={"dialysisOptions"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"dialysisDescribe"}
            render={({ field }) => (
              <FormRender label="Describe:">
                <Input
                  disabled={isEmpty(methods.watch("dialysis"))}
                  {...field}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"peritonealAccessLocation"}
            render={({ field }) => (
              <FormRender label="Peritoneal Access Location:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"dialysisCenterLocation"}
            render={({ field }) => (
              <FormRender label="Dialysis Center Location:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"dialysisContact"}
            render={({ field }) => (
              <FormRender label="Contact:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"dialysisPhone"}
            render={({ field }) => (
              <FormRender label="Phone:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"dialyisisDocumentation"}
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

export default GenitourinaryDialysis;
