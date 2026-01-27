import React from "react";

import { patientFormSchema } from "@/schema/patient/index";
import { FormReturn } from "@/types";

import { DateInput, FormField, FormRender, Input } from "../ui";

type formType = FormReturn<typeof patientFormSchema>;

const PhysicianInformation = ({
  methods,
  mode,
}: {
  methods: formType;
  mode: "create" | "edit" | "view";
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4">
      <FormField
        control={methods.control}
        name={"physician.lastName"}
        render={({ field }) => (
          <FormRender label={"Last Name"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
            />
          </FormRender>
        )}
      />
      <FormField
        control={methods.control}
        name={"physician.firstName"}
        render={({ field }) => (
          <FormRender label={"First Name"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"physician.phone"}
        render={({ field }) => (
          <FormRender label={"Phone"}>
            <Input
              {...field}
              disabled={mode === "view"}
              type="number"
              value={field.value as string}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"physician.fax"}
        render={({ field }) => (
          <FormRender label={"Fax"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"physician.address"}
        render={({ field }) => (
          <FormRender label={"Address"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"physician.city"}
        render={({ field }) => (
          <FormRender label={"City"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"physician.state"}
        render={({ field }) => (
          <FormRender label={"State"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"physician.zip"}
        render={({ field }) => (
          <FormRender label={"Zip"}>
            <Input
              {...field}
              disabled={mode === "view"}
              type="number"
              value={field.value as string}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"physician.npi"}
        render={({ field }) => (
          <FormRender label={"NPI"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"physician.hospital"}
        render={({ field }) => (
          <FormRender label={"Hospital"}>
            <Input
              {...field}
              disabled={mode === "view"}
              value={field.value as string}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"physician.admission"}
        render={({ field }) => (
          <FormRender label={"Admission"}>
            <DateInput
              {...field}
              disabled={mode === "view"}
              value={field.value as Date}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"physician.discharge"}
        render={({ field }) => (
          <FormRender label={"Discharge"}>
            <DateInput
              {...field}
              disabled={mode === "view"}
              value={field.value as Date}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"physician.soc"}
        render={({ field }) => (
          <FormRender label={"M0030 SOC"}>
            <DateInput
              {...field}
              disabled={mode === "view"}
              value={field.value as Date}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"physician.M0030_SOC"}
        render={({ field }) => (
          <FormRender label={"Physician SOC"}>
            <DateInput
              {...field}
              disabled={mode === "view"}
              value={field.value as Date}
            />
          </FormRender>
        )}
      />
    </div>
  );
};

export default PhysicianInformation;
