import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

import {
  Button,
  Form,
  FormField,
  FormRender,
  Input,
  Modal,
} from "@/components/ui";
import { useCreateDiagnosisProcedure } from "@/hooks/request/misc";
import { pickValues } from "@/lib";

const CreateDiagnosisProcedure = ({
  open,
  modalClose,
  title,
  scope,
}: {
  open: boolean;
  modalClose: () => void;
  title: string;
  scope: "diagnosis" | "procedure";
}) => {
  const { data, trigger, isMutating } = useCreateDiagnosisProcedure();

  const methods = useForm({
    resolver: zodResolver(
      z.object({
        code: z.string().min(1, "Code is required"),
        description: z.string().nullish(),
        warning: z.string().nullish(),
      }),
    ),
    defaultValues: { code: "", description: "", warning: "" },
    mode: "onChange",
    shouldUnregister: false,
  });

  useEffect(() => {
    if (data?.success) {
      methods.reset();
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
        modalClose();
      }}
    >
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(async (formData) => {
            await trigger(pickValues({ ...formData, scope }));
          })}
          className="flex flex-col gap-4 px-1"
        >
          <FormField
            control={methods.control}
            name={"code"}
            render={({ field }) => (
              <FormRender label="Code">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"description"}
            render={({ field }) => (
              <FormRender label="Description">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"warning"}
            render={({ field }) => (
              <FormRender label="Warning">
                <Input {...field} value={field.value as string} />
              </FormRender>
            )}
          />
          <Button
            type="submit"
            className="mt-6 py-2 text-white"
            loading={isMutating}
          >
            Submit
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default CreateDiagnosisProcedure;
