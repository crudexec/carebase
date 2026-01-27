"use client";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  sectionGDefaultValue,
  SectionGForm,
  sectionGSchema,
} from "@/schema/assessment/soc-assess/section-g";
import { ObjectData } from "@/types";

const SectionG = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: SectionGForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<SectionGForm>({
    resolver: zodResolver(sectionGSchema),
    defaultValues: sectionGDefaultValue,
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
            socAccess: parseData({ ...assessment, sectionG: formData }),
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
              <FormHeader className="mt-4">FUNCTIONAL STATUS</FormHeader>
              <div className="grid gap-5">
                <FormField
                  control={methods.control}
                  name={"grooming"}
                  render={({ field }) => (
                    <FormRender label="(M1800) Grooming: Current ability to tend safely to personal hygiene needs (specifically: washing face and hands, hair care, shaving or make up, teeth or denture care, or fingernail care)">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "groom-self-unaided",
                            label:
                              "Able to groom self unaided, with or without the use of assistive devices or adapted methods",
                          },
                          {
                            value: "grooming-utensil",
                            label:
                              "Grooming utensils must be placed within reach before able to complete grooming activities",
                          },
                          {
                            value: "assit-patient",
                            label:
                              "Someone must assist the patient to groom self",
                          },
                          {
                            value: "depend-on-someone",
                            label:
                              "Patient depends entirely upon someone else for grooming needs",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"currentAbilityToDressUpperBody"}
                  render={({ field }) => (
                    <FormRender label="(M1810) Current Ability to Dress Upper Body safely (with or without dressing aids) including undergarments, pullovers, front opening shirts and blouses, managing zippers, buttons and snaps">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "dress-without-assistance",
                            label:
                              " Able to get clothes out of closets & drawers, put them on & remove them from the upper body without assistance",
                          },
                          {
                            value: "dress-without-assistance-if",
                            label:
                              "Able to dress upper body without assistance if clothing is laid out or handed to the patient",
                          },
                          {
                            value: "assit-patient",
                            label:
                              "Someone must help the patient put on upper body clothing",
                          },
                          {
                            value: "depend-on-someone",
                            label:
                              " Patient depends entirely upon another person to dress the upper body",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"currentAbilityToDressLowerBody"}
                  render={({ field }) => (
                    <FormRender label="(M1820) Current Ability to Dress Lower Body safely (with or without dressing aids) including undergarments, slacks, socks, or nylons, shoes">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "dress-without-assistance",
                            label:
                              "Able to obtain, put on, & remove clothing & shoes without assistance",
                          },
                          {
                            value: "dress-without-assistance-if",
                            label:
                              "Able to dress lower body without assistance if clothing & shoes are laid out or handed to the patient",
                          },
                          {
                            value: "assit-patient",
                            label:
                              "Someone must help the patient put on undergarments, slacks, socks or nylons, and shoes",
                          },
                          {
                            value: "depend-on-someone",
                            label:
                              "Patient depends entirely upon another person to dress the lower body",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />

                <FormField
                  control={methods.control}
                  name={"bathing"}
                  render={({ field }) => (
                    <FormRender label="(M1830) Bathing: Current ability to wash entire body safely. Excludes grooming (washing face, washing hands, and shampooing hair) ">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "bathe-independently",
                            label:
                              " Able to bathe self in shower or tub independently, including getting in & out of tub/shower",
                          },
                          {
                            value: "use-device",
                            label:
                              "With the use of devices, is able to bathe self in shower or tub independently including getting in and out of the tub/shower",
                          },
                          {
                            value: "assitance-from-person",
                            label:
                              "Able to bathe in shower or tub with the intermittent assistance of another person",
                          },
                          {
                            value: "bathing-self-but-requires-assistance",
                            label:
                              "Able to participate in bathing self in shower or tub, but requires presence of another person throughout the bath for assistance or supervision",
                          },
                          {
                            value:
                              "unable-to-use-shower-tub-but-bathe-independently",
                            label:
                              "Unable to use the shower or tub, but able to bathe self independently with or without the use of devices at the sink, in chair, or on commode",
                          },
                          {
                            value:
                              "unable-to-use-shower-tub-but-bathe-with-assitance",
                            label:
                              "Unable to use the shower or tub, but able to participate in bathing self in bed, at the sink, in bedside chair, or on commode, with the assistance or supervision of another person",
                          },
                          {
                            value: "unable-to-bath",
                            label:
                              "Unable to participate effectively in bathing and is bathed totally by another person",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"toiletTransferring"}
                  render={({ field }) => (
                    <FormRender label="(M1840) Toilet Transferring: Current ability to get to and from the toilet or bedside commode safely and transfer on and off toilet/commode ">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "able-to-use-toilet",
                            label:
                              "Able to get to and from the toilet and transfer independently with or without a device",
                          },
                          {
                            value: "assisted-to-toilet",
                            label:
                              "When reminded, assisted, or supervised by another person, able to get to & from the toilet & transfer",
                          },
                          {
                            value: "unable-to-get-to-tiolet",
                            label:
                              "Unable to get to & from the toilet but is able to use a bedside commode (with or without assistance)",
                          },
                          {
                            value: "depend-on-someone",
                            label:
                              "Unable to get to and from the toilet or beside commode but is able to use a bedpan/urinal independently",
                          },
                          {
                            value: "dependent-in-toileting",
                            label: "Is totally dependent in toileting",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"toiletHygiene"}
                  render={({ field }) => (
                    <FormRender label="(M1845) Toileting Hygiene: Current ability to maintain perineal hygiene safely adjust clothes and/or incontinence pads before and after using toilet, commode, bedpan, urinal. If managing ostomy, includes cleaning area around stoma, but not managing equipment">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "manage-without-assistance",
                            label:
                              "Able to manage toileting hygiene & clothing management w/out assistance",
                          },
                          {
                            value: "manage-without-assistance-if",
                            label:
                              "Able to manage toileting hygiene & clothing management without assistance if supplies/implements are laid out for the patient",
                          },
                          {
                            value: "with-assitance",
                            label:
                              "Someone must help the patient to maintain toileting hygiene and/or adjust clothing",
                          },
                          {
                            value: "depend-on-someone",
                            label:
                              "Patient depends entirely upon another person to maintain toileting hygiene",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"transferring"}
                  render={({ field }) => (
                    <FormRender label="(M1850) Transferring: Current ability to move safely from bed to chair, or ability to turn and position self in bed if patient is bedfast">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "able-to-transfer",
                            label: "Able to independently transfer",
                          },
                          {
                            value: "able-to-transfer-with-minimal-assistance",
                            label:
                              "Able to transfer with minimal human assistance or with use of an assistive device",
                          },
                          {
                            value: "able-to-bear-weight",
                            label:
                              "Able to bear weight and pivot during the transfer process but unable to transfer self",
                          },
                          {
                            value:
                              "unable-to-transfer-when-transfer-by-someone",
                            label:
                              "Unable to transfer self and is unable to bear weight or pivot when transferred by another person",
                          },
                          {
                            value: "unable-to-transfer",
                            label:
                              "Bedfast, unable to transfer but is able to turn and position self in bed",
                          },
                          {
                            value: "unable-to-transfer-turn-position",
                            label:
                              "Bedfast, unable to transfer and is unable to turn and position self",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"locomotion"}
                  render={({ field }) => (
                    <FormRender label="(M1860) Ambulation/Locomotion: Current ability to walk safely, once in a standing position, or use a wheelchair, once in a seated position, on a variety of surfaces">
                      <RadioInput
                        className="flex-row flex-wrap gap-3 items-start"
                        {...field}
                        value={field.value as string}
                        options={[
                          {
                            value: "walk-independently",
                            label:
                              "Able to independently walk on even and uneven surfaces and negotiate stairs with or without railings (specifically: needs no human assistance or assistive device)",
                          },
                          {
                            value: "with-the-use-of-one-hand-device",
                            label:
                              "With the use of a one handed device (for example: cane, single crutch, hemi walker) able to independently walk on even and uneven surfaces and negotiate stairs with or without railings",
                          },
                          {
                            value: "requires-use-of-two-handed-device",
                            label:
                              "Requires use of a two-handed device (for example: walker or crutches) to walk alone on a level surface and/or requires human supervision or assistance to negotiate stairs or steps or uneven surfaces",
                          },
                          {
                            value: "able-to-walk-with-supervision",
                            label:
                              "Able to walk only with the supervision or assistance of another person at all times",
                          },
                          {
                            value: "unable-to-ambulate-able-to-wheel-self",
                            label:
                              "Chairfast, unable to ambulate but is able to wheel self independently",
                          },
                          {
                            value: "unable-to-ambulate-unable-to-wheel-self",
                            label:
                              "Chairfast, unable to ambulate and is unable to wheel self",
                          },
                          {
                            value: "unable-to-ambulate",
                            label:
                              "Bedfast, unable to ambulate or be up in a chair",
                          },
                        ]}
                      />
                    </FormRender>
                  )}
                />
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

export default SectionG;
