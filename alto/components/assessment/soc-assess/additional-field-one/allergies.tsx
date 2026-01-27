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
  RadioInput,
} from "@/components/ui";
import { cn } from "@/lib";
import {
  additionalFieldOneDefaultValue,
  additionalFieldOneSchema,
} from "@/schema/assessment/soc-assess/addtional-field-one";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof additionalFieldOneSchema>;

const Allergies = ({ methods }: { methods: formType }) => {
  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "otherAllergies",
  });
  return (
    <>
      <div>
        <FormHeader className="mt-4">ALLERGIES</FormHeader>
        <div className="grid lg:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"foodAllergies"}
            render={({ field }) => (
              <FormRender label="Food allergies?">
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
            name={"foodAllergiesList"}
            render={({ field }) => (
              <FormRender label="If yes, list:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"environmentalAllergies"}
            render={({ field }) => (
              <FormRender label="Environmental allergies?">
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
            name={"environmentalAllergiesList"}
            render={({ field }) => (
              <FormRender label="If yes, list:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"drugAllergies"}
            render={({ field }) => (
              <FormRender label="Drug/Medication allergies?">
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
            name={"drugAllergiesList"}
            render={({ field }) => (
              <FormRender label="If yes, see list on medication profile:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
      <div>
        <FormHeader className="mt-4">OTHER ALLERGIES</FormHeader>
        <div className="grid grid-col-5">
          {fields.map((_, index) => (
            <div key={index}>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={`otherAllergies.${index}.rxNormal`}
                  render={({ field }) => (
                    <FormRender label={`RxNorm ${index + 1}:`}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`otherAllergies.${index}.description`}
                  render={({ field }) => (
                    <FormRender label={`Description ${index + 1}:`}>
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
                    append(additionalFieldOneDefaultValue.otherAllergies[0])
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
        <FormHeader className="mt-4">PROGNOSIS</FormHeader>
        <div className="grid  gap-5">
          <FormField
            control={methods.control}
            name={"prognosis"}
            render={() => (
              <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                <CheckboxGroup
                  methods={methods}
                  options={[
                    { value: "poor", label: "Poor" },
                    { value: "good", label: "Good" },
                    { value: "guarded", label: "Guarded" },
                    { value: "excellent", label: "Excellent" },
                    { value: "fair", label: "Fair" },
                  ]}
                  name={"prognosis"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"additionalClarification"}
            render={({ field }) => (
              <FormRender label="Additional clarification:">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default Allergies;
