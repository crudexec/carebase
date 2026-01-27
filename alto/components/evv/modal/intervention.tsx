import { zodResolver } from "@hookform/resolvers/zod";
import { NoteIntervention, User } from "@prisma/client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import {
  Button,
  DateInput,
  Form,
  FormField,
  FormRender,
  Modal,
  RadioInput,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { bodySystemOptions } from "@/constants";
import { useCreateIntervention, usePopulateForm } from "@/hooks";
import {
  interventionDefaultValue,
  InterventionForm,
  noteInterventionSchema,
} from "@/schema";

const AddInterventionSummary = ({
  title,
  open,
  selected,
  modalClose,
  refresh,
  unscheduledVisitId,
  patientId,
  skilledNursingNoteId,
  snNoteType,
  caregiver,
}: {
  title: string;
  open: boolean;
  modalClose: () => void;
  selected: NoteIntervention;
  refresh: (skilledNursingNote?: string) => void;
  unscheduledVisitId?: string;
  skilledNursingNoteId?: string;
  snNoteType: string;
  patientId?: string;
  caregiver?: User;
}) => {
  const methods = useForm<InterventionForm>({
    resolver: zodResolver(noteInterventionSchema),
    defaultValues: interventionDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const { data, trigger, isMutating } = useCreateIntervention();

  const closeModal = () => {
    methods.reset(interventionDefaultValue);
    modalClose();
  };

  useEffect(() => {
    if (data?.success) {
      if (!selected?.id && data?.success) {
        toast.success("Intervention created successfully");
      } else if (data?.success) {
        toast.success("Intervention updated successfully");
      }
      refresh(data?.data?.skilledNursingNoteId);
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  usePopulateForm<InterventionForm, NoteIntervention>(methods.reset, selected);

  return (
    <Modal
      title={title}
      open={open}
      onClose={closeModal}
      className="md:max-w-[650px] sm:max-w-full"
    >
      <Form {...methods}>
        <form
          className="max-h-[75vh] overflow-auto flex flex-col gap-5 scrollbar-hide px-1"
          onSubmit={methods.handleSubmit(async (formData) => {
            await trigger({
              ...formData,
              id: selected?.id,
              unscheduledVisitId,
              skilledNursingNoteId,
              caregiverId: caregiver?.id,
              patientId,
              snNoteType,
            });
          })}
        >
          <div className="grid grid-col-1 md:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"bodySystem"}
              render={({ field }) => (
                <FormRender label={"Section/Body System"}>
                  <SelectInput options={bodySystemOptions} field={field} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"effectiveDate"}
              render={({ field }) => (
                <FormRender label={"Effective Date"}>
                  <DateInput {...field} value={field.value as Date} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"interventions"}
              render={({ field }) => (
                <FormRender label={"Interventions (Performed):"}>
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"patientResponse"}
              render={({ field }) => (
                <FormRender label={"Patient/Caregiver Response:"}>
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"orders"}
              render={({ field }) => (
                <FormRender label={"Orders:"}>
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"goals"}
              render={({ field }) => (
                <FormRender label={"Goals:"}>
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"goalMet"}
              render={({ field }) => {
                return (
                  <FormRender formClassName="md:col-span-2">
                    <RadioInput
                      className="flex-row flex-wrap w-full gap-5 items-center"
                      {...field}
                      value={field.value as string}
                      options={[
                        { value: "goal-met", label: "Goals Met" },
                        {
                          value: "goal-not-met",
                          label: "Ongoing/Goals not met",
                        },
                        { value: "discontinued", label: "Discontinued" },
                      ]}
                    />
                  </FormRender>
                );
              }}
            />

            <FormField
              control={methods.control}
              name={"goalMetDate"}
              render={({ field }) => (
                <FormRender
                  label={"Goals Met/Ended Date"}
                  formClassName="md:col-span-2"
                >
                  <DateInput
                    {...field}
                    value={field.value as Date}
                    disabled={
                      methods.watch("goalMet") !== "goal-met" &&
                      methods.watch("goalMet") !== "discontinued"
                    }
                  />
                </FormRender>
              )}
            />
          </div>
          <Button type="submit" loading={isMutating} disabled={isMutating}>
            Submit
          </Button>{" "}
        </form>
      </Form>
    </Modal>
  );
};

export default AddInterventionSummary;
