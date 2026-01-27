"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QAStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import AppLoader from "@/components/app-loader";
import FormHeader from "@/components/form-header";
import PromptModal from "@/components/prompt-modal";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Form,
  FormField,
  FormRender,
  Input,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { usePopulateForm, useSaveAssessment } from "@/hooks";
import { useUpdateQAStatus } from "@/hooks/request/assessment";
import { parseData } from "@/lib";
import {
  servicesDefaultValue,
  ServicesForm,
  servicesSchema,
} from "@/schema/assessment/nursing";
import { ObjectData } from "@/types";

const Services = ({
  assessmentId,
  patientScheduleId,
  mutate,
  data,
  assessment,
  isQA,
}: {
  assessmentId?: string;
  data?: ServicesForm;
  mutate: () => void;
  patientScheduleId: string;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const methods = useForm<ServicesForm>({
    resolver: zodResolver(servicesSchema),
    defaultValues: servicesDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { authUser } = useAuth();
  const { trigger, isMutating, data: response } = useSaveAssessment();
  const {
    trigger: updateQAStatus,
    isMutating: updating,
    data: updateresponse,
  } = useUpdateQAStatus();
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

      <AppLoader loading={false} />
      <form
        onSubmit={methods.handleSubmit(async (data) => {
          trigger({
            nursingAssessment: parseData({ ...assessment, services: data }),
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

            <div>
              <FormHeader className="mt-4">DME SUPPLIES</FormHeader>
              <div className="grid gap-5">
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">WOUND CARE:</p>
                  <FormField
                    control={methods.control}
                    name={"woundCare"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "2*2's", label: "2*2's" },
                            { value: "4*4's", label: "4*4's" },
                            { value: "ABD's", label: "ABD's" },
                            {
                              value: "cotton-tipped-applicators",
                              label: "Cotton tipped applicators",
                            },
                            {
                              value: "wound-cleanser",
                              label: "Wound cleanser",
                            },
                            { value: "wound-gel", label: "Wound gel" },
                            { value: "drain-sponges", label: "Drain sponges" },
                          ]}
                          name={"woundCare"}
                        />
                      </FormRender>
                    )}
                  />
                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"woundCareSterile"}
                      render={() => (
                        <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "sterile", label: "Gloves:Sterile" },
                              { value: "non-sterile", label: "Non-sterile" },
                            ]}
                            name={"woundCareSterile"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"woundCareHdydrocolloid"}
                      render={() => (
                        <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "hydrocolloids",
                                label: "Hydrocolloids",
                              },
                              { value: "kerlixsize", label: "Kerlix size" },
                            ]}
                            name={"woundCareHdydrocolloid"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"woundCareOther"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"woundCareSaline"}
                      render={() => (
                        <FormRender formClassName="md:col-span-2 flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "nu-gauze", label: "Nu-gauze" },
                              { value: "saline", label: "Saline" },
                              { value: "tape", label: "Tape" },
                              {
                                value: "transparent-dressings",
                                label: "Transparent dressings",
                              },
                              { value: "other", label: "Other" },
                            ]}
                            name={"woundCareSaline"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherWoundCareSaline"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">IV SUPPLIES:</p>
                  <FormField
                    control={methods.control}
                    name={"ivSupplies"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "IV-start-kit", label: "IV start kit" },
                            { value: "iv-pole", label: "IV pole" },
                            { value: "iv-tubing", label: "IV tubing" },
                            { value: "alcohol-swabs", label: "Alcohol swabs" },
                            {
                              value: "angiocatheter-size",
                              label: "Angiocatheter size",
                            },
                            { value: "tape", label: "Tape" },
                            {
                              value: "extention-tublings",
                              label: "Extention tublings",
                            },
                          ]}
                          name={"ivSupplies"}
                        />
                      </FormRender>
                    )}
                  />
                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"ivSuppliesInjectionCap"}
                      render={() => (
                        <FormRender formClassName="md:col-span-2 flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "injection-caps",
                                label: "Injection caps",
                              },
                              {
                                value: "central-line-dressing",
                                label: "Central line dressing",
                              },
                              {
                                value: "infusion-pump",
                                label: "Infusion-pump",
                              },
                              {
                                value: "batteries-size",
                                label: "Batteries size",
                              },
                            ]}
                            name={"ivSuppliesInjectionCap"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"ivSuppliesInjectionCapDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="grid grid-col-1 md:grid-cols-2 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"syringesSize"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Syringes size</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"syringesSizeDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"otherIVSupplies"}
                    render={({ field }) => (
                      <FormRender label="Other">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">URINARY/OSTOMY:</p>

                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"urinary"}
                      render={() => (
                        <FormRender formClassName="md:col-span-2 flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "underpads", label: "Underpads" },
                              {
                                value: "external-catheters",
                                label: "External catheters",
                              },
                              {
                                value: "urinary-bag",
                                label: "Urinary bag/pouch",
                              },
                              { value: "ostomy-pouch", label: "Ostomy pouch" },
                            ]}
                            name={"urinary"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"urinarySize"}
                      render={({ field }) => (
                        <FormRender label="Size">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"ostomyWafer"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Ostomy wafer(brandsize)
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"ostomyWaferDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"urinary"}
                      render={() => (
                        <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "stoma-adhesive-tape",
                                label: "Stoma adhesive tape",
                              },
                              {
                                value: "skin-protectant",
                                label: "Skin protectant",
                              },
                            ]}
                            name={"urinary"}
                          />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"otherUrinaryOstomy"}
                    render={({ field }) => (
                      <FormRender label="Other">
                        <Textarea {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">FOLEY SUPPLIES:</p>
                  <FormField
                    control={methods.control}
                    name={"foleySupplies"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "catheter-kit",
                              label: "Catheter kit(try,bag,foley)",
                            },
                            {
                              value: "straight-catheer",
                              label: "Straight catheer",
                            },
                            {
                              value: "irrigation-tray",
                              label: "Irrigation tray",
                            },
                            { value: "saline", label: "Saline" },
                            { value: "acetic-acid", label: "Acetic acid" },
                            { value: "other", label: "Other" },
                          ]}
                          name={"foleySupplies"}
                        />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">DIABETIC:</p>
                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"diabetic"}
                      render={() => (
                        <FormRender formClassName="md:col-span-2 flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "chemstrips", label: "Chemstrips" },
                              { value: "syringes", label: "Syringes" },
                              { value: "other", label: "Other" },
                            ]}
                            name={"diabetes"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherDiabetic"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">MISCELLANEOUS:</p>
                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"miscellaneous"}
                      render={() => (
                        <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "enema-supplies",
                                label: "Enema supplies",
                              },
                              {
                                value: "feeding-tube:",
                                label: "Feeding tube:",
                              },
                            ]}
                            name={"miscellaneous"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"miscellaneousType"}
                      render={({ field }) => (
                        <FormRender label="Type">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"miscellaneousSize"}
                      render={({ field }) => (
                        <FormRender label="Size">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"miscellaneousRemovalKit"}
                      render={() => (
                        <FormRender formClassName="md:col-span-2 flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "suture-removal-kit ",
                                label: "Suture removal Kit ",
                              },
                              {
                                value: "staple-removal-kit",
                                label: "Staple removal Kit",
                              },
                              { value: "steri-strips", label: "Steri strips" },
                              { value: "other", label: "Other" },
                            ]}
                            name={"miscellaneousRemovalKit"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherMiscellaneousRemovalKit"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">SUPPLIES/EQUIPMENT:</p>

                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"equipment"}
                      render={() => (
                        <FormRender formClassName="md:col-span-2 flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "bathbench", label: "Bathbench" },
                              { value: "cane", label: "Cane" },
                              { value: "commode", label: "Commode" },
                              {
                                value: "special-mattress-overlay",
                                label: "Special mattress overlay",
                              },
                            ]}
                            name={"equipment"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"equipmentDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"relievingDevice"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Pressure relieving device
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"eggcrateEquipment"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            { value: "eggcrate", label: "Eggcrate" },
                            { value: "hospital-bed", label: "Hospital bed" },
                            { value: "hoyer-lift", label: "Hoyer lift" },
                            {
                              value: "enteral-feeding-pump",
                              label: "Enteral feeding pump",
                            },
                            { value: "nebulizer", label: "Nebulizer" },
                            {
                              value: "oxygen-concentrator",
                              label: "Oxygen concentrator",
                            },
                          ]}
                          name={"eggcrateEquipment"}
                        />
                      </FormRender>
                    )}
                  />
                  <div className="grid grid-col-1 md:grid-cols-3 items-center border border-dashed p-4 gap-5">
                    <FormField
                      control={methods.control}
                      name={"suppliesEquipment"}
                      render={() => (
                        <FormRender formClassName="md:col-span-2 flex flex-wrap items-center gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "suction-machine",
                                label: "Suction machine",
                              },
                              { value: "ventilator", label: "Ventilator" },
                              { value: "walker", label: "Walker" },
                              { value: "wheelchair", label: "Wheelchair" },
                              { value: "tens-unit", label: "Tens unit" },
                              { value: "other", label: "Other" },
                            ]}
                            name={"suppliesEquipment"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherSuppliesEquipment"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <FormHeader className="mt-4">PROFESSIONAL SERVICES</FormHeader>
              <div className="grid gap-5">
                <p className="text-sm font-semibold">
                  Complete this section only when 485/POC is completed
                </p>
                <FormField
                  control={methods.control}
                  name={"professionalServicesEmergency"}
                  render={({ field }) => (
                    <FormRender label="Emergency">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <p className="text-sm font-semibold">
                  Check and specify patient Specific order for POC
                </p>
                <div className="grid md:grid-cols-2 gap-5 items-center border border-dashed p-4">
                  <FormField
                    control={methods.control}
                    name={"dnr"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            DNR- Do Not Resuscitate(must have MD order)
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"snFrequency"}
                    render={({ field }) => (
                      <FormRender label="SN - FREQUENCY/DURATION">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-5 items-center border border-dashed p-4">
                  <FormField
                    control={methods.control}
                    name={"isSkilledObservation"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Skilled observation for
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"skilledObservationDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"functionalLimits"}
                  render={() => (
                    <FormRender formClassName="flex flex-wrap gap-5 !space-y-0">
                      <CheckboxGroup
                        methods={methods}
                        options={[
                          {
                            value: "cardiopulmonary-status",
                            label: "Evaluate Cardiopulmonary Status",
                          },
                          {
                            value: "nutrition-hydration",
                            label: "Evaluate Nutrition/Hydration/Elimination",
                          },
                          {
                            value: "infection",
                            label: "Evaluate for S/S of Infections",
                          },
                          {
                            value: "disease-process",
                            label: "Teach Disease Process",
                          },
                          { value: "teach-diet", label: "Teach Diet" },
                          {
                            value: "teach-safety",
                            label: "Teach Home Safety/Falls Prevention",
                          },
                        ]}
                        name={"functionalLimits"}
                      />
                    </FormRender>
                  )}
                />
                <div className="grid md:grid-cols-2 gap-5 items-center border border-dashed p-4">
                  <FormField
                    control={methods.control}
                    name={"isOtherFunctionalLimit"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Other</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"otherFunctionalLimitDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                  <FormField
                    control={methods.control}
                    name={"isPrnVisit"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">PRN Visits for</span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"prnVisitDetails"}
                    render={({ field }) => (
                      <FormRender>
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name={"PsychiatricNursing"}
                  render={({ field }) => (
                    <FormRender label="Psychiatric Nursing for">
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">MEDICATIONS</p>
                  <div className="grid md:grid-cols-3 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"medications"}
                      render={() => (
                        <FormRender formClassName="md:col-span-2 flex flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "medication-teaching",
                                label: "Medication Teaching",
                              },
                              {
                                value: "evaluate-med-effects",
                                label:
                                  "Evaluate Med Effects/Compliance Set up Meds Every",
                              },
                            ]}
                            name={"medications"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"medicationDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <div className="flex-1">
                              <Input {...field} value={field.value as string} />
                            </div>

                            <p className="text-sm font-semibold">Weeks</p>
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isAdministerMedication"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Administer
                              medication(s)(name,dose,route,frequency)
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"administerMedicationDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">GASTROINTESTINAL</p>
                  <div className="grid md:grid-cols-3 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"gastrintestinal"}
                      render={() => (
                        <FormRender formClassName="md:col-span-2 flex flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "tube-feeding",
                                label: "Teach N/G Tube Feeding ",
                              },
                              {
                                value: "feeding",
                                label: "Teach G-Tube Feeding",
                              },
                              { value: "other", label: "Other" },
                            ]}
                            name={"gastrintestinal"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherGastrintestinal"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">DIABETES</p>
                  <div className="grid md:grid-cols-3 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"diabetes"}
                      render={() => (
                        <FormRender formClassName="md:col-span-2 flex flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "Administer-Insuling",
                                label: "Administer Insuling",
                              },
                              {
                                value: "insulin-syringes",
                                label: "Prepare Insulin Syringes",
                              },
                              {
                                value: "glucose-monitoring",
                                label: "Blood Glucose Monitoring PRN ",
                              },
                              {
                                value: "teach-diabetic-care",
                                label: "Teach Diabetic Care",
                              },
                              { value: "other", label: "Other" },
                            ]}
                            name={"diabetes"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherDiabetes"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">MATERNAL/CHILD</p>
                  <div className="grid md:grid-cols-3 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"maternal"}
                      render={() => (
                        <FormRender formClassName="md:col-span-2 flex flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "evaluate-feta",
                                label: "Evaluate Feta/Maternal Status ",
                              },
                              {
                                value: "evaluate-growth",
                                label: "Evaluate Growth and Development ",
                              },
                              {
                                value: "evaluate-parenting",
                                label: "Evaluate Parenting",
                              },
                              {
                                value: "teach-pertern",
                                label: "Teach S/S of Pretern Labor",
                              },
                              {
                                value: "teach-growth",
                                label: "Teach Growth and Development",
                              },
                              {
                                value: "teach-apnea",
                                label: "Teach Apnea Monitor Use",
                              },
                              { value: "other", label: "Other" },
                            ]}
                            name={"maternal"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherMaternal"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">LABORATORY</p>
                  <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isVenipuncture"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Venipuncture for</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"venipunctureFor"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"isOtherLaboratory"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Other</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherLaboratoryDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">PT-FREQUENCY/DURATION</p>
                  <FormField
                    control={methods.control}
                    name={"ptFrequency"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "evaluation-treatment",
                              label: "Evaluation and Treatment",
                            },
                            {
                              value: "pulse-oximetry",
                              label: "Pulse Oximetry PRN",
                            },
                          ]}
                          name={"ptFrequency"}
                        />
                      </FormRender>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isPtFrequencyAdministerMedication"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Administer
                              medication(s)(name,dose,route,frequency)
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"ptFrequencyAdministerMedicationDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">IV</p>
                  <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isIvAdministerMedication"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Administer
                              medication(s)(name,dose,route,frequency)
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"ivAdministerMedicationDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isTeachIvAdminister"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Teach IV Administration
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"teachIvAdministerDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">
                    FLUSHING PROTOCOL/FREQUENCY(specify)
                  </p>
                  <div className="grid md:grid-cols-2 gap-5 items-center">
                    <FormField
                      control={methods.control}
                      name={"administerFlush"}
                      render={({ field }) => (
                        <FormRender label="Administer Flush(es)">
                          <div className="flex gap-2 items-center">
                            <div className="flex-1">
                              <Input {...field} value={field.value as string} />
                            </div>

                            <p className="text-sm font-semibold">ml</p>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"normalSaline"}
                      render={({ field }) => (
                        <FormRender label="normal saline:">
                          <div className="flex gap-2 items-center">
                            <div className="flex-1">
                              <Input {...field} value={field.value as string} />
                            </div>

                            <p className="text-sm font-semibold">ml</p>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"sterileWater"}
                      render={({ field }) => (
                        <FormRender label="sterile water:">
                          <div className="flex gap-2 items-center">
                            <div className="flex-1">
                              <Input {...field} value={field.value as string} />
                            </div>

                            <p className="text-sm font-semibold">unit/ml</p>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"heparin"}
                      render={({ field }) => (
                        <FormRender label="Heparin:">
                          <div className="flex gap-2 items-center">
                            <div className="flex-1">
                              <Input {...field} value={field.value as string} />
                            </div>

                            <p className="text-sm font-semibold">unit/ml</p>
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"flushingProtocolTeach"}
                    render={() => (
                      <FormRender formClassName=" flex flex-wrap gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "iv-complications",
                              label: "Teach S/S of IV Complications",
                            },
                            { value: "site-care", label: "Teach IV Site Care" },
                            {
                              value: "infusion-pump",
                              label: "Teach Infusion Pump",
                            },
                            {
                              value: "paternal-nutrition",
                              label: "Teach Complete paternal Nutrition",
                            },
                          ]}
                          name={"flushingProtocolTeach"}
                        />
                      </FormRender>
                    )}
                  />
                  <div className="grid md:grid-cols-3 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"flushingProtocolCare"}
                      render={() => (
                        <FormRender formClassName=" flex flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "site-care",
                                label: "Site Care(specify)",
                              },
                              {
                                value: "line-protocol",
                                label: "Line Protocol(specify)",
                              },
                            ]}
                            name={"flushingProtocolCare"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"flushingProtocolCareDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"isHomeSafety"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Home Safety/falls prevention
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"flushingProtocolTherapy"}
                    render={() => (
                      <FormRender formClassName=" flex flex-wrap gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "therapeutic-exercise",
                              label: "therapeutic exercise",
                            },
                            {
                              value: "transfer-training",
                              label: "Transfer training ",
                            },
                            { value: "gait-training", label: "Gait training" },
                            {
                              value: "establish-home",
                              label: "Establish home exercise program",
                            },
                          ]}
                          name={"flushingProtocolTherapy"}
                        />
                      </FormRender>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isFlushingProtocolModality"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Modality(specify frequency,duration,(amount))
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"flushingProtocolModalityDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"flushingProtocolProsthetic"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "prosthetic-training",
                              label: "Prosthetic Training",
                            },
                            {
                              value: "muscle-re-education",
                              label: "Muscle Re-Education",
                            },
                            { value: "other", label: "Other" },
                          ]}
                          name={"flushingProtocolProsthetic"}
                        />
                      </FormRender>
                    )}
                  />
                </div>

                <div className="grid gap-5">
                  <p className="text-sm font-semibold">QT-FREQUENCY/DURATION</p>
                  <FormField
                    control={methods.control}
                    name={"qtFrequencyDuration"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "evaluation-treatment",
                              label: "Evaluation and treatment",
                            },
                            {
                              value: "pulse-oximetry",
                              label: "Pulse Oximetry PRN",
                            },
                            {
                              value: "home-safety",
                              label: "Home safety/falls prevention",
                            },
                            {
                              value: "adaptive-equipment",
                              label: "Adaptive equipment",
                            },
                            {
                              value: "therapeutic-exercise",
                              label: "Therapeutic exercise",
                            },
                            {
                              value: "muscle-re-education",
                              label: "Muscles Re-education",
                            },
                            {
                              value: "establish-home",
                              label: "Establish Home exercise program",
                            },
                            { value: "homemaker", label: "Homemaker training" },
                          ]}
                          name={"qtFrequencyDuration"}
                        />
                      </FormRender>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isQtFrequencyDurationModality"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Modality(specify frequency,duration,(amount))
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"qtFrequencyDurationModalityDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isOtherQtFrequencyDuration"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Other</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherQtFrequencyDurationDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"prnVisitsForIvComplications"}
                    render={({ field }) => (
                      <FormRender label="PRN visits for IV complications">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isAnaphylaxisProtocol"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Anaphylaxis Protocol(specify orders)
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"anaphylaxisProtocolDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">RESPIRATORY</p>
                  <div className="grid md:grid-cols-3 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isO2Respratory"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">O2 at</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"o2RespratoryDetails"}
                      render={({ field }) => (
                        <FormRender label=".">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"respiratoryLitterPer"}
                      render={({ field }) => (
                        <FormRender label="litters per">
                          <div className="flex gap-2 items-center">
                            <div className="flex-1">
                              <Input {...field} value={field.value as string} />
                            </div>

                            <p className="text-sm font-semibold">minute</p>
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"respiratory"}
                      render={() => (
                        <FormRender formClassName="md:col-span-2 flex flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "every-visit",
                                label: "Pulse Oximetry:Every Visit",
                              },
                              {
                                value: "prn-dyspnea",
                                label: "Pulse Oximetry:PRN Dyspnea",
                              },
                              {
                                value: "teach-oxygen",
                                label: "Teach Oxygen Use/Precautions",
                              },
                              {
                                value: "teach-trach",
                                label: "Teach Trach Care",
                              },
                              {
                                value: "administer-trash",
                                label: "Administer Trach Care",
                              },
                              { value: "other", label: "Other" },
                            ]}
                            name={"respiratory"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherRespiratoryDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">INTEGUMENTARY</p>
                  <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isIntegumentaryWoundCare"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Wound care(specify each site)
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"integumentaryWoundCareDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"integumentary"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "evaluate-wound",
                              label: "Evaluate Wound/Decub for Healings",
                            },
                            {
                              value: "measure-wound",
                              label: "Measure Wound(s) Weekly",
                            },
                            {
                              value: "teach-wound",
                              label: "Teach Wound Care/Dressings",
                            },
                          ]}
                          name={"integumentary"}
                        />
                      </FormRender>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"otherIntegumentary"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Other</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherIntegumentaryDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">ELIMINATION</p>
                  <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isFoley"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Foley</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"foleyDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"frenchInflatedBalloon"}
                      render={({ field }) => (
                        <FormRender label="French inflated balloon with">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"mlChangedEvery"}
                      render={({ field }) => (
                        <FormRender label="ml changed every">
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isSuprapubicCath"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Suprapubic Cath Insertion every
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"suprapubicCathDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"isIndwellingCatheter"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Teach Care of Indwelling Catheter
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"eliminationTeach"}
                      render={() => (
                        <FormRender formClassName="md:col-span-2 flex flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              { value: "self-cath", label: "Teach Self-Cath" },
                              {
                                value: "ostomy-care",
                                label: "Teach Ostomy Care",
                              },
                              {
                                value: "bowel-regime",
                                label: "Teach Bowel Regime",
                              },
                              { value: "other", label: "Other" },
                            ]}
                            name={"eliminationTeach"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"eliminationTeachDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"stFrequency"}
                    render={({ field }) => (
                      <FormRender label="ST-FREQUENCY/DURATION:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"eliminationFrequencyTreatment"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "evaluation-treatment",
                              label: "Evaluation and treatment",
                            },
                            {
                              value: "voice-disorder",
                              label: "Voice disorder treatment",
                            },
                            {
                              value: "speech-articulation",
                              label: "Speech articulation disorder treatment",
                            },
                            {
                              value: "dysphagia-treatment",
                              label: "Dysphagia treatment",
                            },
                          ]}
                          name={"eliminationFrequencyTreatment"}
                        />
                      </FormRender>
                    )}
                  />
                  <div className="grid md:grid-cols-3 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"eliminationFrequencySkills"}
                      render={() => (
                        <FormRender formClassName="md:col-span-2 flex flex-wrap gap-5 !space-y-0">
                          <CheckboxGroup
                            methods={methods}
                            options={[
                              {
                                value: "bowel-regime",
                                label: "Receptive skills",
                              },
                              {
                                value: "bowel-regime",
                                label: "Expressive skills",
                              },
                              {
                                value: "bowel-regime",
                                label: "Cognitive skills ",
                              },
                              { value: "other", label: "Other" },
                            ]}
                            name={"eliminationFrequencySkills"}
                          />
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"eliminationFrequencySkillsDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Input {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"homeHealthAide"}
                    render={({ field }) => (
                      <FormRender label="HOME HEALTH AIDE-FREQUENCY/DURATION:">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"isPersonalCareHHA"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            Personal care for ADL assistance
                          </span>
                        </div>
                      </FormRender>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isOtherHomeHealthAide"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              Other(specify task for HHA)
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherHomeHealthAideDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"otherServices"}
                    render={({ field }) => (
                      <FormRender label="OTHER SERVICES(specify)FREQUENCY/DURATION">
                        <Input {...field} value={field.value as string} />
                      </FormRender>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isOtherHomemaking"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Homemaking Other</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherHomemakingDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isMswFrequency"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">
                              MSW-FREQUENCY/DURATION
                            </span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"mswFrequencyDetails"}
                      render={({ field }) => (
                        <FormRender>
                          <Textarea {...field} value={field.value as string} />
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"otherServicesEvaluated"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={[
                            {
                              value: "evaluate-treat",
                              label: "Evaluate and treat",
                            },
                            {
                              value: "family-situation",
                              label: "Evaluate family situation",
                            },
                            {
                              value: "community-resources",
                              label: "Evaluate/refer to community resources",
                            },
                            {
                              value: "financial-status",
                              label: "Evaluate financial status",
                            },
                          ]}
                          name={"otherServicesEvaluated"}
                        />
                      </FormRender>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-5 border items-center border-dashed p-4">
                    <FormField
                      control={methods.control}
                      name={"isOtherElimination"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm">Other</span>
                          </div>
                        </FormRender>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name={"otherEliminationDetails"}
                      render={({ field }) => (
                        <FormRender>
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

export default Services;
