"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScheduleVisitVerification } from "@prisma/client";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import AppLoader from "@/components/app-loader";
import { Shell } from "@/components/data-table";
import Detail from "@/components/detail";
import FormHeader from "@/components/form-header";
import { Signature } from "@/components/signature";
import { StaticImage } from "@/components/static-image";
import {
  Button,
  Checkbox,
  Form,
  FormField,
  FormRender,
  Input,
  Modal,
  RadioInput,
  Textarea,
} from "@/components/ui";
import {
  useDisclosure,
  useGetSchedule,
  useGetVerificationDetails,
  usePopulateForm,
  useQueryParams,
  useSaveVisitVerification,
} from "@/hooks";
import { formatDate, formatDateTime, getFullName, isTrue } from "@/lib";
import {
  visitVerificationDefaultValue,
  VisitVerificationForm,
  visitVerificationSchema,
} from "@/schema";
import { PageProps } from "@/types";

const VisitVerification = ({ params: { id } }: PageProps) => {
  const { data: patientScheduleData, isLoading: scheduleLoading } =
    useGetSchedule({ id: id });
  const [view] = useQueryParams("view", { defaultValue: false });

  const { opened, onOpen, onClose } = useDisclosure();
  const methods = useForm<VisitVerificationForm>({
    resolver: zodResolver(visitVerificationSchema),
    defaultValues: visitVerificationDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { data, trigger, isMutating } = useSaveVisitVerification();
  const {
    data: verificationData,
    isLoading: loading,
    mutate,
  } = useGetVerificationDetails({
    scheduleId: id as string,
  });
  const [toggleVitalSigns, setToggleVitalSigns] = useState(false);
  usePopulateForm<VisitVerificationForm, ScheduleVisitVerification>(
    methods.reset,
    verificationData?.data?.evv,
  );

  React.useEffect(() => {
    if (data?.success) {
      toast.success(`Success|${data?.message}`);
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Shell>
      <Modal
        title={"Signature"}
        open={opened}
        onClose={onClose}
        className="md:max-w-[600px]"
      >
        <Signature
          refresh={() => mutate()}
          onClose={onClose}
          url="evv/patient-signature"
          uploadData={{
            patientScheduleId: id,
            id: verificationData?.data?.evv?.id,
          }}
          signature={verificationData?.data?.evv?.patientSignature as string}
          mediaId={verificationData?.data?.evv?.mediaId as string}
        />
      </Modal>
      <AppLoader loading={loading || scheduleLoading} />
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit((data) => {
            trigger({
              ...visitVerificationSchema.parse(data),
              patientScheduleId: id,
              id: verificationData?.data?.evv?.id as string,
            });
          })}
        >
          <div>
            <p className="text-3xl pb-2 font-semibold">
              {getFullName(
                patientScheduleData?.data?.patientSchedule?.patient
                  ?.firstName as string,
                patientScheduleData?.data?.patientSchedule?.patient
                  ?.lastName as string,
              )}
            </p>
            <div className="bg-secondary flex flex-col border">
              <div className="border-b p-2">
                <Detail
                  title="PAN"
                  detail={
                    patientScheduleData?.data?.patientSchedule?.patient?.pan
                      ? patientScheduleData?.data?.patientSchedule?.patient?.pan
                      : "-"
                  }
                />
              </div>

              <div className="p-2">
                <div className="flex items-center gap-3">
                  <p className="font-bold">Admit Date:</p>
                  <Link
                    href={`/evv/${patientScheduleData?.data?.patientSchedule?.patient?.id}/admission`}
                    className="cursor-pointer text-primary"
                  >
                    {formatDate(
                      patientScheduleData?.data?.patientSchedule?.patient
                        ?.patientAdmission?.[0]?.createdAt as Date,
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div>
            <FormHeader>Patient Signature</FormHeader>

            <div>
              {verificationData?.data?.evv?.patientSignature && (
                <div>
                  <div className="max-h-[300px] flex items-center justify-start rounded-lg border-border">
                    <StaticImage
                      src={verificationData?.data?.evv?.patientSignature}
                      alt="patient signature"
                      imageClassName={"object-contain"}
                      className="h-[100px] w-[100px]"
                    />
                  </div>
                  <p className="text-sm mt-2">
                    Signed Date:{" "}
                    <span className="font-semibold">
                      {formatDateTime(
                        verificationData?.data?.evv?.signatureDate as Date,
                      )}
                    </span>
                  </p>
                </div>
              )}
              <Button
                type="button"
                onClick={onOpen}
                className="mt-2"
                disabled={isTrue(view)}
              >
                Add Signature
              </Button>
            </div>
          </div>
          <div>
            <FormHeader> Comments</FormHeader>
            <div className="flex flex-col gap-5">
              <FormField
                control={methods.control}
                name={`comment`}
                render={({ field }) => (
                  <FormRender>
                    <Textarea
                      {...field}
                      value={field.value as string}
                      disabled={isTrue(view)}
                    />
                  </FormRender>
                )}
              />
              <div className="flex gap-2 items-center">
                <Checkbox
                  checked={toggleVitalSigns}
                  onCheckedChange={() => {
                    setToggleVitalSigns(!toggleVitalSigns);
                  }}
                  disabled={isTrue(view)}
                />
                <span className="text-sm">Vital Signs</span>
              </div>
            </div>
          </div>
          {toggleVitalSigns && (
            <div>
              <FormHeader>Vital Signs</FormHeader>
              <div className="flex justify-end text-end my-2">
                <Button
                  className="px-6"
                  loading={isMutating}
                  disabled={isTrue(view)}
                >
                  Save Changes{" "}
                </Button>
              </div>
              <div className="grid grid-col-1 lg:grid-cols-2 gap-5 items-start">
                <div className="flex flex-col gap-2 border rounded">
                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"temperature"}
                      render={({ field }) => (
                        <FormRender label={"Temperature"}>
                          <Input
                            {...field}
                            value={field.value as string}
                            disabled={isTrue(view)}
                          />
                        </FormRender>
                      )}
                    />
                    <div className="md:col-span-2">
                      <FormField
                        control={methods.control}
                        name={"temperatureType"}
                        render={({ field }) => (
                          <FormRender>
                            <RadioInput
                              className="flex-row gap-3 items-start"
                              disabled={isTrue(view)}
                              {...field}
                              options={[
                                { value: "ORAL", label: "Oral" },
                                { value: "AUXILLARY", label: "Axillary" },
                                { value: "RECTAL", label: "Rectal" },
                                { value: "TYMPANIC", label: "Tympanic" },
                              ]}
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed gap-5 p-4">
                    <FormField
                      control={methods.control}
                      name={"pulse"}
                      render={({ field }) => (
                        <FormRender label={"Pulse"}>
                          <Input
                            {...field}
                            value={field.value as string}
                            disabled={isTrue(view)}
                          />
                        </FormRender>
                      )}
                    />

                    <div className="flex flex-col md:col-span-2 gap-2">
                      <div className="pb-2 border-b">
                        <FormField
                          control={methods.control}
                          name={"pulseType"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="flex-row gap-3 items-start"
                                {...field}
                                disabled={isTrue(view)}
                                options={[
                                  { value: "RADIAL", label: "Radial" },
                                  { value: "APICAL", label: "Apical" },
                                  { value: "BRACHIAL", label: "Brachial" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>

                      <FormField
                        control={methods.control}
                        name={"pulseTypeRegular"}
                        render={({ field }) => (
                          <FormRender>
                            <RadioInput
                              className="flex-row gap-3 items-start"
                              disabled={isTrue(view)}
                              {...field}
                              options={[
                                { value: "REGULAR", label: "Regular" },
                                { value: "IRREGULAR", label: "Irregular" },
                              ]}
                              id="pulseTypeRegular"
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-col-1 md:grid-cols-3 border border-dashed p-4 items-center  gap-5">
                    <FormField
                      control={methods.control}
                      name={"respiration"}
                      render={({ field }) => (
                        <FormRender label={"Respirations"}>
                          <Input
                            {...field}
                            value={field.value as string}
                            disabled={isTrue(view)}
                          />
                        </FormRender>
                      )}
                    />

                    <div className="md:col-span-2">
                      <FormField
                        control={methods.control}
                        name={"respirationType"}
                        render={({ field }) => (
                          <FormRender>
                            <RadioInput
                              className="flex-row gap-3 items-start"
                              disabled={isTrue(view)}
                              {...field}
                              options={[
                                { value: "REGULAR", label: "Regular" },
                                { value: "IRREGULAR", label: "Irregular" },
                              ]}
                              id="respirationType"
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="px-4 pb-2">
                    <FormField
                      control={methods.control}
                      name={`notes`}
                      render={({ field }) => (
                        <FormRender label={"Notes"}>
                          <Textarea
                            {...field}
                            value={field.value as string}
                            rows={10}
                            disabled={isTrue(view)}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex flex-col gap-5 border border-dashed p-2 rounded">
                    <div>
                      <p className="font-semibold pb-2">Blood Pressure</p>
                      <div className="grid grid-col-1 md:grid-cols-2 items-center gap-5">
                        <FormField
                          control={methods.control}
                          name={"bloodPressureRight"}
                          render={({ field }) => (
                            <FormRender label={"RIGHT"}>
                              <Input
                                {...field}
                                value={field.value as string}
                                placeholder="ex: 160/125"
                                disabled={isTrue(view)}
                              />
                            </FormRender>
                          )}
                        />

                        <FormField
                          control={methods.control}
                          name={"bloodPressureLeft"}
                          render={({ field }) => (
                            <FormRender label={"LEFT"}>
                              <Input
                                {...field}
                                value={field.value as string}
                                placeholder="ex: 160/125"
                                disabled={isTrue(view)}
                              />
                            </FormRender>
                          )}
                        />
                        <FormField
                          control={methods.control}
                          name={"bloodPressureType"}
                          render={({ field }) => (
                            <FormRender>
                              <RadioInput
                                className="gap-5 items-center flex-row"
                                {...field}
                                disabled={isTrue(view)}
                                options={[
                                  { value: "LYING", label: "Lying" },
                                  { value: "STANDING", label: "Standing" },
                                  { value: "SITTING", label: "Sitting" },
                                ]}
                              />
                            </FormRender>
                          )}
                        />
                      </div>
                      <div className="border-b-border border-b mt-4" />
                      <FormField
                        control={methods.control}
                        name={"bloodPressureWeight"}
                        render={({ field }) => (
                          <FormRender label={"Weight"} formClassName="mt-2">
                            <Input
                              {...field}
                              value={field.value as string}
                              disabled={isTrue(view)}
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-5 border mt-2 p-2 rounded">
                    <div className="grid grid-col-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <FormField
                          control={methods.control}
                          name={"painDenied"}
                          render={({ field }) => (
                            <FormRender formClassName="self-center">
                              <div className="flex gap-2 items-center">
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isTrue(view)}
                                />
                                <span className="text-sm">
                                  Patient Denies Pain
                                </span>
                              </div>
                            </FormRender>
                          )}
                        />
                      </div>
                      <FormField
                        control={methods.control}
                        name={"painLocation"}
                        render={({ field }) => (
                          <FormRender label={"Pain Location"}>
                            <Input
                              {...field}
                              value={field.value as string}
                              disabled={
                                methods.watch("painDenied") || isTrue(view)
                              }
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"painIntensity"}
                        render={({ field }) => (
                          <FormRender
                            label={"Pain Intensity"}
                            helperText="scale of 0 to 10"
                          >
                            <Input
                              {...field}
                              value={field.value as string}
                              type="number"
                              disabled={
                                methods.watch("painDenied") || isTrue(view)
                              }
                              placeholder="(0 to 10)"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"painDuration"}
                        render={({ field }) => (
                          <FormRender label={"Pain Duration"}>
                            <Input
                              {...field}
                              value={field.value as string}
                              disabled={
                                methods.watch("painDenied") || isTrue(view)
                              }
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"otherPain"}
                        render={({ field }) => (
                          <FormRender label={"Pain Other"}>
                            <Input
                              {...field}
                              value={field.value as string}
                              disabled={
                                methods.watch("painDenied") || isTrue(view)
                              }
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"painLevel"}
                        render={({ field }) => (
                          <FormRender label={"Patient's acceptable pain level"}>
                            <Input
                              {...field}
                              value={field.value as string}
                              disabled={
                                methods.watch("painDenied") || isTrue(view)
                              }
                              type="number"
                              placeholder="(0 to 10)"
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"medicationTaken"}
                        render={({ field }) => (
                          <FormRender label={"Medication last taken"}>
                            <Input
                              {...field}
                              value={field.value as string}
                              disabled={
                                methods.watch("painDenied") || isTrue(view)
                              }
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"painDescription"}
                        render={({ field }) => (
                          <FormRender label={"Pain Description"}>
                            <Input
                              {...field}
                              value={field.value as string}
                              disabled={
                                methods.watch("painDenied") || isTrue(view)
                              }
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={"painManagement"}
                        render={({ field }) => (
                          <FormRender
                            label={"Other Pain Management Intervention"}
                          >
                            <Input
                              {...field}
                              value={field.value as string}
                              disabled={
                                methods.watch("painDenied") || isTrue(view)
                              }
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end text-end mt-2">
            <Button
              className="px-6"
              loading={isMutating}
              disabled={isTrue(view)}
            >
              Save Changes{" "}
            </Button>
          </div>
        </form>
      </Form>
    </Shell>
  );
};

export default VisitVerification;
