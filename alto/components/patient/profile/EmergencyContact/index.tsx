"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientEmergencyContact } from "@prisma/client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import useSWRMutation from "swr/mutation";

import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  Form,
  FormField,
  FormRender,
  Input,
  MultiSelect,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { legalPaperOptions } from "@/constants";
import { usePopulateForm, useUpdateEmergencyContact } from "@/hooks";
import { cn } from "@/lib";
import {
  EmergencyContactDefaultValue,
  EmergencyContactForm,
  EmergencyContactSchema,
} from "@/schema";

const EmergencyContact = ({
  data,
  patientId,
  mutate,
}: {
  data?: PatientEmergencyContact;
  patientId?: string;
  mutate: () => void;
}) => {
  const {
    data: updatePatient,
    trigger,
    isMutating,
  } = useSWRMutation(
    "/api/patient/emergency-contact",
    useUpdateEmergencyContact,
  );
  const methods = useForm<EmergencyContactForm>({
    resolver: zodResolver(EmergencyContactSchema),
    defaultValues: EmergencyContactDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  useEffect(() => {
    if (updatePatient?.success) {
      mutate();
      toast.success(`Success|${updatePatient?.message}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatePatient]);

  usePopulateForm<EmergencyContactForm, PatientEmergencyContact>(
    methods.reset,
    data,
  );

  return (
    <Form {...methods}>
      <form
        className="mt-2 justify-between flex flex-col scrollbar-hide max-h-[calc(100vh-130px)] md:max-h-[calc(100vh-180px)] overflow-auto pb-8"
        onSubmit={methods.handleSubmit(async (formData) => {
          await trigger({
            ...formData,
            patientId,
            id: data?.id as string,
          });
        })}
      >
        <div className="md:px-8 px-2 bg-background border-b border-b-border flex justify-between items-center uppercase font-semibold  text-white  py-2 mx-2 mb-4 sticky top-0 z-[1]">
          <p className="text-foreground"> Referral Information</p>
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
            name={"firstName"}
            render={({ field }) => (
              <FormRender label={"First Name"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"lastName"}
            render={({ field }) => (
              <FormRender label={"Last Name"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"dayPhone"}
            render={({ field }) => (
              <FormRender label={"Day Phone"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"eveningPhone"}
            render={({ field }) => (
              <FormRender label={"Evening Phone"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"relation"}
            render={({ field }) => (
              <FormRender label={"Relation"}>
                <Input {...field} value={field.value as string} />
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
            name={"type"}
            render={({ field }) => (
              <FormRender label={"Type"}>
                <SelectInput
                  options={[
                    {
                      label: "Individual",
                      value: "individual",
                    },
                    {
                      label: "Institution",
                      value: "institution",
                    },
                  ]}
                  field={{ ...field, value: field.value as string }}
                />
              </FormRender>
            )}
          />
        </div>
        <FormHeader className="mx-2"> Next of Kin</FormHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4 items-end">
          <FormField
            control={methods.control}
            name={"nextOfKinName"}
            render={({ field }) => (
              <FormRender label={"Name"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />

          <FormField
            control={methods.control}
            name={"nextOfKinRelation"}
            render={({ field }) => (
              <FormRender label={"Relation"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"nextOfKinPhone"}
            render={({ field }) => (
              <FormRender label={"Phone"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"nextOfKinExt"}
            render={({ field }) => (
              <FormRender label={"Ext"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"nextOfKinAddress"}
            render={({ field }) => (
              <FormRender label={"Address"}>
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>{" "}
        <FormHeader className="mx-2"> Home Environment </FormHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4 items-end">
          <FormField
            control={methods.control}
            name={"livesWith"}
            render={({ field }) => (
              <FormRender label={"Patient lives with"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"homePet"}
            render={({ field }) => (
              <FormRender label={"Pets in Home"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"smokesInHome"}
            render={({ field }) => (
              <FormRender label={"Smokes in Home"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>{" "}
        <FormHeader className="mx-2"> Legal Papers </FormHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4 items-end">
          <FormField
            control={methods.control}
            name={"isAdvancedDirective"}
            render={({ field }) => (
              <FormRender formClassName="self-center">
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">Advanced Directives</span>
                </div>
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"location"}
            render={({ field }) => (
              <FormRender label={"Location of"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />{" "}
          <FormField
            control={methods.control}
            name={"legalPaperOption"}
            render={({ field }) => (
              <FormRender label={"Legal Paper Options"}>
                <MultiSelect
                  options={legalPaperOptions}
                  value={field.value as string[]}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              </FormRender>
            )}
          />{" "}
          <FormField
            control={methods.control}
            name={"attorneyPower"}
            render={({ field }) => (
              <FormRender label={"Power of Attorney"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />{" "}
          <FormField
            control={methods.control}
            name={"poaPhone"}
            render={({ field }) => (
              <FormRender label={"POA Phone"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />{" "}
        </div>
      </form>
    </Form>
  );
};

export default EmergencyContact;
