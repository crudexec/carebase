import React from "react";

import FormHeader from "@/components/form-header";
import {
  Checkbox,
  CheckboxGroup,
  FormField,
  FormRender,
  Input,
  RadioInput,
} from "@/components/ui";
import { additionalFieldOneSchema } from "@/schema/assessment/soc-assess/addtional-field-one";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof additionalFieldOneSchema>;

const FunctionalEquipment = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4">FUNCTIONAL LIMITATIONS</FormHeader>
        <div className="grid gap-5">
          <FormField
            control={methods.control}
            name={"functionalLimitations"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    { value: "amputation", label: "Amputation" },
                    { value: "contracture", label: "Contracture" },
                    { value: "hearing", label: "Hearing" },
                    { value: "paralysis", label: "Paralysis" },
                    { value: "endurance", label: "Endurance" },
                    { value: "ambulation", label: "Ambulation" },
                    { value: "speech", label: "Speech" },
                    { value: "legally-blind", label: "Legally Blind" },
                    { value: "CVA", label: "CVA/hemiparalysis/dysphonia" },
                    { value: "fall-risk", label: "Fall risk" },
                    { value: "bowel", label: "Bowel/Bladder (Incontinence)" },
                    {
                      value: "angina-with-minimal",
                      label: "Angina with minimal exertion or at rest",
                    },
                    {
                      value: "confined-to-wheelchair",
                      label: "Confined to wheelchair",
                    },
                  ]}
                  name={"functionalLimitations"}
                />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">DYSPNEA</FormHeader>
        <div className="grid gap-5">
          <FormField
            control={methods.control}
            name={"isDysnea"}
            render={({ field }) => (
              <FormRender formClassName="mt-4">
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">Dyspnea w/ minimal exertion</span>
                </div>
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"otherDyspnea"}
            render={({ field }) => (
              <FormRender label="Other(functional limitations):">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">ACTIVITIES PERMITTED</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"activitiesPermitted"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    { value: "complete-bedrest", label: "Complete Bedrest" },
                    { value: "bedrest", label: "Bedrest BRD" },
                    { value: "up-as-tolerated", label: "Up as Tolerated" },
                    { value: "crutches", label: "Crutches" },
                    { value: "cane", label: "Cane" },
                    { value: "ambulation", label: "Ambulation" },
                    { value: "transfer", label: "Transfer Bed/Chair" },
                    {
                      value: "exercise-prescribed",
                      label: "Exercise Prescribed",
                    },
                    {
                      value: "partial-weight-bearing",
                      label: "Partial weight bearing",
                    },
                    {
                      value: "independent-at-home",
                      label: "Independent at home",
                    },
                  ]}
                  name={"activitiesPermitted"}
                />
              </FormRender>
            )}
          />

          <FormField
            control={methods.control}
            name={"activitiesPermittedLocation"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    { value: "wheelchair", label: "Wheelchair" },
                    { value: "walker", label: "Walker" },
                    { value: "no-restrictionr", label: "No Restrictionr" },
                  ]}
                  name={"activitiesPermittedLocation"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"otherActivitiesPermitted"}
            render={({ field }) => (
              <FormRender label="Other(activities permitted):">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>

      <div>
        <FormHeader className="mt-4">EQUIPMENT</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"hospitalBed"}
            render={({ field }) => (
              <FormRender label="Hospital Bed?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "NEEDS", label: "Needs" },
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"wheelChairManual"}
            render={({ field }) => (
              <FormRender label="Wheelchair, Manual?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "NEEDS", label: "Needs" },
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"wheelchairElectric"}
            render={({ field }) => (
              <FormRender label="Wheelchair, Electric?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "NEEDS", label: "Needs" },
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"walker"}
            render={({ field }) => (
              <FormRender label="Walker?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "NEEDS", label: "Needs" },
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"cane"}
            render={({ field }) => (
              <FormRender label="Cane?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "NEEDS", label: "Needs" },
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"crutches"}
            render={({ field }) => (
              <FormRender label="Crutches?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "NEEDS", label: "Needs" },
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"transferEquipment"}
            render={({ field }) => (
              <FormRender label="Transfer Equipment?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "NEEDS", label: "Needs" },
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"hospitalBed"}
            render={({ field }) => (
              <FormRender label="Hospital Bed?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "NEEDS", label: "Needs" },
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"bathroomSafety"}
            render={({ field }) => (
              <FormRender label="Bathroom safety devices?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "NEEDS", label: "Needs" },
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"bedsideCommode"}
            render={({ field }) => (
              <FormRender label="Bedside commode?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "NEEDS", label: "Needs" },
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"dressingAides"}
            render={({ field }) => (
              <FormRender label="Dressing aides?">
                <RadioInput
                  className="flex-row  gap-3 items-start"
                  {...field}
                  options={[
                    { value: "NEEDS", label: "Needs" },
                    { value: "YES", label: "Yes" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"otherEquipment"}
            render={({ field }) => (
              <FormRender label="Other">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default FunctionalEquipment;
