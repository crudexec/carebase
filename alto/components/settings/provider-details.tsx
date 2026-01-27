import { useMemo } from "react";
import useSWR from "swr";

import { DayOptions, providerTypeOptions, taxonomy } from "@/constants";
import { providerFormSchema } from "@/schema";
import { ApiResponse, FormReturn, TaxonomyResponse } from "@/types";

import { FormField, FormRender, Input, SelectInput } from "../ui";

type formType = FormReturn<(typeof providerFormSchema)[0]>;

const ProviderDetails = ({ form }: { form: formType }) => {
  const { data: taxonomies } =
    useSWR<ApiResponse<TaxonomyResponse[]>>(`/api/lookup/taxonomy`);
  const inputForms = useMemo(
    () => [
      { label: "Provider Name", name: "providerName" },
      { label: "DMETPI", name: "dmetpi" },
      { label: "Billing Name", name: "billingName" },
      { label: "Identifier Name", name: "identifierName" },
      { label: "Provider Number", name: "providerNumber" },
      { label: "Benefit Code", name: "benefitCode" },
      { label: "Contact 1", name: "contact1" },
      { label: "NPI", name: "npi" },
      { label: "Contact 2", name: "contact2" },
      { label: "Tax ID", name: "taxId" },
      { label: "Address 1", name: "address1" },
      { label: "State Assigned ID", name: "stateAssignedId" },
      { label: "Address 2", name: "address2" },
      { label: "Branch ID", name: "branchId" },
      { label: "State", name: "state" },
      { label: "Phone", name: "phone" },
      { label: "City", name: "city" },
      { label: "Cell Phone", name: "cellPhone" },
      { label: "Zip Code", name: "zipCode" },
      { label: "Fax", name: "fax" },
      { label: "TPI", name: "tpi" },
      { label: "Email", name: "email" },
      { label: "Press Ganey Client ID", name: "pressGaneyClientId" },
      { label: "Start Day", name: "startDay", options: DayOptions },
      {
        label: "Taxonomy",
        name: "taxonomy",
        options: taxonomies?.data.map((tax) => ({
          value: tax.id,
          label: taxonomy.find((item) => item.value === tax.name)?.label || "",
        })),
      },
      {
        label: "Taxonomy Code",
        name: "taxonomyCode",
        options: taxonomies?.data
          .find((taxonomy) => taxonomy.id === form.watch("taxonomy"))
          ?.codes.map((code) => ({
            value: code.id,
            label:
              taxonomy
                .flatMap((item) => item.code)
                .find((item) => item.value === code.code)?.label || "",
          })),
      },
      { label: "License No", name: "licenseNumber" },
      { label: "Novaetus ID", name: "novaetusId" },
      {
        label: "Provider Type",
        name: "providerType",
        options: providerTypeOptions,
      },
    ],
    [form, taxonomies?.data],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-7 gap-y-4">
      {inputForms.map((formField) => (
        <FormField
          key={formField.name}
          control={form.control}
          name={formField.name as keyof InferSchema<typeof currentSchema>}
          render={({ field }) => (
            <FormRender label={formField.label}>
              {formField.name === "providerType" ||
              formField.name === "startDay" ||
              formField.name === "taxonomy" ||
              formField.name === "taxonomyCode" ? (
                <SelectInput options={formField.options} field={field} />
              ) : (
                <Input {...field} />
              )}
            </FormRender>
          )}
        />
      ))}
    </div>
  );
};

export default ProviderDetails;
