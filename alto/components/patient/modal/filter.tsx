import { zodResolver } from "@hookform/resolvers/zod";
import { PayerType } from "@prisma/client";
import { useRouter } from "next-nprogress-bar";
import { useForm } from "react-hook-form";
import z from "zod";

import {
  Button,
  DateRangePicker,
  DialogFooter,
  Form,
  FormField,
  FormRender,
  Modal,
  SelectInput,
} from "@/components/ui";
import { createReqQuery, getPayerLabel } from "@/lib";
import { SearchParamsType } from "@/schema";

const PatientFilter = ({
  title,
  open,
  onClose,
  search,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  search: SearchParamsType;
}) => {
  const router = useRouter();

  const methods = useForm({
    resolver: zodResolver(
      z.object({
        activityDate: z.array(z.date().optional()).optional(),
        payer: z.string().optional(),
      }),
    ),
    defaultValues: { activityDate: [], payer: "" },
  });

  const modalClose = () => {
    methods.reset({
      payer: "",
      activityDate: [],
    });
    onClose();
  };

  return (
    <Modal title={title} open={open} onClose={modalClose}>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(async (data) => {
            router.push(
              `/patient?payer=${data.payer}${data.activityDate[0] ? `&startDate=${data.activityDate[0]}` : ""}${data.activityDate[1] ? `&endDate=${data.activityDate[1]}` : ""}&${createReqQuery(search)}`,
              { scroll: false },
            );
            modalClose();
          })}
          className="flex flex-col gap-4 px-1"
        >
          <FormField
            control={methods.control}
            name={"activityDate"}
            render={({ field }) => (
              <FormRender label={"Activity Date"}>
                <DateRangePicker
                  onChange={field.onChange}
                  value={field.value as Date[]}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"payer"}
            render={({ field }) => (
              <FormRender label={"Payer"}>
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
          />
          <DialogFooter>
            <Button type="button" onClick={modalClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit">Filter</Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
};

export default PatientFilter;
