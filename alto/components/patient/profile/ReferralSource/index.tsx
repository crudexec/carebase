import { zodResolver } from "@hookform/resolvers/zod";
import { PatientReferralSource } from "@prisma/client";
import { PlusIcon } from "@radix-ui/react-icons";
import { MinusIcon } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import useSWRMutation from "swr/mutation";

import FormHeader from "@/components/form-header";
import {
  Button,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { ReferralSourceType } from "@/constants/patient";
import { usePopulateForm, useUpdateReferralSource } from "@/hooks";
import { cn } from "@/lib";
import {
  referralSourceDefaultValue,
  ReferralSourceForm,
  ReferralSourceSchema,
} from "@/schema";
import { PatientReferralSourceResponse } from "@/types";

const ReferralSource = ({
  data,
  patientId,
  mutate,
}: {
  data: PatientReferralSourceResponse;
  patientId?: string;
  mutate: () => void;
}) => {
  const {
    data: updatePatient,
    trigger,
    isMutating,
  } = useSWRMutation("/api/patient/referral-source", useUpdateReferralSource);
  const methods = useForm<ReferralSourceForm>({
    resolver: zodResolver(ReferralSourceSchema),
    defaultValues: referralSourceDefaultValue,
    mode: "onChange",
    shouldUnregister: true,
  });
  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "pharmacy",
  });

  usePopulateForm<ReferralSourceForm, PatientReferralSource>(
    methods.reset,
    data,
  );

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
          await trigger({
            ...formData,
            patientId,
            id: data?.id,
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
            name={"referredBy"}
            render={({ field }) => (
              <FormRender label={"Referred By"}>
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
                  options={ReferralSourceType}
                  field={{ ...field, value: field.value }}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"facility"}
            render={({ field }) => (
              <FormRender label={"Facility"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"referralDate"}
            render={({ field }) => (
              <FormRender label={"Referral Date"}>
                <DateInput
                  onChange={field.onChange}
                  value={field.value as Date}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"coordinator"}
            render={({ field }) => (
              <FormRender label={"Coordinator"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"salesRep"}
            render={({ field }) => (
              <FormRender label={"Sales Rep"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"referralPhone"}
            render={({ field }) => (
              <FormRender label={"Referral Phone"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"ext"}
            render={({ field }) => (
              <FormRender label={"Ext"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"disposition"}
            render={({ field }) => (
              <FormRender label={"Disposition"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"followUp"}
            render={({ field }) => (
              <FormRender label={"Follow Up"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"otherHHA"}
            render={({ field }) => (
              <FormRender label={"Other HHA"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"phone"}
            render={({ field }) => (
              <FormRender label={"Phone"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"mrNumber"}
            render={({ field }) => (
              <FormRender label={"MR Number"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"notes"}
            render={({ field }) => (
              <FormRender label={"Notes"}>
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
        <FormHeader className="mx-2"> Phamarcy </FormHeader>

        <div
          className={cn(
            "grid grid-cols-1 gap-x-7 gap-y-4 md:px-8 px-4 items-end",
          )}
        >
          {fields.map((_, index) => (
            <div key={index}>
              <div className={cn("grid lg:grid-cols-2 gap-x-7 gap-y-4")}>
                <FormField
                  control={methods.control}
                  name={`pharmacy.${index}.name`}
                  render={({ field }) => (
                    <FormRender label={"Pharmacy"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`pharmacy.${index}.phone`}
                  render={({ field }) => (
                    <FormRender label={"Phone"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`pharmacy.${index}.address`}
                  render={({ field }) => (
                    <FormRender label={"Address"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`pharmacy.${index}.fax`}
                  render={({ field }) => (
                    <FormRender label={"Fax"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
              <div className={cn("flex space-x-3 items-center my-2")}>
                {index === fields.length - 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() =>
                      append(referralSourceDefaultValue.pharmacy[0])
                    }
                  >
                    <PlusIcon className="size-4" />
                    Add More
                  </Button>
                )}
                {fields.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    type="button"
                    onClick={() => remove(index)}
                  >
                    <MinusIcon className="size-4" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div
          className={cn(
            "grid grid-cols-1 gap-x-7 gap-y-4 md:px-8 px-4 items-end mt-2",
          )}
        >
          <FormField
            control={methods.control}
            name={"diagnosis"}
            render={({ field }) => (
              <FormRender label={"Diagnosis"}>
                <Textarea {...field} value={field.value as string} />
              </FormRender>
            )}
          />
        </div>
      </form>
    </Form>
  );
};

export default ReferralSource;
