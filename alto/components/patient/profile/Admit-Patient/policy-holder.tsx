"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientPolicyHolder } from "@prisma/client";
import { isEmpty } from "lodash";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import useSWRMutation from "swr/mutation";

import {
  Button,
  Checkbox,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  SelectInput,
} from "@/components/ui";
import { genderOptions, getCities, getCountries, getStates } from "@/constants";
import { payersOption, policyHolders } from "@/constants/patient";
import { useCreatePolicyHolder, usePopulateForm } from "@/hooks";
import { cn, pickValues } from "@/lib";
import {
  policyHolderDefaultValue,
  PolicyHolderForm,
  PolicyHolderSchema,
} from "@/schema";

const PolicyHolder = ({
  data,
  mutate: refresh,
  patientId,
}: {
  data?: PatientPolicyHolder | null;
  mutate: () => void;
  patientId: string;
}) => {
  const methods = useForm<PolicyHolderForm>({
    resolver: zodResolver(PolicyHolderSchema),
    defaultValues: policyHolderDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const countries = getCountries();
  const states = getStates(methods.watch("country"));
  const cities = getCities(methods.watch("country"), methods.watch("state"));

  const {
    data: createResponse,
    trigger,
    isMutating,
  } = useSWRMutation(
    `/api/patient/${patientId}/policy-holder`,
    useCreatePolicyHolder,
  );

  usePopulateForm<PolicyHolderForm, PatientPolicyHolder>(
    methods.reset,
    data as PatientPolicyHolder,
  );

  useEffect(() => {
    if (createResponse?.success) {
      refresh();
      toast.success(`Success|${createResponse?.message}`);
    }
  }, [createResponse, refresh]);

  return (
    <Form {...methods}>
      <form
        className="mt-2 justify-between flex flex-col scrollbar-hide max-h-[calc(100vh-130px)] md:max-h-[calc(100vh-180px)] overflow-auto pb-8"
        onSubmit={methods.handleSubmit(async (data) => {
          await trigger(pickValues({ ...data }));
        })}
      >
        <>
          <div className="md:px-8 px-2 bg-background border-b border-b-border flex justify-between items-center uppercase font-semibold  text-white  py-2 mx-2 sticky top-0 z-[1]">
            <p className="text-foreground"> Policy Holder</p>
            <Button
              type="submit"
              className={cn("py-2 text-white")}
              loading={isMutating}
            >
              Save Changes
            </Button>
          </div>
          <p className="flex justify-center text-center font-semibold bg-secondary py-2 mx-2 mb-2">
            INSURANCE INFORMATION ON POLICY HOLDER Required <br /> when billing
            Non-Medicare Patients Defaults Policy holder should be "Self (18)".
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4 items-end mt-3">
            <FormField
              control={methods.control}
              name={`policyPayer`}
              render={({ field }) => (
                <FormRender label="Policy Payer">
                  <SelectInput
                    options={payersOption}
                    field={field}
                    placeholder="Choose one (1) apropriate payer"
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"payerId"}
              render={({ field }) => (
                <FormRender label={"Payer ID"}>
                  <Input {...field} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"policyHolder"}
              render={({ field }) => (
                <FormRender label={"Policy Holder"}>
                  <SelectInput options={policyHolders} field={field} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"insuredPolicyHolder"}
              render={({ field }) => (
                <FormRender label={"Insured/Policy Holder"}>
                  <Input {...field} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"uniqueId"}
              render={({ field }) => (
                <FormRender label={"Unique ID"}>
                  <Input {...field} />
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
                  <Input {...field} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"country"}
              render={({ field }) => (
                <FormRender label={"Country"}>
                  <SelectInput options={countries} field={field} />
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
                    field={field}
                    disabled={isEmpty(cities)}
                  />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"zipCode"}
              render={({ field }) => (
                <FormRender label={"Zip Code"}>
                  <Input {...field} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"phone"}
              render={({ field }) => (
                <FormRender label={"Phone"}>
                  <Input {...field} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"employerOrSchool"}
              render={({ field }) => (
                <FormRender label={"Employer or School"}>
                  <Input {...field} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"groupName"}
              render={({ field }) => (
                <FormRender label={"Group Name"}>
                  <Input {...field} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"groupNumber"}
              render={({ field }) => (
                <FormRender label={"Group Number"}>
                  <Input {...field} />
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
          </div>
        </>
      </form>
    </Form>
  );
};

export default PolicyHolder;
