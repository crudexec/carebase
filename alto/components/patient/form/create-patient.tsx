"use client";
import { Patient, Physician } from "@prisma/client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaArrowRight } from "react-icons/fa";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";

import FormHeader from "@/components/form-header";
import {
  Button,
  Form,
  FormField,
  FormRender,
  Input,
  SelectInput,
} from "@/components/ui";
import { dmeSuppliesOptions } from "@/constants";
import { useCreatePatient, useUpdatePatient } from "@/hooks";
import { getFullName, pickValues } from "@/lib";
import { patientFormSchema } from "@/schema/patient/index";
import { ApiResponse, FormReturn, ISetState } from "@/types";

import CreatePhysician from "../modal/create-physician";
import PatientInformation from "../patient-information";

type formType = FormReturn<typeof patientFormSchema>;

const AddPatient = ({
  refreshTable,
  mode,
  selected,
  setPatientId,
  setTab,
  patientId,
  methods,
}: {
  refreshTable: () => void;
  mode: "create" | "edit" | "view";
  selected?: Patient;
  setPatientId: ISetState<string>;
  patientId: string;
  setTab: ISetState<string>;
  methods: formType;
}) => {
  const { data, trigger, isMutating } = useSWRMutation(
    "/api/patient",
    useCreatePatient,
  );
  const { data: allPatientMeta, mutate: mutatePatientMeta } =
    useSWR<ApiResponse<Physician[]>>(`/api/physician`);
  const [action, setAction] = useState("");

  const {
    data: updateResponse,
    trigger: updatePatient,
    isMutating: isUpdating,
  } = useSWRMutation("/api/patient", useUpdatePatient);
  const refreshData = () => {
    mutatePatientMeta();
    mutate("/api/patient?paginate=false&status=active");
  };

  useEffect(() => {
    if (data?.success || updateResponse?.success) {
      refreshTable();
      refreshData();
      if (mode === "create" && !patientId) {
        setPatientId(data?.data?.id);
        toast.success(`Success|${data?.message}`);
      } else {
        setPatientId(updateResponse?.data?.id);
        toast.success(`Success|${updateResponse?.message}`);
      }
      setTab("medication");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, updateResponse]);

  return (
    <div>
      <CreatePhysician
        mode={"create"}
        title={"Create Physician"}
        open={action === "create-physician"}
        modalClose={() => {
          refreshData();
          setAction("");
        }}
      />
      <Form {...methods}>
        <form
          className="h-[670px] overflow-auto mt-2 justify-between flex flex-col scrollbar-hide"
          onSubmit={methods.handleSubmit(async (data) => {
            const {
              gender,
              maritalStatus,
              employmentStatus,
              student,
              admissionPriority,
              race,
              dmeSupplies,
              physician,
              ...rest
            } = data;
            if (mode === "create" && !patientId) {
              await trigger(
                pickValues({
                  ...data,
                  physician: pickValues(data.physician as Physician),
                }),
              );
            } else {
              await updatePatient({
                ...rest,
                id: (selected?.id as string) || patientId,
                ...pickValues({
                  gender,
                  maritalStatus,
                  employmentStatus,
                  student,
                  admissionPriority,
                  race,
                  dmeSupplies,
                }),
                physician,
              });
            }
          })}
        >
          <>
            <FormHeader className="!mt-4">Patient Information</FormHeader>

            <PatientInformation methods={methods} mode={mode} />
          </>

          <>
            <FormHeader>Physician Information</FormHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4 items-end">
              <FormField
                control={methods.control}
                name={"physician.id"}
                render={({ field }) => (
                  <FormRender label={"Physician"}>
                    <SelectInput
                      options={[
                        ...(allPatientMeta?.data?.map((item) => ({
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
                          }
                        },
                      }}
                      placeholder="Select Physician"
                    />
                  </FormRender>
                )}
              />{" "}
            </div>
          </>

          <>
            <FormHeader>DME</FormHeader>
            <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4 items-center">
              <FormField
                control={methods.control}
                name={"dme"}
                render={({ field }) => (
                  <FormRender label={"DME in Home"}>
                    <Input {...field} disabled={mode === "view"} />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"dmeSupplies"}
                render={({ field }) => (
                  <FormRender label={"DME/Supplies"}>
                    <SelectInput
                      options={dmeSuppliesOptions}
                      field={field}
                      disabled={mode === "view"}
                    />
                  </FormRender>
                )}
              />
            </div>
          </>

          {mode !== "view" && (
            <Button
              rightIcon={<FaArrowRight />}
              type="submit"
              className="md:mx-2 mt-6 py-2 text-white"
              loading={isMutating || isUpdating}
            >
              Save and Continue
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
};

export default AddPatient;
