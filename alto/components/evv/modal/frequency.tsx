import { zodResolver } from "@hookform/resolvers/zod";
import { PatientFrequency } from "@prisma/client";
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
} from "@/components/ui";
import {
  useCreateFrequency,
  useGetDisciplines,
  usePopulateForm,
  useUpdateFrequency,
} from "@/hooks";
import {
  frequencyDefaultValue,
  FrequencyForm,
  frequencySchema,
} from "@/schema";
import { PatientFrequencyResponse } from "@/types";

const FrequencyModal = ({
  title,
  open,
  modalClose,
  refresh,
  selected,
  patientId,
}: {
  title: string;
  open: boolean;
  modalClose: () => void;
  refresh: () => void;
  selected?: PatientFrequencyResponse;
  patientId?: string;
}) => {
  const methods = useForm<FrequencyForm>({
    resolver: zodResolver(frequencySchema),
    defaultValues: frequencyDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const { data, trigger } = useCreateFrequency();
  const { data: updateResponse, trigger: updateFrequency } =
    useUpdateFrequency();
  const { data: disciplines } = useGetDisciplines();

  const closeModal = () => {
    modalClose();
    methods.reset(frequencyDefaultValue);
  };

  useEffect(() => {
    if (data?.success || updateResponse?.success) {
      if (!selected?.id && data?.success) {
        toast.success("Frequency created successfully");
      } else {
        toast.success("Frequency updated successfully");
      }
      closeModal();
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, updateResponse]);

  usePopulateForm<FrequencyForm, PatientFrequency>(methods.reset, selected);

  return (
    <Modal
      title={title}
      open={open}
      onClose={() => {
        closeModal();
      }}
      className="lg:max-w-[30%]"
    >
      <Form {...methods}>
        <form
          className="overflow-auto flex flex-col gap-5 scrollbar-hide px-1"
          onSubmit={methods.handleSubmit(async (formData) => {
            if (selected?.id) {
              await updateFrequency({ ...formData, id: selected?.id });
            } else {
              await trigger({ ...formData, patientId });
            }
          })}
        >
          <FormField
            control={methods.control}
            name={"disciplineId"}
            render={({ field }) => (
              <FormRender label={"Discipline"}>
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
          <FormField
            control={methods.control}
            name={"visit"}
            render={({ field }) => (
              <FormRender label={"Visits"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />

          <FormField
            control={methods.control}
            name={"perDay"}
            render={({ field }) => (
              <FormRender label={"Per # Days"}>
                <Input {...field} value={field.value as string} type="number" />
              </FormRender>
            )}
          />

          <FormField
            control={methods.control}
            name={"effectiveFrom"}
            render={({ field }) => (
              <FormRender label={"Effective From"}>
                <DateInput {...field} value={field.value as Date} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"effectiveThrough"}
            render={({ field }) => (
              <FormRender label={"Effective Thru"}>
                <DateInput {...field} value={field.value as Date} />
              </FormRender>
            )}
          />

          <FormField
            control={methods.control}
            name={"comment"}
            render={({ field }) => (
              <FormRender label={"Comment"}>
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </Modal>
  );
};

export default FrequencyModal;
