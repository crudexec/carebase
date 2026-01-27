"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { PayerType } from "@prisma/client";
import { useRouter } from "next-nprogress-bar";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import z from "zod";

import {
  Button,
  DialogFooter,
  Form,
  FormField,
  FormRender,
  Modal,
  SelectInput,
} from "@/components/ui";
import {} from "@/hooks";
import { getPayerLabel } from "@/lib";
import { ApiResponse, PatientResponse } from "@/types";

const AdmitPatient = ({
  title,
  open,
  onClose,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
}) => {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        patient: z.string().min(1, {
          message: "Patient is required",
        }),
        payer: z.string().min(1, {
          message: "Payer is required",
        }),
      }),
    ),
    defaultValues: {
      payer: "",
      patient: "",
    },
  });
  const { data: patients } = useSWR<
    ApiResponse<{ patients: PatientResponse[]; totalCount: number }>
  >(`/api/patient?status=REFERRED`);
  const router = useRouter();

  const modalClose = () => {
    form.reset({
      payer: "",
    });
    onClose();
  };

  return (
    <Modal title={title} open={open} onClose={modalClose}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            router.push(`/patient/${data.patient}/admit?payer=${data?.payer}`);
          })}
          className="flex flex-col gap-4 px-1"
        >
          <FormField
            control={form.control}
            name={"patient"}
            render={({ field }) => (
              <FormRender label={"Patients"} required={true}>
                <SelectInput
                  options={
                    patients?.data?.patients.map((item) => ({
                      value: item.id,
                      label: `${item?.firstName ?? ""} ${item?.lastName ?? ""}`,
                    })) ?? []
                  }
                  field={field}
                  placeholder="Select patient from referral intake"
                />
              </FormRender>
            )}
          />{" "}
          <FormField
            control={form.control}
            name={"payer"}
            render={({ field }) => (
              <FormRender label={"Payer"} required={true}>
                <SelectInput
                  options={
                    Object.keys(PayerType).map((item) => ({
                      value: item,
                      label: getPayerLabel(item as PayerType),
                    })) ?? []
                  }
                  field={field}
                  placeholder="Select a payer"
                />
              </FormRender>
            )}
          />{" "}
          <DialogFooter>
            <Button type="button" onClick={modalClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit">Proceed</Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
};

export default AdmitPatient;
