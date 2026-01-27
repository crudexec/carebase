"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import AppLoader from "@/components/app-loader";
import { SNNoteHeader } from "@/components/evv";
import Flex from "@/components/flex";
import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  DateInput,
  DateTimeInput,
  Form,
  FormField,
  FormRender,
  Input,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
  useGetPatient,
  useGetScheduleAssessment,
  usePopulateForm,
  useQueryParams,
  useSaveAssessment,
} from "@/hooks";
import { modifyDateFields, parseData, parseDateString } from "@/lib";
import {
  consentDefaultValue,
  ConsentForm,
  consentSchema,
} from "@/schema/assessment";
import { PageProps, PatientResponse } from "@/types";

type Information = {
  date: Date;
  label: string;
  checked: boolean;
};

const AssessmentConsent = ({ params: { id } }: PageProps) => {
  const { data, isLoading, mutate } = useGetScheduleAssessment({
    patientScheduleId: id as string,
  });
  const { data: response, trigger, isMutating } = useSaveAssessment();
  const [patient] = useQueryParams("patient", { defaultValue: "" });
  const { data: patientDetails, isLoading: isFetching } = useGetPatient({
    id: patient,
  });
  const { authUser } = useAuth();

  const methods = useForm({
    resolver: zodResolver(consentSchema),
    defaultValues: consentDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { fields } = useFieldArray({
    control: methods?.control,
    name: "information1",
  });

  const scheduleData = useMemo(() => {
    return modifyDateFields({
      id: data?.data?.id,
      ...parseData(data?.data?.consent),
      information1: parseData(data?.data?.consent)?.information1.map(
        (item: ConsentForm) => {
          const information = item as unknown as Information;
          return { ...information, date: parseDateString(information?.date) };
        },
      ),
    });
  }, [data]);

  usePopulateForm<ConsentForm, ConsentForm>(
    methods.reset,
    scheduleData as ConsentForm,
  );

  useEffect(() => {
    if (response?.success) {
      toast.success("Details saved successfully!");
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return (
    <Form {...methods}>
      <AppLoader loading={isLoading || isFetching} />
      <form
        onSubmit={methods.handleSubmit(async (data) => {
          await trigger({
            consent: parseData(data),
            patientScheduleId: id as string,
            caregiverId: authUser?.id as string,
            id: scheduleData?.id,
          });
        })}
      >
        <div className="p-5">
          <div className="rounded flex flex-col">
            <SNNoteHeader patient={patientDetails?.data as PatientResponse} />
          </div>
          <p className="text-xl font-semibold pb-2 mt-4">
            AUTHORIZATION FOR USE OR DISCLOSURE OF HEALTH INFORMATION
          </p>
          <p className="text-sm leading-6 pb-2">
            This form is used to authorize the release of protected health
            information in accordance with the Privacy Rule of the Health
            Insurance Portability and Accountability Act of 1996 (HIPAA).
          </p>
          <p className="text-sm leading-6 pb-2">
            MD healthcare providers: The MD Medical Records Privacy Act requires
            the Attorney General of MD to adopt a standard Authorization to
            Disclose Protected Health Information form. Completion of this
            document authorizes the disclosure and/or use of health information
            about you. Failure to provide all the information requested may
            invalidate this authorization.{" "}
          </p>
          <div>
            <div className="flex justify-end text-end mt-2">
              <Button className="px-6" loading={isMutating}>
                Save Changes
              </Button>
            </div>
            <FormHeader className="mt-4">
              USE AND DISCLOSURE OF HEALTH INFORMATION
            </FormHeader>
            <p>
              I hereby authorize{" "}
              <span className="uppercase font-semibold ml-4">
                {authUser?.provider?.providerName}
              </span>
              <span className="uppercase font-semibold ml-4">
                {authUser?.provider?.address1}
              </span>
              <span className="uppercase font-semibold ml-4">
                {authUser?.provider?.fax}
              </span>
            </p>
            <div>
              <p className="font-normal text-sm py-5">to release to:</p>
              <div className="grid grid-col-1 md:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"name"}
                  render={({ field }) => (
                    <FormRender>
                      <Input
                        {...field}
                        value={field.value as string}
                        placeholder="Name"
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"address"}
                  render={({ field }) => (
                    <FormRender>
                      <Input
                        {...field}
                        value={field.value as string}
                        placeholder="Address Line 1"
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"city"}
                  render={({ field }) => (
                    <FormRender>
                      <Input
                        {...field}
                        value={field.value as string}
                        placeholder="City, State"
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"postalCode"}
                  render={({ field }) => (
                    <FormRender>
                      <Input
                        {...field}
                        value={field.value as string}
                        placeholder="PostalCode"
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <p className="py-5 text-sm font-semibold">
                a. The following information is to be released
              </p>
              <div>
                <div className="grid md:grid-cols-2 grid-cols-1">
                  <div className="flex flex-col gap-4">
                    {fields.map((item, index) => (
                      <div
                        className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 justify-between"
                        key={item.id}
                      >
                        <input
                          type="hidden"
                          {...methods.register(
                            `information1.${index}.label` as const,
                          )}
                        />
                        <Flex>
                          <FormField
                            control={methods.control}
                            name={`information1.${index}.checked`}
                            render={({ field }) => (
                              <FormRender>
                                <Checkbox
                                  onCheckedChange={field.onChange}
                                  checked={field.value as boolean}
                                />
                              </FormRender>
                            )}
                          />
                          <p className="text-sm ml-3">{item?.label}</p>
                        </Flex>
                        <FormField
                          control={methods.control}
                          name={`information1.${index}.date`}
                          render={({ field }) => (
                            <FormRender formClassName="flex-1">
                              <DateInput
                                {...field}
                                value={field.value as Date}
                                className="flex-1"
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 grid-cols-1">
                  <div>
                    <FormField
                      control={methods.control}
                      name={"isOtherService"}
                      render={({ field }) => (
                        <FormRender formClassName="mt-4">
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Other(please specify needed information and
                              date(s) of service if known):
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherService"}
                      render={({ field }) => (
                        <FormRender label="" formClassName="mt-2">
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm py-5">
                b. I specifically authorize the release of the following
                information (check as appropriate)
              </p>
              <div className="grid grid-col-1 gap-5">
                <FormField
                  control={methods.control}
                  name={"information2"}
                  render={() => (
                    <FormRender formClassName="flex flex-col items-start gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "metal-health-treatment",
                            label:
                              " Mental health treatment information' (A separate authorization is required to authorize the disclosure or use of psychotherapy notes.)",
                          },
                          {
                            value: "hiv-test-result",
                            label: "HIV test results",
                          },
                          {
                            value: "drug-treatment",
                            label: "Alcohol/drug treatment information",
                          },
                          {
                            value: "genetic-information",
                            label: "Genetic information/testing",
                          },
                        ]}
                        name={"information2"}
                      />
                    </FormRender>
                  )}
                />

                <div className="flex gap-4">
                  <FormField
                    control={methods.control}
                    name={"understandInformation"}
                    render={({ field }) => (
                      <FormRender>
                        <Input
                          {...field}
                          value={field.value as string}
                          placeholder="Initials Ex : AB"
                        />
                      </FormRender>
                    )}
                  />
                  <p className="text-sm flex-1">
                    I understand that the information in my health record may
                    include information relating to sexually transmitted
                    disease, acquired immunodeficiency syndrome (AIDS), or human
                    immunodeficiency virus (HIV). It may also include
                    information about behavioral or mental health services and
                    treatment for alcohol and drug abuse. I understand that by
                    signing.this authorization, I am authorizing the release of
                    such information unless specified otherwise above.
                  </p>
                </div>
                <div className="flex gap-4">
                  <p className="text-sm flex-1">
                    I understand my treatment or payment for my treatment cannot
                    be conditioned on signing this authorization.
                  </p>
                </div>
                <div className="flex gap-4">
                  <p className="text-sm flex-1">
                    This authorization remains valid for two years from the date
                    of signature.
                  </p>
                </div>
                <div className="flex gap-4">
                  <p className="text-sm flex-1">
                    Any facsimile, copy, or photocopy of this authorization
                    shall authorize you to release the records requested herein.
                  </p>
                </div>
                <div className="flex gap-4">
                  <p className="text-sm flex-1">
                    This authorization remains valid for two years from the date
                    of signature.
                  </p>
                </div>
                <p className="text-sm">
                  I understand that a nurse will case manage all services. I
                  understand the frequency of services. This frequency may
                  change according to need.
                </p>

                <div className="flex flex-col gap-5">
                  <FormField
                    control={methods.control}
                    name={"evaluations"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "skilled-nursing",
                              label: "Skilled Nursing",
                            },
                            {
                              value: "home-health-aide",
                              label: "Home Health Aide",
                            },
                            { value: "pt-evaluation", label: "PT Evaluation" },
                            { value: "ot-evaluation", label: "OT Evaluation" },
                            { value: "st-evaluation", label: "ST Evaluation" },
                            { value: "other", label: "Other" },
                          ]}
                          name={"evaluations"}
                        />
                      </FormRender>
                    )}
                  />

                  {methods.watch("evaluations")?.includes("other") && (
                    <FormField
                      control={methods.control}
                      name={"otherEvaluation"}
                      render={({ field }) => (
                        <FormRender label={"Other"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  )}
                </div>
                <p className="text-sm">
                  I have received a copy and an explanation of my Bill of
                  Rights, Patient Bill of Rights and the Rights of the Elderly,
                  as appropriate. I have been notified of my right to voice a
                  complaint. I may direct that complaint to the Agency
                  Administrator or Owner at 202-207-0726. An investigation of
                  the complaint will be initiated within 10 calendar days and
                  resolved within 30 calendar days of receipt.
                </p>
                <p className="text-sm">
                  This includes a complaint regarding advance directives.
                  Complaints regarding Utilization Review or HMO/PPO/MCO
                  services can be made directly to MD Department of Insurance
                  Consumer Protections.
                </p>
                <p className="text-sm">
                  Under your rights you may also contact HIPPA at
                  1-877-696-6775. Any complaints regarding the agency may be
                  directed to the KEPRO Hotline at 1-888-315-0636. The hours of
                  operation for KEPRO are 8 AM-6 PM (EST) Monday through Friday.
                </p>
              </div>
            </div>
          </div>
          <div>
            <FormHeader>
              I have received information and Agency Policy on Advance
              Directives.
            </FormHeader>
            <div className="grid grid-col-1 gap-5">
              <FormField
                control={methods.control}
                name={"information3"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "have", label: "I have" },
                        { value: "have-not", label: "have not signed a" },
                      ]}
                      name={"information3"}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"information3"}
                render={() => (
                  <FormRender formClassName="flex flex-col flex-wrap gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        {
                          value: "living-will",
                          label: "Living Will/Directive to Physician",
                        },
                        {
                          value: "out-of-hospital",
                          label: "Out of Hospital DNR",
                        },
                        {
                          value: "medical-power-attorney",
                          label: "Medical Power Attorney",
                        },
                        {
                          value: "declaration of mental health",
                          label: "Declaration of Mental Health.",
                        },
                      ]}
                      name={"information3"}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"information3"}
                render={() => (
                  <FormRender formClassName="flex items-center flex-wrap gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        { value: "am", label: "I am" },
                        {
                          value: "am-not",
                          label: "or am not a copy for my record",
                        },
                      ]}
                      name={"information3"}
                    />
                  </FormRender>
                )}
              />
              {methods
                .watch("information3")
                ?.includes("medical-power-attorney") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={methods.control}
                    name={"attorneyPower"}
                    render={({ field }) => (
                      <FormRender label="Name">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"phone"}
                    render={({ field }) => (
                      <FormRender label="Number">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
              )}
              <div>
                <p className="text-sm">
                  I understand that it is my right and responsibility to be
                  involved in my care and that I will be informed as to the
                  nature and purpose of any technical procedure.
                </p>
                <p className="text-sm">
                  I have been informed what to do in an emergency/natural
                  disaster and have received education on completing an
                  emergency preparedness plan for myself and my family.
                </p>
                <p className="text-sm">
                  I understand the importance of completing this plan and know
                  that agency staff may assist in this process.
                </p>
                <p className="text-sm">
                  I have been informed verbally and in writing regarding Agency
                  Policy on abuse, neglect, and exploitation, agency drug
                  testing and hazardous waste disposal in the home.
                </p>
                <p className="text-sm">
                  I have been advised verbally and in writing of the purpose and
                  my rights pertaining to the collection of information and the
                  HIPPA Privacy Act.
                </p>
              </div>

              <p>
                HIPPA- I have received the Notice of Privacy Practices, which
                includes information about the "Red Flags Rule", and consent to
                the agency's use and for disclosure of protected heath
                information for payment, treatment, and Agency's Health care
                operations.
              </p>
            </div>
          </div>
          <div>
            <FormHeader>Purpose</FormHeader>
            <div>
              <p className="text-sm pb-5">
                The purpose of the release of this information is:
              </p>
              <div className="flex flex-col gap-5">
                <FormField
                  control={methods.control}
                  name={"purpose"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "insurance",
                            label:
                              "Insurance or other third-party reimbursement",
                          },
                          {
                            value: "continuity-of-care",
                            label: "Continuity of care",
                          },
                          {
                            value: "pending-legal-action",
                            label: "Pending legal action",
                          },
                          {
                            value: "request-of-the-patient",
                            label: "At the request of the patient",
                          },
                          { value: "other", label: "Other (Specify):" },
                        ]}
                        name={"purpose"}
                      />
                    </FormRender>
                  )}
                />

                {methods.watch("purpose")?.includes("other") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <FormField
                        control={methods.control}
                        name={"otherPurpose"}
                        render={({ field }) => (
                          <FormRender label="">
                            <Textarea
                              {...field}
                              value={field.value as string}
                            />
                          </FormRender>
                        )}
                      />{" "}
                    </div>
                    <FormField
                      control={methods.control}
                      name={"continuityDate"}
                      render={({ field }) => (
                        <FormRender
                          label={
                            "*If for continuity of care, records needed for appointment on"
                          }
                        >
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
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <FormHeader>RESTRICTIONS</FormHeader>
            <div>
              <p className="text-sm">
                According to federal and state regulations, if the health
                information requested relates to AIDS/HIV treatment or treatment
                in a federally recognized chemical dependency unit, then the
                information will be accompanied by a statement limiting
                disclosure to third parties as required by law.
              </p>
              <p className="text-sm">
                I understand that if the person or entity that receives the
                information is not a healthcare provider or a health plan
                covered by federal privacy regulations, the information
                described above may be re-disclosed and no longer protected by
                these regulations. However, the recipient may be prohibited from
                disclosing substance abuse information under the Federal
                Substance Abuse Confidentiality Requirements.
              </p>
              <p className="text-sm">
                I realize that the office and its employees have a
                responsibility to maintain the confidentiality of the health
                records in its possession. I understand that once the
                information is disclosed, it may be re-disclosed by the
                recipient and the information may not be protected by federal
                privacy laws or regulations. The office will not be held
                responsible for any subsequent disclosure by the recipient of
                the health information. I release ADAGE HEALTHCARE SOLUTIONS,
                LLC and employees of any liability that may arise as a result of
                any subsequent disclosure of my health information by the
                recipient.
              </p>
            </div>
          </div>
          <div>
            <FormHeader>MY RIGHTS</FormHeader>
            <div className="flex flex-col gap-5">
              <p className="text-sm">
                I may refuse to sign this authorization. My refusal will not
                affect my ability to obtain treatment or payment or eligibility
                for benefits. I may inspect or obtain a copy of the health
                information that I am being asked to allow the use or disclosure
                of. I may revoke this authorization at any time, but I must do
                so in writing and submit it to the following address:
              </p>
              <p>
                <span className="uppercase font-semibold">
                  {authUser?.provider?.providerName}
                </span>
                <span className="uppercase font-semibold ml-4">
                  {authUser?.provider?.address1}
                </span>
                <span className="uppercase font-semibold ml-4">
                  {authUser?.provider?.fax}
                </span>
              </p>
              <p className="text-sm">
                My revocation will take effect upon receipt, except to the
                extent that others have acted in reliance upon this
                authorization. I have a right to receive a copy of this
                authorization.3 Information disclosed pursuant to this
                authorization could be re-disclosed by the recipient and no
                longer protected by the HIPAA Privacy Rule.
              </p>
            </div>
          </div>
          <div>
            <FormHeader>SIGNATURES</FormHeader>
            <div className="w-[300px] lg:w-[500px] mb-5"></div>
            <div className="grid grid-col-1 md:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"legalRepSignatureDate"}
                render={({ field }) => (
                  <FormRender
                    label={
                      "Patient or Legal Representative signature Date and Time:"
                    }
                  >
                    <DateTimeInput {...field} value={field.value as Date} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"legalRepName"}
                render={({ field }) => (
                  <FormRender label="Patient or Legal Representative Name:">
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"legalRepRelation"}
                render={({ field }) => (
                  <FormRender label="Legal Representative's Relationship to Patient:">
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"witness"}
                render={({ field }) => (
                  <FormRender label="Witness Name:">
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"witnessSignature"}
                render={({ field }) => (
                  <FormRender label="Witness Signature:">
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"witnessSignatureDate"}
                render={({ field }) => (
                  <FormRender label={"Witness signature Date and Time:"}>
                    <DateTimeInput {...field} value={field.value as Date} />
                  </FormRender>
                )}
              />
            </div>{" "}
          </div>
        </div>
        <div className="flex justify-end text-end mt-2 pb-12 pr-5">
          <Button className="px-6" loading={isMutating}>
            Save Changes{" "}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AssessmentConsent;
