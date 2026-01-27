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

const CaregiverSafety = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4">
          CAREGIVER/REFERRAL NEEDS ASSESSMENT
        </FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"ableToProvide"}
            render={({ field }) => (
              <FormRender label="Caregiver able/willing to provide all care?">
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
            name={"ableToReceive"}
            render={({ field }) => (
              <FormRender label="Caregiver able to receive & follow instructions?">
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
            name={"ableToAdministerMeds"}
            render={({ field }) => (
              <FormRender label="Able to administer meds?">
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
            name={"ableToPerform"}
            render={({ field }) => (
              <FormRender label="Able to perform/assist with procedures?">
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
            name={"americanCancerSociety"}
            render={({ field }) => (
              <FormRender label="American Cancer Society?">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "HAS", label: "Has" },
                    { value: "NEEDS", label: "Needs" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"mealsOnWheels"}
            render={({ field }) => (
              <FormRender label="Meals on Wheels">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "HAS", label: "Has" },
                    { value: "NEEDS", label: "Needs" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"transportationService"}
            render={({ field }) => (
              <FormRender label="Transportation Service?">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "HAS", label: "Has" },
                    { value: "NEEDS", label: "Needs" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"church"}
            render={({ field }) => (
              <FormRender label="Church?">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "HAS", label: "Has" },
                    { value: "NEEDS", label: "Needs" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"commCareServices"}
            render={({ field }) => (
              <FormRender label="Comm Care Services?">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "HAS", label: "Has" },
                    { value: "NEEDS", label: "Needs" },
                    { value: "NO", label: "No" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"referralNeedsAssessmentType"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    { value: "CBA", label: "CBA" },
                    { value: "PHC", label: "PHC" },
                  ]}
                  name={"referralNeedsAssessmentType"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"referralNeedsAssessmentAgency"}
            render={({ field }) => (
              <FormRender label="Agency:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"referralNeedsAssessmentPhone"}
            render={({ field }) => (
              <FormRender label="Phone:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"otherReferralNeedsAssessment"}
            render={({ field }) => (
              <FormRender label="Other:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"referralNeedsAssessmentDocumentation"}
            render={({ field }) => (
              <FormRender label="Supporting Documentation:">
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">SAFETY HAZARDS IN THE HOME</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"unsoundStructure"}
            render={({ field }) => (
              <FormRender label="Unsound structure?">
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
            name={"unsafeFunctionalBarriers"}
            render={({ field }) => (
              <FormRender label="Unsafe functional barriers (stairs,etc)?">
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
            name={"unsafePlacement"}
            render={({ field }) => (
              <FormRender label="Unsafe placement of rugs, cords, furniture?">
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
            name={"inadequateElectricity"}
            render={({ field }) => (
              <FormRender label="Inadequate heating/electricity?">
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
            name={"inadequatePlumbing"}
            render={({ field }) => (
              <FormRender label="Inadequate sanitation/plumbing?">
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
            name={"unsafeGas"}
            render={({ field }) => (
              <FormRender label="Unsafe gas/electrical appliances?">
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
            name={"inadequateCookingFacilities"}
            render={({ field }) => (
              <FormRender label="Inadequate cooking facilities?">
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
            name={"inadequateCookingArrangements"}
            render={({ field }) => (
              <FormRender label="Inadequate sleeping arrangements?">
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
            name={"inadequateVentilation"}
            render={({ field }) => (
              <FormRender label="Inadequate ventilation?">
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
            name={"inadequateRunningWater"}
            render={({ field }) => (
              <FormRender label="Inadequate running water?">
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
            name={"unsafeStorageOfSupplies"}
            render={({ field }) => (
              <FormRender label="Unsafe storage of supplies/equipment?">
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
            name={"presenceOfPest"}
            render={({ field }) => (
              <FormRender label="Presence or infestation of pests?">
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
            name={"unsafeNeighborhood"}
            render={({ field }) => (
              <FormRender label="Neighborhood unsafe?">
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
            name={"noEmergencyPlan"}
            render={({ field }) => (
              <FormRender label="Inadequate or no emergency plan?">
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
            name={"railingsNeeded"}
            render={({ field }) => (
              <FormRender label="Ramps/railings needed?">
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
            name={"homeSafetyHazardsDocumentation"}
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

export default CaregiverSafety;
