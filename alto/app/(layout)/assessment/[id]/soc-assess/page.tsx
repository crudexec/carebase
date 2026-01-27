"use client";
import React from "react";

import AppLoader from "@/components/app-loader";
import {
  SectionA,
  SectionB,
  SectionC,
  SectionD,
  SectionE,
  SectionF,
  SectionG,
  SectionGG,
  SectionH,
  SectionI,
  SectionJ,
  SectionK,
  SectionM,
  SectionN,
  SectionO,
} from "@/components/assessment/soc-assess";
import AddtionalFieldOne from "@/components/assessment/soc-assess/additional-field-one";
import AddtionalFieldTwo from "@/components/assessment/soc-assess/additional-field-two";
import { SNNoteHeader } from "@/components/evv";
import { SegmentedControl, TabsContent } from "@/components/ui";
import {
  useGetPatient,
  useGetScheduleAssessment,
  useQueryParams,
} from "@/hooks";
import { getFullName, modifyDateFields, parseData } from "@/lib";
import { ObjectData, PageProps, PatientResponse } from "@/types";

const tabList = [
  { value: "section-a", label: "Section A" },
  { value: "section-b", label: "Section B" },
  { value: "section-c", label: "Section C" },
  { value: "section-d", label: "Section D" },
  { value: "section-e", label: "Section E" },
  { value: "section-f", label: "Section F" },
  { value: "section-g", label: "Section G" },
  { value: "section-gg", label: "Section GG" },
  { value: "section-h", label: "Section H" },
  { value: "section-i", label: "Section I" },
  { value: "section-j", label: "Section J" },
  { value: "section-k", label: "Section K" },
  { value: "section-m", label: "Section M" },
  { value: "section-n", label: "Section N" },
  { value: "section-o", label: "Section O" },
  { value: "additional-field-1", label: "Additional Field 1" },
  { value: "additional-field-2", label: "Additional Field 2" },
];

const SOCAssess = ({ params: { id } }: PageProps) => {
  const [formTab, setFormTab] = useQueryParams("tab", {
    defaultValue: "section-a",
  });
  const [patient] = useQueryParams("patient", { defaultValue: "" });
  const { data: patientDetails, isLoading: isFetching } = useGetPatient({
    id: patient,
  });
  const { data, isLoading, mutate } = useGetScheduleAssessment({
    patientScheduleId: id as string,
  });
  const [isQA] = useQueryParams("isQA", { defaultValue: "" });

  return (
    <div className="p-5">
      <p className="text-xl font-semibold pb-2">Oasis Assessment</p>
      <SegmentedControl
        data={tabList}
        value={formTab}
        stretch
        onChange={setFormTab}
      >
        <AppLoader loading={isFetching || isLoading} />
        <div className="border p-4 rounded flex flex-col">
          <SNNoteHeader patient={patientDetails?.data as PatientResponse} />
          <TabsContent value="section-a">
            <SectionA
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields({
                ...parseData(data?.data?.socAccess)?.sectionA,
                ...(!data?.data?.id && {
                  ...patientDetails?.data,
                  patientName: getFullName(
                    patientDetails?.data?.lastName,
                    patientDetails?.data?.firstName,
                  ),
                }),
              })}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="section-b">
            <SectionB
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.socAccess)?.sectionB,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="section-c">
            <SectionC
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.socAccess)?.sectionC,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="section-d">
            <SectionD
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.socAccess)?.sectionD,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="section-e">
            <SectionE
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.socAccess)?.sectionE,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="section-f">
            <SectionF
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.socAccess)?.sectionF,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="section-g">
            <SectionG
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.socAccess)?.sectionG,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="section-gg">
            <SectionGG
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.socAccess)?.sectionGG,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="section-h">
            <SectionH
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.socAccess)?.sectionH,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="section-i">
            <SectionI
              patientScheduleId={id}
              mutate={mutate}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)?.sectionI}
              data={modifyDateFields({
                ...parseData(data?.data?.socAccess)?.sectionI,
                diagnosis: parseData(
                  data?.data?.socAccess,
                )?.sectionI?.diagnosis?.map((item: ObjectData) =>
                  modifyDateFields(item),
                ),
              })}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="section-j">
            <SectionJ
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.socAccess)?.sectionJ,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="section-k">
            <SectionK
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.socAccess)?.sectionK,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="section-m">
            <SectionM
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.socAccess)?.sectionM,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="section-n">
            <SectionN
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.socAccess)?.sectionN,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="section-o">
            <SectionO
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.socAccess)?.sectionO,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="additional-field-1">
            <AddtionalFieldOne
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.socAccess)?.additionalFieldOne,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)}
              isQA={isQA}
            />
          </TabsContent>
          <TabsContent value="additional-field-2">
            <AddtionalFieldTwo
              patientScheduleId={id}
              mutate={mutate}
              data={modifyDateFields(
                parseData(data?.data?.socAccess)?.additionalFieldTwo,
              )}
              assessmentId={data?.data?.id as string}
              assessment={parseData(data?.data?.socAccess)}
              visitDate={data?.data?.visitDate as Date}
              timeIn={data?.data?.timeIn as string}
              timeOut={data?.data?.timeOut as string}
              isQA={isQA}
            />
          </TabsContent>
        </div>
      </SegmentedControl>
    </div>
  );
};

export default SOCAssess;
