"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
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
import { useDisclosure, usePopulateForm, useSavePlanOfCare } from "@/hooks";
import { formatDateTime, modifyDateFields } from "@/lib";
import {
  planOfCareDefaultValue,
  PlanOfCareForm,
  planOfCareSchema,
} from "@/schema";
import { PlanOfCareResponse } from "@/types";

const QaSignature = ({
  caregiver,
  patientId,
  callback,
  data,
  disabled,
  isCert485,
}: {
  patientId: string;
  callback: (planOfCare?: string) => void;
  caregiver?: User;
  data: PlanOfCareResponse & { nurseSignatureUrl?: string };
  disabled?: boolean;
  isCert485?: boolean;
}) => {
  const { authUser } = useAuth();
  const [note, setNote] = useState("");
  const methods = useForm<PlanOfCareForm>({
    resolver: zodResolver(planOfCareSchema),
    defaultValues: planOfCareDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { data: response, trigger, isMutating } = useSavePlanOfCare();
  const { opened, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (response?.success) {
      toast.success("QA signature detail saved successfully!");
      callback(response?.data?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const planOfCare = useMemo(() => {
    return modifyDateFields({ ...data } as PlanOfCareResponse);
  }, [data]);

  usePopulateForm<PlanOfCareForm, PlanOfCareResponse>(
    methods.reset,
    planOfCare,
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
            callback(res?.planOfCareId ?? data?.id);
          }}
          onClose={onClose}
          signature={data?.nurseSignatureUrl as string}
          mediaId={data?.nurseMediaId as string}
          uploadData={{
            patientId,
            caregiverId: caregiver?.id,
            id: data?.id as string,
            isCert485,
          }}
          url="clinical/poc"
        />
      </Modal>
      <form
        onSubmit={methods.handleSubmit(async (formData) => {
          await trigger({
            ...formData,
            id: data?.id as string,
            caregiverId: caregiver?.id,
            patientId,
            isCert485,
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
            name={"qAstatus"}
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

          <div className="grid grid-col-1 md:grid-cols-2 gap-3 items-start">
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

export { QaSignature };
