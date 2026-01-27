"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientAuthorization } from "@prisma/client";
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
import { usePopulateForm, useUpdateAuthorization } from "@/hooks";
import { cn, filterArray } from "@/lib";
import {
  AuthorizationDefaultValue,
  AuthorizationForm,
  AuthorizationSchema,
} from "@/schema/patient/authorization";

const Authorization = ({
  data,
  patientId,
  mutate,
}: {
  data: { authorizationTracker: PatientAuthorization[] };
  patientId?: string;
  mutate: () => void;
}) => {
  const {
    data: updatePatient,
    trigger,
    isMutating,
  } = useSWRMutation("/api/patient/authorization", useUpdateAuthorization);
  const methods = useForm<AuthorizationForm>({
    resolver: zodResolver(AuthorizationSchema),
    defaultValues: AuthorizationDefaultValue,
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

  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "authorizationTracker",
  });

  usePopulateForm(methods.reset, data);

  return (
    <Form {...methods}>
      <form
        className="mt-2 justify-between flex flex-col scrollbar-hide max-h-[calc(100vh-130px)] md:max-h-[calc(100vh-180px)] overflow-auto pb-8"
        onSubmit={methods.handleSubmit(async (formData) => {
          trigger({
            ...formData,
            patientId,
            authorizationTracker: filterArray(formData.authorizationTracker),
          });
        })}
      >
        <div className="md:px-8 px-2 bg-background border-b border-b-border flex justify-between items-center uppercase font-semibold  text-white  py-2 mx-2 mb-4 sticky top-0 z-[1]">
          <p className="text-foreground"> Authorization Tracker</p>
          <Button
            type="submit"
            className={cn("py-2 text-white")}
            loading={isMutating}
          >
            Save Changes
          </Button>
        </div>
        <div
          className={cn(
            "grid grid-cols-1 gap-x-7 gap-y-4 md:px-8 px-4 items-end",
          )}
        >
          {fields.map((item, index) => (
            <div key={index}>
              {index > 0 && (
                <div className="bg-primary p-3 uppercase mx-auto text-center font-semibold mb-2">
                  Authorization Tracker {index + 1}
                </div>
              )}
              <div className={cn("grid lg:grid-cols-2 gap-x-7 gap-y-4")}>
                <FormField
                  control={methods.control}
                  name={`authorizationTracker.${index}.startDate`}
                  render={({ field }) => (
                    <FormRender label={"Start"}>
                      <DateInput
                        onChange={field.onChange}
                        value={field.value as Date}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`authorizationTracker.${index}.endDate`}
                  render={({ field }) => (
                    <FormRender label={"End"}>
                      <DateInput
                        onChange={field.onChange}
                        value={field.value as Date}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`authorizationTracker.${index}.status`}
                  render={({ field }) => (
                    <FormRender label={"Status"}>
                      <SelectInput
                        options={[
                          {
                            label: "Inactive",
                            value: "inactive",
                          },
                          {
                            label: "Active",
                            value: "active",
                          },
                        ]}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`authorizationTracker.${index}.insurance`}
                  render={({ field }) => (
                    <FormRender label={"Insurance"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`authorizationTracker.${index}.number`}
                  render={({ field }) => (
                    <FormRender label={"Authorization Number"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`authorizationTracker.${index}.visitsAuthorized`}
                  render={({ field }) => (
                    <FormRender label={"Total Visits Authorized"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormHeader className="md:col-span-2 mt-8">Services</FormHeader>
                <div className="grid grid-cols-3 gap-x-7 gap-y-4 w-full lg:grid-cols-6 md:col-span-2">
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.sn`}
                    render={({ field }) => (
                      <FormRender label={"SN"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.pt`}
                    render={({ field }) => (
                      <FormRender label={"PT"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.ot`}
                    render={({ field }) => (
                      <FormRender label={"OT"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.st`}
                    render={({ field }) => (
                      <FormRender label={"ST"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.msw`}
                    render={({ field }) => (
                      <FormRender label={"MSW"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.rn`}
                    render={({ field }) => (
                      <FormRender label={"RN"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.lvn`}
                    render={({ field }) => (
                      <FormRender label={"LVN"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.caregiver`}
                    render={({ field }) => (
                      <FormRender label={"Caregiver"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.hha`}
                    render={({ field }) => (
                      <FormRender label={"HHA"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.rm`}
                    render={({ field }) => (
                      <FormRender label={"RM"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.assLiv`}
                    render={({ field }) => (
                      <FormRender label={"AssLiv"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.empAs`}
                    render={({ field }) => (
                      <FormRender label={"EmpAs"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.peer`}
                    render={({ field }) => (
                      <FormRender label={"Peer"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.counselling`}
                    render={({ field }) => (
                      <FormRender label={"Counseling"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.sud`}
                    render={({ field }) => (
                      <FormRender label={"SUD"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.sudg`}
                    render={({ field }) => (
                      <FormRender label={"SUDG"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.nurse`}
                    render={({ field }) => (
                      <FormRender label={"Nurse"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.psychRe`}
                    render={({ field }) => (
                      <FormRender label={"PsychRe"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.psychRehg`}
                    render={({ field }) => (
                      <FormRender label={"psychRehg"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.transp`}
                    render={({ field }) => (
                      <FormRender label={"TransP"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.supEmp`}
                    render={({ field }) => (
                      <FormRender label={"SupEmp"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.shl`}
                    render={({ field }) => (
                      <FormRender label={"SHL"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.hhc`}
                    render={({ field }) => (
                      <FormRender label={"HHC"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`authorizationTracker.${index}.sls`}
                    render={({ field }) => (
                      <FormRender label={"SLS"}>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />{" "}
                </div>
                <FormField
                  control={methods.control}
                  name={`authorizationTracker.${index}.comment`}
                  render={({ field }) => (
                    <FormRender label={"Comments"}>
                      <Textarea {...field} value={field.value as string} />
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
                      append(AuthorizationDefaultValue.authorizationTracker[0])
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
      </form>
    </Form>
  );
};

export default Authorization;
