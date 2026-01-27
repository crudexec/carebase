import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import {
  Button,
  Checkbox,
  DateInput,
  Form,
  FormField,
  FormRender,
  Modal,
  SelectInput,
} from "@/components/ui";
import { dischargeReasons, otherDischargeReasons } from "@/constants";
import { UpdateStatusPayload } from "@/hooks";

const DischargePatient = ({
  open,
  modalClose,
  trigger,
  selected,
  loading,
}: {
  open: boolean;
  modalClose: () => void;
  trigger: (data: UpdateStatusPayload) => Promise<void>;
  selected: string[];
  loading: boolean;
}) => {
  const methods = useForm({
    resolver: zodResolver(
      z.object({
        date: z.date(),
        reason: z.string().min(1, {
          message: "Reason is required",
        }),
        otherReason: z.string().optional(),
      }),
    ),
    defaultValues: {
      date: new Date(),
      reason: "",
      otherReason: "",
      confirmDischarge: false,
    },
    mode: "onChange",
    shouldUnregister: false,
  });

  const closeModal = () => {
    methods.reset();
    modalClose();
  };

  return (
    <Modal title={"Discharge Patient"} open={open} onClose={closeModal}>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(async (formData) => {
            await trigger({
              ...formData,
              status: "discharged",
              patients: selected,
            });
            closeModal();
          })}
          className="flex flex-col gap-4 px-1"
        >
          <FormField
            control={methods.control}
            name={"date"}
            render={({ field }) => (
              <FormRender label={"Date"} required={true}>
                <DateInput {...field} value={field.value as Date} />
              </FormRender>
            )}
          />{" "}
          <FormField
            control={methods.control}
            name={"reason"}
            render={({ field }) => (
              <FormRender label={"Reason"} required={true}>
                <SelectInput
                  options={dischargeReasons}
                  field={field}
                  placeholder="Select a reason"
                />
              </FormRender>
            )}
          />{" "}
          <FormField
            control={methods.control}
            name={"otherReason"}
            render={({ field }) => (
              <FormRender label={"Other Reason"}>
                <SelectInput
                  options={otherDischargeReasons}
                  field={field}
                  placeholder="Select a payer"
                />
              </FormRender>
            )}
          />{" "}
          <FormField
            control={methods.control}
            name={"confirmDischarge"}
            render={({ field }) => (
              <FormRender formClassName="self-start">
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">Confirm Patient Discharge</span>
                </div>
              </FormRender>
            )}
          />
          <Button
            type="submit"
            className="md:mx-2 mt-6 py-2 text-white"
            loading={loading}
            disabled={!methods.watch("confirmDischarge")}
          >
            Discharge
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default DischargePatient;
