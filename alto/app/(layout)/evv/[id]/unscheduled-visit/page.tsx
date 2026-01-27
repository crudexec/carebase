"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { UnscheduledVisit } from "@prisma/client";
import { Pencil2Icon, PlusIcon } from "@radix-ui/react-icons";
import { CheckCircle2Icon } from "lucide-react";
import { useRouter } from "next-nprogress-bar";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FcAlarmClock } from "react-icons/fc";
import { TiMediaStopOutline } from "react-icons/ti";

import AppLoader from "@/components/app-loader";
import Detail from "@/components/detail";
import { AssessmentModal, MissedNotes } from "@/components/evv";
import CreateSNNotePrompt from "@/components/evv/modal/sn-note-prompt";
import { Signature } from "@/components/signature";
import { StaticImage } from "@/components/static-image";
import {
  Alert,
  Button,
  Form,
  FormField,
  FormRender,
  Input,
  Modal,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
  useDisclosure,
  useGetPatient,
  useGetUnScheduledVisitDetailsById,
  usePopulateForm,
  useSaveUnscheduledVisitDetails,
} from "@/hooks";
import { formatDate, formatDateTime, getFullName } from "@/lib";
import {
  unscheduledVisitDefaultValue,
  UnscheduledVisitForm,
  unscheduledVisitSchema,
} from "@/schema";
import { PageProps } from "@/types";

