import { MinusIcon, PlusIcon } from "lucide-react";
import React from "react";
import { useFieldArray } from "react-hook-form";

import FormHeader from "@/components/form-header";
import {
  Button,
  CheckboxGroup,
  FormField,
  FormRender,
  Input,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib";
import {
  additionalFieldTwoDefaultValue,
  additionalFieldTwoSchema,
} from "@/schema/assessment/soc-assess/additional-field-two";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof additionalFieldTwoSchema>;

const RehabilitationPotential = ({ methods }: { methods: formType }) => {
  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "rehabilitationPotential",
  });
  return (
    <>
      <div>
        <FormHeader className="mt-4">
          Goals/Rehabilitation potential/Discharge plans
        </FormHeader>
        <div className="grid lg:grid-cols-3 gap-5 text-center py-2 bg-secondary items-center justify-center font-semibold">
          <p>Service</p>
          <p>Goals</p>
          <p>Rehabilitation potential</p>
        </div>
        <div className="grid gap-5 py-5">
          {fields.map((_, index) => (
            <div key={index}>
              <div className="grid lg:grid-cols-3 gap-5">
                <FormField
                  control={methods.control}
                  name={`rehabilitationPotential.${index}.dischargePlanService`}
                  render={({ field }) => (
                    <FormRender>
                      <SelectInput
                        options={[
                          { label: "PT", value: "PT" },
                          { label: "SN", value: "SN" },
                          { label: "OT", value: "OT" },
                          { label: "ST", value: "ST" },
                        ]}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`rehabilitationPotential.${index}.dischargePlanGoals`}
                  render={({ field }) => (
                    <FormRender>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`rehabilitationPotential.${index}.dischargePlanRehabilitationPotential`}
                  render={({ field }) => (
                    <FormRender>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <div className={cn("flex space-x-3 items-center mt-4")}>
                <Button
                  variant="outline"
                  className="!font-medium !text-sm md:!text-base !leading-4 md:!leading-6 !py-3 !px-4 !rounded-[8px]"
                  type="button"
                  onClick={() =>
                    append(
                      additionalFieldTwoDefaultValue.rehabilitationPotential[0],
                    )
                  }
                >
                  Add
                  <PlusIcon className="h-4 w-4" />
                </Button>

                {fields.length > 1 && (
                  <Button
                    variant="destructive"
                    className="!font-medium !text-sm md:!text-base !leading-4 md:!leading-6 !py-3 !px-4 !rounded-[8px]"
                    type="button"
                    onClick={() => remove(index)}
                  >
                    <MinusIcon className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="grid lg:grid-cols-2 gap-5 text-center py-2 bg-secondary items-center justify-center font-semibold">
          <p>Patient Care Preferences</p>
          <p>Rehabilitation potential</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 py-5">
          <FormField
            control={methods.control}
            name={"patientCarePreferences"}
            render={({ field }) => (
              <FormRender>
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"patientCareRehabilitationPotential"}
            render={({ field }) => (
              <FormRender>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <div className="grid lg:grid-cols-2 gap-5 text-center py-2 bg-secondary items-center justify-center font-semibold">
          <p>Patient Identified Goals</p>
          <p>Rehabilitation potential</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 py-5">
          <FormField
            control={methods.control}
            name={"patientIdentifiedGoals"}
            render={({ field }) => (
              <FormRender>
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"patientIdentifiedRehabilitationPotential"}
            render={({ field }) => (
              <FormRender>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">HOMEBOUND STATUS</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-5">
            <p className="text-sm font-semibold">
              Describe the patient's functional status that renders him/her
              homebound. Must meet Criteria One A or B and Criteria Two A & B.
            </p>
            <FormField
              control={methods.control}
              name={"citeriaOneA"}
              render={({ field }) => (
                <FormRender label="Criteria One: A. Requires the assistance of supportive device, use of special transportation, or the assistance of another person to leave home (describe/explain):">
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"citeriaOneB"}
              render={({ field }) => (
                <FormRender label="Or B. Leaving the home is medically contraindicated (describe/explain):">
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"citeriaTwoA"}
              render={({ field }) => (
                <FormRender label="AND Criteria Two: A. There exists a normal inability to leave home (describe/explain):">
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"citeriaTwoB"}
              render={({ field }) => (
                <FormRender label="AND B. Leaving home requires a considerable taxing effort (describe/explain):">
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"absencesFromHome"}
              render={({ field }) => (
                <FormRender label="AND Absences from the home are infrequent, or relatively short duration, or to receive medical care (describe):">
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>

          <div className="flex flex-col gap-5">
            <FormHeader className="my-0">
              HOSPITAL RISK ASSESSMENT / NECESSARY INTERVENTION TO ADRESS RISK
            </FormHeader>
            <FormField
              control={methods.control}
              name={"hospitalRiskAssessment"}
              render={({ field }) => (
                <FormRender label="Hospital Risk Assessment/Necessary Intervention To Adress Risk">
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <p className="text-sm font-semibold text-center">
              Enter the following in 487 - addendum page:
            </p>
            <FormHeader className="my-0">REHAB POTENTIAL</FormHeader>
            <FormField
              control={methods.control}
              name={"rehabPotential"}
              render={() => (
                <FormRender formClassName="flex flex-wrap gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      { value: "excellent", label: "Excellent" },
                      { value: "guarded", label: "Guarded" },
                      { value: "good", label: "Good" },
                      {
                        value: "poor",
                        label: "Poor - To accomplish goals established",
                      },
                      { value: "fair", label: "Fair" },
                    ]}
                    name={"rehabPotential"}
                  />
                </FormRender>
              )}
            />
            <FormHeader className="my-0">DISCHARGE PLANS</FormHeader>
            <FormField
              control={methods.control}
              name={"dischargePlans"}
              render={() => (
                <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      {
                        value: "wound-healed",
                        label:
                          "Discharge when wounds are healed and or willing and available caregivers identified to perform wound care",
                      },
                      {
                        value: "blood-sugar",
                        label:
                          "Discharge when pt able to perform blood sugar testing accurately and or cg willing and able to perform blood sugar testing",
                      },
                      {
                        value: "caregiver-under-supervision",
                        label:
                          "Discharge to self/caregiver/family under MD supervision when:",
                      },
                    ]}
                    name={"dischargePlans"}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"caregiverUnderSupervision"}
              render={() => (
                <FormRender formClassName="flex flex-wrap gap-5 !space-y-0 pl-5">
                  <CheckboxGroup
                    disabled={
                      !methods
                        .watch("dischargePlans")
                        ?.includes("caregiver-under-supervision")
                    }
                    methods={methods}
                    options={[
                      { value: "goals-met", label: "Goals met" },
                      {
                        value: "skilled-service",
                        label: "Skilled services are no longer needed",
                      },
                    ]}
                    name={"caregiverUnderSupervision"}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"dischargePlanSnPtToTeachPerform"}
              render={({ field }) => (
                <FormRender label="SN/PT to Teach/Perform:">
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default RehabilitationPotential;
