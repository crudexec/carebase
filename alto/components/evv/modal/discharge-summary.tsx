import { zodResolver } from "@hookform/resolvers/zod";
import { DischargeSummary, DischargeSummaryType } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Detail from "@/components/detail";
import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  Modal,
  RadioInput,
  SegmentedControl,
  TabsContent,
  Textarea,
} from "@/components/ui";
import { otherDischargeReasons } from "@/constants/patient";
import { usePopulateForm, useSaveDischargeSummary } from "@/hooks";
import { formatDate, getFullName } from "@/lib";
import {
  dischargeSummaryDefaultValue,
  DischargeSummaryForm,
  dischargeSummarySchema,
} from "@/schema/evv/discharge-summary";
import { PatientResponse } from "@/types";

import SummarySignature from "./summary-signature";

const DischargeSummaryModal = ({
  type,
  open,
  modalClose,
  refresh,
  dischargeSummaryData,
  patient,
  dischargeDate,
}: {
  type?: DischargeSummaryType;
  open: boolean;
  modalClose: () => void;
  refresh: () => void;
  dischargeSummaryData?: DischargeSummary;
  patient?: PatientResponse;
  dischargeDate: Date;
}) => {
  const [formTab, setFormTab] = useState("sent-to-physician");
  const methods = useForm<DischargeSummaryForm>({
    resolver: zodResolver(dischargeSummarySchema),
    defaultValues: dischargeSummaryDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { data: saveResponse, trigger, isMutating } = useSaveDischargeSummary();
  const [mediaId, setMediaId] = useState<string | undefined>(undefined);
  usePopulateForm<DischargeSummaryForm, DischargeSummary>(
    methods.reset,
    dischargeSummaryData as DischargeSummary,
  );

  const onClose = () => {
    methods?.reset(dischargeSummaryDefaultValue);
    modalClose();
  };

  useEffect(() => {
    if (saveResponse?.success) {
      toast.success("Discharge Summary saved successfully");
      refresh();
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveResponse]);

  return (
    <Modal
      title={`${type} Discharge Summary`}
      open={open}
      onClose={onClose}
      className="md:max-w-[750px]"
    >
      <Form {...methods}>
        <form
          className="flex flex-col gap-4 h-[75vh] overflow-auto scrollbar-hide"
          onSubmit={methods.handleSubmit(async (formData) => {
            await trigger({
              ...formData,
              type: type,
              patientId: patient?.id,
              id: dischargeSummaryData?.id,
              mediaId: mediaId,
            });
          })}
        >
          <div>
            <div className="bg-secondary flex flex-col border gap-2 p-2">
              <Detail
                title="Patient Name"
                detail={getFullName(patient?.firstName, patient?.lastName)}
              />
              <Detail title="PAN" detail={patient?.pan} />
              <Detail
                title="Admit Date"
                detail={
                  patient?.patientAdmission[0]?.createdAt
                    ? formatDate(patient?.patientAdmission[0]?.createdAt)
                    : ""
                }
              />
              <Detail
                title={`${type} Discharge Date`}
                detail={formatDate(dischargeDate)}
              />
            </div>
          </div>

          <div>
            <FormHeader className="mt-4">Reason for Discharge</FormHeader>

            <div>
              <FormField
                control={methods.control}
                name={"dischargeReason"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 items-center"
                      {...field}
                      options={otherDischargeReasons}
                    />
                  </FormRender>
                )}
              />
              {methods.watch("dischargeReason") === "other" && (
                <FormField
                  control={methods.control}
                  name={`otherReason`}
                  render={({ field }) => (
                    <FormRender label="Specify Reason" formClassName="mt-4">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              )}
            </div>
          </div>

          <div className="mb-3">
            <FormHeader> Care Summary</FormHeader>
            <div>
              <FormField
                control={methods.control}
                name={`careSummary`}
                render={({ field }) => (
                  <FormRender>
                    <Textarea {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <SegmentedControl
            data={[
              { value: "sent-to-physician", label: "Sent to Physician" },
              { value: "electronic-signature", label: "Electronic Signature" },
            ]}
            value={formTab}
            stretch
            onChange={setFormTab}
          >
            <div className="border p-4 rounded flex flex-col gap-5">
              <TabsContent value="sent-to-physician">
                <div className="grid grid-col-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"summaryDateSent"}
                    render={({ field }) => (
                      <FormRender label={"Date Sent to Physician"}>
                        <DateInput
                          {...field}
                          value={field.value as Date}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"sentVia"}
                    render={({ field }) => (
                      <FormRender label="Sent Via">
                        <RadioInput
                          className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 items-center"
                          {...field}
                          options={[
                            { value: "fax", label: "Fax" },
                            { value: "mail", label: "Mail" },
                          ]}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </TabsContent>
              <TabsContent value="electronic-signature">
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="font-semibold text-lg mb-3">Signature Type</p>
                    <FormField
                      control={methods.control}
                      name={"signatureType"}
                      render={({ field }) => (
                        <FormRender>
                          <RadioInput
                            className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 items-center"
                            {...field}
                            options={[
                              {
                                value: "digital-signature",
                                label: "Digital Signature",
                              },
                              {
                                value: "actual-signature",
                                label: "Actual Signature",
                              },
                            ]}
                          />
                        </FormRender>
                      )}
                    />
                  </div>

                  {methods.watch("signatureType") === "digital-signature" && (
                    <FormField
                      control={methods.control}
                      name={"digitalSignatureChecked"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              By checking this box, I, IDRIS JOHNSON ,digitally
                              sign this document. I also affirm this document
                              was prepared by me and the information is true and
                              correct to the best of my knowledge.
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                  )}
                  {methods.watch("signatureType") === "actual-signature" && (
                    <SummarySignature
                      setMediaId={setMediaId}
                      summaryData={dischargeSummaryData}
                      refresh={refresh}
                    />
                  )}

                  {/* <div className="flex justify-end">
                    <FormField
                      control={methods.control}
                      name={'signatureDate'}
                      render={({ field }) => (
                        <FormRender>
                          <DateInput {...field} value={field.value as Date} />
                        </FormRender>
                      )}
                    />
                  </div> */}
                </div>
              </TabsContent>
            </div>
          </SegmentedControl>

          <Button loading={isMutating} disabled={isMutating}>
            Submit
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default DischargeSummaryModal;
