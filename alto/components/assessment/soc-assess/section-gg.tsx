"use client";
import { QAStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import PromptModal from "@/components/prompt-modal";
import {
  Button,
  Form,
  FormField,
  FormRender,
  RadioInput,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import { HistoryForm } from "@/schema/assessment/pt-visit/history";
import { ObjectData } from "@/types";

const PatientCode = () => (
  <div className="grid gap-5 border p-2 text-sm">
    <p>
      Code the patient's usual performance for each activity using the 6-point
      scale. If activity was not attempted, code the reason. Code the patient's
      discharge goal using the 6-point scale. Use of codes 07, 09,10 or 88 is
      permissible to code discharge goal.
    </p>
    <p>
      Coding: Safety and Quality of Performance - If helper assistance is
      required because patient's performance is unsafe or of poor quality, score
      according to amount of assistance provided. Activity may be completed with
      or without assistive devices.
    </p>
    <p>
      01.Dependant - Helper does ALL of the effort. Patient does none of the
      effort to complete the activity. Or, the assistance of 2 or more helpers
      is required for the patient to complete the activity.
    </p>
    <p>
      02.Substantial/maximal assistance - Helper does MORE THAN HALF the effort.
      Helper lifts or holds trunk or limbs and provides more than half the
      effort.
    </p>
    <p>
      03.Partial/moderate assistance - Helper does LESS THAN HALF the effort.
      Helper lifts, holds or supports trunk or limbs, but provides less than
      half the effort.
    </p>
    <p>
      04.Supervision or touching assistance - Helper provides verbal cues and/or
      touching/steadying and/or contact guard assistance as patient completes
      activity.Assistance may be provided throughout the activity or
      intermittently.
    </p>
    <p>
      05.Setup or clean-up assistance - Helper sets up or cleans up; patient
      completes activity.Helper assists only prior to or following the activity.
    </p>
    <p>
      06.Independent - Patient completes the activity by him/herself with no
      assistance from a helper.
    </p>
    <p className="font-semibold">If activity was not attempted, code reason:</p>
    <p>07.Patient refused</p>
    <p>
      09.Not applicable - Not attempted and the patient did not perform this
      activity prior to the current illness, exacerbation or injury.
    </p>
    <p>
      10.Not attempted due to environmental limitations (e.g., lack of
      equipment, weather constraints)
    </p>
    <p>88.Not attempted due to medical conditions or safety concerns.</p>
  </div>
);

const SectionGG = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: HistoryForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm({
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
        onSubmit={methods.handleSubmit(async (formData) => {
          trigger({
            socAccess: parseData({ ...assessment, sectionGG: formData }),
            patientScheduleId,
            caregiverId: authUser?.id as string,
            id: assessmentId,
          });
        })}
      >
        <div className="p-5">
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
          <div>
            <div>
              <FormHeader className="mt-4">
                GG SECTION - FUNCTIONAL ABILITIES & GOALS
              </FormHeader>
              <div className="grid gap-5">
                <div className="grid gap-5 border p-2 text-sm">
                  <p>
                    (GG0100)Prior Functioning:Everyday Activities:Indicate the
                    patient's usual ability with everyday activities prior to
                    the current illness, exacerbation, or injury.
                  </p>
                  <p>
                    1. Dependent- A helper completed the activities for the
                    patient.
                  </p>
                  <p>
                    2. Needed some help- Patient needed partial assistance from
                    another person to complete activities.
                  </p>
                  <p>
                    3. Independent- Patient completed the activities by
                    him/herself, with or without an assistive device, with no
                    assistance from a helper.
                  </p>
                  <p>8. Unknown</p>
                  <p>9. Not Applicable</p>
                </div>

                {[
                  {
                    title:
                      "A.Self Care: Code the patient's need for assistance with bathing, dressing, using the toilet, or eating prior to the current illness, exacerbation, or injury.",
                    key: "selfCare",
                  },
                  {
                    title:
                      "B.Indoor Mobility(Ambulation): Code the patient's need for assistance with walking from room to room (with or without a device such as cane, crutch or walker) prior to the current illness,exacerbation,or injury.",
                    key: "indoorMobility",
                  },
                  {
                    title:
                      "Stairs: Code the patient's need for assistance with internal or external stairs(with or without a device such as cane,crutch,or walker) prior to the current illness,exacerbation, or injury.",
                    key: "stairs",
                  },
                  {
                    title:
                      "D.Functional Cognition: Code the patient's need for assistance with planning regular tasks,such as shopping or remembering to take medication prior to the current illness,exacerbation,or injury.",
                    key: "functionalCognition",
                  },
                ].map((item) => (
                  <FormField
                    key={item.key}
                    control={methods.control}
                    name={`${item.key}`}
                    render={({ field }) => (
                      <FormRender label={item.title}>
                        <SelectInput
                          allowClear
                          options={[
                            { value: "dependent", label: "Dependent" },
                            {
                              value: "needed-some-help",
                              label: "Needed Some Help",
                            },
                            { value: "independent", label: "Independent" },
                            { value: "unknown", label: "Unknown" },
                            {
                              value: "not-applicable",
                              label: "Not Applicable",
                            },
                            {
                              value: "not-assessed",
                              label: "Not Assessed/no informat",
                            },
                          ]}
                          field={field}
                        />
                      </FormRender>
                    )}
                  />
                ))}
                <FormField
                  control={methods.control}
                  name={`priorDevice`}
                  render={({ field }) => (
                    <FormRender
                      label="(GG0110)Prior Device Use.Indicate devices and aids used by the patient prior to the current illness,exacerbation,or injury."
                      formClassName="mt-5"
                    >
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "manual-wheelchair",
                            label: "Manual wheelchair",
                          },
                          {
                            value: "motorized-wheelchair",
                            label: "Motorized wheelchair and/or scooter",
                          },
                          {
                            value: "mechanical-lift",
                            label: "Mechanical lift",
                          },
                          { value: "walker", label: "Walker" },
                          {
                            value: "orthotics",
                            label: "Orthotics/Prosthetics",
                          },
                          { value: "none", label: "None of the above" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">(GG0130) Self-Care</FormHeader>
              <div className="grid gap-5">
                <PatientCode />
                {[
                  {
                    title:
                      "A.Eating: The ability to use suitable utensils to bring food and/or liquid to the mouth and swallow food and/or liquid once the meal is placed before the patient",
                    key: "eating",
                  },
                  {
                    title:
                      "B.Oral Hygiene: The ability to use suitable items to clean teeth.Dentures(if applicable):The ability to remove and replace dentures from and to the mouth,and manage equipment for soaking and rinsing them.",
                    key: "oralHygiene",
                  },
                  {
                    title:
                      "C.Toileting Hygiene: The ability to maintain perineal hygiene,adjust clothes before and after voiding or having a bowel movement. If managing an ostomy,include wiping the opening but not managing equipment.",
                    key: "toiletingHygiene",
                  },
                  {
                    title:
                      "E.Shower/bathe self: The ability to bathe self,including washing,rinsing, and drying self(excludes washing of back and hair). Does not include transfering in/out of tub/shower.",
                    key: "showerSelf",
                  },
                  {
                    title:
                      "F.Upper body dressing: The ability to dress and undress above the waist;including fasteners,if applicable.",
                    key: "upperBodyDressing",
                  },
                  {
                    title:
                      "G.Lower body dressing: The ability to dress and undress below the waist, including fasteners;does noot include footwear.",
                    key: "lowerBodyDressing",
                  },
                  {
                    title:
                      "H.Putting on/taking off footwear: The ability to put on and take off socks and shoes or other footwear that is appropriate for safe mobility;including fasteners,if applicable.",
                    key: "puttingOn",
                  },
                ].map((item) => (
                  <div key={item.key}>
                    <p className="text-sm font-semibold pb-2">{item.title}</p>
                    <div className="grid lg:grid-cols-2 gap-5">
                      <FormField
                        control={methods.control}
                        name={`${item.key}SocPerformance`}
                        render={({ field }) => (
                          <FormRender
                            label="SOC/ROC Performance"
                            className="!font-normal"
                          >
                            <SelectInput
                              allowClear
                              options={[
                                { label: "Independent", value: "Independent" },
                                {
                                  label: "Setup or clean-up assistance",
                                  value: "clean-up-assistance",
                                },
                                {
                                  label: "Supervision or touching assistance",
                                  value: "touching-assistance",
                                },
                                {
                                  label: "Partial/moderate assistance",
                                  value: "moderate-assistance",
                                },
                                {
                                  label: "Substantial/maximal assistance",
                                  value: "maximal-assistance",
                                },
                                { label: "Dependant", value: "dependant" },
                                {
                                  label: "Patient refused",
                                  value: "patient-refused",
                                },
                                {
                                  label: "Not applicable",
                                  value: "not-applicable",
                                },
                                {
                                  label:
                                    "Not attempted due to environmental limitations",
                                  value: "not-attempted",
                                },
                                {
                                  label:
                                    "Not attempted due to medical conditions or safety concerns",
                                  value: "medical",
                                },
                                {
                                  label: "Not assessed/no information",
                                  value: "not-assessed",
                                },
                              ]}
                              field={field}
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.key}DcGoal`}
                        render={({ field }) => (
                          <FormRender label="DC Goal" className="!font-normal">
                            <SelectInput
                              allowClear
                              options={[
                                { label: "Independent", value: "Independent" },
                                {
                                  label: "Setup or clean-up assistance",
                                  value: "clean-up-assistance",
                                },
                                {
                                  label: "Supervision or touching assistance",
                                  value: "touching-assistance",
                                },
                                {
                                  label: "Partial/moderate assistance",
                                  value: "moderate-assistance",
                                },
                                {
                                  label: "Substantial/maximal assistance",
                                  value: "maximal-assistance",
                                },
                                { label: "Dependant", value: "dependant" },
                                {
                                  label: "Patient refused",
                                  value: "patient-refused",
                                },
                                {
                                  label: "Not applicable",
                                  value: "not-applicable",
                                },
                                {
                                  label:
                                    "Not attempted due to environmental limitations",
                                  value: "not-attempted",
                                },
                                {
                                  label:
                                    "Not attempted due to medical conditions or safety concerns",
                                  value: "medical",
                                },
                                {
                                  label: "Not assessed/no information",
                                  value: "not-assessed",
                                },
                              ]}
                              field={field}
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">(GG0170)MOBILITY</FormHeader>
              <div className="grid gap-5">
                <PatientCode />
                {[
                  {
                    title:
                      "A. Roll left and right: The ability to roll from lying on back to left and right side, and return to lying on back on the bed.",
                    key: "rollLeftRight",
                  },
                  {
                    title:
                      "B. Sit to lying: The ability to move from sitting on side of bed to lying flat on the bed.",
                    key: "sitToLying",
                  },
                  {
                    title:
                      "C. Lying to sitting on side of bed: The ability to move from lying on the back to sitting on the side of the bed with feet flat on the floor,and with no back support.",
                    key: "lyingToSitting",
                  },
                  {
                    title:
                      "D. Sit to stand: The ability to come to a standing position from sitting in a chair,wheelchair,or on the side of the bed.",
                    key: "sitToStand",
                  },
                  {
                    title:
                      "E.Chair/bed-to-chair transfer: The ability to transfer to and from a bed to a chair(or wheelchair).",
                    key: "chairTransfer",
                  },
                  {
                    title:
                      "F.Toilet transfer: The ability to get on and off a toilet or commode.",
                    key: "toiletTransfer",
                  },
                  {
                    title:
                      "G.Car transfer: The ability to transfer in and out of a car or van on the passenger side.Does not include the ability to open/close door or fasten seat belt.",
                    key: "carTransfer",
                  },
                  {
                    title:
                      "I.Walk 10 feet:Once standing,the ability to walk at least 10 feet in a room,corridor,or similar space.",
                    key: "walkTenFeet",
                  },
                  {
                    title:
                      "J.Walk 50 feet with two turns:Once standing,the ability to walk 50 feet and make two turns.",
                    key: "walk50Feet",
                  },
                  {
                    title:
                      "K.Walk 150 feet:Once standing,the ability to walk at least 150 feet in a corridor or similar space..",
                    key: "walk150Feet",
                  },
                  {
                    title:
                      "L.Walking 10 feet on uneven surfaces:The ability to walk 10 feet on uneven or sloping surfaces(indoor or outdoor),such as turf or gravel.",
                    key: "walking10Feet",
                  },
                  {
                    title:
                      "M.1 step(curb):The ability to go up and down a curb and/or up and down one step.",
                    key: "oneStep",
                  },
                  {
                    title:
                      "N.4 steps:The ability to go up and down four steps with or without a rail.",
                    key: "4Steps",
                  },
                  {
                    title:
                      "O.12 steps:The ability to go up and down 12 steps with or without a rail.",
                    key: "12Steps",
                  },
                ].map((item) => (
                  <div key={item.key}>
                    <p className="text-sm font-semibold pb-2">{item.title}</p>
                    <div className="grid lg:grid-cols-2 gap-5">
                      <FormField
                        control={methods.control}
                        name={`${item.key}SocPerformance`}
                        render={({ field }) => (
                          <FormRender
                            label="SOC/ROC Performance"
                            className="!font-normal"
                          >
                            <SelectInput
                              allowClear
                              options={[
                                { label: "Independent", value: "Independent" },
                                {
                                  label: "Setup or clean-up assistance",
                                  value: "clean-up-assistance",
                                },
                                {
                                  label: "Supervision or touching assistance",
                                  value: "touching-assistance",
                                },
                                {
                                  label: "Partial/moderate assistance",
                                  value: "moderate-assistance",
                                },
                                {
                                  label: "Substantial/maximal assistance",
                                  value: "maximal-assistance",
                                },
                                { label: "Dependant", value: "dependant" },
                                {
                                  label: "Patient refused",
                                  value: "patient-refused",
                                },
                                {
                                  label: "Not applicable",
                                  value: "not-applicable",
                                },
                                {
                                  label:
                                    "Not attempted due to environmental limitations",
                                  value: "not-attempted",
                                },
                                {
                                  label:
                                    "Not attempted due to medical conditions or safety concerns",
                                  value: "medical",
                                },
                                {
                                  label: "Not assessed/no information",
                                  value: "not-assessed",
                                },
                              ]}
                              field={field}
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.key}DcGoal`}
                        render={({ field }) => (
                          <FormRender label="DC Goal" className="!font-normal">
                            <SelectInput
                              allowClear
                              options={[
                                { label: "Independent", value: "Independent" },
                                {
                                  label: "Setup or clean-up assistance",
                                  value: "clean-up-assistance",
                                },
                                {
                                  label: "Supervision or touching assistance",
                                  value: "touching-assistance",
                                },
                                {
                                  label: "Partial/moderate assistance",
                                  value: "moderate-assistance",
                                },
                                {
                                  label: "Substantial/maximal assistance",
                                  value: "maximal-assistance",
                                },
                                { label: "Dependant", value: "dependant" },
                                {
                                  label: "Patient refused",
                                  value: "patient-refused",
                                },
                                {
                                  label: "Not applicable",
                                  value: "not-applicable",
                                },
                                {
                                  label:
                                    "Not attempted due to environmental limitations",
                                  value: "not-attempted",
                                },
                                {
                                  label:
                                    "Not attempted due to medical conditions or safety concerns",
                                  value: "medical",
                                },
                                {
                                  label: "Not assessed/no information",
                                  value: "not-assessed",
                                },
                              ]}
                              field={field}
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  </div>
                ))}

                {[
                  {
                    title:
                      "P.Picking up object:The ability to bend/stoop from a standing position to pick up a small object,such as a spoon, from the floor.",
                    subTitle: "Q.Does patient use wheelchair and/or a scooter?",
                    key: "pickingUpObject",
                  },
                  {
                    title:
                      "R.Wheel 50 feet with two turns: Once seated in wheelchair/scooter,the ability to wheel at least 50 feet and make two turns.",
                    subTitle:
                      "RR1/RR3.Indicate the type of wheelchair or scooter used.",
                    key: "wheel50Feet",
                  },
                  {
                    title:
                      "S.Wheel 150 feet: Once seated in wheelchair/scooter,the ability to wheel at least 150 feet in a corridor or similar space.",
                    subTitle:
                      "SS1/SS3.Indicate the type of wheelchair or scooter used.",
                    key: "wheel150Feet",
                  },
                ].map((item) => (
                  <div key={item.key}>
                    <p className="text-sm font-semibold pb-2">{item.title}</p>
                    <div className="grid lg:grid-cols-2 gap-5">
                      <FormField
                        control={methods.control}
                        name={`${item.key}SocPerformance`}
                        render={({ field }) => (
                          <FormRender
                            label="SOC/ROC Performance"
                            className="!font-normal"
                          >
                            <SelectInput
                              allowClear
                              options={[
                                { label: "Independent", value: "Independent" },
                                {
                                  label: "Setup or clean-up assistance",
                                  value: "clean-up-assistance",
                                },
                                {
                                  label: "Supervision or touching assistance",
                                  value: "touching-assistance",
                                },
                                {
                                  label: "Partial/moderate assistance",
                                  value: "moderate-assistance",
                                },
                                {
                                  label: "Substantial/maximal assistance",
                                  value: "maximal-assistance",
                                },
                                { label: "Dependant", value: "dependant" },
                                {
                                  label: "Patient refused",
                                  value: "patient-refused",
                                },
                                {
                                  label: "Not applicable",
                                  value: "not-applicable",
                                },
                                {
                                  label:
                                    "Not attempted due to environmental limitations",
                                  value: "not-attempted",
                                },
                                {
                                  label:
                                    "Not attempted due to medical conditions or safety concerns",
                                  value: "medical",
                                },
                                {
                                  label: "Not assessed/no information",
                                  value: "not-assessed",
                                },
                              ]}
                              field={field}
                            />
                          </FormRender>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name={`${item.key}DcGoal`}
                        render={({ field }) => (
                          <FormRender label="DC Goal" className="!font-normal">
                            <SelectInput
                              allowClear
                              options={[
                                { label: "Independent", value: "Independent" },
                                {
                                  label: "Setup or clean-up assistance",
                                  value: "clean-up-assistance",
                                },
                                {
                                  label: "Supervision or touching assistance",
                                  value: "touching-assistance",
                                },
                                {
                                  label: "Partial/moderate assistance",
                                  value: "moderate-assistance",
                                },
                                {
                                  label: "Substantial/maximal assistance",
                                  value: "maximal-assistance",
                                },
                                { label: "Dependant", value: "dependant" },
                                {
                                  label: "Patient refused",
                                  value: "patient-refused",
                                },
                                {
                                  label: "Not applicable",
                                  value: "not-applicable",
                                },
                                {
                                  label:
                                    "Not attempted due to environmental limitations",
                                  value: "not-attempted",
                                },
                                {
                                  label:
                                    "Not attempted due to medical conditions or safety concerns",
                                  value: "medical",
                                },
                                {
                                  label: "Not assessed/no information",
                                  value: "not-assessed",
                                },
                              ]}
                              field={field}
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                    <FormField
                      control={methods.control}
                      name={`${item.key}Wheelchair`}
                      render={({ field }) => (
                        <FormRender label={item.subTitle} formClassName="mt-5">
                          <RadioInput
                            className="flex-row flex-wrap gap-3 items-start"
                            {...field}
                            value={field.value as string}
                            options={[
                              { value: "manual", label: "Manual" },
                              { value: "motorized", label: "Motorized" },
                              {
                                value: "not-assessed",
                                label: "Not assessed/no information",
                              },
                            ]}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                ))}
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

export default SectionGG;
