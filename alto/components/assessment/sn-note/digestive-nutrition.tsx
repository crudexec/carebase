"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { QAStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import ColostomyImage from "@/assets/images/colostomy.jpg";
import GastroIntestinalImage from "@/assets/images/gastro-intestinal.jpg";
import IleostomyImage from "@/assets/images/ileostomy.jpg";
import OstomyImage from "@/assets/images/ostomy.jpg";
import FormHeader from "@/components/form-header";
import PromptModal from "@/components/prompt-modal";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  digestiveNutritionDefaultValue,
  DigestiveNutritionForm,
  digestiveNutritionSchema,
} from "@/schema/assessment/sn-visit/digestive-nutrition";
import { ObjectData } from "@/types";

import SNImage from "./sn-image";

const DigestiveNutrition = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: DigestiveNutritionForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<DigestiveNutritionForm>({
    resolver: zodResolver(digestiveNutritionSchema),
    defaultValues: digestiveNutritionDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const { authUser } = useAuth();
  const { trigger, isMutating, data: response } = useSaveAssessment();
  const [action, setAction] = useState<QAStatus>();
  const [qaComment, setQaComment] = useState("");

  usePopulateForm(methods.reset, data);

  useEffect(() => {
    if (response?.success) {
      toast.success("Details saved successfully!");
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const {
    trigger: updateQAStatus,
    isMutating: updating,
    data: updateresponse,
  } = useUpdateQAStatus();

  useEffect(() => {
    if (updateresponse?.success) {
      toast.success(updateresponse?.message);
      mutate();
      setAction(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateresponse]);

  const updateStatus = async (status: QAStatus) => {
    await updateQAStatus({
      status,
      id: assessmentId as string,
      qaComment,
    });
  };

  return (
    <Form {...methods}>
      <PromptModal
        title={action === "APPROVED" ? "Approve" : "Disapprove"}
        variant={action === "APPROVED" ? "default" : "destructive"}
        open={!!action}
        onClose={() => setAction(undefined)}
        callback={async () => {
          updateStatus(action as QAStatus);
        }}
        loading={updating}
      >
        <div className="mb-5">
          <p className="mb-4  font-semibold">QA Comment</p>
          <Textarea
            value={qaComment}
            onChange={(e) => setQaComment(e.target.value)}
            placeholder="Add QA comments"
            rows={5}
          />
        </div>
      </PromptModal>

      <form
        onSubmit={methods.handleSubmit(async (data) => {
          trigger({
            snVisit: parseData({ ...assessment, digestiveNutrition: data }),
            patientScheduleId,
            caregiverId: authUser?.id as string,
            id: assessmentId,
          });
        })}
      >
        <div className="p-5">
          <div>
            <div className="flex justify-end text-end mt-2 gap-2">
              {!isQA ? (
                <>
                  <Button className="px-6" loading={isMutating}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="px-6"
                    type="button"
                    onClick={() => {
                      setAction("APPROVED");
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    className="px-6"
                    variant="destructive"
                    type="button"
                    onClick={() => {
                      setAction("REJECTED");
                    }}
                  >
                    Disapprove
                  </Button>
                </>
              )}
            </div>
            <div className="flex justify-center lg:justify-between flex-wrap gap-5 items-center">
              <SNImage
                title="GASTRO INTESTINAL"
                image={GastroIntestinalImage}
              />
              <SNImage title="OSTOMY" image={OstomyImage} />
              <SNImage title="COLOSTOMY" image={ColostomyImage} />
              <SNImage title="ILEOSTOMY" image={IleostomyImage} />
            </div>
            <div>
              <FormHeader className="mt-4">GASTRO INTESTINAL</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"gastroIntestinal"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap gap-5 !space-y-0 border p-2 border-dashed">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "appetite-decreased",
                            label: "Appetite Decreased",
                          },
                          { value: "constipation", label: "Constipation" },
                          { value: "chronic", label: "Chronic" },
                          { value: "acute", label: "Acute" },
                          {
                            value: "incontinent-feces",
                            label: "Incontinent Feces",
                          },
                          { value: "occasional", label: "Occasional" },
                          { value: "nausea", label: "Nausea" },
                          { value: "vomiting", label: "Vomiting" },
                          { value: "diarrhea", label: "Diarrhea" },
                          { value: "dysphagia", label: "Dysphagia" },
                          { value: "reflux", label: "Reflux / Indigestion" },
                        ]}
                        name={"gastroIntestinal"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid gap-5 border border-dashed p-2">
                  <FormField
                    control={methods.control}
                    name={"abdomen"}
                    render={() => (
                      <FormRender
                        label="Abdomen"
                        formClassName="flex flex-wrap gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "soft", label: "Soft" },
                            { value: "distended", label: "Distended" },
                            { value: "firm", label: "Firm" },
                            {
                              value: "abdominal-pain",
                              label: "Abdominal Pain",
                            },
                          ]}
                          name={"abdomen"}
                        />
                      </FormRender>
                    )}
                  />
                  <div className="grid lg:grid-cols-2 gap-5">
                    <FormField
                      control={methods.control}
                      name={"abdominalGrith"}
                      render={({ field }) => (
                        <FormRender label="Abdominal Girth:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherAbdomen"}
                      render={({ field }) => (
                        <FormRender label="Other:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-5 border border-dashed p-2">
                  <div className="grid lg:grid-cols-2 gap-5 items-center">
                    <FormField
                      control={methods.control}
                      name={"isBowelSound"}
                      render={({ field }) => (
                        <FormRender formClassName="mt-4">
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Bowel Sounds Present all 4 Quads:
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"bowelSound"}
                      render={({ field }) => (
                        <FormRender label="Bowel Sound:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"abnormalStool"}
                    render={() => (
                      <FormRender
                        label="Abnormal Stool:"
                        formClassName="flex flex-wrap gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "grey", label: "Grey" },
                            { value: "tarry", label: "Tarry" },
                            { value: "fresh-blood", label: "Fresh Blood" },
                            { value: "black", label: "Black" },
                            { value: "hemroids", label: "Hemroids" },
                            { value: "internal", label: "Internal" },
                            { value: "external", label: "External" },
                            { value: "lax", label: "Lax/Enema" },
                          ]}
                          name={"abnormalStool"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid lg:grid-cols-2 gap-5 border border-dashed p-2">
                  <FormField
                    control={methods.control}
                    name={`lastBM`}
                    render={({ field }) => (
                      <FormRender label="Last BM">
                        <DateInput {...field} value={field.value as Date} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"weightLoss"}
                    render={({ field }) => (
                      <FormRender label="Weight Loss/Gain:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`dietCompliance`}
                    render={({ field }) => (
                      <FormRender label={"Type of Wound"}>
                        <SelectInput
                          options={[
                            { value: "YES", label: "Yes" },
                            { value: "NO", label: "No" },
                          ]}
                          field={field}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"dietType"}
                    render={({ field }) => (
                      <FormRender label="Diet Type:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"dietInadequate"}
                    render={({ field }) => (
                      <FormRender label="Diet Inadiquate:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"tubeFeeding"}
                    render={({ field }) => (
                      <FormRender label="Tube Feeding:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid gap-5 border border-dashed p-2">
                  <FormField
                    control={methods.control}
                    name={"ostomy"}
                    render={() => (
                      <FormRender
                        label="Ostomy Care"
                        formClassName="flex items-center flex-wrap gap-5 !space-y-0"
                      >
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "ostomy-care", label: "Ostomy Care" },
                            { value: "taught", label: "Taught" },
                            { value: "performed", label: "Performed" },
                            { value: "other", label: "Other" },
                          ]}
                          name={"ostomy"}
                        />
                      </FormRender>
                    )}
                  />
                  {methods.watch("ostomy")?.includes("other") && (
                    <FormField
                      control={methods.control}
                      name={"otherOstomy"}
                      render={({ field }) => (
                        <FormRender label={"Other"}>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  )}
                  <div className="grid lg:grid-cols-2 gap-5">
                    <FormField
                      control={methods.control}
                      name={"stomaAppearance"}
                      render={({ field }) => (
                        <FormRender label="Stoma Appearance:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"stoolAppearance"}
                      render={({ field }) => (
                        <FormRender label="Stool Appearance:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"surroundingSkin"}
                      render={({ field }) => (
                        <FormRender label="Surrounding skin:">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end text-end mt-2 pb-12 pr-5 gap-2">
          {!isQA ? (
            <>
              <Button className="px-6" loading={isMutating}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                className="px-6"
                type="button"
                onClick={() => {
                  setAction("APPROVED");
                }}
              >
                Approve
              </Button>
              <Button
                className="px-6"
                variant="destructive"
                type="button"
                onClick={() => {
                  setAction("REJECTED");
                }}
              >
                Disapprove
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
};

export default DigestiveNutrition;
