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
import { useAuth } from "@/context/AuthContext";
import {
  useDisclosure,
  useGetDiagnosesAndProcedure,
  useSaveAssessment,
} from "@/hooks";
import { parseData, parseDateString } from "@/lib";
import {
  diagnosisProcedureDefaultValue,
  DiagnosisProcedureForm,
  DiagnosisProcedureSchema,
  HistoryAndDiagnosisForm,
} from "@/schema";

const DiagnosisProcedureModal = ({
  title,
  open,
  modalClose,
  localScopeState,
  patientId,
  assessmentId,
  scope,
  data,
  historyAndDiagnosis,
  callback,
  dateCompleted,
}: {
  title: string;
  open: boolean;
  modalClose: () => void;
  localScopeState?: string;
  patientId: string;
  assessmentId: string;
  scope: "diagnosis" | "procedure";
  data: DiagnosisProcedureForm[];
  historyAndDiagnosis: HistoryAndDiagnosisForm;
  dateCompleted?: Date;
  callback: (assessmentId?: string) => void;
}) => {
  const methods = useForm<DiagnosisProcedureForm>({
    resolver: zodResolver(DiagnosisProcedureSchema),
    defaultValues: diagnosisProcedureDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const { trigger, isMutating, data: response } = useSaveAssessment();
  const { data: diagnoses, mutate: refresh } =
    useGetDiagnosesAndProcedure(scope);
  const { opened, onOpen, onClose } = useDisclosure();

  const closeModal = () => {
    modalClose();
    methods.reset(diagnosisProcedureDefaultValue);
  };

  useEffect(() => {
    if (response?.success && localScopeState === scope) {
      if (response?.success) {
        callback(response?.data?.id);
        toast.success(`${scope} created successfully`);
      }
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response, scope]);

  const { authUser } = useAuth();

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
          refresh();
          onClose();
        }}
        scope={scope}
      />
      <Form {...methods}>
        <form
          className="max-h-[670px] overflow-auto flex flex-col gap-5 scrollbar-hide px-1"
          onSubmit={methods.handleSubmit(async (formData) => {
            if (scope === "diagnosis") {
              await trigger({
                historyAndDiagnosis: {
                  ...historyAndDiagnosis,
                  ...parseData({
                    diagnosis: parseData([
                      ...data,
                      {
                        ...formData,
                        scope,
                        icdCode: diagnoses?.data?.find(
                          (diagnosis) =>
                            diagnosis.id === formData.diagnosisProcedureId,
                        )?.code,
                        icdDescription: diagnoses?.data?.find(
                          (diagnosis) =>
                            diagnosis.id === formData.diagnosisProcedureId,
                        )?.description,
                      },
                    ]),
                  }),
                },
                id: assessmentId,
                caregiverId: authUser?.id as string,
                dateCompleted: parseDateString(dateCompleted),
                patientId,
                source: "NON_OASIS",
              });
            } else {
              await trigger({
                historyAndDiagnosis: {
                  ...historyAndDiagnosis,
                  ...parseData({
                    procedure: parseData([
                      ...data,
                      {
                        ...formData,
                        scope,
                        icdCode: diagnoses?.data?.find(
                          (diagnosis) =>
                            diagnosis.id === formData.diagnosisProcedureId,
                        )?.code,
                        icdDescription: diagnoses?.data?.find(
                          (diagnosis) =>
                            diagnosis.id === formData.diagnosisProcedureId,
                        )?.description,
                      },
                    ]),
                  }),
                },
                id: assessmentId,
                caregiverId: authUser?.id as string,
                dateCompleted: parseDateString(dateCompleted),
                patientId,
                source: "NON_OASIS",
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
                <DateInput {...field} value={field.value as Date} />
              </FormRender>
            )}
          />

          {scope === "diagnosis" && (
            <FormField
              control={methods.control}
              name={"type"}
              render={({ field }) => (
                <FormRender label="Type">
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
          )}

          <Button type="submit" loading={isMutating}>
            Submit
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default DiagnosisProcedureModal;
