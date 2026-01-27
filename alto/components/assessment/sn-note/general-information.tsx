"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Patient } from "@prisma/client";
import React from "react";
import { useForm } from "react-hook-form";

import FormHeader from "@/components/form-header";
import {
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  RadioInput,
} from "@/components/ui";
import { genderOptions } from "@/constants";
import { usePopulateForm } from "@/hooks";
import { patientDefaultValue, PatientForm, patientFormSchema } from "@/schema";
import { PatientResponse } from "@/types";

const GeneralInformation = ({ data }: { data?: PatientResponse }) => {
  const methods = useForm({
    resolver: zodResolver(patientFormSchema),
    defaultValues: patientDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  usePopulateForm<PatientForm, Patient>(methods.reset, data as PatientResponse);

  return (
    <Form {...methods}>
      <form>
        <div className="p-5">
          <div>
            <FormHeader className="mt-4">PATIENT INFORMATIONS</FormHeader>
            <div className="grid lg:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"firstName"}
                render={({ field }) => (
                  <FormRender label="First Name:">
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"middleInitial"}
                render={({ field }) => (
                  <FormRender label="Middle Name:">
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"lastName"}
                render={({ field }) => (
                  <FormRender label="Last Name:">
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={`dob`}
                render={({ field }) => (
                  <FormRender label="DOB">
                    <DateInput
                      {...field}
                      value={field.value as Date}
                      disabled
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"gender"}
                render={({ field }) => (
                  <FormRender label="Gender">
                    <RadioInput
                      disabled
                      className="flex-row gap-3 items-start"
                      {...field}
                      options={genderOptions}
                    />
                  </FormRender>
                )}
              />
              <div>
                <p>Admission:</p>
                <DateInput
                  onChange={() => null}
                  value={data?.patientAdmission?.[0]?.createdAt as Date}
                  disabled
                />
              </div>

              <FormField
                control={methods.control}
                name={"patientNo"}
                render={({ field }) => (
                  <FormRender label="Patient ID:">
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"controlNumber"}
                render={({ field }) => (
                  <FormRender label="Control Number:">
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"address1"}
                render={({ field }) => (
                  <FormRender label="Address:">
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"address2"}
                render={({ field }) => (
                  <FormRender label="Address 2:">
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"city"}
                render={({ field }) => (
                  <FormRender label="City:">
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"state"}
                render={({ field }) => (
                  <FormRender label="State:">
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"zip"}
                render={({ field }) => (
                  <FormRender label="Zip Code:">
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"phone"}
                render={({ field }) => (
                  <FormRender label="Phone:">
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
            </div>
          </div>
          <div>
            <FormHeader className="mt-4">PHYSICIAN INFORMATION</FormHeader>
            <div className="grid lg:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"physician.firstName"}
                render={({ field }) => (
                  <FormRender label="First Name:">
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"physician.lastName"}
                render={({ field }) => (
                  <FormRender label="Last Name:">
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"physician.npi"}
                render={({ field }) => (
                  <FormRender label={"NPI:"}>
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"physician.upin"}
                render={({ field }) => (
                  <FormRender label={"UPIN:"}>
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"physician.phone"}
                render={({ field }) => (
                  <FormRender label={"Phone:"}>
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"physician.fax"}
                render={({ field }) => (
                  <FormRender label={"Fax:"}>
                    <Input {...field} value={field.value as string} disabled />
                  </FormRender>
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default GeneralInformation;
