import React from "react";

import FormHeader from "@/components/form-header";
import {
  Checkbox,
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

const CoordinationOfCare = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4"> COORDINATION OF CARE</FormHeader>
        <div className="grid gap-5">
          <div className="grid lg:grid-cols-3 gap-5 border border-dashed p-2">
            <FormField
              control={methods.control}
              name={"isDialysis"}
              render={({ field }) => (
                <FormRender formClassName="mt-4">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm">Dialysis</span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"dialysisNotifiedOfAdmission"}
              render={({ field }) => (
                <FormRender label="Notified of Admission:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"dialysisDays"}
              render={({ field }) => (
                <FormRender label="Dialysis Days:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
          <div className="grid lg:grid-cols-3 gap-5 border border-dashed p-2">
            <FormField
              control={methods.control}
              name={"isPch"}
              render={({ field }) => (
                <FormRender formClassName="mt-4">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm">PHC</span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"pchNotifiedOfAdmission"}
              render={({ field }) => (
                <FormRender label="Notified of Admission:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"pchComments"}
              render={({ field }) => (
                <FormRender label="Comments:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
          <div className="grid lg:grid-cols-3 gap-5 border border-dashed p-2">
            <FormField
              control={methods.control}
              name={"isCancerCenter"}
              render={({ field }) => (
                <FormRender formClassName="mt-4">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm">Cancer Center</span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"cancerCenterNotifiedOfAdmission"}
              render={({ field }) => (
                <FormRender label="Notified of Admission:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"cancerCenterChemo"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      { value: "chemotherapy", label: "Chemotherapy" },
                      { value: "radiation", label: "Radiation" },
                    ]}
                    name={"cancerCenterChemo"}
                  />
                </FormRender>
              )}
            />
          </div>
          <div className="grid lg:grid-cols-3 gap-5 border border-dashed p-2">
            <FormField
              control={methods.control}
              name={"isAdultDayCare"}
              render={({ field }) => (
                <FormRender formClassName="mt-4">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm">Adult Day Care</span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"adultDayCareNotifiedOfAdmission"}
              render={({ field }) => (
                <FormRender label="Notified of Admission:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"adultDayCareComments"}
              render={({ field }) => (
                <FormRender label="Comments:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
          <div className="grid lg:grid-cols-3 gap-5 border border-dashed p-2">
            <FormField
              control={methods.control}
              name={"isCba"}
              render={({ field }) => (
                <FormRender formClassName="mt-4">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm">CBA</span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"cbaNotifiedOfAdmission"}
              render={({ field }) => (
                <FormRender label="Notified of Admission:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"cbaComments"}
              render={({ field }) => (
                <FormRender label="Comments:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
          <div className="grid lg:grid-cols-3 gap-5 border border-dashed p-2">
            <FormField
              control={methods.control}
              name={"isWoundCareCenter"}
              render={({ field }) => (
                <FormRender formClassName="mt-4">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm">Wound Care Center</span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"woundCareCenterNotifiedOfAdmission"}
              render={({ field }) => (
                <FormRender label="Notified of Admission:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"woundCareCenterComments"}
              render={({ field }) => (
                <FormRender label="Comments:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
          <div className="grid lg:grid-cols-3 gap-5 border border-dashed p-2">
            <FormField
              control={methods.control}
              name={"isOtherPhysicianInCare"}
              render={({ field }) => (
                <FormRender formClassName="mt-4">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm">
                      Other physician involved in care
                    </span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"otherPhysicianInCareNotifiedOfAdmission"}
              render={({ field }) => (
                <FormRender label="Notified of Admission:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"otherPhysicianInCareLists"}
              render={({ field }) => (
                <FormRender label="Lists:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
          <div className="grid lg:grid-cols-3 gap-5 border border-dashed p-2">
            <FormField
              control={methods.control}
              name={"isOtherInvolvedInCare"}
              render={({ field }) => (
                <FormRender formClassName="mt-4">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm">Other involved in care</span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"otherInvolvedInCareNotifiedOfAdmission"}
              render={({ field }) => (
                <FormRender label="Notified of Admission:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"otherInvolvedInCareLists"}
              render={({ field }) => (
                <FormRender label="Lists:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">
          {" "}
          FIRE RISK ASSESSMENT (if patient has oxygen in the home)
        </FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"noSmokingSignPosted"}
            render={({ field }) => (
              <FormRender label='"No Smoking" Signs Posted?'>
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
            name={"exitPlan"}
            render={({ field }) => (
              <FormRender label='"Exit plan?'>
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
            name={"smokeDetector"}
            render={({ field }) => (
              <FormRender label="Smoke Detector?">
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
            name={"isSmokeDectectorWorking"}
            render={({ field }) => (
              <FormRender label="If yes, is it working?">
                <RadioInput
                  disabled={!methods.watch("smokeDetector")?.includes("YES")}
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
            name={"intactElectricityCords"}
            render={({ field }) => (
              <FormRender label="Intact electrical cords near oxygen?">
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
            name={"electicalMedicalEquipment"}
            render={({ field }) => (
              <FormRender label="Electrical medical equipment away from oxygen?">
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
            name={"notFrayed"}
            render={({ field }) => (
              <FormRender label="If no, electrical cords are intact, not frayed?">
                <RadioInput
                  disabled={
                    !methods.watch("electicalMedicalEquipment")?.includes("NO")
                  }
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
            name={"medicalGasCylinders"}
            render={({ field }) => (
              <FormRender label="Medical gas cylinders stored on their sides in a stable protected area?">
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
          <div>
            <p className="text-sm font-semibold pb-2">
              If any responses, other than yes, education was provided to:
            </p>
            <FormField
              control={methods.control}
              name={"educationWasProvidedTo"}
              render={() => (
                <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                  <CheckboxGroup
                    methods={methods}
                    options={[
                      { value: "patient", label: "Patient" },
                      { value: "caregiver", label: "Caregiver" },
                    ]}
                    name={"educationWasProvidedTo"}
                  />
                </FormRender>
              )}
            />
          </div>

          <FormField
            control={methods.control}
            name={"coordinationOfCareDocumentation"}
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

export default CoordinationOfCare;
