"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button, Form, Modal } from "@/components/ui";
import { useCreatePhysician } from "@/hooks";
import { pickValues } from "@/lib";
import {
  patientDefaultValue,
  PatientForm,
  patientFormSchema,
  PhysicianForm,
} from "@/schema";

import PhysicianInformation from "../physician";

const CreatePhysician = ({
  mode,
  open,
  modalClose,
  title,
}: {
  mode: "create" | "edit" | "view";
  open: boolean;
  modalClose: () => void;
  title: string;
}) => {
  const { data, trigger, isMutating } = useCreatePhysician();

  const methods = useForm<PatientForm>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: patientDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  useEffect(() => {
    if (data?.success) {
      methods.resetField("physician");
      modalClose();
      toast.success(`Success|${data?.message}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Modal
      title={title}
      open={open}
      onClose={() => {
        methods.resetField("physician");
        modalClose();
      }}
      className="md:max-w-[700px]"
    >
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(async (formData) => {
            await trigger(pickValues(formData.physician as PhysicianForm));
          })}
          className="flex flex-col gap-4 px-1"
        >
          <PhysicianInformation methods={methods} mode={mode} />
          <Button
            type="submit"
            className="md:mx-2 mt-6 py-2 text-white"
            loading={isMutating}
          >
            Submit
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default CreatePhysician;
