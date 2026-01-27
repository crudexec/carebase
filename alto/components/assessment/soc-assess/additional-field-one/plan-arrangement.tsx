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

const PlanArrangements = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4">
          ADDITIONAL FIELDS IMPACTING PLAN OF CARE
        </FormHeader>
        <div className="grid lg:grid-cols-2 items-end gap-5">
          <FormField
            control={methods.control}
            name={"planOfCareTemp"}
            render={({ field }) => (
              <FormRender label="Temp:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"planOfCareResp"}
            render={({ field }) => (
              <FormRender label="Resp:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"planOfCareSaturation"}
            render={({ field }) => (
              <FormRender label="O2 Saturation:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"planOfCareHeight"}
            render={({ field }) => (
              <FormRender label="Height:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"planOfCareWeight"}
            render={({ field }) => (
              <FormRender label="Weight:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"planOfCareWeightType"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    { value: "actual", label: "Actual" },
                    { value: "stated", label: "Stated" },
                  ]}
                  name={"planOfCareWeightType"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"pulseApicalHeart"}
            render={({ field }) => (
              <FormRender label="Pulse - Apical (Heart)">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"pulseApicalHeartType"}
            render={({ field }) => (
              <FormRender label=" Apical Type">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "REGULAR", label: "Regular" },
                    { value: "IRREGULAR", label: "Irregular" },
                  ]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"pulseRadialWrist"}
            render={({ field }) => (
              <FormRender label="Pulse - Radial (Wrist)">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"pulseRadialWristType"}
            render={({ field }) => (
              <FormRender label="Radial Type">
                <RadioInput
                  className="flex-row gap-3 items-start"
                  {...field}
                  options={[
                    { value: "REGULAR", label: "Regular" },
                    { value: "IRREGULAR", label: "Irregular" },
                  ]}
                />
              </FormRender>
            )}
          />
          <div className="grid gap-5">
            <p className="text-sm font-semibold">B/P (L)</p>
            <FormField
              control={methods.control}
              name={"bpLLying"}
              render={({ field }) => (
                <FormRender label="Lying:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"bpLSitting"}
              render={({ field }) => (
                <FormRender label="Sitting:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"bpLStanding"}
              render={({ field }) => (
                <FormRender label="Standing:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
          <div className="grid gap-5">
            <p className="text-sm font-semibold"> B/P (R)</p>
            <FormField
              control={methods.control}
              name={"bpRLying"}
              render={({ field }) => (
                <FormRender label="Lying:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"bpRSitting"}
              render={({ field }) => (
                <FormRender label="Sitting:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"bpRStanding"}
              render={({ field }) => (
                <FormRender label="Standing:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"otherBP"}
            render={({ field }) => (
              <FormRender label="B/P Other:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"grithMeasurement"}
            render={({ field }) => (
              <FormRender label="Girth Measurement - Abdominal:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">LIVING ARRANGEMENTS</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"emergencyContact"}
            render={({ field }) => (
              <FormRender label="Emergency Contact:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"livingArrangementPhone"}
            render={({ field }) => (
              <FormRender label="Phone:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"livingArrangmentRelationship"}
            render={({ field }) => (
              <FormRender label="Relationship:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"livingArrangementCaregiver"}
            render={({ field }) => (
              <FormRender label="Caregiver:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"isAddressAsSamePatient"}
            render={({ field }) => (
              <FormRender formClassName="mt-4">
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">Address same as Patient</span>
                </div>
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"otherLivingArrangement"}
            render={({ field }) => (
              <FormRender label="Other:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"nameOfFacility"}
            render={({ field }) => (
              <FormRender label="If lives in assisted living facility, name of facility:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"contactPerson"}
            render={({ field }) => (
              <FormRender label="Contact Person/Number:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default PlanArrangements;
