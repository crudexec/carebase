import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import CreateDiagnosisProcedure from "@/components/modal/diagnosis-procedure";
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
  useDisclosure,
  useGetDiagnosesAndProcedure,
  usePopulateForm,
} from "@/hooks";
import {
  CreateDiagnosisProcedurePayload,
  diagnosisProcedureDefaultValue,
  DiagnosisProcedureForm,
  DiagnosisProcedureSchema,
} from "@/schema";
import { ObjectData } from "@/types";

const DiagnosisProcedureModal = ({
  title,
  open,
  modalClose,
  refresh,
  selected,
  patientId,
  caregiverId,
  disabled,
  callback,
  scope,
  createCallback,
  updateCallback,
  createResponse,
  updateResponse,
  isMutating,
  parentId,
  localScopeState,
}: {
  title: string;
  open: boolean;
  modalClose: () => void;
  refresh: () => void;
  selected?: ObjectData;
  patientId?: string;
  caregiverId?: string;
  disabled: boolean;
  callback: (planOfCare?: string) => void;
  scope: "procedure" | "diagnosis";
  createCallback: (data: CreateDiagnosisProcedurePayload) => Promise<void>;
  updateCallback: (data: CreateDiagnosisProcedurePayload) => Promise<void>;
  createResponse: ObjectData;
  updateResponse: ObjectData;
  isMutating: boolean;
  parentId: string;
  localScopeState?: string;
}) => {
  const methods = useForm<DiagnosisProcedureForm>({
    resolver: zodResolver(DiagnosisProcedureSchema),
    defaultValues: diagnosisProcedureDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const { data: diagnoses, mutate } = useGetDiagnosesAndProcedure(scope);
  const { opened, onOpen, onClose } = useDisclosure();

  const closeModal = () => {
    modalClose();
    methods.reset(diagnosisProcedureDefaultValue);
  };

  useEffect(() => {
    if (
      (createResponse?.success || updateResponse?.success) &&
      localScopeState === scope
    ) {
      if (!selected?.id && createResponse?.success) {
        callback(createResponse?.data?.id);
        toast.success(`${scope} created successfully`);
      } else {
        toast.success(`${scope} updated successfully`);
      }
      closeModal();
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createResponse, updateResponse, scope]);

  usePopulateForm<DiagnosisProcedureForm, DiagnosisProcedureForm>(
    methods.reset,
    selected,
  );

  return (
    <Modal
      title={title}
      open={open}
      onClose={() => {
        closeModal();
      }}
      // className="xl:max-w-[30%]"
    >
      <CreateDiagnosisProcedure
        title={scope === "procedure" ? "Create Procedure" : "Create Diagnosis"}
        open={opened}
        modalClose={() => {
          mutate();
          onClose();
        }}
        scope={scope}
      />
      <Form {...methods}>
        <form
          className="max-h-[670px] overflow-auto flex flex-col gap-5 scrollbar-hide px-1"
          onSubmit={methods.handleSubmit(async (formData) => {
            if (selected?.id) {
              await updateCallback({ ...formData, id: selected?.id, scope });
            } else {
              await createCallback({
                ...formData,
                patientId,
                caregiverId,
                scope,
                parentId,
              });
            }
          })}
        >
          <FormField
            control={methods.control}
            name={"diagnosisProcedureId"}
            render={({ field }) => (
              <FormRender
                label={scope == "diagnosis" ? "Diagnosis" : "Procedure"}
              >
                <SelectInput
                  disabled={disabled}
                  options={[
                    {
                      label: "Code -  Description - Warning",
                      value: "code-description-warning",
                      disabled: true,
                    },
                    ...(diagnoses?.data?.map((diagnosis) => ({
                      label: `${diagnosis.code ?? ""} - ${diagnosis.description ?? ""} - ${diagnosis.warning ?? ""}`,
                      value: diagnosis.id,
                    })) || []),
                    {
                      value: "create-new",
                      label: `+ Create new ${scope}`,
                    },
                  ]}
                  field={{
                    ...field,
                    onChange: (value) => {
                      if (value === "create-new") {
                        onOpen();
                        field.onChange("");
                      } else {
                        field.onChange(value);
                      }
                    },
                  }}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"date"}
            render={({ field }) => (
              <FormRender label={"Effective Date"}>
                <DateInput
                  {...field}
                  value={field.value as Date}
                  disabled={disabled}
                />
              </FormRender>
            )}
          />

          {scope === "diagnosis" && (
            <FormField
              control={methods.control}
              name={"type"}
              render={({ field }) => (
                <FormRender label="Type">
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />
          )}
          {!disabled && (
            <Button type="submit" loading={isMutating}>
              Submit
            </Button>
          )}
        </form>
      </Form>
    </Modal>
  );
};

export default DiagnosisProcedureModal;
