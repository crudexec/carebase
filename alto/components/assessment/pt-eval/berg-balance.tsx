"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QAStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import PromptModal from "@/components/prompt-modal";
import {
  Button,
  Form,
  FormField,
  FormRender,
  RadioInput,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  bergBalanceDefaultValue,
  BergBalanceForm,
  bergBalanceSchema,
} from "@/schema/assessment/pt-eval/berg-balance";
import { ObjectData } from "@/types";

const BergBalance = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: BergBalanceForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<BergBalanceForm>({
    resolver: zodResolver(bergBalanceSchema),
    defaultValues: bergBalanceDefaultValue,
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
            ptEval: parseData({ assessment, bergBalance: data }),
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
                </Button>{" "}
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
                </Button>{" "}
                <Button
                  className="px-6"
                  variant="destructive"
                  type="button"
                  onClick={() => {
                    setAction("REJECTED");
                  }}
                >
                  Disapprove
                </Button>{" "}
              </>
            )}
          </div>
          <div className="grid gap-5 mt-4">
            <div className="border-b pb-5">
              <div className="text-sm font-semibold pb-2">
                <p>1. SITTING TO STANDING</p>
                <p className="italic pt-1">
                  INSTRUCTIONS: Please stand up. Try not to use your hand for
                  support.
                </p>
              </div>
              <FormField
                control={methods.control}
                name={"sittingToStanding"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "4",
                          label:
                            "(4) able to stand without using hands and stabilize independently",
                        },
                        {
                          value: "3",
                          label: "(3) able to stand independently using hands",
                        },
                        {
                          value: "2",
                          label:
                            "(2) able to stand using hands after several tries",
                        },
                        {
                          value: "1",
                          label: "(1) needs minimal aid to stand or stabilize",
                        },
                        {
                          value: "0",
                          label:
                            "(0) needs moderate or maximal assist to stand",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div className="border-b pb-5">
              <div className="text-sm font-semibold pb-2">
                <p>2. STANDING UNSUPPORTED</p>
                <p className="italic pt-1">
                  INSTRUCTIONS: Please stand for two minutes without holding on.
                </p>
              </div>
              <FormField
                control={methods.control}
                name={"standingUnsupported"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "4",
                          label: "(4) able to stand safely for 2 minutes",
                        },
                        {
                          value: "3",
                          label: "(3) able to stand 2 minutes with supervision",
                        },
                        {
                          value: "2",
                          label: "(2) able to stand 30 seconds unsupported",
                        },
                        {
                          value: "1",
                          label:
                            "(1) needs several tries to stand 30 seconds unsupported",
                        },
                        {
                          value: "0",
                          label: "(0) unable to stand 30 seconds unsupported",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
              <p className="text-sm font-semibold pt-5 text-end">
                NOTE: If a subject is able to stand 2 minutes unsupported, score
                full points for sitting unsupported. Proceed to item #4.
              </p>
            </div>
            <div className="border-b pb-5">
              <div className="text-sm font-semibold pb-2">
                <p>
                  3. SITTING WITH BACK UNSUPPORTED BUT FEET SUPPORTED ON FLOOR
                  OR ON A STOOL
                </p>
                <p className="italic pt-1">
                  INSTRUCTIONS: Please sit with arms folded for 2 minutes.
                </p>
              </div>
              <FormField
                control={methods.control}
                name={"sittingWithBackUnSupported"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "4",
                          label:
                            "(4) able to sit safely and securely for 2 minutes",
                        },
                        {
                          value: "3",
                          label: "(3) able to sit 2 minutes under supervision",
                        },
                        {
                          value: "2",
                          label: "(2) able to able to sit 30 seconds",
                        },
                        { value: "1", label: "(1) able to sit 10 seconds" },
                        {
                          value: "0",
                          label: "(0) unable to sit without support 10 seconds",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div className="border-b pb-5">
              <div className="text-sm font-semibold pb-2">
                <p>4. STANDING TO SITTING</p>
                <p className="italic pt-1">INSTRUCTIONS: Please sit down.</p>
              </div>
              <FormField
                control={methods.control}
                name={"standingToSitting"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "4",
                          label: "(4) sits safely with minimal use of hands",
                        },
                        {
                          value: "3",
                          label: "(3) controls descent by using hands",
                        },
                        {
                          value: "2",
                          label:
                            "(2) uses back of legs against chair to control descent",
                        },
                        {
                          value: "1",
                          label:
                            "(1) sits independently but has uncontrolled descent",
                        },
                        { value: "0", label: "(0) needs assist to sit" },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div className="border-b pb-5">
              <div className="text-sm font-semibold pb-2">
                <p>5.TRANSFERS</p>
                <p className="italic pt-1">
                  INSTRUCTIONS: Arrange chair(s) for pivot transfer. Ask subject
                  to transfer one way toward a seat with armrests and one way
                  toward a seat without armrests. You may use two chairs (one
                  with and one without armrests) or a bed and a chair.
                </p>
              </div>
              <FormField
                control={methods.control}
                name={"transfers"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "4",
                          label:
                            "(4) able to transfer safely with minor use of hands",
                        },
                        {
                          value: "3",
                          label:
                            "(3) able to transfer safely definite need of hands",
                        },
                        {
                          value: "2",
                          label:
                            "(2) able to transfer with verbal cuing and/or supervision",
                        },
                        { value: "1", label: "(1) needs one person to assist" },
                        {
                          value: "0",
                          label:
                            "(0) needs two people to assist or supervise to be safe",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div className="border-b pb-5">
              <div className="text-sm font-semibold pb-2">
                <p>6.STANDING UNSUPPORTED WITH EYES CLOSED</p>
                <p className="italic pt-1">
                  INSTRUCTIONS: Please close your eyes and stand still for 10
                  seconds.
                </p>
              </div>
              <FormField
                control={methods.control}
                name={"standingUnsupportedWithEyeClosed"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "4",
                          label: "(4) able to stand 10 seconds safely",
                        },
                        {
                          value: "3",
                          label:
                            "(3) able to stand 10 seconds with supervision",
                        },
                        { value: "2", label: "(2) able to stand 3 seconds" },
                        {
                          value: "1",
                          label:
                            "(1) unable to keep eyes closed 3 seconds but stays safely",
                        },
                        {
                          value: "0",
                          label: "(0) needs help to keep from falling",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div className="border-b pb-5">
              <div className="text-sm font-semibold pb-2">
                <p>7.STANDING UNSUPPORTED WITH FEET TOGETHER</p>
                <p className="italic pt-1">
                  INSTRUCTIONS: Place your feet together and stand without
                  holding on.
                </p>
              </div>
              <FormField
                control={methods.control}
                name={"standingUnsupportedWithFeetTogether"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "4",
                          label:
                            "(4) able to place feet together independently and stand 1 minute safely",
                        },
                        {
                          value: "3",
                          label:
                            "(3) able to place feet together independently and stand 1 minute with supervision",
                        },
                        {
                          value: "2",
                          label:
                            "(2) able to place feet together independently but unable to hold for 30 seconds",
                        },
                        {
                          value: "1",
                          label:
                            "(1) needs help to attain position but able to stand 15 seconds feet together",
                        },
                        {
                          value: "0",
                          label:
                            "(0) needs help to attain position and unable to hold for 15 seconds",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div className="border-b pb-5">
              <div className="text-sm font-semibold pb-2">
                <p>8.REACHING FORWARD WITH OUTSTRETCHED ARM WHILE STANDING</p>
                <p className="italic pt-1">
                  INSTRUCTIONS: : Lift arm to 90 degrees. Stretch out your
                  fingers and reach forward as far as you can. (Examiner places
                  a ruler at the end of fingertips when arm is at 90 degrees.
                  Fingers should not touch the ruler while reaching forward. The
                  recorded measure is the distance forward that the fingers
                  reach while the subject is in the most forward lean position.
                  When possible, ask subject to use both arms when reaching to
                  avoid rotation of the trunk.)
                </p>
              </div>
              <FormField
                control={methods.control}
                name={"reachingForwardWithOutstretchedArm"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "4",
                          label:
                            "(4) can reach forward confidently 25 cm (10 inches)",
                        },
                        {
                          value: "3",
                          label: "(3) can reach forward 12 cm (5 inches)",
                        },
                        {
                          value: "2",
                          label: "(2) can reach forward 5 cm (2 inches)",
                        },
                        {
                          value: "1",
                          label: "(1) reaches forward but needs supervision",
                        },
                        {
                          value: "0",
                          label:
                            "(0) loses balance while trying/requires external support",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div className="border-b pb-5">
              <div className="text-sm font-semibold pb-2">
                <p>9. PICK UP OBJECT FROM THE FLOOR FROM A STANDING POSITION</p>
                <p className="italic pt-1">INSTRUCTIONS: saveFilterState</p>
              </div>
              <FormField
                control={methods.control}
                name={"pickObjectFromTheFloor"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "4",
                          label:
                            "(4) able to pick up slipper safely and easily",
                        },
                        {
                          value: "3",
                          label:
                            "(3) able to pick up slipper but needs supervision",
                        },
                        {
                          value: "2",
                          label:
                            "(2) unable to pick up but reaches 2-5 cm(1-2 inches) from slipper and keeps balance independently",
                        },
                        {
                          value: "1",
                          label:
                            "(1) unable to pick up and needs supervision while trying",
                        },
                        {
                          value: "0",
                          label:
                            "(0) unable to try/needs assist to keep from losing balance or falling",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div className="border-b pb-5">
              <div className="text-sm font-semibold pb-2">
                <p>
                  10.TURNING TO LOOK BEHIND OVER LEFT AND RIGHT SHOULDERS WHILE
                  STANDING
                </p>
                <p className="italic pt-1">
                  INSTRUCTIONS:Turn to look directly behind you over toward the
                  left shoulder. Repeat to the right. Examiner may pick an
                  object to look at directly behind the subject to encourage a
                  better twist turn.
                </p>
              </div>
              <FormField
                control={methods.control}
                name={"turningToLookBehind"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "4",
                          label:
                            "(4) looks behind from both sides and weight shifts well",
                        },
                        {
                          value: "3",
                          label:
                            "(3) looks behind one side only other side shows less weight shift",
                        },
                        {
                          value: "2",
                          label:
                            "(2) turns sideways only but maintains balance",
                        },
                        {
                          value: "1",
                          label: "(1) needs supervision when turning",
                        },
                        {
                          value: "0",
                          label:
                            "(0) needs assist to keep from losing balance or falling",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div className="border-b pb-5">
              <div className="text-sm font-semibold pb-2">
                <p>11. TURN 360 DEGREES</p>
                <p className="italic pt-1">
                  INSTRUCTIONS:Turn completely around in a full circle. Pause.
                  Then turn a full circle in the other direction.
                </p>
              </div>
              <FormField
                control={methods.control}
                name={"turn360Degree"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "4",
                          label:
                            "(4) able to turn 360 degrees safely in 4 seconds or less",
                        },
                        {
                          value: "3",
                          label:
                            "(3) able to turn 360 degrees safely one side only 4 seconds or less",
                        },
                        {
                          value: "2",
                          label:
                            "(2) able to turn 360 degrees safely but slowly",
                        },
                        {
                          value: "1",
                          label: "(1) needs close supervision or verbal cuing",
                        },
                        {
                          value: "0",
                          label: "(0) needs assistance while turning",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div className="border-b pb-5">
              <div className="text-sm font-semibold pb-2">
                <p>
                  12. PLACE ALTERNATE FOOT ON STEP OR STOOL WHILE STANDING
                  UNSUPPORTED
                </p>
                <p className="italic pt-1">
                  INSTRUCTIONS:Place each foot alternately on the step/stool.
                  Continue until each foot has touch the step/stool four times.
                </p>
              </div>
              <FormField
                control={methods.control}
                name={"placeAlternateStep"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "4",
                          label:
                            "(4) able to stand independently and safely and complete 8 steps in 20 seconds",
                        },
                        {
                          value: "3",
                          label:
                            "(3) able to stand independently and complete 8 steps in > 20 seconds",
                        },
                        {
                          value: "2",
                          label:
                            "(2) able to complete 4 steps without aid with supervision",
                        },
                        {
                          value: "1",
                          label:
                            "(1) able to complete > 2 steps needs minimal assist",
                        },
                        {
                          value: "0",
                          label:
                            "(0) needs assistance to keep from falling/unable to try",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div className="border-b pb-5">
              <div className="text-sm font-semibold pb-2">
                <p>13.STANDING UNSUPPORTED ONE FOOT IN FRONT</p>
                <p className="italic pt-1">
                  INSTRUCTIONS:(DEMONSTRATE TO SUBJECT) Place one foot directly
                  in front of the other. If you feel that you cannot place your
                  foot directly in front, try to step far enough ahead that the
                  heel of your forward foot is ahead of the toes of the other
                  foot. (To score 3 points, the length of the step should exceed
                  the length of the other foot and the width of the stance
                  should approximate the subjectâ€™s normal stride width.)
                </p>
              </div>
              <FormField
                control={methods.control}
                name={"standingUnsupportedOneFoot"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "4",
                          label:
                            "(4) able to place foot tandem independently and hold 30 seconds",
                        },
                        {
                          value: "3",
                          label:
                            "(3) able to place foot ahead independently and hold 30 seconds",
                        },
                        {
                          value: "2",
                          label:
                            "(2) able to take small step independently and hold 30 seconds",
                        },
                        {
                          value: "1",
                          label:
                            "(1) needs help to step but can hold 15 seconds",
                        },
                        {
                          value: "0",
                          label: "(0) loses balance while stepping or standing",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div className="border-b pb-5">
              <div className="text-sm font-semibold pb-2">
                <p>14.STANDING ON ONE LEG</p>
                <p className="italic pt-1">
                  INSTRUCTIONS:Stand on one leg as long as you can without
                  holding on.
                </p>
              </div>
              <FormField
                control={methods.control}
                name={"standingOnOneLeg"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="flex-row flex-wrap gap-3 items-start"
                      {...field}
                      value={field.value as string}
                      options={[
                        {
                          value: "4",
                          label:
                            "(4) able to lift leg independently and hold > 10 seconds",
                        },
                        {
                          value: "3",
                          label:
                            "(3) able to lift leg independently and hold 5-10 seconds",
                        },
                        {
                          value: "2",
                          label:
                            "(2) able to lift leg independently and hold ≥ 3 seconds",
                        },
                        {
                          value: "1",
                          label:
                            "(1) tries to lift leg unable to hold 3 seconds but remains standing independently.",
                        },
                        {
                          value: "0",
                          label:
                            "(0) unable to try of needs assist to prevent fall",
                        },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end text-end mt-2 pb-12 pr-5 gap-2">
          {!isQA ? (
            <>
              <Button className="px-6" loading={isMutating}>
                Save Changes
              </Button>{" "}
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
              </Button>{" "}
              <Button
                className="px-6"
                variant="destructive"
                type="button"
                onClick={() => {
                  setAction("REJECTED");
                }}
              >
                Disapprove
              </Button>{" "}
            </>
          )}
        </div>
      </form>
    </Form>
  );
};

export default BergBalance;
