import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";

import Detail from "@/components/detail";
import FormHeader from "@/components/form-header";
import {
  Button,
  DateTimeInput,
  Form,
  FormField,
  FormRender,
  Input,
  Modal,
  RadioInput,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { useGetUsers } from "@/hooks";
import {
  missedVisitNoteDefaultValue,
  MissedVisitNoteForm,
  missedVisitNoteSchema,
} from "@/schema";

const MissedVisitNoteModal = ({
  title,
  open,
  modalClose,
}: {
  title: string;
  open: boolean;
  modalClose: () => void;
}) => {
  const { data: caregivers, isLoading } = useGetUsers({ tab: "caregiver" });
  const methods = useForm<MissedVisitNoteForm>({
    resolver: zodResolver(missedVisitNoteSchema),
    defaultValues: missedVisitNoteDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  return (
    <Modal
      title={title}
      open={open}
      onClose={modalClose}
      className="md:max-w-[750px]"
    >
      <Form {...methods}>
        <form className="h-[75vh] overflow-auto flex flex-col gap-5 scrollbar-hide px-1">
          <div>
            <p className="text-2xl font-semibold pb-2">Doe John</p>
            <div className="bg-secondary border grid grid-col-1 p-2 gap-3">
              <Detail title="PAN" detail={"12345667"} />
              <Detail title="Admit Date" detail={"05/11/2024"} />
            </div>
          </div>

          <div>
            <FormHeader className="mt-4">Visit Information</FormHeader>

            <div className="grid grid-col-1 md:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"caregiver"}
                render={({ field }) => (
                  <FormRender label={"Caregiver"}>
                    <SelectInput
                      options={
                        caregivers?.data?.users?.map((caregiver) => ({
                          label: `${caregiver.firstName} ${caregiver.lastName}`,
                          value: caregiver.id,
                        })) || []
                      }
                      field={field}
                      loading={isLoading}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"scheduledVisit"}
                render={({ field }) => (
                  <FormRender label={"Scheduled Visit"}>
                    <DateTimeInput {...field} value={field.value as Date} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"startTime"}
                render={({ field }) => (
                  <FormRender label={"Start Time"}>
                    <DateTimeInput {...field} value={field.value as Date} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"endTime"}
                render={({ field }) => (
                  <FormRender label={"End Time"}>
                    <DateTimeInput {...field} value={field.value as Date} />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <FormHeader> Type of Visit</FormHeader>

            <div className="grid grid-col-1 gap-5">
              <FormField
                control={methods.control}
                name={"visitType"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="grid md:grid-cols-3 gap-5 items-center"
                      {...field}
                      options={[
                        { value: "skilled-nursing", label: "Skilled Nursing" },
                        {
                          value: "medical-social-service",
                          label: "Medical Social Services",
                        },
                        {
                          value: "occupational-therapy",
                          label: "Occupational Therapy",
                        },
                        {
                          value: "home-health-aide",
                          label: "Home Health Aide",
                        },
                        {
                          value: "physical-therapy",
                          label: "Physical Therapy",
                        },
                        { value: "speech-therapy", label: "Speech Therapy" },
                        { value: "other", label: "Other" },
                      ]}
                    />
                  </FormRender>
                )}
              />

              {methods.watch("visitType") === "other" && (
                <FormField
                  control={methods.control}
                  name={`otherVisitType`}
                  render={({ field }) => (
                    <FormRender>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              )}
            </div>
          </div>

          <div>
            <FormHeader> Reason for Missed Visit</FormHeader>

            <div className="grid grid-col-1 md:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"reasonType"}
                render={({ field }) => (
                  <FormRender label={"Reason Type"}>
                    <SelectInput options={[]} field={field} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={`reasonTypeComment`}
                render={({ field }) => (
                  <FormRender label={"Comment"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <FormHeader> Physician Notified</FormHeader>

            <div className="grid grid-col-1 gap-5">
              <FormField
                control={methods.control}
                name={"physicianNotified"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-5 items-center"
                      {...field}
                      options={[
                        { value: "phone", label: "Phone" },
                        { value: "fax", label: "Fax" },
                        { value: "mail", label: "Mail" },
                        { value: "email", label: "Email" },
                        { value: "not-notified", label: "Not Notified" },
                      ]}
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"physicianNotifiedDate"}
                render={({ field }) => (
                  <FormRender label={"Date and Time Notified"}>
                    <DateTimeInput {...field} value={field.value as Date} />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <FormHeader> Case Manager Notified</FormHeader>

            <div className="grid grid-col-1 gap-5">
              <FormField
                control={methods.control}
                name={"caseManagerNotified"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-5 items-center"
                      {...field}
                      options={[
                        { value: "phone", label: "Phone" },
                        { value: "fax", label: "Fax" },
                        { value: "mail", label: "Mail" },
                        { value: "email", label: "Email" },
                        { value: "not-notified", label: "Not Notified" },
                      ]}
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"caseManagerNotifiedDate"}
                render={({ field }) => (
                  <FormRender label={"Date and Time Notified"}>
                    <DateTimeInput {...field} value={field.value as Date} />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <FormHeader> Additional Comments</FormHeader>

            <div>
              <FormField
                control={methods.control}
                name={`additionalComments`}
                render={({ field }) => (
                  <FormRender>
                    <Textarea {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <Button>Submit</Button>
        </form>
      </Form>
    </Modal>
  );
};

export default MissedVisitNoteModal;
