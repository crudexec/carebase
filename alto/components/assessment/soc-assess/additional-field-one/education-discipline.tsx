import React from "react";

import FormHeader from "@/components/form-header";
import {
  Checkbox,
  FormField,
  FormRender,
  Input,
  RadioInput,
  Textarea,
} from "@/components/ui";
import { additionalFieldOneSchema } from "@/schema/assessment/soc-assess/addtional-field-one";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof additionalFieldOneSchema>;

const EducationDiscipline = ({ methods }: { methods: formType }) => {
  return (
    <>
      <div>
        <FormHeader className="mt-4">SELF EXAM FREQUENCY</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"technicalProcedures"}
            render={({ field }) => (
              <FormRender label="Technical procedures?">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"medications"}
            render={({ field }) => (
              <FormRender label="Medications?">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"pathophysiologOfDisease"}
            render={({ field }) => (
              <FormRender label="Pathophysiology of disease?">
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
            name={"signsToReportToPhysician"}
            render={({ field }) => (
              <FormRender label="Signs/symptoms to report to physician?">
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
            name={"fluidRestrictions"}
            render={({ field }) => (
              <FormRender label="Special diet/fluid restrictions?">
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
            name={"basicPrinciplesOfCare"}
            render={({ field }) => (
              <FormRender label="Basic principles of care?">
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
            name={"properEquipmentUse"}
            render={({ field }) => (
              <FormRender label="Proper equipment use?">
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
            name={"otherEducationNeededRelatedTo"}
            render={({ field }) => (
              <FormRender label="Other:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"educationNeededDocumentation"}
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
        <FormHeader className="mt-4">DISCIPLINE</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <p className="text-sm font-semibold lg:col-span-2">
            The following disciplines may be indicated based on assessment. If
            patient refused any, specify discipline and reason.
          </p>
          <FormField
            control={methods.control}
            name={"isPt"}
            render={({ field }) => (
              <FormRender formClassName="mt-4">
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">PT</span>
                </div>
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"ptReason"}
            render={({ field }) => (
              <FormRender label="Reason:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"isOt"}
            render={({ field }) => (
              <FormRender formClassName="mt-4">
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">OT</span>
                </div>
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"otReason"}
            render={({ field }) => (
              <FormRender label="Reason:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"isSp"}
            render={({ field }) => (
              <FormRender formClassName="mt-4">
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">SP</span>
                </div>
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"spReason"}
            render={({ field }) => (
              <FormRender label="Reason:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"isMsw"}
            render={({ field }) => (
              <FormRender formClassName="mt-4">
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">MSW</span>
                </div>
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"mswReason"}
            render={({ field }) => (
              <FormRender label="Reason:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"isHa"}
            render={({ field }) => (
              <FormRender formClassName="mt-4">
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">HA</span>
                </div>
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"haReason"}
            render={({ field }) => (
              <FormRender label="Reason:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">SUPPLIES</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"isPatientRecieveSupplies"}
            render={({ field }) => (
              <FormRender
                label="Is the patient receiving supplies from any provider?"
                formClassName="lg:col-span-2"
              >
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
            name={"typeOfSupplies"}
            render={({ field }) => (
              <FormRender label="If yes, type of supplies:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"suppliesProvider"}
            render={({ field }) => (
              <FormRender label="Provider:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"suppliesPhone"}
            render={({ field }) => (
              <FormRender label="Phone:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"suppliesAddress"}
            render={({ field }) => (
              <FormRender label="Address:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">DME AND SUPPLIESS</FormHeader>
        <div className="grid gap-5">
          <FormField
            control={methods.control}
            name={"dmeAndSupplies"}
            render={({ field }) => (
              <FormRender label="Supplies (Only billable by Home Health):">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default EducationDiscipline;
