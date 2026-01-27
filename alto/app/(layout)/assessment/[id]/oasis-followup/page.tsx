"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import AppLoader from "@/components/app-loader";
import { SNNoteHeader } from "@/components/evv";
import FormHeader from "@/components/form-header";
import {
  Button,
  CheckboxGroup,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  RadioInput,
  SelectInput,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
  useGetPatient,
  useGetScheduleAssessment,
  usePopulateForm,
  useQueryParams,
  useSaveAssessment,
} from "@/hooks";
import { modifyDateFields, parseData } from "@/lib";
import {
  oasisFollowUpDefaultValue,
  OasisFollowUpForm,
  oasisFollowUpSchema,
} from "@/schema/assessment/oasis-followup";
import { PageProps, PatientResponse } from "@/types";

const OasisFollowUp = ({ params: { id } }: PageProps) => {
  const [patient] = useQueryParams("patient", { defaultValue: "" });
  const { data: patientDetails, isLoading: isFetching } = useGetPatient({
    id: patient,
  });
  const { data, isLoading, mutate } = useGetScheduleAssessment({
    patientScheduleId: id as string,
  });

  const methods = useForm<OasisFollowUpForm>({
    resolver: zodResolver(oasisFollowUpSchema),
    defaultValues: oasisFollowUpDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const followupData = useMemo(
    () =>
      modifyDateFields({
        ...parseData(data?.data?.oasisFollowUp),
      }),
    [data?.data?.oasisFollowUp],
  );

  const { authUser } = useAuth();
  const { trigger, isMutating, data: response } = useSaveAssessment();

  usePopulateForm(methods.reset, followupData);

  useEffect(() => {
    if (response?.success) {
      toast.success("Details saved successfully!");
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return (
    <div className="p-5">
      <p className="text-xl font-semibold pb-2">Oasis Followup E</p>
      <div>
        <AppLoader loading={isFetching || isLoading} />
        <div className="border p-4 rounded flex flex-col">
          <SNNoteHeader patient={patientDetails?.data as PatientResponse} />
          <Form {...methods}>
            <form
              onSubmit={methods.handleSubmit(async (formData) => {
                trigger({
                  nursingAssessment: parseData({ oasisFollowUp: formData }),
                  patientScheduleId: id,
                  caregiverId: authUser?.id as string,
                  id: data?.data?.id as string,
                });
              })}
            >
              <div className="p-5">
                <div className="flex justify-end text-end mt-2">
                  <Button className="px-6" loading={isMutating}>
                    Save Changes
                  </Button>
                </div>

                <div>
                  <div>
                    <FormHeader className="mt-4">SERVICES</FormHeader>
                    <div className="grid gap-5">
                      <FormField
                        control={methods.control}
                        name={"serviceProvided"}
                        render={({ field }) => (
                          <FormRender label="Service Provided:">
                            <RadioInput
                              className="flex-row flex-wrap gap-3 items-start"
                              {...field}
                              options={[
                                {
                                  value: "direct-care",
                                  label: "Direct Care (wd, catheter, etc)",
                                },
                                {
                                  value: "training",
                                  label: "Training/Education (teaching)",
                                },
                                {
                                  value: "observation",
                                  label: "Observation/Assessment",
                                },
                                {
                                  value: "RN",
                                  label:
                                    "M&E by RN (if specific orders for mgmt/eval)",
                                },
                              ]}
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"qCode"}
                        render={({ field }) => (
                          <FormRender label="Q Code:">
                            <RadioInput
                              className="flex-row flex-wrap gap-3 items-start"
                              {...field}
                              value={field.value as string}
                              options={[
                                {
                                  value: "patient-home",
                                  label:
                                    "Hospice or home health care provided in patients home/residence",
                                },
                                {
                                  value: "assisted-living",
                                  label:
                                    "Hospice or home health care provided in assisted living facility",
                                },
                                {
                                  value: "place-not-otherwise",
                                  label:
                                    "Hospice or home health care provided in place not otherwise specified (NO)",
                                },
                              ]}
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"serviceVisit"}
                        render={({ field }) => (
                          <FormRender label="Visit:">
                            <RadioInput
                              className="flex-row flex-wrap gap-3 items-start"
                              {...field}
                              value={field.value as string}
                              options={[
                                {
                                  value: "direct-visit",
                                  label: "Direct visit",
                                },
                                { value: "tele-visit", label: "Tele Visit" },
                                {
                                  value: "video-conferencing",
                                  label: "Video Conferencing",
                                },
                              ]}
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <FormHeader className="mt-4">PATIENT HISTORY</FormHeader>
                    <div className="grid lg:grid-cols-2 gap-5">
                      <FormField
                        control={methods.control}
                        name={"certificationNumber"}
                        render={({ field }) => (
                          <FormRender label="(M0010) CMS Certification Number:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"branchState"}
                        render={({ field }) => (
                          <FormRender label="(M0014) Branch State:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"branchId"}
                        render={({ field }) => (
                          <FormRender label="(M0016) Branch ID:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"attendingPhysician"}
                        render={({ field }) => (
                          <FormRender label="Attending Physician (who'll sign POC):">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"physicianNpi"}
                        render={({ field }) => (
                          <FormRender label="(M0018) Physician NPI:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"patientId"}
                        render={({ field }) => (
                          <FormRender label="(M0020) Patient ID:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"startOfCare"}
                        render={({ field }) => (
                          <FormRender label="(M0030) Start of Care:">
                            <DateInput {...field} value={field.value as Date} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"resumptionOfCare"}
                        render={({ field }) => (
                          <FormRender label="(M0032) Resumption of Care:">
                            <DateInput {...field} value={field.value as Date} />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <FormHeader className="mt-4">
                      PATIENT INFORMATION
                    </FormHeader>
                    <div className="grid lg:grid-cols-2 gap-5">
                      <FormField
                        control={methods.control}
                        name={"firstName"}
                        render={({ field }) => (
                          <FormRender label="(M0040) First Name:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"patientMi"}
                        render={({ field }) => (
                          <FormRender label="(M0040) MI:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"lastName"}
                        render={({ field }) => (
                          <FormRender label="(M0040) Last Name:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"suffix"}
                        render={({ field }) => (
                          <FormRender label="(M0040) Suffix:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"address"}
                        render={({ field }) => (
                          <FormRender label="Address:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"city"}
                        render={({ field }) => (
                          <FormRender label="City:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"state"}
                        render={({ field }) => (
                          <FormRender label="(M0050) State:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"zip"}
                        render={({ field }) => (
                          <FormRender label="(M0060) Zip:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"medicareNumber"}
                        render={({ field }) => (
                          <FormRender label="(M0063) Medicare Number:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"ssn"}
                        render={({ field }) => (
                          <FormRender label="(M0064) SSN:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"medicaidNumber"}
                        render={({ field }) => (
                          <FormRender label="(M0065) Medicaid Number:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"dob"}
                        render={({ field }) => (
                          <FormRender label="(M0066) DOB:">
                            <DateInput {...field} value={field.value as Date} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"gender"}
                        render={({ field }) => (
                          <FormRender label="Gender:">
                            <SelectInput
                              allowClear
                              options={[
                                { value: "MALE", label: "Male" },
                                { value: "FEMALE", label: "Female" },
                              ]}
                              field={field}
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <FormHeader className="mt-4">PAYMENT SOURCES</FormHeader>
                    <div className="grid gap-5">
                      <div>
                        <p className="text-sm font-semibold pb-2">
                          (M0150) Current Payment Sources (Mark all that
                          apply){" "}
                        </p>
                        <FormField
                          control={methods.control}
                          name={"paymentSource"}
                          render={() => (
                            <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                              <CheckboxGroup
                                methods={methods}
                                options={[
                                  {
                                    value: "no-charge",
                                    label:
                                      "0. None, no charge for current services",
                                  },
                                  {
                                    value: "medicare-traditional-fee",
                                    label:
                                      "1. Medicare (Traditional fee for service)",
                                  },
                                  {
                                    value: "medicare-managed-care",
                                    label:
                                      "2. Medicare (HMO/Managed Care, Advantage Plan)",
                                  },
                                  {
                                    value: "medicaid-traditional-fee",
                                    label:
                                      "3. Medicaid (Traditional fee for service)",
                                  },
                                  {
                                    value: "medicaid-managed-care",
                                    label: "4. Medicaid (HMO/Managed Care)",
                                  },
                                  {
                                    value: "workers-compensation",
                                    label: "5. Workers Compensation",
                                  },
                                  {
                                    value: "title-program",
                                    label:
                                      "6. Title Programs (e.g, Title III, V, or XX)",
                                  },
                                  {
                                    value: "other-government",
                                    label:
                                      "7. Other Government (e.g, CHAMPUS, VA, etc.)",
                                  },
                                  {
                                    value: "private-insurance",
                                    label: "8. Private Insurance",
                                  },
                                  {
                                    value: "private-hmo",
                                    label: "9. Private HMO/Managed Care",
                                  },
                                  { value: "self-pay", label: "10. Self pay" },
                                  { value: "other", label: "11. Other" },
                                ]}
                                name={"paymentSource"}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                      {methods.watch("paymentSource")?.includes("other") && (
                        <FormField
                          control={methods.control}
                          name={"otherPaymentSource"}
                          render={({ field }) => (
                            <FormRender label={"Other"}>
                              <Input {...field} value={field.value as string} />
                            </FormRender>
                          )}
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <FormHeader className="mt-4">
                      CLINICAL RECORD ITEMS
                    </FormHeader>
                    <div className="grid lg:grid-cols-2 gap-5">
                      <FormField
                        control={methods.control}
                        name={"serviceProvided"}
                        render={({ field }) => (
                          <FormRender
                            formClassName="lg:col-span-2"
                            label="(M0080) Discipline of Person Completing Assessment"
                          >
                            <RadioInput
                              className="flex-row  flex-wrap gap-3 items-start"
                              {...field}
                              options={[
                                { value: "RN", label: "RN" },
                                { value: "PT", label: "PT" },
                                { value: "SLP", label: "SLP/ST" },
                                { value: "OT", label: "OT" },
                              ]}
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"visitDate"}
                        render={({ field }) => (
                          <FormRender label="Visit Date:">
                            <DateInput {...field} value={field.value as Date} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"dateAssessmentCompleted"}
                        render={({ field }) => (
                          <FormRender label="(M0090) Date Assessment Completed:">
                            <DateInput {...field} value={field.value as Date} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"timeIn"}
                        render={({ field }) => (
                          <FormRender label={"Time In:"}>
                            <Input
                              {...field}
                              value={field.value as string}
                              type="time"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"timeOut"}
                        render={({ field }) => (
                          <FormRender label={"Time Out:"}>
                            <Input
                              {...field}
                              value={field.value as string}
                              type="time"
                            />
                          </FormRender>
                        )}
                      />
                      <div className="col-span-2">
                        <p className="text-sm font-semibold pb-2">
                          (M0100) This Assessment is currently being completed
                          for the following reason
                        </p>
                        <FormField
                          control={methods.control}
                          name={"assessmentReason"}
                          render={() => (
                            <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                              <CheckboxGroup
                                methods={methods}
                                options={[
                                  {
                                    value: "recertification",
                                    label:
                                      "Recertification (follow-up) assessment",
                                  },
                                  { value: "other", label: "Other follow-up" },
                                ]}
                                name={"assessmentReason"}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                      <FormField
                        control={methods.control}
                        name={"serviceProvided"}
                        render={({ field }) => (
                          <FormRender
                            formClassName="lg:col-span-2"
                            label="(M0110) Episode Timing: Is the Medicare home health payment episode for which this assessment will define a case mix group an 'early' episode or a 'later' episode in the patient's current sequence of adjacent Medicare home health payment episodes?"
                          >
                            <RadioInput
                              className="flex-row flex-wrap gap-3 items-start"
                              {...field}
                              options={[
                                { value: "early", label: "Early" },
                                { value: "later", label: "Later" },
                              ]}
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"admissionSource"}
                        render={({ field }) => (
                          <FormRender
                            label={"Admission Source:"}
                            formClassName="col-span-2"
                          >
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <FormHeader className="mt-4">SIGNATURES</FormHeader>
                    <div className="grid lg:grid-cols-2 gap-5">
                      <FormField
                        control={methods.control}
                        name={"signatureCompleting"}
                        render={({ field }) => (
                          <FormRender label="Signature/Title of Discipline Completing:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"signatureCompletingDate"}
                        render={({ field }) => (
                          <FormRender label="Date Signed:">
                            <DateInput {...field} value={field.value as Date} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"signatureRevising"}
                        render={({ field }) => (
                          <FormRender label="Signature/Title of Discipline Revising:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"signatureRevisingDate"}
                        render={({ field }) => (
                          <FormRender label="Date Signed:">
                            <DateInput {...field} value={field.value as Date} />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <FormHeader className="mt-4">MILAGE</FormHeader>
                    <div className="grid gap-5">
                      <FormField
                        control={methods.control}
                        name={"milesTravelled"}
                        render={({ field }) => (
                          <FormRender label="Miles Travelled:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <FormHeader className="mt-4">INITIALS</FormHeader>
                    <div className="grid gap-5">
                      <FormField
                        control={methods.control}
                        name={"electronicInitials"}
                        render={({ field }) => (
                          <FormRender label="PT/RN Electronic Initials:">
                            <Input {...field} value={field.value as string} />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end text-end mt-2 pb-12 pr-5">
                <Button className="px-6" loading={isMutating}>
                  Save Changes
                </Button>{" "}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default OasisFollowUp;
