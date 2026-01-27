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
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib";
import {
  additionalFieldOneDefaultValue,
  additionalFieldOneSchema,
} from "@/schema/assessment/soc-assess/addtional-field-one";
import { FormReturn } from "@/types";

type formType = FormReturn<typeof additionalFieldOneSchema>;

const SiteLocation = ({ methods }: { methods: formType }) => {
  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "siteLocation",
  });
  return (
    <>
      {fields.map((_, index) => (
        <div key={index}>
          <FormHeader className="mt-4">SITE LOCATION {index + 1}</FormHeader>
          <div className="grid lg:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={`siteLocation.${index}.siteLocation`}
              render={({ field }) => (
                <FormRender label="Location:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={`siteLocation.${index}.siteLength`}
              render={({ field }) => (
                <FormRender label="Length:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={`siteLocation.${index}.siteWidth`}
              render={({ field }) => (
                <FormRender label="Width:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={`siteLocation.${index}.siteUndermining`}
              render={({ field }) => (
                <FormRender label="Undermining:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={`siteLocation.${index}.siteDepth`}
              render={({ field }) => (
                <FormRender label="Depth:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={`siteLocation.${index}.siteTunneling`}
              render={({ field }) => (
                <FormRender label="Tunneling:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <div>
              <p className="text-sm font-semibold pb-2">Drainage:</p>
              <FormField
                control={methods.control}
                name={`siteLocation.${index}.drainage`}
                render={() => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "serous", label: "Serous" },
                        { value: "serosanguineous", label: "Serosanguineous" },
                        { value: "purulent", label: "Purulent" },
                      ]}
                      name={"drainage"}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div>
              <p className="text-sm font-semibold pb-2">Amount:</p>
              <FormField
                control={methods.control}
                name={`siteLocation.${index}.amount`}
                render={() => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "small", label: "Small" },
                        { value: "moderate", label: "Moderate" },
                        { value: "large", label: "Large" },
                      ]}
                      name={"amount"}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div>
              <p className="text-sm font-semibold pb-2">
                Wound Bed Appearance:
              </p>
              <FormField
                control={methods.control}
                name={`siteLocation.${index}.woundBedAppearance`}
                render={() => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "granulation", label: "Granulation" },
                        { value: "slough", label: "Slough" },
                        { value: "eschar", label: "Eschar" },
                        { value: "other", label: "Other" },
                      ]}
                      name={"woundBedAppearance"}
                    />
                  </FormRender>
                )}
              />
            </div>
            <FormField
              control={methods.control}
              name={`siteLocation.${index}.otherWoundBedAppearance`}
              render={({ field }) => (
                <FormRender label="Other:">
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={
                      !methods
                        .watch(`siteLocation.${index}.woundBedAppearance`)
                        ?.includes("other")
                    }
                  />
                </FormRender>
              )}
            />
            <div>
              <p className="text-sm font-semibold pb-2">Surrounding Tissue:</p>
              <FormField
                control={methods.control}
                name={`siteLocation.${index}.surroundingTissue`}
                render={() => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "erythema", label: "Erythema" },
                        { value: "induration", label: "Induration" },
                        { value: "maceration", label: "Maceration" },
                      ]}
                      name={"surroundingTissue"}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div>
              <p className="text-sm font-semibold pb-2">Odor:</p>
              <FormField
                control={methods.control}
                name={`siteLocation.${index}.odor`}
                render={() => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "none", label: "None" },
                        { value: "mild", label: "Mild" },
                        { value: "foul", label: "Foul" },
                      ]}
                      name={"odor"}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div>
              <p className="text-sm font-semibold pb-2">
                Signs/Symptoms of Infection:
              </p>
              <FormField
                control={methods.control}
                name={`siteLocation.${index}.signsOfInfection`}
                render={() => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "fever", label: "Fever" },
                        { value: "redness", label: "Redness" },
                        { value: "swelling", label: "Swelling" },
                        { value: "warmth", label: "Warmth" },
                        { value: "other", label: "Other" },
                      ]}
                      name={"signsOfInfection"}
                    />
                  </FormRender>
                )}
              />
            </div>
            <FormField
              control={methods.control}
              name={`siteLocation.${index}.otherSignsOfInfection`}
              render={({ field }) => (
                <FormRender label="Other:">
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={
                      !methods
                        .watch(`siteLocation.${index}.signsOfInfection`)
                        ?.includes("other")
                    }
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={`siteLocation.${index}.teachingOfWoundCare`}
              render={({ field }) => (
                <FormRender label="Teaching of Wound Care to:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={`siteLocation.${index}.runDemonstration`}
              render={({ field }) => (
                <FormRender label="Return demonstration:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={`siteLocation.${index}.acceptable`}
              render={({ field }) => (
                <FormRender label="Acceptable:">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={`siteLocation.${index}.dressingChange`}
              render={({ field }) => (
                <FormRender label="Dressing Change:">
                  <Textarea {...field} value={field.value as string} />
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
                append(additionalFieldOneDefaultValue.siteLocation[0])
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
    </>
  );
};

export default SiteLocation;
