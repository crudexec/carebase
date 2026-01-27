"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import { CreatePhysicianModal } from "@/components/patient";
import PhraseHelperText from "@/components/phrase-helper";
import {
  Button,
  Checkbox,
  DateInput,
  Form,
  FormField,
  FormRender,
  SelectInput,
  Textarea,
} from "@/components/ui";
import {
  useGetPhysician,
  useGetUsers,
  usePopulateForm,
  useSavePlanOfCare,
} from "@/hooks";
import { getFullName, modifyDateFields } from "@/lib";
import {
  planOfCareDefaultValue,
  PlanOfCareForm,
  planOfCareSchema,
} from "@/schema";
import { PlanOfCareResponse } from "@/types";

const POCPhysician = ({
  caregiver,
  patientId,
  callback,
  data,
  disabled,
  isCert485,
}: {
  patientId: string;
  callback: (planOfCare?: string) => void;
  caregiver?: User;
  data: PlanOfCareResponse;
  disabled?: boolean;
  isCert485?: boolean;
}) => {
  const methods = useForm<PlanOfCareForm>({
    resolver: zodResolver(planOfCareSchema),
    defaultValues: planOfCareDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { data: response, trigger, isMutating } = useSavePlanOfCare();
  const { data: caregivers, isLoading: loading } = useGetUsers({
    tab: "caregiver",
  });
  const { data: physician, mutate } = useGetPhysician();
  const [action, setAction] = React.useState<string>("");

  useEffect(() => {
    if (response?.success) {
      toast.success("Data saved successfully!");
      callback(response?.data?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const planOfCare = useMemo(() => {
    return modifyDateFields({ ...data } as PlanOfCareResponse);
  }, [data]);

  usePopulateForm<PlanOfCareForm, PlanOfCareResponse>(
    methods.reset,
    planOfCare,
  );
  return (
    <div>
      <CreatePhysicianModal
        mode={"create"}
        title={"Create Physician"}
        open={action === "create-physician"}
        modalClose={() => {
          mutate();
          setAction("");
        }}
      />
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(async (formData) => {
            await trigger({
              ...formData,
              id: data?.id as string,
              caregiverId: caregiver?.id,
              patientId,
              isCert485,
            });
          })}
        >
          <div>
            <FormHeader className="mt-4">
              Physician, Nurse and Verbal SOC
            </FormHeader>
            <div className="grid grid-col-1 md:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"physicianId"}
                render={({ field }) => (
                  <FormRender label={"Physician"}>
                    <SelectInput
                      disabled={disabled}
                      options={[
                        ...(physician?.data?.map((item) => ({
                          value: item.id as string,
                          label: getFullName(
                            item?.lastName,
                            item?.firstName,
                            "Name not available",
                          ),
                        })) ?? []),
                        {
                          value: "create-physician",
                          label: "+ Create new physician",
                        },
                      ]}
                      field={{
                        ...field,
                        onChange: (value) => {
                          if (value === "create-physician") {
                            setAction("create-physician");
                          } else {
                            field.onChange(value);
                          }
                        },
                      }}
                      placeholder="Select Physician"
                    />
                  </FormRender>
                )}
              />
              <FormField
                disabled={disabled}
                control={methods.control}
                name={"modifyPhysicianCert"}
                render={({ field }) => (
                  <FormRender formClassName="self-center">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={disabled}
                      />
                      <span className="text-sm">
                        Modify Physician Certification Statement on POC Plus
                      </span>
                    </div>
                  </FormRender>
                )}
              />
              {methods.watch("modifyPhysicianCert") && (
                <div>
                  <FormField
                    control={methods.control}
                    name={"certStatement"}
                    render={({ field }) => (
                      <FormRender label="POC+ - Physician Certification Statement:">
                        <Textarea
                          {...field}
                          value={field.value as string}
                          disabled={disabled}
                        />
                      </FormRender>
                    )}
                  />
                  <PhraseHelperText
                    formData={{
                      section: "phys-cert-statement-poc-plus",
                      description: methods.watch("certStatement") ?? "",
                    }}
                    callback={(text) => {
                      methods.setValue(
                        "certStatement",
                        `${methods.watch("certStatement") ?? ""} ${text}`,
                      );
                    }}
                  />
                </div>
              )}
              <FormField
                control={methods.control}
                name={"caseManagerId"}
                render={({ field }) => (
                  <FormRender label={"Case Manager/Primary RN"}>
                    <SelectInput
                      options={
                        caregivers?.data?.users?.map((caregiver) => ({
                          label: `${caregiver.firstName} ${caregiver.lastName}`,
                          value: caregiver.id,
                        })) || []
                      }
                      disabled={disabled}
                      field={field}
                      loading={loading}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"verbalSOC"}
                render={({ field }) => (
                  <FormRender label={"Verbal SOC (if applicable)"}>
                    <DateInput
                      {...field}
                      value={field.value as Date}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end text-end my-2">
            <Button className="px-6" loading={isMutating} disabled={disabled}>
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export { POCPhysician };
