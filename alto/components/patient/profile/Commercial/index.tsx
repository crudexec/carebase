"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientCommercial } from "@prisma/client";
import { isEmpty } from "lodash";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useSWRMutation from "swr/mutation";

import {
  Button,
  Checkbox,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  MultiSelect,
  SelectInput,
} from "@/components/ui";
import {
  genderOptions,
  getCities,
  getCountries,
  getStates,
  insuranceInformationOption,
} from "@/constants";
import { usePopulateForm, useUpdateCommercial } from "@/hooks";
import { cn, pickValues } from "@/lib";
import {
  CommercialDefaultValue,
  CommercialForm,
  CommercialSchema,
} from "@/schema/patient/commercial";

const Commercial = ({
  data,
  patientId,
  mutate,
}: {
  data?: PatientCommercial;
  patientId?: string;
  mutate: () => void;
}) => {
  const {
    data: updatePatient,
    trigger,
    isMutating,
  } = useSWRMutation("/api/patient/commercial", useUpdateCommercial);
  const methods = useForm<CommercialForm>({
    resolver: zodResolver(CommercialSchema),
    defaultValues: CommercialDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const countries = getCountries();
  const states = getStates(methods.watch("country"));
  const cities = getCities(methods.watch("country"), methods.watch("state"));
  usePopulateForm<CommercialForm, PatientCommercial>(methods.reset, data);

  useEffect(() => {
    if (updatePatient?.success) {
      mutate();
      toast.success(`Success|${updatePatient?.message}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatePatient]);

  return (
    <Form {...methods}>
      <form
        className="mt-2 justify-between flex flex-col scrollbar-hide max-h-[calc(100vh-130px)] md:max-h-[calc(100vh-180px)] overflow-auto pb-8"
        onSubmit={methods.handleSubmit(async (formData) => {
          const { gender, otherBenefitPlanGender, ...rest } = formData;
          trigger({
            ...rest,
            patientId,
            id: data?.id as string,
            ...pickValues({ gender }),
            ...pickValues({ otherBenefitPlanGender }),
          });
        })}
      >
        <div className="md:px-8 px-2 bg-background border-b border-b-border flex justify-between items-center uppercase font-semibold  text-white  py-2 mx-2 mb-4 sticky top-0 z-[1]">
          <p className="text-foreground"> Commercial Information</p>
          <Button
            type="submit"
            className={cn("py-2 text-white")}
            loading={isMutating}
          >
            Save Changes
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4 items-end">
          <FormField
            control={methods.control}
            name={"insuranceInformation"}
            render={({ field }) => (
              <FormRender label="Insurance Information">
                <MultiSelect
                  options={insuranceInformationOption}
                  value={field.value as string[]}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"payId"}
            render={({ field }) => (
              <FormRender label={"Payor ID"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"policyHolder"}
            render={({ field }) => (
              <FormRender label={"Policy Holder"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"insuredHolder"}
            render={({ field }) => (
              <FormRender label={"Insured/Policy Holder"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"uniqueId"}
            render={({ field }) => (
              <FormRender label={"Unique ID"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"gender"}
            render={({ field }) => (
              <FormRender label={"Gender"}>
                <SelectInput options={genderOptions} field={field} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"dob"}
            render={({ field }) => (
              <FormRender label={"DOB"}>
                <DateInput onChange={field.onChange} value={field.value} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"address"}
            render={({ field }) => (
              <FormRender label={"Address"}>
                <Input {...field} value={field.value as string} />
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
                  field={{ ...field, value: field?.value }}
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
                  field={{ ...field, value: field?.value }}
                  disabled={isEmpty(states)}
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
                  field={{ ...field, value: field?.value }}
                  disabled={isEmpty(cities)}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"zip"}
            render={({ field }) => (
              <FormRender label={"Zip"}>
                <Input {...field} type="number" />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"phone"}
            render={({ field }) => (
              <FormRender label={"Phone"}>
                <Input {...field} type="number" />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"employer"}
            render={({ field }) => (
              <FormRender label={"Employer or School"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"groupName"}
            render={({ field }) => (
              <FormRender label={"Group Name"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"groupNumber"}
            render={({ field }) => (
              <FormRender label={"Group Number"}>
                <Input {...field} type="number" />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"isOtherBenefitPlan"}
            render={({ field }) => (
              <FormRender formClassName="self-center">
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">
                    Check if there is another Health Benefit Plan
                  </span>
                </div>
              </FormRender>
            )}
          />
          {methods.watch("isOtherBenefitPlan") && (
            <>
              <FormField
                control={methods.control}
                name={"otherInsured"}
                render={({ field }) => (
                  <FormRender label={"Other Insured"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"otherBenefitPlanEmployer"}
                render={({ field }) => (
                  <FormRender label={"Employer or School"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"otherBenefitPlanGender"}
                render={({ field }) => (
                  <FormRender label={"Gender"}>
                    <SelectInput options={genderOptions} field={field} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"otherBenefitPlanDob"}
                render={({ field }) => (
                  <FormRender label={"DOB"}>
                    <DateInput onChange={field.onChange} value={field.value} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"otherBenefitPlanGroupName"}
                render={({ field }) => (
                  <FormRender label={"Group Name"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"otherBenefitPlanGroupNumber"}
                render={({ field }) => (
                  <FormRender label={"Group Number"}>
                    <Input {...field} type="number" />
                  </FormRender>
                )}
              />
            </>
          )}
        </div>
      </form>
    </Form>
  );
};

export default Commercial;
