import React from "react";

import FormHeader from "@/components/form-header";
import {
  CheckboxGroup,
  FormField,
  FormRender,
  Input,
  RadioInput,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { additionalFieldOneSchema } from "@/schema/assessment/soc-assess/addtional-field-one";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof additionalFieldOneSchema>;

const PainOstomy = ({ methods }: { methods: formType }) => {
  return (
    <>
      {" "}
      <div>
        <FormHeader className="mt-4">PAIN ASSESSMENT</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"painLocation"}
            render={({ field }) => (
              <FormRender label="Location:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"painOnset"}
            render={({ field }) => (
              <FormRender label="Onset:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"painScale"}
            render={({ field }) => (
              <FormRender label="Pain Scale:">
                <SelectInput
                  options={[
                    { label: "0", value: "0" },
                    { label: "1", value: "1" },
                    { label: "2", value: "2" },
                    { label: "3", value: "3" },
                    { label: "4", value: "4" },
                    { label: "5", value: "5" },
                    { label: "6", value: "6" },
                    { label: "7", value: "7" },
                    { label: "8", value: "8" },
                    { label: "9", value: "9" },
                    { label: "10", value: "10" },
                  ]}
                  field={field}
                />
              </FormRender>
            )}
          />
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold pb-2">
              Non Verbal Demonstrated:
            </p>
            <FormField
              control={methods.control}
              name={"nonVerbalDemonstrated"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      { value: "diaphoresis", label: "Diaphoresis" },
                      { value: "moaning", label: "Moaning/Crying" },
                      { value: "grimacing", label: "Grimacing" },
                      { value: "irritability", label: "Irritability" },
                      { value: "tense", label: "Tense" },
                      { value: "anger", label: "Anger" },
                      { value: "guarding", label: "Guarding" },
                      {
                        value: "change-vital-signs",
                        label: "Change Vital Signs",
                      },
                    ]}
                    name={"nonVerbalDemonstrated"}
                  />
                </FormRender>
              )}
            />
          </div>
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold pb-2">Description:</p>
            <FormField
              control={methods.control}
              name={"painDescription"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      { value: "ache", label: "Ache" },
                      { value: "dull", label: "Dull" },
                      { value: "throbbing", label: "Throbbing" },
                      { value: "burning", label: "Burning" },
                      { value: "sharp", label: "Sharp" },
                      { value: "crushing", label: "Crushing" },
                      { value: "stabbing", label: "Stabbing" },
                      { value: "radiating", label: "Radiating" },
                      { value: "other", label: "Other" },
                    ]}
                    name={"painDescription"}
                  />
                </FormRender>
              )}
            />
            {methods.watch("painDescription")?.includes("other") && (
              <FormField
                control={methods.control}
                name={"otherPainDescription"}
                render={({ field }) => (
                  <FormRender label={"Other"} formClassName="mt-5">
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            )}
          </div>
          <FormField
            control={methods.control}
            name={"whatMakesPainBetter"}
            render={({ field }) => (
              <FormRender label={"What makes the pain better?"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"whatMakesPainWorse"}
            render={({ field }) => (
              <FormRender label={"What makes the pain worse?"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"timeWhenPainIsWorse"}
            render={({ field }) => (
              <FormRender label={"Time of day/night when pain is worse?"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"painPreventPatient"}
            render={({ field }) => (
              <FormRender
                label={"Does pain prevent patient from doing things?"}
              >
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"painControlRegimen"}
            render={({ field }) => (
              <FormRender label={"Current pain control regimen:"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"timeLastPainMedicationTaken"}
            render={({ field }) => (
              <FormRender label={"Time last pain medication taken:"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"totalUseIn24hr"}
            render={({ field }) => (
              <FormRender label={"Total use in the last 24 hours:"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"painAssesment"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    {
                      value: "medication-utlilized",
                      label: "Pain medication utlilized appropriately",
                    },
                    {
                      value: "pain-regimen",
                      label: "Non pharmacological pain regimen",
                    },
                    { value: "log-utilized", label: "Pain log utilized" },
                  ]}
                  name={"painAssesment"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"painControlRegimenEffective"}
            render={({ field }) => (
              <FormRender label="In current pain control regimen effective?">
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
            name={"notifiedPhysician"}
            render={({ field }) => (
              <FormRender label="Notified physician">
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
            name={"painAssesmentDocumentation"}
            render={({ field }) => (
              <FormRender
                label={"Supporting Documentation:"}
                formClassName="lg:col-span-2"
              >
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">INTEGUMENTARY STATUS</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"skinTugor"}
            render={({ field }) => (
              <FormRender label="Skin Turgor:">
                <SelectInput
                  options={[
                    { label: "Good", value: "good" },
                    { label: "Fair", value: "fair" },
                    { label: "Poor", value: "poor" },
                  ]}
                  field={field}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"skinColor"}
            render={({ field }) => (
              <FormRender label="Skin Color:">
                <SelectInput
                  options={[
                    { label: "WNL", value: "WNL" },
                    { label: "Pale", value: "pale" },
                    { label: "Cyanotic", value: "cyanotic" },
                  ]}
                  field={field}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"skin"}
            render={({ field }) => (
              <FormRender label="Skin:">
                <SelectInput
                  options={[
                    { label: "Cool", value: "cool" },
                    { label: "Warm", value: "warm" },
                  ]}
                  field={field}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"skinType"}
            render={({ field }) => (
              <FormRender label="Skin Type:">
                <SelectInput
                  options={[
                    { label: "Dry", value: "dry" },
                    { label: "Disphoretic", value: "disphoretic" },
                  ]}
                  field={field}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"skinLesion"}
            render={({ field }) => (
              <FormRender label="Skin Lesion:">
                <SelectInput
                  options={[
                    { label: "Wounds", value: "wounds" },
                    { label: "Ulcers", value: "ulcers" },
                    { label: "Rash", value: "rash" },
                  ]}
                  field={field}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"skinLesionType"}
            render={({ field }) => (
              <FormRender label="Skin Lesion Type:">
                <SelectInput
                  options={[
                    { label: "Incision", value: "incision" },
                    { label: "Ostomy", value: "ostomy" },
                    { label: "Ecchymosis", value: "ecchymosis" },
                  ]}
                  field={field}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"integumentaryStatusDocumentation"}
            render={({ field }) => (
              <FormRender
                label={"Supporting Documentation:"}
                formClassName="lg:col-span-2"
              >
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">PRESSURE RELIEVING DEVICE</FormHeader>
        <div className="grid gap-5">
          <FormField
            control={methods.control}
            name={"presureRelievingDevice"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    { value: "none", label: "None" },
                    { value: "low-air", label: "Low air loss mattress" },
                    { value: "gel-cushion", label: "Gel cushion" },
                    { value: "egg-crate", label: "Egg crate" },
                  ]}
                  name={"presureRelievingDevice"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"otherPresureRelievingDevice"}
            render={({ field }) => (
              <FormRender label="Other:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">OSTOMY</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"ostomyType"}
            render={({ field }) => (
              <FormRender label="Ostomy Type:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"ostomyLocation"}
            render={({ field }) => (
              <FormRender label="Location:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"stomaAppearance"}
            render={({ field }) => (
              <FormRender label="Stoma Appearance:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <div>
            <p className="text-sm font-semibold pb-2">
              Ostomy care provided by:
            </p>
            <FormField
              control={methods.control}
              name={"ostomyCareProvidedBy"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      { value: "SN", label: "SN" },
                      { value: "patient", label: "Patient" },
                      { value: "caregiver", label: "Caregiver" },
                    ]}
                    name={"ostomyCareProvidedBy"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"ostomyCareProvidedByName"}
            render={({ field }) => (
              <FormRender label="Name:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"ostomyCare"}
            render={({ field }) => (
              <FormRender label="Ostomy care/appliance change performed during visit:">
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default PainOstomy;
