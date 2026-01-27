import { providerFormSchema } from "@/schema/settings/provider";
import { FormReturn } from "@/types";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "../ui";

const QualityImprovement = ({
  form,
}: {
  form: FormReturn<(typeof providerFormSchema)[1]>;
}) => {
  const inputForms = [
    { label: "QIO AddressLine 1", name: "qioAddress1" },
    { label: "QIO AddressLine 2", name: "qioAddress2" },
    { label: "QIO City", name: "qioCity" },
    { label: "QIO State", name: "qioState" },
    { label: "QIO Zip Code", name: "qioZipCode" },
    { label: "QIO Phone Number", name: "qioPhone" },
    { label: "QIO Fax Number", name: "qioFax" },
    { label: "QIO Local Phone Number", name: "qioLocalPhone" },
  ];
  return (
    <div className="grid  grid-cols-1 lg:grid-cols-2 gap-x-7 gap-y-4">
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

export default QualityImprovement;
