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

const MentalMusculoSkeletal = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4">MENTAL STATUS</FormHeader>
        <div className="grid gap-5">
          <FormField
            control={methods.control}
            name={"mentalStatus"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    { value: "oriented", label: "Oriented" },
                    { value: "comatose", label: "Comatose" },
                    { value: "forgetful", label: "Forgetful" },
                    { value: "depressed", label: "Depressed" },
                    { value: "disoriented", label: "Disoriented" },
                    { value: "lethargic", label: "Lethargic" },
                    { value: "agitated", label: "Agitated" },
                  ]}
                  name={"mentalStatus"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"otherMentalStatus"}
            render={({ field }) => (
              <FormRender label="Other(mental status):">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">
          ENDOCRINE/HEMATOPOETIC ASSESSMENT
        </FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"bruising"}
            render={({ field }) => (
              <FormRender label="Bruising?">
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
            name={"petechiae"}
            render={({ field }) => (
              <FormRender label="Petechiae?">
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
            name={"bleeding"}
            render={({ field }) => (
              <FormRender label="Bleeding?">
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
            name={"polyuria"}
            render={({ field }) => (
              <FormRender label="Polyuria?">
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
            name={"polydipsia"}
            render={({ field }) => (
              <FormRender label="Polydipsia?">
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
            name={"polyphagia"}
            render={({ field }) => (
              <FormRender label="Polyphagia?">
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
            name={"glucometerTesting"}
            render={({ field }) => (
              <FormRender label="Glucometer testing">
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
            name={"resultsToday"}
            render={({ field }) => (
              <FormRender label="Results Today:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"resultsTodaySite"}
            render={({ field }) => (
              <FormRender label="Site:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />

          <FormField
            control={methods.control}
            name={"endocrineAssessmentFasting"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    { value: "fasting", label: "Fasting" },
                    { value: "random", label: "Random" },
                  ]}
                  name={"endocrineAssessmentFasting"}
                />
              </FormRender>
            )}
          />
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold pb-2">Testing performed by:</p>
            <FormField
              control={methods.control}
              name={"testingPerformedBy"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      { value: "patient", label: "Patient" },
                      { value: "caregiver", label: "Caregiver" },
                      { value: "nurse", label: "Nurse" },
                    ]}
                    name={"testingPerformedBy"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"properUseOfGlucometer"}
            render={({ field }) => (
              <FormRender label="Pt/cg demonstrated proper use of glucometer?">
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
            name={"competencyInAdmnisterOfInsulin"}
            render={({ field }) => (
              <FormRender label="Pt/cg demonstrated competency in administration of insulin?">
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
            name={"recentBloodSugarRange"}
            render={({ field }) => (
              <FormRender label="Recent blood sugar ranges:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"timeOnOralHypoglycemic"}
            render={({ field }) => (
              <FormRender label="Length of time on oral hypoglycemic:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"timeOnInsulin"}
            render={({ field }) => (
              <FormRender label="Length of time on insulin:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"insulinDose"}
            render={({ field }) => (
              <FormRender label="Insulin Dose:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"endocrineAssessmentDocumentation"}
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
        <FormHeader className="mt-4">MUSCULOSKELETAL ASSESSMENT</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"limitedRom"}
            render={({ field }) => (
              <FormRender label="Limited ROM?">
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
            name={"limitedRomLocation"}
            render={({ field }) => (
              <FormRender label="Location:">
                <Input
                  disabled={!methods.watch("limitedRom")?.includes("YES")}
                  {...field}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"painOrCramps"}
            render={({ field }) => (
              <FormRender label="Pain or cramps?">
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
            name={"painOrCrampsLocation"}
            render={({ field }) => (
              <FormRender label="Location:">
                <Input
                  disabled={!methods.watch("painOrCramps")?.includes("YES")}
                  {...field}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"musculoRedness"}
            render={({ field }) => (
              <FormRender label="Redness, warmth, swelling?">
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
            name={"musculoRednessLocation"}
            render={({ field }) => (
              <FormRender label="Location:">
                <Input
                  disabled={!methods.watch("musculoRedness")?.includes("YES")}
                  {...field}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"musculoProthesis"}
            render={({ field }) => (
              <FormRender label="Prosthesis/Appliance?">
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
            name={"musculoProthesisLocation"}
            render={({ field }) => (
              <FormRender label="Location:">
                <Input
                  disabled={!methods.watch("musculoProthesis")?.includes("YES")}
                  {...field}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"jointProblems"}
            render={({ field }) => (
              <FormRender label="Bone or joint problems?">
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
            name={"decreasedMobility"}
            render={({ field }) => (
              <FormRender label="Decreased mobility/endurance?">
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
            name={"amputationOf"}
            render={({ field }) => (
              <FormRender label="Amputation of:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"musculoskeletalAssessmentDocumentation"}
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

export default MentalMusculoSkeletal;
