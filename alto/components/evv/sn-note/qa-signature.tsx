import { zodResolver } from "@hookform/resolvers/zod";
import { QASignature, User } from "@prisma/client";
import { Pencil2Icon, PlusIcon } from "@radix-ui/react-icons";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import { Signature } from "@/components/signature";
import { StaticImage } from "@/components/static-image";
import {
  Button,
  Form,
  FormField,
  FormRender,
  Modal,
  RadioInput,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useDisclosure, usePopulateForm, useSaveQASignature } from "@/hooks";
import { formatDateTime, modifyDateFields } from "@/lib";
import {
  qaSignatureDefaultValue,
  QASignatureForm,
  qASignatureSchema,
} from "@/schema";

const QaSignatureForm = ({
  caregiver,
  unscheduledVisitId,
  skilledNursingNoteId,
  patientId,
  snNoteType,
  callback,
  data,
  disabled,
}: {
  patientId: string;
  unscheduledVisitId?: string;
  skilledNursingNoteId?: string;
  snNoteType: string;
  callback: (skilledNursingNote?: string) => void;
  caregiver?: User;
  data: QASignature & {
    patientSignatureUrl?: string;
    nurseSignatureUrl?: string;
  };
  disabled?: boolean;
}) => {
  const { authUser } = useAuth();
  const [note, setNote] = useState("");
  const methods = useForm<QASignatureForm>({
    resolver: zodResolver(qASignatureSchema),
    defaultValues: qaSignatureDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { data: response, trigger, isMutating } = useSaveQASignature();
  const [signatureType, setSignatureType] = useState<string>();
  const { opened, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (response?.success) {
      toast.success("QA signature detail saved successfully!");
      callback(response?.data?.skilledNursingNoteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const qASignature = useMemo(() => {
    return modifyDateFields({ ...data } as QASignature);
  }, [data]);

  usePopulateForm<QASignatureForm, QASignature>(
    methods.reset,
    qASignature as QASignature,
  );

  return (
    <Form {...methods}>
      <Modal
        title={"Signature"}
        open={opened}
        onClose={onClose}
        className="md:max-w-[600px]"
      >
        <Signature
          refresh={(res) => {
            callback(res?.skilledNursingNoteId ?? skilledNursingNoteId);
          }}
          onClose={onClose}
          signature={
            (signatureType === "nurse"
              ? data?.nurseSignatureUrl
              : data?.patientSignatureUrl) as string
          }
          mediaId={
            (signatureType === "nurse"
              ? data?.nurseMediaId
              : data?.patientMediaId) as string
          }
          uploadData={{
            unscheduledVisitId,
            patientId,
            caregiverId: caregiver?.id,
            skilledNursingNoteId,
            snNoteType,
            signatureType,
            id: data?.id as string,
          }}
          url="clinical/sn-note/qa-signature/signature"
        />
      </Modal>
      <form
        onSubmit={methods.handleSubmit(async (formData) => {
          await trigger({
            ...formData,
            id: data?.id as string,
            unscheduledVisitId,
            skilledNursingNoteId,
            caregiverId: caregiver?.id,
            patientId,
            snNoteType,
          });
        })}
      >
        <div>
          <div className="flex justify-end text-end mt-2">
            <Button className="px-6" loading={isMutating} disabled={disabled}>
              Save Changes{" "}
            </Button>
          </div>
          <FormHeader className="mt-4">QA Status</FormHeader>

          <FormField
            control={methods.control}
            name={"status"}
            render={({ field }) => {
              return (
                <FormRender>
                  <RadioInput
                    className="flex-row gap-5 items-center"
                    {...field}
                    value={field.value as string}
                    options={[
                      { value: "in-use", label: "In Use" },
                      { value: "completed", label: "Completed" },
                    ]}
                    disabled={disabled}
                  />
                </FormRender>
              );
            }}
          />
        </div>

        <div>
          <FormHeader> Add QA Note</FormHeader>
          <div className="flex flex-col  md:flex-row items-center gap-5">
            <Textarea
              className="flex-1"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={disabled}
            />
            <Button
              type="button"
              className="w-full md:w-fit"
              disabled={!note || disabled}
              onClick={() => {
                methods.setValue(
                  "QANote",
                  [
                    methods.watch("QANote") ?? "",
                    dayjs().format("DD/MM/YYYY hh:mm:ss a"),
                    authUser?.firstName,
                    `${authUser?.lastName}:`,
                    note,
                    "\n \n",
                  ]
                    .filter(Boolean)
                    .join(" "),
                );
                setNote("");
              }}
            >
              Add
            </Button>
          </div>
        </div>

        <div>
          <FormHeader> QA Note</FormHeader>
          <FormField
            control={methods.control}
            name={"QANote"}
            render={({ field }) => {
              return (
                <FormRender>
                  <Textarea
                    className="flex-row gap-5 items-center border border-dashed disabled:!opacity-100"
                    {...field}
                    value={field.value as string}
                    disabled
                    rows={10}
                  />
                </FormRender>
              );
            }}
          />
        </div>

        <div>
          <FormHeader>Signatures</FormHeader>
          {data?.status !== "completed" ? (
            <p className="text-sm ">
              This document is not yet completed. In order to sign this note
              from CareConnect, please set the QA status to Completed and then
              sign the CareConnect visit. If CareConnect visit is ended before
              this note is completed, a separate signature field for this note
              will be made available Note: Patient signatures from CareConnect
              will automatically be shared with this note, even if QA status is
              not yet completed.
            </p>
          ) : (
            <div className="grid grid-col-1 md:grid-cols-2 gap-3 items-start">
              <div>
                <p className="text-sm mb-2 font-semibold"> Patient Signature</p>
                <div className="border border-border px-4 py-6 rounded">
                  {data?.patientSignatureUrl && (
                    <div className="mb-4">
                      <div className="max-h-[300px] flex items-center justify-start rounded-lg border-border">
                        <StaticImage
                          src={data?.patientSignatureUrl}
                          imageClassName={"object-contain"}
                          alt="patient signature"
                          className="h-[100px] w-[100px]"
                        />
                      </div>
                      <p className="text-sm mt-2">
                        Signed Date:{" "}
                        <span className="font-semibold">
                          {formatDateTime(data?.patientSignatureDate as Date)}
                        </span>
                      </p>
                    </div>
                  )}
                  <Button
                    type="button"
                    onClick={() => {
                      setSignatureType("patient");
                      onOpen();
                    }}
                    variant={"secondary"}
                    leftIcon={
                      data?.patientSignatureUrl ? <Pencil2Icon /> : <PlusIcon />
                    }
                  >
                    {data?.patientSignatureUrl ? "Update" : "Add"}
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm mb-2 font-semibold"> Nurse Signature</p>
                <div className="border border-border px-4 py-6 rounded">
                  {data?.nurseSignatureUrl && (
                    <div className="mb-4">
                      <div className="max-h-[300px] flex items-center justify-start rounded-lg border-border">
                        <StaticImage
                          src={data?.nurseSignatureUrl}
                          imageClassName={"object-contain"}
                          alt="nurse-signature"
                          className="h-[100px] w-[100px]"
                        />
                      </div>
                      <p className="text-sm mt-2">
                        Signed Date:{" "}
                        <span className="font-semibold">
                          {formatDateTime(data?.nurseSignatureDate as Date)}
                        </span>
                      </p>
                    </div>
                  )}
                  <Button
                    type="button"
                    onClick={() => {
                      setSignatureType("nurse");
                      onOpen();
                    }}
                    leftIcon={
                      data?.nurseSignatureUrl ? <Pencil2Icon /> : <PlusIcon />
                    }
                    variant={"secondary"}
                  >
                    {data?.nurseSignatureUrl ? "Update" : "Add"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end text-end my-2">
          <Button className="px-6" loading={isMutating} disabled={disabled}>
            Save Changes{" "}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QaSignatureForm;
