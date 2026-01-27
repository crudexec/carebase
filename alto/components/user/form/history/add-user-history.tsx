import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import useSWRMutation from "swr/mutation";

import { FormSection } from "@/components/patient";
import { Button, Form } from "@/components/ui";
import { useCreateUserHistory, useUpdateUserHistory } from "@/hooks";
import { cn, filterArray, pickValues, uploadFile } from "@/lib";
import {
  userHistoryDefaultValues,
  UserHistoryForm,
  UserHistorySchema,
} from "@/schema";
import { ActionType, FormReturn, ISetState } from "@/types";

import AttachFiles from "./attach-file";
import CareGiverCertifications from "./caregiver-certificaton";
import EmploymentDate from "./employment-date";
import LicenseTracking from "./license-tracking";
import MedicalTest from "./medical-test";
import StaffProfile from "./staff-profile";

type formType = FormReturn<typeof UserHistorySchema>;

const AddUserHistory = ({
  refreshTable,
  onClose,
  mode,
  selected,
  userId,
  setTab,
  methods,
}: {
  refreshTable: () => void;
  onClose: () => void;
  mode: ActionType;
  selected?: UserHistoryForm & { id: string };
  userId: string;
  setTab: ISetState<string>;
  methods: formType;
}) => {
  const [userHistoryId, setUserHistoryId] = useState("");
  const [uploading, setUploading] = useState(false);
  const { data, trigger, isMutating } = useSWRMutation(
    "/api/user/history",
    useCreateUserHistory,
  );

  const {
    data: updateResponse,
    trigger: updateUserHistory,
    isMutating: isUpdating,
  } = useSWRMutation("/api/user/history", useUpdateUserHistory);

  const modalClose = () => {
    methods.reset(userHistoryDefaultValues);
    setUserHistoryId("");
    onClose();
  };

  useEffect(() => {
    if (data?.success || updateResponse?.success) {
      refreshTable();
      if (
        (mode === "create" && !userHistoryId) ||
        (!selected?.id && !!userId)
      ) {
        toast.success(`Success|${data?.message}`);
      } else {
        toast.success(`Success|${updateResponse?.message}`);
      }
      setUserHistoryId(data?.data?.id);
      modalClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, updateResponse]);

  return (
    <Form {...methods}>
      <form
        className="h-[670px] overflow-auto mt-2 justify-between flex flex-col scrollbar-hide"
        onSubmit={methods.handleSubmit(async ({ media, ...data }) => {
          const filteredData = {
            ...data,
            driversLicense: pickValues(data.driversLicense),
            professionalLicense: pickValues(data.professionalLicense),
            caregiverCertifications: filterArray(data.caregiverCertifications),
            userId,
          };

          let uploadedFiles;
          if (media.length) {
            setUploading(true);
            const response = await Promise.all(
              media.map(async (media: File & { id: string }) => {
                if (!media?.id) {
                  const resp = await uploadFile(media, "users");
                  return {
                    mediaId: resp.mediaId,
                    size: media.size,
                    type: media.type,
                    fileName: media.name,
                    success: resp.success,
                  };
                }
                return {
                  id: media?.id,
                  size: media.size,
                  type: media.type,
                  fileName: media.name,
                  success: true,
                };
              }),
            );
            uploadedFiles = response?.map(
              ({ success: _success, ...res }) => res,
            );
            setUploading(false);
            if (!response?.find((res) => res.success)) return;
          }

          if (
            (mode === "create" && !userHistoryId) ||
            (!selected?.id && !!userId)
          ) {
            await trigger(
              pickValues({ ...filteredData, media: uploadedFiles }),
            );
          } else {
            await updateUserHistory({
              ...filteredData,
              media: uploadedFiles,
              driversLicense: data.driversLicense,
              professionalLicense: data.professionalLicense,
              id: selected?.id as string,
            });
          }
        })}
      >
        {/* Staff Profile*/}
        <FormSection title="Staff Profile" className="z-[1] mt-4">
          <StaffProfile methods={methods} mode={mode} />
        </FormSection>

        {/* License Tracking*/}
        <FormSection title="License Tracking" className="z-[1]">
          <LicenseTracking methods={methods} mode={mode} />
        </FormSection>

        {/* Staff Profile*/}
        <FormSection title="Employment Date" className="z-[1]">
          <EmploymentDate methods={methods} mode={mode} />
        </FormSection>

        {/* Caregiver Caertification*/}
        <FormSection title="Caregiver Certification" className="z-[1]">
          <CareGiverCertifications methods={methods} mode={mode} />
        </FormSection>

        {/* Attach Files*/}
        <FormSection title="ATTACH FILES" className="z-[1] text-center">
          <AttachFiles methods={methods} mode={mode} />
        </FormSection>

        {/* Medical Test*/}
        <FormSection
          title="MEDICAL TEST/OTHER DATES"
          className="z-[1] text-center"
        >
          <MedicalTest methods={methods} mode={mode} />
        </FormSection>
        {mode !== "view" && (
          <div className={cn("flex gap-2 items-center w-full px-8")}>
            <Button
              leftIcon={<FaArrowLeft />}
              type="button"
              className="md:mx-2 mt-6 py-2 text-white w-[50%]"
              onClick={() => setTab("information")}
            >
              Prev
            </Button>
            <Button
              rightIcon={<FaArrowRight />}
              type="submit"
              className={cn("md:mx-2 mt-6 py-2 text-white w-[50%]")}
              loading={isMutating || isUpdating || uploading}
            >
              Submit
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default AddUserHistory;
