"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Patient, Physician } from "@prisma/client";
import { isEmpty } from "lodash";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  MultiSelect,
  SelectInput,
  Tooltip,
} from "@/components/ui";
import {
  genderOptions,
  getCities,
  getCountries,
  getStates,
  maritalStatusOptions,
  taxonomy,
} from "@/constants";
import {
  admissionPriority,
  admissionSource,
  CBSACode,
  employmentStatus,
  patientConditionRelatedTo,
  studentType,
  suffixes,
} from "@/constants/patient";
import { usePopulateForm, useUpdatePatient } from "@/hooks";
import { cn, getFullName, pickValues } from "@/lib";
import { patientDefaultValue, PatientForm, patientFormSchema } from "@/schema";
import { ApiResponse, TaxonomyResponse } from "@/types";

import { CreatePhysicianModal } from "../../modal";

const ProfileAdmission = ({
  data,
  mutate: refresh,
}: {
  data?: Patient;
  mutate: () => void;
}) => {
  const {
    data: updatePatient,
    trigger,
    isMutating,
  } = useSWRMutation("/api/patient", useUpdatePatient);
  const { data: meta, mutate } =
    useSWR<ApiResponse<Physician[]>>(`/api/physician`);
  const { data: taxonomies } =
    useSWR<ApiResponse<TaxonomyResponse[]>>(`/api/lookup/taxonomy`);
  const methods = useForm<PatientForm>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: patientDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const [action, setAction] = useState("");

  const countries = getCountries();
  const states = getStates(methods.watch("country"));
  const cities = getCities(methods.watch("country"), methods.watch("state"));

  useEffect(() => {
    if (updatePatient?.success) {
      mutate();
      refresh();
      toast.success(`Success|${updatePatient?.message}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatePatient]);

  usePopulateForm<PatientForm, Patient>(methods.reset, data);

  return (
    <>
      <CreatePhysicianModal
        mode={"create"}
        title={"Create Physician"}
        open={action === "create-physician"}
        modalClose={() => {
          mutate();
          setAction("");
        }}
      />
      <Form {...methods}>
        <form
          className="mt-2 justify-between flex flex-col scrollbar-hide max-h-[calc(100vh-130px)] md:max-h-[calc(100vh-180px)] overflow-auto pb-8"
          onSubmit={methods.handleSubmit(async (formData) => {
            const {
              gender,
              maritalStatus,
              employmentStatus,
              student,
              admissionPriority,
              ...rest
            } = formData;
            await trigger({
              ...rest,
              id: data?.id as string,
              autoAccidentState: formData?.conditionRelation?.includes(
                "auto-accident",
              )
                ? formData?.autoAccidentState
                : "",
              ...pickValues({
                gender,
                maritalStatus,
                employmentStatus,
                student,
                admissionPriority,
              }),
            });
          })}
        >
          <div className="md:px-8 px-2 bg-background border-b border-b-border flex justify-between items-center uppercase font-semibold  text-white  py-2 mx-2 mb-4 sticky top-0 z-[1]">
            <p className="text-foreground"> Patient Information</p>
            <Button
              type="submit"
              className={cn("py-2 text-white")}
              loading={isMutating}
            >
              Save Changes
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4 items-end">
            <FormField
              control={methods.control}
              name={"firstName"}
              render={({ field }) => (
                <FormRender label={"First Name"}>
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"middleInitial"}
              render={({ field }) => (
                <FormRender label={"Middle Name"}>
                  <Input {...field} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"lastName"}
              render={({ field }) => (
                <FormRender label={"Last Name"}>
                  <Input {...field} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"suffix"}
              render={({ field }) => (
                <FormRender label={"Suffix"}>
                  <SelectInput
                    options={suffixes}
                    field={{ ...field, value: field.value }}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"dob"}
              render={({ field }) => (
                <FormRender label={"DOB"}>
                  <DateInput onChange={field.onChange} value={field.value} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"controlNumber"}
              render={({ field }) => (
                <FormRender label={"Control Number/ID"}>
                  <Input
                    {...field}
                    value={(field.value as string)?.trim()}
                    onInput={(event: ChangeEvent<HTMLInputElement>) => {
                      const inputValue = event.target.value;
                      event.target.value = inputValue.slice(0, 6);
                    }}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"medicareNumber"}
              render={({ field }) => (
                <FormRender label={"Insurance/Patient ID"}>
                  <Input {...field} type="number" />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"notMedicareNumber"}
              render={({ field }) => (
                <FormRender formClassName="self-center">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm">Not Medicare Number</span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"medicaidNumber"}
              render={({ field }) => (
                <FormRender label={"Medicaid Number"}>
                  <Input {...field} type="number" />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"ssn"}
              render={({ field }) => (
                <FormRender
                  label={"SSN"}
                  helperText="Provide the last four digits"
                >
                  <Input
                    {...field}
                    type="number"
                    onInput={(event: ChangeEvent<HTMLInputElement>) => {
                      const inputValue = event.target.value;
                      event.target.value = inputValue.slice(0, 4);
                    }}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"gender"}
              render={({ field }) => (
                <FormRender label={"Gender"}>
                  <SelectInput options={genderOptions} field={field} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"admissionSOC"}
              render={({ field }) => (
                <FormRender label={"Admission (SOC)"}>
                  <DateInput onChange={field.onChange} value={field.value} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"address1"}
              render={({ field }) => (
                <FormRender label={"Address"}>
                  <Input {...field} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"address2"}
              render={({ field }) => (
                <FormRender label={"Address 2"}>
                  <Input {...field} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"country"}
              render={({ field }) => (
                <FormRender label={"Country"}>
                  <SelectInput
                    options={countries}
                    field={{ ...field, value: field?.value }}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"state"}
              render={({ field }) => (
                <FormRender label={"State"}>
                  <SelectInput
                    options={states}
                    field={{ ...field, value: field?.value }}
                    disabled={isEmpty(states)}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"city"}
              render={({ field }) => (
                <FormRender label={"City"}>
                  <SelectInput
                    options={cities}
                    field={{ ...field, value: field?.value }}
                    disabled={isEmpty(cities)}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"zip"}
              render={({ field }) => (
                <FormRender label={"Zip"}>
                  <Input {...field} type="number" />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"county"}
              render={({ field }) => (
                <FormRender label={"County"}>
                  <Input {...field} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"phone"}
              render={({ field }) => (
                <FormRender label={"Phone"}>
                  <Input {...field} type="number" />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"maritalStatus"}
              render={({ field }) => (
                <FormRender label={"Marital Status"}>
                  <SelectInput options={maritalStatusOptions} field={field} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"employmentStatus"}
              render={({ field }) => (
                <FormRender label={"Employment"}>
                  <SelectInput options={employmentStatus} field={field} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"student"}
              render={({ field }) => (
                <FormRender label={"Student"}>
                  <SelectInput options={studentType} field={field} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"admissionSource"}
              render={({ field }) => (
                <FormRender label={"Admission Source"}>
                  <SelectInput options={admissionSource} field={field} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"CBSACode"}
              render={({ field }) => (
                <FormRender label={"CBSA Code"}>
                  <SelectInput options={CBSACode} field={field} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"admissionPriority"}
              render={({ field }) => (
                <FormRender label={"Priority of Admission"}>
                  <SelectInput options={admissionPriority} field={field} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"authorizationNumber"}
              render={({ field }) => (
                <FormRender label={"Authorization Number"}>
                  <Input {...field} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"faceToFace"}
              render={({ field }) => (
                <FormRender label={"Face to face"}>
                  <DateInput onChange={field.onChange} value={field.value} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"physician.id"}
              render={({ field }) => (
                <FormRender label={"MD/DO/NP/CNS/PA"}>
                  <SelectInput
                    options={[
                      ...(meta?.data?.map((item) => ({
                        value: item.id as string,
                        label: getFullName(
                          item?.lastName,
                          item?.firstName,
                          "Name not available",
                        ),
                      })) ?? []),
                      {
                        value: "create-physician",
                        label: "+ Create new physician",
                      },
                    ]}
                    field={{
                      ...field,
                      onChange: (value) => {
                        if (value === "create-physician") {
                          setAction("create-physician");
                        } else {
                          field.onChange(value);
                          const selectedPhysician = meta?.data?.find(
                            (item) => item.id === value,
                          );
                          methods.setValue(
                            "physician.npi",
                            selectedPhysician?.npi,
                          );
                        }
                      },
                    }}
                    placeholder="Select Physician"
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"physician.npi"}
              render={({ field }) => (
                <FormRender label={"NPI"}>
                  <Input
                    {...field}
                    type="number"
                    value={field.value as string}
                    disabled
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"notAPhysician"}
              render={({ field }) => (
                <FormRender formClassName="self-center">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm">Not a Physician</span>
                  </div>
                </FormRender>
              )}
            />
            {methods.watch("notAPhysician") && (
              <>
                <FormField
                  control={methods.control}
                  name={"supervisingPhysician"}
                  render={({ field }) => (
                    <FormRender label={"Supervising Physician"}>
                      <SelectInput
                        options={
                          meta?.data?.map((item) => ({
                            value: item.id,
                            label: getFullName(
                              item?.lastName,
                              item?.firstName,
                              "Name not available",
                            ),
                          })) ?? []
                        }
                        field={{
                          ...field,
                          onChange: (value) => {
                            const selectedPhysician = meta?.data?.find(
                              (item) => item.id === value,
                            );
                            methods.setValue(
                              "supervisingPhysicianNpi",
                              selectedPhysician?.npi,
                            );
                            field.onChange(value);
                          },
                        }}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"supervisingPhysicianNpi"}
                  render={({ field }) => (
                    <FormRender label={"Supervising Physician NPI"}>
                      <Input
                        {...field}
                        type="number"
                        value={field.value as string}
                        disabled
                      />
                    </FormRender>
                  )}
                />
              </>
            )}
            <FormField
              control={methods.control}
              name={"taxonomy"}
              render={({ field }) => (
                <FormRender label={"Taxonomy Type"}>
                  <SelectInput
                    options={taxonomies?.data.map((tax) => ({
                      value: tax.id,
                      label:
                        taxonomy.find((item) => item.value === tax.name)
                          ?.label || "",
                    }))}
                    field={field}
                    searchable
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"taxonomyCode"}
              render={({ field }) => (
                <FormRender label={"Taxonomy Code"}>
                  <SelectInput
                    options={
                      taxonomies?.data
                        .find(
                          (taxonomy) =>
                            taxonomy.id === methods.watch("taxonomy"),
                        )
                        ?.codes.map((code) => ({
                          value: code.id,
                          label:
                            taxonomy
                              .flatMap((item) => item.code)
                              .find((item) => item.value === code.code)
                              ?.label || "",
                        })) ?? []
                    }
                    field={field}
                    searchable
                  />
                </FormRender>
              )}
            />
          </div>
          <FormHeader className="mx-2"> PATIENT CONDITION RELATION</FormHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4 items-end">
            <FormField
              control={methods.control}
              name={"conditionRelation"}
              render={({ field }) => (
                <FormRender label={"Patient Condition related to"}>
                  <MultiSelect
                    options={patientConditionRelatedTo}
                    value={field.value as string[]}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    placeholder="Select Multiple Options"
                  />
                </FormRender>
              )}
            />
            {methods.watch("conditionRelation")?.includes("auto-accident") && (
              <FormField
                control={methods.control}
                name={"autoAccidentState"}
                render={({ field }) => (
                  <FormRender label={"State of Auto Accident"}>
                    <SelectInput
                      options={states}
                      field={field}
                      disabled={isEmpty(states)}
                    />
                  </FormRender>
                )}
              />
            )}
            <FormField
              control={methods.control}
              name={"sharePatient"}
              render={({ field }) => (
                <FormRender formClassName="self-center">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Tooltip
                      trigger={
                        <span className="text-sm">
                          Connect Patient with External ACO
                        </span>
                      }
                    >
                      <div className="text-sm px-3 py-1.5">
                        Share Patient Information with External Contractors
                        (Physicians, Therapy Companies, Social Workers, etc) who
                        you have a contract with.
                      </div>
                    </Tooltip>
                  </div>
                </FormRender>
              )}
            />
          </div>
        </form>
      </Form>
    </>
  );
};

export default ProfileAdmission;
