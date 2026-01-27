import { zodResolver } from "@hookform/resolvers/zod";
import { InsurancePriorAuthorization } from "@prisma/client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import {
  Button,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  Modal,
  SelectInput,
  Textarea,
} from "@/components/ui";
import {
  useCreatePriorAuthorization,
  useGetDisciplines,
  usePopulateForm,
  useUpdatePriorAuthorization,
} from "@/hooks";
import { pickValues } from "@/lib";
import {
  priorAuthorizationDefaultValue,
  PriorAuthorizationForm,
  priorAuthorizationSchema,
} from "@/schema";
import { PriorAuthorizationResponse } from "@/types";

const AddPriorAuthorization = ({
  title,
  open,
  modalClose,
  patientInsuranceId,
  mutate,
  selected,
}: {
  title: string;
  open: boolean;
  modalClose: () => void;
  patientInsuranceId?: string;
  mutate: () => void;
  selected?: PriorAuthorizationResponse;
}) => {
  const { data: disciplines } = useGetDisciplines();

  const methods = useForm<PriorAuthorizationForm>({
    resolver: zodResolver(priorAuthorizationSchema),
    defaultValues: priorAuthorizationDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const { data, trigger, isMutating } = useCreatePriorAuthorization();
  const {
    data: updateResponse,
    trigger: updatePriorAuthorization,
    isMutating: isUpdating,
  } = useUpdatePriorAuthorization();

  const closeModal = () => {
    modalClose();
    methods.reset(priorAuthorizationDefaultValue);
  };

  useEffect(() => {
    if (data?.success || updateResponse?.success) {
      if (!selected?.id && data?.success) {
        toast.success("Insurance Authorization created successfully");
      } else {
        toast.success("Insurance Authorization updated successfully");
      }
      closeModal();
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, updateResponse]);

  usePopulateForm<PriorAuthorizationForm, InsurancePriorAuthorization>(
    methods.reset,
    selected,
  );

  return (
    <Modal
      title={title}
      open={open}
      onClose={closeModal}
      className="md:max-w-[600px] sm:max-w-full"
    >
      <Form {...methods}>
        <form
          className="max-h-[75vh] overflow-auto flex flex-col gap-5 scrollbar-hide px-1"
          onSubmit={methods.handleSubmit(async (formData) => {
            if (selected?.id) {
              await updatePriorAuthorization({ ...formData, id: selected?.id });
            } else {
              await trigger(pickValues({ ...formData, patientInsuranceId }));
            }
          })}
        >
          <div className="grid grid-col-1 md:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"disciplineId"}
              render={({ field }) => (
                <FormRender label={"Discipline:"} formClassName="md:col-span-2">
                  <SelectInput
                    options={
                      disciplines?.data?.map((discipline) => ({
                        label: discipline.name,
                        value: discipline.id,
                      })) || []
                    }
                    field={field}
                  />
                </FormRender>
              )}
            />

            <div className="md:col-span-2">
              <p className="text-sm font-medium pb-2">
                Authorization Request Progress
              </p>
              <div className="grid grid-col-1 md:grid-cols-2 gap-5 border border-dashed p-5">
                <FormField
                  control={methods.control}
                  name={"dateRequestSent"}
                  render={({ field }) => (
                    <FormRender label={"Date Request Sent:"}>
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"dateAuthorizationReceived"}
                  render={({ field }) => (
                    <FormRender label={"Date Authorization Received:"}>
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
              </div>
            </div>

            <FormField
              control={methods.control}
              name={"authCode"}
              render={({ field }) => (
                <FormRender label={"Auth. Code:"}>
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"visitAuth"}
              render={({ field }) => (
                <FormRender label={"Visits Auth:"}>
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"effectiveFrom"}
              render={({ field }) => (
                <FormRender label={"Eff From:"}>
                  <DateInput {...field} value={field.value as Date} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"effectiveThrough"}
              render={({ field }) => (
                <FormRender label={"Eff Thru:"}>
                  <DateInput {...field} value={field.value as Date} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"hoursAuth"}
              render={({ field }) => (
                <FormRender label={"Hours Auth:"}>
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"units"}
              render={({ field }) => (
                <FormRender label={"Units:"}>
                  <Input
                    {...field}
                    value={field.value as string}
                    type="number"
                  />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"notes"}
              render={({ field }) => (
                <FormRender label={"Notes:"} formClassName="md:col-span-2">
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          </div>

          <Button
            type="submit"
            loading={isMutating || isUpdating}
            disabled={isMutating || isUpdating}
          >
            Submit
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default AddPriorAuthorization;
