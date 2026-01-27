import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useSWRMutation from "swr/mutation";

import {
  Button,
  DialogFooter,
  Form,
  FormField,
  FormRender,
  Input,
  Modal,
} from "@/components/ui";
import { useCreateUser, usePopulateForm, useUpdateUser } from "@/hooks";
import { pickValues } from "@/lib";
import {
  createUserFormSchema,
  userDefaultValues,
  UserForm,
} from "@/schema/user";

const CreateUserModal = ({
  title,
  open,
  refreshTable,
  onClose,
  mode,
  selected,
  role,
}: {
  title: string;
  open: boolean;
  refreshTable: () => void;
  onClose: () => void;
  mode: "create" | "edit" | "view";
  selected?: User;
  role?: string;
}) => {
  const form = useForm<UserForm>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: userDefaultValues,
  });
  const { data, trigger, isMutating } = useSWRMutation(
    "/api/user",
    useCreateUser,
  );
  const {
    data: updateResponse,
    trigger: updateUser,
    isMutating: isUpdating,
  } = useSWRMutation("/api/user", useUpdateUser);
  usePopulateForm<UserForm, User>(form.reset, selected);

  const modalClose = () => {
    form.reset(userDefaultValues);
    onClose();
  };

  useEffect(() => {
    if (data?.success || updateResponse?.success) {
      refreshTable();
      if (mode === "create") {
        toast.success(`Success|${data?.message}`);
      } else {
        toast.success(`Success|${updateResponse?.message}`);
      }
      modalClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, updateResponse]);

  return (
    <Modal title={title} open={open} onClose={modalClose}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            if (mode === "create") {
              await trigger(pickValues({ ...data, role }));
            } else {
              await updateUser({ ...data, id: selected?.id as string });
            }
          })}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name={"firstName"}
            render={({ field }) => (
              <FormRender label={"First Name"} required={true}>
                <Input
                  {...field}
                  disabled={mode === "view"}
                  placeholder="Enter first name"
                />
              </FormRender>
            )}
          />
          <FormField
            control={form.control}
            name={"lastName"}
            render={({ field }) => (
              <FormRender label={"Last Name"} required={true}>
                <Input
                  {...field}
                  disabled={mode === "view"}
                  placeholder="Enter last name"
                />
              </FormRender>
            )}
          />
          <FormField
            control={form.control}
            name={"email"}
            render={({ field }) => (
              <FormRender label={"Email"} required={true}>
                <Input
                  {...field}
                  disabled={mode === "view"}
                  placeholder="Enter email"
                />
              </FormRender>
            )}
          />
          {mode !== "view" && (
            <DialogFooter>
              <Button type="button" onClick={modalClose} variant="outline">
                Cancel
              </Button>
              <Button type="submit" loading={isMutating || isUpdating}>
                Submit
              </Button>
            </DialogFooter>
          )}
        </form>
      </Form>
    </Modal>
  );
};

export default CreateUserModal;
