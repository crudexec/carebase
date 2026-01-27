import {} from "lodash";
import React from "react";

import FormHeader from "@/components/form-header";
import {
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

const ReproductiveGastroIntestinal = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4">REPRODUCTIVE ASSESSMENT</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"prostateProblem"}
            render={({ field }) => (
              <FormRender
                label="Prostate problems?"
                formClassName="lg:col-span-2"
              >
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "NA", label: "NA" },
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"menopauseProblem"}
            render={({ field }) => (
              <FormRender label="Abnormal menses/menopause problems?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "NA", label: "NA" },
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"describeMenopauseProblem"}
            render={({ field }) => (
              <FormRender label="Describe:">
                <Input
                  disabled={!methods.watch("menopauseProblem")?.includes("YES")}
                  {...field}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"dischargeFromVagina"}
            render={({ field }) => (
              <FormRender label="Discharge from vagina/penis?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "NA", label: "NA" },
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"breastLump"}
            render={({ field }) => (
              <FormRender label="Breast lump/discharge?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "NA", label: "NA" },
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"reproductiveAssessmentDocumentation"}
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
        <FormHeader className="mt-4">GASTROINTESTINAL ASSESSMENT</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"nausea"}
            render={({ field }) => (
              <FormRender label="Nausea/vomiting?">
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
            name={"describeNausea"}
            render={({ field }) => (
              <FormRender label="Describe:">
                <Input
                  disabled={!methods.watch("nausea")?.includes("YES")}
                  {...field}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"abnormalPain"}
            render={({ field }) => (
              <FormRender label="Abnormal pain?">
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
            name={"describeAbnormalPain"}
            render={({ field }) => (
              <FormRender label="Describe:">
                <Input
                  disabled={!methods.watch("abnormalPain")?.includes("YES")}
                  {...field}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"stoolCharacteristics"}
            render={({ field }) => (
              <FormRender label="Stool characteristics?">
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
            name={"describeStoolCharacteristics"}
            render={({ field }) => (
              <FormRender label="Describe:">
                <Input
                  disabled={
                    !methods.watch("stoolCharacteristics")?.includes("YES")
                  }
                  {...field}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"constipation"}
            render={({ field }) => (
              <FormRender label="Diarrhea/Constipation?">
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
            name={"abuseOfLaxatives"}
            render={({ field }) => (
              <FormRender label="Use/abuse of laxatives?">
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
            name={"otherGiIssues"}
            render={({ field }) => (
              <FormRender label="Other GI issues?">
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
            name={"abdominalDistention"}
            render={({ field }) => (
              <FormRender label="Abdominal distention or tenderness?">
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
            name={"minimalBowelSound"}
            render={({ field }) => (
              <FormRender label="Absent or minimal bowel sounds?">
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
            name={"describeMinimalBowelSound"}
            render={({ field }) => (
              <FormRender label="Describe:">
                <Input
                  disabled={
                    !methods.watch("minimalBowelSound")?.includes("YES")
                  }
                  {...field}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"abdominalSound"}
            render={({ field }) => (
              <FormRender label="Abdominal masses?">
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
            name={"describeAbdominalSound"}
            render={({ field }) => (
              <FormRender label="Describe:">
                <Input
                  disabled={!methods.watch("abdominalSound")?.includes("YES")}
                  {...field}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={`dateOfLastBm`}
            render={({ field }) => (
              <FormRender label="Date of Last BM:">
                <DateInput {...field} value={field.value as Date} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"gastroIntestinalAssessmentDocumentation"}
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

export default ReproductiveGastroIntestinal;
