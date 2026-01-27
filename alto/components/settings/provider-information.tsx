import { providerFormSchema } from "@/schema";
import { FormReturn } from "@/types";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "../ui";

const ProviderInformation = ({
  form,
}: {
  form: FormReturn<(typeof providerFormSchema)[2]>;
}) => {
  const inputForms = [
    { label: "Name", name: "ppiName" },
    { label: "NPI", name: "ppiNpi" },
    { label: "Address Line 1", name: "ppiAddress1" },
    { label: "Address Line 2", name: "ppiAddress2" },
    { label: "City", name: "ppiCity" },
    { label: "State", name: "ppiState" },
    { label: "Zip Code", name: "ppiZipCode" },
    { label: "Tax ID", name: "ppiTaxId" },
    { label: "Tax Type", name: "ppiTaxType" },
    { label: "Provider ID", name: "ppiProviderId" },
    { label: "Provider No", name: "ppiProviderNumber" },
    { label: "Sec ID 1", name: "ppiSecId1" },
    { label: "Sec Type 1", name: "ppiSecType1" },
    { label: "Sec ID 2", name: "ppiSecId2" },
    { label: "Sec Type 2", name: "ppiSecType2" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4">
      {inputForms.map((formField) => (
        <FormField
          key={formField.name}
          control={form.control}
          name={formField.name as keyof InferSchema<typeof currentSchema>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{formField.label}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
};

export default ProviderInformation;
