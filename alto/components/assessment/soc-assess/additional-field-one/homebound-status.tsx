import React from "react";

import FormHeader from "@/components/form-header";
import {
  CheckboxGroup,
  DateInput,
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

const HomeBoundStatus = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4">
          REASON FOR HOMEBOUND STATUS NARRATIVE
        </FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"initialSummaryOfHistory"}
            render={({ field }) => (
              <FormRender label="Initial Summary of History:">
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"skilledIntervention"}
            render={({ field }) => (
              <FormRender label="Skilled Intervention/Procedure/Summary Progress Towards 486 (Provided/performed/administered this visit):">
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"reasonOfHomeCare"}
            render={({ field }) => (
              <FormRender label="Reason for Home Care:">
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"patientReasonToAboveCare"}
            render={({ field }) => (
              <FormRender label="Patient/Caregiver Response to above care/teaching:">
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <div>
            <p className="text-sm font-semibold pb-2">Patient Strengths:</p>
            <FormField
              control={methods.control}
              name={"patientStrength"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      { value: "able-to-read", label: "Able to Read" },
                      { value: "able-to-learn", label: "Able to Learn" },
                      { value: "willing-to-learn", label: "Willing to Learn" },
                      {
                        value: "family-supportive",
                        label: "Family Supportive",
                      },
                    ]}
                    name={"patientStrength"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"otherPatientStrength"}
            render={({ field }) => (
              <FormRender label="Other:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"participatedInPlanOfCare"}
            render={({ field }) => (
              <FormRender label="Patient/Caregiver participated in the plan of care and is aware of treatment options?">
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
            name={"contentOfAdvanceDirectives"}
            render={({ field }) => (
              <FormRender label="Content of Advance Directive(s), if applicable:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"instructionGivenOnSafetyMeasures"}
            render={({ field }) => (
              <FormRender label="Instruction given on Safety measures in the home include:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"emergencyPreparednessRiskAssessment"}
            render={({ field }) => (
              <FormRender label="Emergency Preparedness Risk Assessment:">
                <SelectInput
                  allowClear
                  options={[
                    { value: "LOW", label: "Low" },
                    { value: "MODERATE", label: "Moderate" },
                    { value: "HIGH", label: "High" },
                  ]}
                  field={field}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"essentialMedications"}
            render={({ field }) => (
              <FormRender label="Essential Medications:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"ventilator"}
            render={({ field }) => (
              <FormRender label="Ventilator/O2:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"sterileDressing"}
            render={({ field }) => (
              <FormRender label="Sterile Dressing:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"bedbound"}
            render={({ field }) => (
              <FormRender label="Bedbound:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"otherHomeboundStatus"}
            render={({ field }) => (
              <FormRender label="other:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"triage"}
            render={({ field }) => (
              <FormRender label="Triage:">
                <SelectInput
                  allowClear
                  options={[
                    {
                      label:
                        "Life threatening (or potential) - requires ongoing medical treatment/care. Any equipment dependent upon electricity should be listed with the power company. Oxygen dependent patients should be supplied with a back-up tank from the supplier. Does not have a caregiver capable of providing care. Requires assistance with transportation to hospital or specialized shelter.",
                      value: "I",
                    },
                    {
                      label:
                        "Not life threatening but patient might suffer severe adverse effects from interruption of services, i.e., daily insulin, IV meds, sterile wound care with large amounts of drainage, symptoms controlled with difficulty, death appears imminent. Capable caregiver present. Will require transportation assistance to hospital or specialized shelter if necessary.",
                      value: "II",
                    },
                    {
                      label:
                        "Visits could be postponed 24-48 hours without adverse effects, i.e., sterile wound care with a minimal amount to no drainage, symptoms need intervention, but are fairly well controlled. Able to care for self or willing and able caregiver. Transportation available from family, friends, or others.",
                      value: "III",
                    },
                    {
                      label:
                        "Visits could be postponed 72-96 hours without adverse effects, i.e., symptoms well-controlled. Able to care for self or willing and able caregiver. Transportation available from family, friends, or others.",
                      value: "IV",
                    },
                  ]}
                  field={field}
                />
              </FormRender>
            )}
          />
        </div>
      </div>

      <div>
        <FormHeader className="mt-4">DISCHARGE PLANS</FormHeader>
        <div className="grid gap-5">
          <FormField
            control={methods.control}
            name={"dischargePlan"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    { value: "goals-met", label: "When goals are met" },
                    {
                      value: "caregiver-available",
                      label:
                        "When caregiver is available and willing to assist with care",
                    },
                    {
                      value: "physician-when",
                      label: "DC to self/physician when SN no longer needed",
                    },
                  ]}
                  name={"dischargePlan"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"otherDischargePlan"}
            render={({ field }) => (
              <FormRender label="Other:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">
          PHYSICIAN CONTACTED TO APPROVE ADDITIONAL ORDERS NOT ON REFERRAL
        </FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={`physicianContactedDate`}
            render={({ field }) => (
              <FormRender label="Date">
                <DateInput {...field} value={field.value as Date} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"physcianContactedTime"}
            render={({ field }) => (
              <FormRender label="Time:">
                <Input {...field} value={field.value as string} type="time" />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"physicianSpokeWith"}
            render={({ field }) => (
              <FormRender label="Spoke with:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default HomeBoundStatus;
