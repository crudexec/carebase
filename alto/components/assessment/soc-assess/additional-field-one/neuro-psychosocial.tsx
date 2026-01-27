import {} from "lodash";
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

const NeuroPyschoSocial = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4">NEURO ASSESSMENT</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"tremors"}
            render={({ field }) => (
              <FormRender label="Tremors?">
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
            name={"describeTremors"}
            render={({ field }) => (
              <FormRender label="Describe:">
                <Input
                  disabled={!methods.watch("tremors")?.includes("YES")}
                  {...field}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"unsteadyGait"}
            render={({ field }) => (
              <FormRender label="Unsteady gait, or ataxia?">
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
            name={"describeUnsteadyGait"}
            render={({ field }) => (
              <FormRender label="Describe:">
                <Input
                  disabled={!methods.watch("unsteadyGait")?.includes("YES")}
                  {...field}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"impairedBalance"}
            render={({ field }) => (
              <FormRender label="Impaired balance/coordination?">
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
            name={"vertigo"}
            render={({ field }) => (
              <FormRender label="Vertigo or syncope?">
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
            name={"episodeOfUnconsciousness"}
            render={({ field }) => (
              <FormRender label="Episodes of unconsciousnes?">
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
            name={"describeEpisodeOfUnconsciousness"}
            render={({ field }) => (
              <FormRender label="Describe:">
                <Input
                  disabled={
                    !methods.watch("episodeOfUnconsciousness")?.includes("YES")
                  }
                  {...field}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"sensoryLoss"}
            render={({ field }) => (
              <FormRender label="Sensory loss?">
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
            name={"describeSensoryLoss"}
            render={({ field }) => (
              <FormRender label="Describe:">
                <Input
                  disabled={!methods.watch("sensoryLoss")?.includes("YES")}
                  {...field}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold pb-2">Paralysis?</p>
            <FormField
              control={methods.control}
              name={"neuroParalysis"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      { value: "quadriplegia", label: "Quadriplegia" },
                      { value: "dominant-side", label: "Dominant Side" },
                      { value: "paraplegia", label: "Paraplegia" },
                      { value: "non-dominant", label: "Non Dominant" },
                    ]}
                    name={"neuroParalysis"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"aphasia"}
            render={({ field }) => (
              <FormRender label="Aphasia?">
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
            name={"pupilsEqual"}
            render={({ field }) => (
              <FormRender label="Pupils Equal? React to light?">
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
            name={"neuroHeadaches"}
            render={({ field }) => (
              <FormRender label="Headaches?">
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
            name={"describeNeuroHeadaches"}
            render={({ field }) => (
              <FormRender label="Describe:">
                <Input
                  disabled={!methods.watch("neuroHeadaches")?.includes("YES")}
                  {...field}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />

          <FormField
            control={methods.control}
            name={"neuroIntestinalAssessmentDocumentation"}
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
        <FormHeader className="mt-4">
          PSYCHOSOCIAL/FINANCIAL ASSESSMENT
        </FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"grief"}
            render={({ field }) => (
              <FormRender label="Grief?">
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
            name={"roleChange"}
            render={({ field }) => (
              <FormRender label="Role change?">
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
            name={"changeInBodyImage"}
            render={({ field }) => (
              <FormRender label="Change in body image?">
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
            name={"abuse"}
            render={({ field }) => (
              <FormRender label="Abuse?">
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
            name={"reportToAps"}
            render={({ field }) => (
              <FormRender label="Report to APS/CPS?">
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
            name={"affordMedications"}
            render={({ field }) => (
              <FormRender label="Able to afford medications?">
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
            name={"accessTransportationForMedical"}
            render={({ field }) => (
              <FormRender label="Able to access transportation for medical appts?">
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
            name={"affordRent"}
            render={({ field }) => (
              <FormRender label="Able to afford rent/utilities?">
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
            name={"spiritualNeedsMet"}
            render={({ field }) => (
              <FormRender label="Spiritual needs met?">
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
            name={"culturalIssueImapactingCare"}
            render={({ field }) => (
              <FormRender label="Cultural issues impacting care?">
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
            name={"otherPsychoSocialAssesment"}
            render={({ field }) => (
              <FormRender label="Other:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"psychoSocialAssessmentDocumentation"}
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

export default NeuroPyschoSocial;
