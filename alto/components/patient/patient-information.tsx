import { isEmpty } from "lodash";
import { ChangeEvent } from "react";

import {
  ethnicityOptions,
  genderOptions,
  getCities,
  getCountries,
  getStates,
  maritalStatusOptions,
} from "@/constants";
import { patientFormSchema } from "@/schema/patient/index";
import { FormReturn } from "@/types";

import { DateInput, FormField, FormRender, Input, SelectInput } from "../ui";

type formType = FormReturn<typeof patientFormSchema>;

const PatientInformation = ({
  methods,
  mode,
}: {
  methods: formType;
  mode: "create" | "edit" | "view";
}) => {
  const countries = getCountries();
  const states = getStates(methods.watch("country"));
  const cities = getCities(methods.watch("country"), methods.watch("state"));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4 items-end">
      <FormField
        control={methods.control}
        name={"firstName"}
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
        name={"middleInitial"}
        render={({ field }) => (
          <FormRender label={"Middle Initial"}>
            <Input {...field} disabled={mode === "view"} />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"lastName"}
        render={({ field }) => (
          <FormRender label={"Last Name"}>
            <Input {...field} disabled={mode === "view"} />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"dob"}
        render={({ field }) => (
          <FormRender label={"DOB"}>
            <DateInput
              onChange={field.onChange}
              value={field.value}
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"ssn"}
        render={({ field }) => (
          <FormRender label={"SSN"} helperText="Provide the last four digits">
            <Input
              {...field}
              disabled={mode === "view"}
              type="number"
              onInput={(event: ChangeEvent<HTMLInputElement>) => {
                const inputValue = event.target.value;
                event.target.value = inputValue.slice(0, 4);
              }}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"phone"}
        render={({ field }) => (
          <FormRender label={"Phone"}>
            <Input {...field} disabled={mode === "view"} type="number" />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"medicareNumber"}
        render={({ field }) => (
          <FormRender label={"Medicare Number"}>
            <Input {...field} disabled={mode === "view"} type="number" />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"medicaidNumber"}
        render={({ field }) => (
          <FormRender label={"Medicaid Number"}>
            <Input {...field} disabled={mode === "view"} type="number" />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"address1"}
        render={({ field }) => (
          <FormRender label={"Address"}>
            <Input {...field} disabled={mode === "view"} />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"address2"}
        render={({ field }) => (
          <FormRender label={"Address 2"}>
            <Input {...field} disabled={mode === "view"} />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"country"}
        render={({ field }) => (
          <FormRender label={"Country"}>
            <SelectInput
              options={countries}
              field={field}
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"state"}
        render={({ field }) => (
          <FormRender label={"State"}>
            <SelectInput
              options={states}
              field={field}
              disabled={isEmpty(states) || mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"city"}
        render={({ field }) => (
          <FormRender label={"City"}>
            <SelectInput
              options={cities}
              field={field}
              disabled={isEmpty(cities) || mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"zip"}
        render={({ field }) => (
          <FormRender label={"Zip"}>
            <Input {...field} disabled={mode === "view"} type="number" />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"gender"}
        render={({ field }) => (
          <FormRender label={"Gender"}>
            <SelectInput
              options={genderOptions}
              field={field}
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"maritalStatus"}
        render={({ field }) => (
          <FormRender label={"Marital Status"}>
            <SelectInput
              options={maritalStatusOptions}
              field={field}
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"workersComp"}
        render={({ field }) => (
          <FormRender label={"INS (PVT) Workers Comp"}>
            <Input {...field} disabled={mode === "view"} />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"race"}
        render={({ field }) => (
          <FormRender label={"Race"}>
            <SelectInput
              options={ethnicityOptions}
              field={field}
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />

      <FormField
        control={methods.control}
        name={"referralSource"}
        render={({ field }) => (
          <FormRender label={"Referral Source"}>
            <Input {...field} disabled={mode === "view"} />
          </FormRender>
        )}
      />
    </div>
  );
};

export default PatientInformation;
