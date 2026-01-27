import { zodResolver } from "@hookform/resolvers/zod";
import {
  DischargeSummary,
  DischargeSummaryType,
  PatientDiscipline,
} from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import AppLoader from "@/components/app-loader";
import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
} from "@/components/ui";
import {
  useDisclosure,
  useGetDischargeSummary,
  useGetDiscipline,
  usePopulateForm,
  useSaveDiscipline,
} from "@/hooks";
import { modifyDateFields } from "@/lib";
import {
  disciplineDefaultValue,
  DisciplineForm,
  disciplineSchema,
} from "@/schema";
import { PatientResponse } from "@/types";

import { DischargeSummaryModal } from "../modal";

const Discipline = ({ patient }: { patient?: PatientResponse }) => {
  const patientId = patient?.id;
  const { opened, onOpen, onClose } = useDisclosure();
  const [type, setType] = useState<DischargeSummaryType>();
  const methods = useForm<DisciplineForm>({
    resolver: zodResolver(disciplineSchema),
    defaultValues: disciplineDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { data, isLoading, mutate } = useGetDiscipline({ id: patientId });
  const {
    data: snData,
    isLoading: loadingData,
    mutate: mutateSN,
  } = useGetDischargeSummary({ patientId, type: DischargeSummaryType.SN });
  const {
    data: ptData,
    isLoading: loadingPTData,
    mutate: mutatePT,
  } = useGetDischargeSummary({ patientId, type: DischargeSummaryType.PT });
  const {
    data: otData,
    isLoading: loadingOTData,
    mutate: mutateOT,
  } = useGetDischargeSummary({ patientId, type: DischargeSummaryType.OT });
  const {
    data: stData,
    isLoading: loadingSTData,
    mutate: mutateST,
  } = useGetDischargeSummary({ patientId, type: DischargeSummaryType.ST });
  const {
    data: otherData,
    isLoading: loadingOtherData,
    mutate: mutateOther,
  } = useGetDischargeSummary({ patientId, type: DischargeSummaryType.OTHER });
  const { data: saveResponse, trigger } = useSaveDiscipline();

  const handleSubmit = () => {
    trigger({
      ...methods.getValues(),
      patientId,
      id: data?.data?.discipline?.id as string,
      SNDischargeDate: methods.watch("SNDischargeDate") ?? null,
      PTDischargeDate: methods.watch("PTDischargeDate") ?? null,
      OTDischargeDate: methods.watch("OTDischargeDate") ?? null,
      STDischargeDate: methods.watch("STDischargeDate") ?? null,
      MSWDischargeDate: methods.watch("MSWDischargeDate") ?? null,
      HHADischargeDate: methods.watch("HHADischargeDate") ?? null,
      OTHERDischargeDate: methods.watch("OTHERDischargeDate") ?? null,
    });
  };

  useEffect(() => {
    if (saveResponse?.success) {
      mutate();
    }
  }, [mutate, saveResponse]);

  usePopulateForm<DisciplineForm, PatientDiscipline>(
    methods.reset,
    data?.data?.discipline as PatientDiscipline,
  );

  const getSummaryData = () => {
    switch (type) {
      case DischargeSummaryType.SN:
        return {
          summary: modifyDateFields(snData?.data ?? {}),
          dischargeDate: data?.data?.discipline?.SNDischargeDate,
        };
      case DischargeSummaryType.PT:
        return {
          summary: modifyDateFields(ptData?.data ?? {}),
          dischargeDate: data?.data?.discipline?.PTDischargeDate,
        };
      case DischargeSummaryType.OT:
        return {
          summary: modifyDateFields(otData?.data ?? {}),
          dischargeDate: data?.data?.discipline?.OTDischargeDate,
        };
      case DischargeSummaryType.ST:
        return {
          summary: modifyDateFields(stData?.data ?? {}),
          dischargeDate: data?.data?.discipline?.STDischargeDate,
        };
      case DischargeSummaryType.OTHER:
        return {
          summary: modifyDateFields(otherData?.data ?? {}),
          dischargeDate: data?.data?.discipline?.OTHERDischargeDate,
        };
      default:
        return {
          summary: modifyDateFields(otherData?.data ?? {}),
          dischargeDate: data?.data?.discipline?.OTHERDischargeDate,
        };
    }
  };
  return (
    <div>
      <DischargeSummaryModal
        type={type}
        open={opened}
        modalClose={() => {
          setType(undefined);
          onClose();
        }}
        refresh={() => {
          mutateSN();
          mutatePT();
          mutateOT();
          mutateST();
          mutateOther();
        }}
        dischargeSummaryData={getSummaryData().summary as DischargeSummary}
        patient={patient}
        dischargeDate={getSummaryData().dischargeDate as Date}
      />
      <AppLoader
        loading={
          isLoading ||
          loadingData ||
          loadingOTData ||
          loadingPTData ||
          loadingSTData ||
          loadingOtherData
        }
      />
      <Form {...methods}>
        <form>
          <FormHeader> Disciplines</FormHeader>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 border border-primary rounded-md p-2">
              <FormField
                control={methods.control}
                name={"SN"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          handleSubmit();
                        }}
                      />
                      <span className="text-sm">SN</span>
                    </div>
                  </FormRender>
                )}
              />
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Discharge Date:</p>
                <div className="flex-1">
                  <FormField
                    control={methods.control}
                    name={"SNDischargeDate"}
                    render={({ field }) => (
                      <FormRender>
                        <DateInput
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            handleSubmit();
                          }}
                          value={field.value as Date}
                          disabled={!methods.watch("SN")}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-medium"> Comment:</p>
                <div className="flex-1">
                  <FormField
                    control={methods.control}
                    name={"SNDischargeComment"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <Input
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            handleSubmit();
                          }}
                          value={field.value as string}
                          disabled={!methods.watch("SN")}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <Button
                variant={"ghost"}
                type="button"
                className="!border-primary !text-primary disabled:!text-inherit"
                disabled={
                  !methods.watch("SN") || !methods.watch("SNDischargeDate")
                }
                onClick={() => {
                  onOpen();
                  setType("SN");
                }}
              >
                {`${snData?.data?.id ? "Open" : "Add"} SN Discharge Summary`}
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-6 border border-primary rounded-md p-2">
              <FormField
                control={methods.control}
                name={"PT"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          handleSubmit();
                        }}
                      />
                      <span className="text-sm">PT</span>
                    </div>
                  </FormRender>
                )}
              />
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Discharge Date:</p>
                <div className="flex-1">
                  <FormField
                    control={methods.control}
                    name={"PTDischargeDate"}
                    render={({ field }) => (
                      <FormRender>
                        <DateInput
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            handleSubmit();
                          }}
                          value={field.value as Date}
                          disabled={!methods.watch("PT")}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-medium"> Comment:</p>
                <div className="flex-1">
                  <FormField
                    control={methods.control}
                    name={"PTDischargeComment"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <Input
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            handleSubmit();
                          }}
                          value={field.value as string}
                          disabled={!methods.watch("PT")}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <Button
                variant={"ghost"}
                type="button"
                className="!border-primary !text-primary disabled:!text-inherit "
                disabled={
                  !methods.watch("PT") || !methods.watch("PTDischargeDate")
                }
                onClick={() => {
                  onOpen();
                  setType("PT");
                }}
              >
                {`${ptData?.data?.id ? "Open" : "Add"} PT Discharge Summary`}
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-6 border border-primary rounded-md p-2">
              <FormField
                control={methods.control}
                name={"OT"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          handleSubmit();
                        }}
                      />
                      <span className="text-sm">OT</span>
                    </div>
                  </FormRender>
                )}
              />
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Discharge Date:</p>
                <div className="flex-1">
                  <FormField
                    control={methods.control}
                    name={"OTDischargeDate"}
                    render={({ field }) => (
                      <FormRender>
                        <DateInput
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            handleSubmit();
                          }}
                          value={field.value as Date}
                          disabled={!methods.watch("OT")}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-medium"> Comment:</p>
                <div className="flex-1">
                  <FormField
                    control={methods.control}
                    name={"OTDischargeComment"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <Input
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            handleSubmit();
                          }}
                          value={field.value as string}
                          disabled={!methods.watch("OT")}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <Button
                variant={"ghost"}
                type="button"
                className="!border-primary !text-primary disabled:!text-inherit "
                disabled={
                  !methods.watch("OT") || !methods.watch("OTDischargeDate")
                }
                onClick={() => {
                  onOpen();
                  setType("OT");
                }}
              >
                {`${otData?.data?.id ? "Open" : "Add"} OT Discharge Summary`}
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-6 border border-primary rounded-md p-2">
              <FormField
                control={methods.control}
                name={"ST"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          handleSubmit();
                        }}
                      />
                      <span className="text-sm">ST</span>
                    </div>
                  </FormRender>
                )}
              />
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Discharge Date:</p>
                <div className="flex-1">
                  <FormField
                    control={methods.control}
                    name={"STDischargeDate"}
                    render={({ field }) => (
                      <FormRender>
                        <DateInput
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            handleSubmit();
                          }}
                          value={field.value as Date}
                          disabled={!methods.watch("ST")}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-medium"> Comment:</p>
                <div className="flex-1">
                  <FormField
                    control={methods.control}
                    name={"STDischargeComment"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <Input
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            handleSubmit();
                          }}
                          value={field.value as string}
                          disabled={!methods.watch("ST")}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <Button
                variant={"ghost"}
                type="button"
                className="!border-primary !text-primary disabled:!text-inherit "
                disabled={
                  !methods.watch("ST") || !methods.watch("STDischargeDate")
                }
                onClick={() => {
                  onOpen();
                  setType("ST");
                }}
              >
                {`${stData?.data?.id ? "Open" : "Add"} ST Discharge Summary`}
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-6 border border-primary rounded-md p-2">
              <FormField
                control={methods.control}
                name={"MSW"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          handleSubmit();
                        }}
                      />
                      <span className="text-sm">MSW</span>
                    </div>
                  </FormRender>
                )}
              />
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Discharge Date:</p>
                <div className="flex-1">
                  <FormField
                    control={methods.control}
                    name={"MSWDischargeDate"}
                    render={({ field }) => (
                      <FormRender>
                        <DateInput
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            handleSubmit();
                          }}
                          value={field.value as Date}
                          disabled={!methods.watch("MSW")}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-medium"> Comment:</p>
                <div className="flex-1">
                  <FormField
                    control={methods.control}
                    name={"MSWDischargeComment"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <Input
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            handleSubmit();
                          }}
                          value={field.value as string}
                          disabled={!methods.watch("MSW")}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-6 border border-primary rounded-md p-2">
              <FormField
                control={methods.control}
                name={"HHA"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          handleSubmit();
                        }}
                      />
                      <span className="text-sm">HHA</span>
                    </div>
                  </FormRender>
                )}
              />
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Discharge Date:</p>
                <div className="flex-1">
                  <FormField
                    control={methods.control}
                    name={"HHADischargeDate"}
                    render={({ field }) => (
                      <FormRender>
                        <DateInput
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            handleSubmit();
                          }}
                          value={field.value as Date}
                          disabled={!methods.watch("HHA")}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-medium"> Comment:</p>
                <div className="flex-1">
                  <FormField
                    control={methods.control}
                    name={"HHADischargeComment"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <Input
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            handleSubmit();
                          }}
                          value={field.value as string}
                          disabled={!methods.watch("HHA")}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-6 border border-primary rounded-md p-2">
              <FormField
                control={methods.control}
                name={"OTHER"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          handleSubmit();
                        }}
                      />
                      <span className="text-sm">Other</span>
                    </div>
                  </FormRender>
                )}
              />
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Discharge Date:</p>
                <div className="flex-1">
                  <FormField
                    control={methods.control}
                    name={"OTHERDischargeDate"}
                    render={({ field }) => (
                      <FormRender>
                        <DateInput
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            handleSubmit();
                          }}
                          value={field.value as Date}
                          disabled={!methods.watch("OTHER")}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-medium"> Comment:</p>
                <div className="flex-1">
                  <FormField
                    control={methods.control}
                    name={"OTHERDischargeComment"}
                    render={({ field }) => (
                      <FormRender formClassName="md:col-span-2">
                        <Input
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            handleSubmit();
                          }}
                          value={field.value as string}
                          disabled={!methods.watch("OTHER")}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>

              <Button
                variant={"ghost"}
                type="button"
                className="!border-primary !text-primary disabled:!text-inherit "
                disabled={
                  !methods.watch("OTHER") ||
                  !methods.watch("OTHERDischargeDate")
                }
                onClick={() => {
                  onOpen();
                  setType("OTHER");
                }}
              >
                {`${otherData?.data?.id ? "Open" : "Add"} Other Discharge Summary`}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Discipline;