const UnscheduledVisitPage = ({
  searchParams: { create },
  params: { id },
}: PageProps) => {
  const {
    data: details,
    isLoading: loading,
    mutate,
  } = useGetUnScheduledVisitDetailsById({ id: create ? "" : id });
  const { data, isLoading } = useGetPatient({
    id: create ? id : (details?.data?.patientId as string),
  });
  const {
    data: response,
    isMutating,
    trigger,
  } = useSaveUnscheduledVisitDetails();

  const { opened, onClose } = useDisclosure();
  const {
    opened: opened2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  const {
    opened: opened3,
    onOpen: onOpen3,
    onClose: onClose3,
  } = useDisclosure();
  const {
    opened: opened4,
    onOpen: onOpen4,
    onClose: onClose4,
  } = useDisclosure();
  const {
    opened: opened5,
    onOpen: onOpen5,
    onClose: onClose5,
  } = useDisclosure();
  const [updateNoteType, setUpdateNoteType] = useState("");
  const [action, setAction] = React.useState<string>("");
  const { authUser } = useAuth();
  const router = useRouter();

  const methods = useForm<UnscheduledVisitForm>({
    resolver: zodResolver(unscheduledVisitSchema),
    defaultValues: unscheduledVisitDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const [signatureType, setSignatureType] = React.useState<
    "patient" | "caregiver"
  >("patient");
  usePopulateForm<UnscheduledVisitForm, UnscheduledVisit>(
    methods.reset,
    details?.data,
  );

  useEffect(() => {
    if (response?.success) {
      if (!updateNoteType) {
        mutate();
        onClose3();
        onClose4();
        toast.success(`Success|${response?.message}`);
      }
      if (create) {
        router.push(`/evv/${response?.data?.id}/unscheduled-visit`);
      }
      if (updateNoteType) {
        if (updateNoteType === "poc") {
          router.push(
            `/evv/${response?.data?.id}/unscheduled-visit/sn-note?type=poc`,
          );
        } else {
          router.push(`/evv/${response?.data?.id}/unscheduled-visit/sn-note`);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response, updateNoteType]);

  const locationMessage = (
    <div>
      Distance from current location to expected service location could not be
      calculated. If you continue, this visit will appear in CareConnect
      Conflicts for administrative review.
      <p className="mt-2">
        Are you sure you want to {action === "start" ? "start" : "end"} this
        visit now?
      </p>
    </div>
  );

  const signatureMessage = (
    <div>
      {!details?.data?.patientSignatureUrl &&
      !details?.data?.patientSignatureUrl
        ? "Patient and caregiver signature is missing."
        : !details?.data?.patientSignatureUrl
          ? "Patient signature is missing."
          : "Caregiver signature is missing."}
      <p className="mt-2">
        Would you like to go back and sign the document or continue?
      </p>
    </div>
  );

  return (
    <div>
      <Alert
        title="Warning: Location not available"
        description={locationMessage}
        variant={"default"}
        open={opened3}
        onClose={onClose3}
        callback={async () => {
          if (action === "start") {
            await trigger({
              startTime: new Date(),
              patientId: id,
              id: details?.data?.id,
              caregiverId: authUser?.id,
            });
          } else {
            await trigger({
              endTime: new Date(),
              patientId: id,
              id: details?.data?.id,
              caregiverId: authUser?.id,
            });
          }
        }}
        loading={isMutating}
      />
      <Alert
        title="Warning: Signature"
        description={signatureMessage}
        variant={"default"}
        open={opened4}
        onClose={onClose4}
        callback={onOpen3}
        loading={false}
      />
      <AppLoader loading={isLoading || loading} />
      <Modal
        title={"Signature"}
        open={opened2}
        onClose={onClose2}
        className="md:max-w-[600px]"
      >
        <Signature
          refresh={() => mutate()}
          onClose={onClose2}
          signature={
            (signatureType === "caregiver"
              ? details?.data?.caregiverSignatureUrl
              : details?.data?.patientSignatureUrl) as string
          }
          mediaId={
            (signatureType === "caregiver"
              ? details?.data?.caregiverMediaId
              : details?.data?.patientMediaId) as string
          }
          uploadData={{
            patientId: id,
            id: details?.data?.id,
            type: signatureType,
          }}
          url="evv/unscheduled-visit/signature"
        />
      </Modal>
      <AssessmentModal
        action={action}
        setAction={setAction}
        patientId={id}
        data={details?.data}
        mutate={mutate}
      />
      <MissedNotes
        title="Missed Visit Note"
        open={opened}
        modalClose={onClose}
      />
      <CreateSNNotePrompt
        open={opened5}
        onClose={onClose5}
        patientId={id}
        caregiverId={authUser?.id as string}
        unscheduledVisitId={details?.data?.id}
        setUpdateNoteType={setUpdateNoteType}
        updateNoteType={updateNoteType}
        isMutating={isMutating}
        trigger={trigger}
      />

      <Form {...methods}>
        <form
          className="flex flex-col gap-5 scrollbar-hide p-4"
          onSubmit={methods.handleSubmit(async (formData) => {
            await trigger({
              ...formData,
              patientId: id,
              id: details?.data?.id,
              caregiverId: authUser?.id,
            });
          })}
        >
          <div>
            <p className="text-2xl font-semibold pb-2">
              {getFullName(data?.data?.firstName, data?.data?.lastName)}
            </p>
            <div className="bg-secondary border grid grid-col-1 md:grid-cols-2 p-2 gap-3">
              <Detail title="PAN" detail={data?.data?.pan ?? "-"} />
              <Detail title="DNR" detail={data?.data?.dnr ?? "-"} />
              <Detail
                title="Admit Date"
                detail={formatDate(
                  data?.data?.patientAdmission?.[0]?.createdAt as Date,
                )}
              />
              <Detail
                title="Allergies"
                detail={data?.data?.patientMedication?.allergies ?? "-"}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-5">
            {details?.data?.startTime && details?.data?.endTime ? (
              <Button
                className="w-full py-8 text-xl"
                type="button"
                disabled
                leftIcon={<CheckCircle2Icon className="text-xl" />}
              >
                Visit Completed
              </Button>
            ) : (
              <>
                <Button
                  className="w-full py-8 text-xl"
                  type="button"
                  disabled={!!details?.data?.startTime}
                  onClick={() => {
                    setAction("start");
                    onOpen3();
                  }}
                  leftIcon={<FcAlarmClock className="text-lg" />}
                >
                  Start Visit
                </Button>
                <Button
                  className="w-full py-8 text-xl"
                  type="button"
                  variant={"destructive"}
                  disabled={!details?.data?.startTime}
                  onClick={() => {
                    if (
                      !details?.data?.patientSignatureUrl ||
                      !details?.data?.caregiverSignatureUrl
                    ) {
                      onOpen4();
                    } else {
                      setAction("end");
                      onOpen3();
                    }
                  }}
                  leftIcon={<TiMediaStopOutline className="text-3xl" />}
                >
                  End Visit
                </Button>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            {/* {details?.data?.startTime && (
              <Button type="button" onClick={onOpen}>
                Missed Visit Note
              </Button>
            )} */}
            <Button
              type="button"
              disabled={!details?.data?.startTime}
              onClick={() => {
                if (!details?.data?.skilledNursingNote?.snNoteType) {
                  onOpen5();
                } else if (
                  details?.data?.skilledNursingNote?.snNoteType === "poc"
                ) {
                  router.push(
                    `/evv/${details?.data?.id}/unscheduled-visit/sn-note?type=poc`,
                  );
                } else {
                  router.push(
                    `/evv/${details?.data?.id}/unscheduled-visit/sn-note`,
                  );
                }
              }}
            >
              SN Visit Note
            </Button>

            <Button
              type="button"
              disabled={!details?.data?.startTime}
              onClick={() => setAction("assessment")}
            >
              Assessment
            </Button>
          </div>

          <div className="grid grid-col-1 md:grid-cols-2 gap-3 items-start">
            <div>
              <p className="text-sm mb-2 font-medium"> Patient Signature</p>
              <div className="border border-border px-4 py-6 rounded">
                {details?.data?.patientSignatureUrl && (
                  <div className="mb-4">
                    <div className="max-h-[300px] flex items-center justify-start rounded-lg border-border">
                      <StaticImage
                        src={details?.data?.patientSignatureUrl}
                        imageClassName={"object-contain"}
                        alt="patient signature"
                        className="h-[100px] w-[100px]"
                      />
                    </div>
                    <p className="text-sm mt-2">
                      Signed Date:{" "}
                      <span className="font-semibold">
                        {formatDateTime(
                          details?.data?.patientSignatureDate as Date,
                        )}
                      </span>
                    </p>
                  </div>
                )}
                <Button
                  type="button"
                  onClick={() => {
                    setSignatureType("patient");
                    onOpen2();
                  }}
                  variant={"secondary"}
                  disabled={!details?.data?.startTime}
                  leftIcon={
                    details?.data?.patientSignatureUrl ? (
                      <Pencil2Icon />
                    ) : (
                      <PlusIcon />
                    )
                  }
                >
                  {details?.data?.patientSignatureUrl ? "Update" : "Add"}
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm mb-2 font-medium"> Caregiver Signature</p>
              <div className="border border-border px-4 py-6 rounded">
                {details?.data?.caregiverSignatureUrl && (
                  <div className="mb-4">
                    <div className="max-h-[300px] flex items-center justify-start rounded-lg border-border">
                      <StaticImage
                        src={details?.data?.caregiverSignatureUrl}
                        imageClassName={"object-contain"}
                        alt="caregiver-signature"
                        className="h-[100px] w-[100px]"
                      />
                    </div>
                    <p className="text-sm mt-2">
                      Signed Date:{" "}
                      <span className="font-semibold">
                        {formatDateTime(
                          details?.data?.caregiverSignatureDate as Date,
                        )}
                      </span>
                    </p>
                  </div>
                )}
                <Button
                  type="button"
                  onClick={() => {
                    setSignatureType("caregiver");
                    onOpen2();
                  }}
                  disabled={!details?.data?.startTime}
                  leftIcon={
                    details?.data?.caregiverSignatureUrl ? (
                      <Pencil2Icon />
                    ) : (
                      <PlusIcon />
                    )
                  }
                  variant={"secondary"}
                >
                  {details?.data?.caregiverSignatureUrl ? "Update" : "Add"}
                </Button>
              </div>
            </div>

            <FormField
              control={methods.control}
              name={"comments"}
              render={({ field }) => (
                <FormRender label={"Comments"} formClassName="md:col-span-2">
                  <Textarea
                    {...field}
                    value={field.value as string}
                    disabled={!details?.data?.startTime}
                  />
                </FormRender>
              )}
            />
          </div>
          <div className="flex flex-col md:flex-row w-full gap-3 items-start">
            <FormField
              control={methods.control}
              name={"miles"}
              render={({ field }) => (
                <FormRender label={"Miles"} formClassName="md:w-[30%] w-full">
                  <Input
                    {...field}
                    value={field.value as string}
                    type="number"
                    disabled={!details?.data?.startTime}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"milesComments"}
              render={({ field }) => (
                <FormRender
                  label={"Mileage Comments"}
                  formClassName="md:w-[70%] w-full"
                >
                  <Input
                    {...field}
                    value={field.value as string}
                    disabled={!details?.data?.startTime}
                  />
                </FormRender>
              )}
            />
          </div>

          <div className="flex justify-end text-end my-2">
            <Button
              loading={isMutating}
              disabled={isMutating || !details?.data?.startTime}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UnscheduledVisitPage;
