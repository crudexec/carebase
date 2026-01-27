import { zodResolver } from "@hookform/resolvers/zod";
import { NotePlan, User } from "@prisma/client";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  RadioInput,
  Textarea,
} from "@/components/ui";
import { usePopulateForm, useSaveNotePlan } from "@/hooks";
import { modifyDateFields } from "@/lib";
import { notePlanDefaultValue, NotePlanForm, notePlanSchema } from "@/schema";

const Plan = ({
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
  caregiver?: User;
  snNoteType: string;
  callback: (skilledNursingNote?: string) => void;
  data: NotePlan;
  disabled?: boolean;
}) => {
  const methods = useForm<NotePlanForm>({
    resolver: zodResolver(notePlanSchema),
    defaultValues: notePlanDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const { data: response, trigger, isMutating } = useSaveNotePlan();

  useEffect(() => {
    if (response?.success) {
      toast.success("Note plan detail saved successfully!");
      callback(response?.data?.skilledNursingNoteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const notePlan = useMemo(() => {
    return modifyDateFields({ ...data } as NotePlan);
  }, [data]);

  usePopulateForm<NotePlanForm, NotePlan>(methods.reset, notePlan);

  return (
    <Form {...methods}>
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
          <FormHeader className="mt-4">Plan/Coordination/Checklist</FormHeader>

          <div className="grid lg:grid-cols-2 gap-5 items-center">
            <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:col-span-2">
              <p className="text-sm font-medium">Care Plan:</p>
              <FormField
                control={methods.control}
                name={"carePlan"}
                render={() => (
                  <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                    <CheckboxGroup
                      methods={methods}
                      options={[
                        {
                          value: "revised",
                          label: "Reviewed/Revised with patient/caregiver",
                        },
                        {
                          value: "achieved-outcome",
                          label: "Achieved Outcome",
                        },
                      ]}
                      name={"carePlan"}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
            </div>

            <FormField
              control={methods.control}
              name={"nurseVisit"}
              render={({ field }) => (
                <FormRender
                  label={"Next HH Nurse Visit"}
                  formClassName="flex-1"
                >
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"physicianVisit"}
              render={({ field }) => (
                <FormRender
                  label={"Next Physician Visit"}
                  formClassName="flex-1"
                >
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />

            <div className="lg:col-span-2 flex flex-col lg:flex-row lg:items-center gap-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                <p className="text-sm font-medium">Care Coordination with:</p>
                <FormField
                  control={methods.control}
                  name={"careCordinationWith"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          { value: "physician", label: "Physician" },
                          { value: "sn", label: "SN" },
                          { value: "pt", label: "PT" },
                          { value: "ot", label: "OT" },
                          { value: "st", label: "ST" },
                          { value: "msw", label: "MSW" },
                          { value: "other", label: "Other" },
                        ]}
                        name={"careCordinationWith"}
                        disabled={disabled}
                      />
                    </FormRender>
                  )}
                />
              </div>

              <FormField
                control={methods.control}
                name={"otherCareCordinationWith"}
                render={({ field }) => (
                  <FormRender formClassName="flex-1">
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={
                        !methods
                          .watch("careCordinationWith")
                          .includes("other") || disabled
                      }
                    />
                  </FormRender>
                )}
              />
            </div>

            <FormField
              control={methods.control}
              name={"providedBillableSupplies"}
              render={({ field }) => (
                <FormRender>
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">Provided Billable Supplies</span>
                  </div>
                </FormRender>
              )}
            />

            <div className="flex items-center gap-2 flex-1">
              <p className="text-sm font-medium">Note:</p>
              <FormField
                control={methods.control}
                name={"planNote"}
                render={({ field }) => (
                  <FormRender formClassName="flex-1">
                    <Input
                      {...field}
                      value={field.value as string}
                      disabled={disabled}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>
        </div>

        <div>
          <FormHeader> HHA Supervisory Visit</FormHeader>

          <div className="grid lg:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"aideName"}
              render={({ field }) => (
                <FormRender label={"Name of Aide"}>
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />

            <div className="flex flex-col gap-5">
              <FormField
                control={methods.control}
                name={"aidePresent"}
                render={({ field }) => {
                  return (
                    <FormRender>
                      <RadioInput
                        className="flex-row gap-5 items-center"
                        {...field}
                        value={field.value as string}
                        options={[
                          { value: "aide-present", label: "Aide Present" },
                          { value: "not-present", label: "Not Present" },
                        ]}
                        disabled={disabled}
                      />
                    </FormRender>
                  );
                }}
              />

              <FormField
                control={methods.control}
                name={"aideFamilySatisfied"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={disabled}
                      />
                      <span className="text-sm">
                        Patient/Family Satisfied ?
                      </span>
                    </div>
                  </FormRender>
                )}
              />
            </div>

            <FormField
              control={methods.control}
              name={"aideTaskObserved"}
              render={({ field }) => (
                <FormRender label={"Tasks Observed"}>
                  <Textarea
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"aideVisitDate"}
              render={({ field }) => (
                <FormRender label={"Next Supervisory Visit Date"}>
                  <DateInput
                    {...field}
                    value={field.value as Date}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />
          </div>
        </div>

        <div>
          <FormHeader> LPN/LVN Supervisory Visit</FormHeader>

          <div className="grid lg:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"lpnName"}
              render={({ field }) => (
                <FormRender label={"Name of LPN/LVN"}>
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />

            <div className="flex flex-col gap-5">
              <FormField
                control={methods.control}
                name={"lpnPresent"}
                render={({ field }) => {
                  return (
                    <FormRender>
                      <RadioInput
                        className="flex-row gap-5 items-center"
                        {...field}
                        value={field.value as string}
                        options={[
                          { value: "present", label: "LPN/LVN Present" },
                          { value: "not-present", label: "Not Present" },
                        ]}
                        disabled={disabled}
                      />
                    </FormRender>
                  );
                }}
              />

              <FormField
                control={methods.control}
                name={"lpnFamilySatisfied"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={disabled}
                      />
                      <span className="text-sm">
                        Patient/Family Satisfied ?
                      </span>
                    </div>
                  </FormRender>
                )}
              />
            </div>

            <FormField
              control={methods.control}
              name={"lpnTaskObserved"}
              render={({ field }) => (
                <FormRender label={"Tasks Observed"}>
                  <Textarea
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />

            <FormField
              control={methods.control}
              name={"lpnVisitDate"}
              render={({ field }) => (
                <FormRender label={"Next Supervisory Visit Date"}>
                  <DateInput
                    {...field}
                    value={field.value as Date}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />
          </div>
        </div>

        <div>
          <FormHeader> General Notes</FormHeader>

          <FormField
            control={methods.control}
            name={"generalNotes"}
            render={({ field }) => (
              <FormRender>
                <Textarea {...field} value={field.value as string} rows={10} />
              </FormRender>
            )}
          />
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

export default Plan;
