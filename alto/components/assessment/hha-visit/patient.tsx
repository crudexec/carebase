"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import {
  Button,
  CheckboxGroup,
  Form,
  FormField,
  FormRender,
  Input,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { parseData } from "@/lib";
import {
  patientDefaultValue,
  PatientForm,
  patientSchema,
} from "@/schema/assessment/hha-visit/patient";

const Patient = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
}: {
  assessmentId?: string;
  data?: PatientForm;
  mutate: () => void;
  patientScheduleId: string;
}) => {
  const methods = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: patientDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { authUser } = useAuth();
  const { trigger, isMutating, data: response } = useSaveAssessment();

  usePopulateForm(methods.reset, data);

  useEffect(() => {
    if (response?.success) {
      toast.success("Details saved successfully!");
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(async (data) => {
          trigger({
            hhaVisit: parseData({ patient: data }),
            patientScheduleId,
            caregiverId: authUser?.id as string,
            id: assessmentId,
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
              <FormHeader className="mt-4">
                PATIENT HISTORY AND DIAGNOSIS
              </FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"patientName"}
                  render={({ field }) => (
                    <FormRender label="Patient:">
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
                  name={"phone"}
                  render={({ field }) => (
                    <FormRender label="Phone:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"caseManager"}
                  render={({ field }) => (
                    <FormRender label="Case Manager/Nurse/Supervisor:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"frequency"}
                  render={({ field }) => (
                    <FormRender label="Frequency/Duration Aide Visits:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"diagnosis"}
                  render={({ field }) => (
                    <FormRender label="Diagnosis:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">GOALS FOR CARE</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"goalForCare"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "personal-care",
                            label: "Effective and Safe Personal Care ",
                          },
                          {
                            value: "patient-clean",
                            label: "Patient clean, comfortable",
                          },
                        ]}
                        name={"goalForCare"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherGoalForCare"}
                  render={({ field }) => (
                    <FormRender label="Other:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                SAFETY AND OTHER PERTINENT INFORMATION
              </FormHeader>
              <div className="grid gap-5">
                <p className="text-sm font-semibold pb-2">
                  Check All That Apply (RN to review and revise at least every
                  60 days)
                </p>
                <FormField
                  control={methods.control}
                  name={"safetyInformation"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "lives-alone", label: "Lives Alone" },
                          { value: "lives-other", label: "Lives w/ Other" },
                          {
                            value: "alone-during-day",
                            label: "Alone during day",
                          },
                          { value: "bed-bound", label: "Bed Bound" },
                          {
                            value: "up-as-tolerated",
                            label: "Up as Tolerated",
                          },
                          { value: "oriented", label: "Oriented" },
                          { value: "alert", label: "Alert" },
                          { value: "forgetful", label: "Forgetful" },
                          { value: "confused", label: "Confused" },
                        ]}
                        name={"safetyInformation"}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">
                VISION, HEARING, AND DENTAL
              </FormHeader>
              <div className="grid gap-5">
                <p className="text-sm font-semibold pb-2">
                  Check All That Apply (RN to review and revise at least every
                  60 days)
                </p>
                <FormField
                  control={methods.control}
                  name={"visionHearingDental"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "glasses", label: "Glasses" },
                          { value: "contacts", label: "Contacts" },
                          {
                            value: "hard-of-hearing",
                            label: "Hard of Hearing",
                          },
                          { value: "hearing-aid", label: "Hearing Aid" },
                          { value: "dentures", label: "Dentures" },
                          { value: "upper", label: "Upper" },
                          { value: "lower", label: "Lower" },
                          { value: "partial", label: "Partial" },
                        ]}
                        name={"visionHearingDental"}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">OXYGEN</FormHeader>
              <div className="grid lg:grid-cols-2 items-end gap-5">
                <FormField
                  control={methods.control}
                  name={"oxygenAt"}
                  render={({ field }) => (
                    <FormRender label="Oxygen at:">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input {...field} value={field.value as string} />
                        </div>
                        <p className="text-sm font-semibold">l/m via</p>
                      </div>
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"oxygenType"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "nasal-cannula", label: "Nasal Cannula" },
                          { value: "mask", label: "Mask" },
                        ]}
                        name={"oxygenType"}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">OTHER</FormHeader>
              <div className="grid lg:grid-cols-2  items-end gap-5">
                <FormField
                  control={methods.control}
                  name={"other"}
                  render={({ field }) => (
                    <FormRender label="Other:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherType"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "intermittent", label: "Intermittent" },
                          { value: "continuous", label: "Continuous" },
                        ]}
                        name={"otherType"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"amputee"}
                  render={({ field }) => (
                    <FormRender label="Amputee (Specify):">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"artificialLimb"}
                  render={({ field }) => (
                    <FormRender label="Artificial Limb (Specify):">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">ENVIRONMENT</FormHeader>
              <div className="grid lg:grid-cols-2 gap-5">
                <FormField
                  control={methods.control}
                  name={"environment"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "ostomy", label: "Ostomy" },
                          {
                            value: "presence-of-animals",
                            label: "Presence of Animals",
                          },
                        ]}
                        name={"environment"}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"foodAllergies"}
                  render={({ field }) => (
                    <FormRender label="Food Allergies:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"otherEnvironment"}
                  render={({ field }) => (
                    <FormRender label="Other:">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"supplies"}
                  render={({ field }) => (
                    <FormRender label="Supplies:">
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
  );
};

export default Patient;
