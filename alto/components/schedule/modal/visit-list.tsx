import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";

import {
  Checkbox,
  DateInput,
  Form,
  FormField,
  FormRender,
  Modal,
  RadioInput,
  SelectInput,
} from "@/components/ui";
import { billingCode, visitStatusOptions } from "@/constants";
import { useGetPatients, useGetProviders, useGetUsers } from "@/hooks";
import { visitDefaultValue, VisitForm, visitSchema } from "@/schema";

const VisitListModal = ({
  title,
  open,
  modalClose,
}: {
  title: string;
  open: boolean;
  modalClose: () => void;
}) => {
  const { data, isLoading } = useGetPatients({ status: "ACTIVE" });
  const { data: caregivers } = useGetUsers({ tab: "caregiver" });
  const { data: providers } = useGetProviders();
  const methods = useForm<VisitForm>({
    resolver: zodResolver(visitSchema),
    defaultValues: visitDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  return (
    <Modal
      title={title}
      open={open}
      onClose={modalClose}
      className="md:max-w-[650px]"
    >
      <Form {...methods}>
        <form className="h-[670px] overflow-auto flex flex-col gap-5 scrollbar-hide px-2 !pt-0">
          <div className="grid grid-col-1 md:grid-cols-2 gap-4">
            <FormField
              control={methods.control}
              name={"dateFrom"}
              render={({ field }) => (
                <FormRender label={"From:"}>
                  <DateInput {...field} value={field.value as Date} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"dateThrough"}
              render={({ field }) => (
                <FormRender label={"Through:"}>
                  <DateInput {...field} value={field.value as Date} />
                </FormRender>
              )}
            />
          </div>
          <div>
            <p className="pb-3 border-b">Patient</p>
            <div className="flex gap-4 items-center pt-4">
              <div className="flex-1">
                <FormField
                  control={methods.control}
                  name={"patient"}
                  render={({ field }) => (
                    <FormRender>
                      <SelectInput
                        options={data?.data?.patients?.map((patient) => ({
                          label: `${patient.firstName} ${patient.lastName}`,
                          value: patient.id,
                        }))}
                        field={field}
                        loading={isLoading}
                        placeholder="Select a Patient"
                      />
                    </FormRender>
                  )}
                />
              </div>

              <FormField
                control={methods.control}
                name={"allPatient"}
                render={({ field }) => (
                  <FormRender formClassName="self-center">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">All</span>
                    </div>
                  </FormRender>
                )}
              />
            </div>

            <FormField
              control={methods.control}
              name={"inActivePatient"}
              render={({ field }) => (
                <FormRender formClassName="self-center">
                  <div className="flex gap-2 items-center mt-2">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm">
                      Show Inactive Patients in Drop-down
                    </span>
                  </div>
                </FormRender>
              )}
            />
          </div>

          <div>
            <p className="pb-3 border-b">Caregiver</p>
            <div className="flex gap-4 items-center pt-4">
              <div className="flex-1">
                <FormField
                  control={methods.control}
                  name={"caregiver"}
                  render={({ field }) => (
                    <FormRender>
                      <SelectInput
                        options={
                          caregivers?.data?.users?.map((caregiver) => ({
                            label: `${caregiver.firstName} ${caregiver.lastName}`,
                            value: caregiver.id,
                          })) || []
                        }
                        field={field}
                        loading={isLoading}
                        placeholder="Select a Caregiver"
                      />
                    </FormRender>
                  )}
                />
              </div>

              <FormField
                control={methods.control}
                name={"allCaregiver"}
                render={({ field }) => (
                  <FormRender formClassName="self-center">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">All</span>
                    </div>
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <p className="pb-3 border-b">Visit Status</p>
            <div className="pt-4">
              <FormField
                control={methods.control}
                name={"visitStatus"}
                render={({ field }) => (
                  <FormRender>
                    <SelectInput
                      options={visitStatusOptions}
                      field={field}
                      placeholder="Select Visit Status"
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <p className="pb-3 border-b">Group By</p>
            <div className="pt-3">
              <FormField
                control={methods.control}
                name={"groupBy"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="grid grid-cols-2 items-center"
                      {...field}
                      options={[
                        { value: "patient", label: "Patient" },
                        { value: "caregiver", label: "Caregiver" },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <p className="pb-3 border-b">Sort By</p>
            <div className="pt-3">
              <FormField
                control={methods.control}
                name={"sortBy"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="grid grid-cols-2 items-center"
                      {...field}
                      options={[
                        { value: "visit-date", label: "Visit Date" },
                        { value: "caregiver", label: "Caregiver" },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <p className="pb-3 border-b">Unassigned Visits</p>
            <div className="pt-4">
              <FormField
                control={methods.control}
                name={"noCaregiverAssigned"}
                render={({ field }) => (
                  <FormRender formClassName="self-center">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">
                        List only visits with no caregiver assigned
                      </span>
                    </div>
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"noPatientAssigned"}
                render={({ field }) => (
                  <FormRender formClassName="self-center">
                    <div className="flex gap-2 items-center pt-3">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">
                        List only visits with no patient assigned
                      </span>
                    </div>
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <p className="pb-3 border-b">Office</p>
            <div className="flex gap-4 items-center pt-4">
              <div className="flex-1">
                <FormField
                  control={methods.control}
                  name={"office"}
                  render={({ field }) => (
                    <FormRender>
                      <SelectInput
                        options={providers?.data?.providers?.map(
                          (provider) => ({
                            label: provider.providerName as string,
                            value: provider.id,
                          }),
                        )}
                        field={field}
                      />
                    </FormRender>
                  )}
                />
              </div>

              <FormField
                control={methods.control}
                name={"allOffice"}
                render={({ field }) => (
                  <FormRender formClassName="self-center">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">All</span>
                    </div>
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <p className="pb-3 border-b">Billing Code</p>
            <div className="flex gap-4 items-center pt-4">
              <div className="flex-1">
                <FormField
                  control={methods.control}
                  name={"billingCode"}
                  render={({ field }) => (
                    <FormRender formClassName="w-full">
                      <SelectInput
                        options={billingCode}
                        field={field}
                        placeholder="Enter Billing Code"
                      />
                    </FormRender>
                  )}
                />
              </div>

              <FormField
                control={methods.control}
                name={"allBillingCode"}
                render={({ field }) => (
                  <FormRender formClassName="self-center">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">All</span>
                    </div>
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <p className="pb-3 border-b">
              Discipline Name / Type (based on Discipline from Billing Code)
            </p>
            <div className="flex flex-col gap-4  pt-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-7">
                <FormField
                  control={methods.control}
                  name={"allDiscipline"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm">All</span>
                      </div>
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"disciplineType"}
                  render={({ field }) => (
                    <FormRender>
                      <RadioInput
                        className="grid grid-cols-2 gap-5 items-center"
                        {...field}
                        options={[
                          { value: "name", label: "Discipline Name" },
                          { value: "type", label: "Discipline Type" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"discipline"}
                render={({ field }) => (
                  <FormRender>
                    <SelectInput options={[]} field={field} />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <p className="pb-3 border-b">Payer</p>
            <div className="flex gap-4 items-center pt-4">
              <div className="flex-1">
                <FormField
                  control={methods.control}
                  name={"payer"}
                  render={({ field }) => (
                    <FormRender>
                      <SelectInput options={[]} field={field} />
                    </FormRender>
                  )}
                />
              </div>

              <FormField
                control={methods.control}
                name={"allPayer"}
                render={({ field }) => (
                  <FormRender formClassName="self-center">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">All</span>
                    </div>
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <p className="pb-3 border-b">Payroll Status</p>

            <div className="pt-3">
              <FormField
                control={methods.control}
                name={"payrollStatus"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="grid grid-col-1 md:grid-cols-3 items-center"
                      {...field}
                      options={[
                        { value: "all", label: "All" },
                        { value: "paid", label: "Paid Only" },
                        { value: "unpaid", label: "Unpaid Only" },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <p className="pb-3 border-b">Include Amount</p>
            <div className="pt-3">
              <FormField
                control={methods.control}
                name={"amount"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="grid grid-col-1 md:grid-cols-3 items-center"
                      {...field}
                      options={[
                        { value: "none", label: "None" },
                        { value: "charge", label: "Charge" },
                        { value: "receivable", label: "Receivable" },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <p className="pb-3 border-b">Billed/Unbilled Visits</p>
            <div className="pt-3">
              <FormField
                control={methods.control}
                name={"billedVisit"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="grid grid-cols-1 md:grid-cols-3 items-center"
                      {...field}
                      options={[
                        { value: "all", label: "All" },
                        { value: "billed", label: "Billed Visits Only" },
                        { value: "unbilled", label: "Unbilled Visits Only" },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <p className="pb-3 border-b">Billable/Non-Billable Visits</p>
            <div className="pt-3">
              <FormField
                control={methods.control}
                name={"billableVisit"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="grid grid-cols-1 md:grid-cols-3 items-center"
                      {...field}
                      options={[
                        { value: "all", label: "All" },
                        { value: "billable", label: "Billable Visits only" },
                        {
                          value: "non-billable",
                          label: "Non-Billable Visits only",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </Modal>
  );
};

export default VisitListModal;
