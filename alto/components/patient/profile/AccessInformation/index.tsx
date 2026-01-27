"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSWRMutation from "swr/mutation";

import { Button, MultiSelect } from "@/components/ui";
import { useGetUsers, useSaveAccessInfo } from "@/hooks";
import { cn } from "@/lib/utils";
import { PatientAccessInfoResponse } from "@/types";

const AccessInformation = ({
  patientId,
  patientAccessInfo,
  mutate,
}: {
  patientId: string;
  patientAccessInfo: PatientAccessInfoResponse;
  mutate: () => void;
}) => {
  const [caregivers, setCareGivers] = useState<string[]>([]);
  const { data } = useGetUsers({ tab: "caregiver" });

  const {
    data: updateResponse,
    trigger,
    isMutating,
  } = useSWRMutation("/api/patient/access-info", useSaveAccessInfo);

  useEffect(() => {
    if (updateResponse?.success) {
      mutate();
      toast.success(`Success|${updateResponse?.message}`);
    }
  }, [mutate, updateResponse]);

  useEffect(() => {
    if (patientAccessInfo) {
      setCareGivers(patientAccessInfo.caregivers);
    }
  }, [patientAccessInfo]);

  return (
    <div>
      <div className="md:px-8 px-2 bg-background border-b border-b-border text-white  py-4 mx-2 mb-4 sticky top-0 z-[1]">
        <p className="text-foreground uppercase font-semibold">
          Access Information
        </p>
      </div>
      <div
        className={cn(
          "grid grid-cols-1 gap-x-7 gap-y-2 md:px-8 px-4 items-end",
        )}
      >
        <p className="text-sm">Choose Caregiver</p>
        <MultiSelect
          options={
            data?.data?.users?.map((item) => ({
              value: item.id as string,
              label: (item.lastName ?? "") + " " + (item.lastName ?? ""),
            })) ?? []
          }
          value={caregivers}
          onChange={(value) => {
            setCareGivers(value);
          }}
          placeholder="Select Caregivers"
        />{" "}
        <Button
          aria-label="Activate or Archive"
          className="ml-auto h-8 lg:flex"
          loading={isMutating}
          onClick={() => {
            trigger({
              patient: patientId,
              caregivers,
            });
          }}
        >
          Save{" "}
        </Button>
      </div>
    </div>
  );
};

export default AccessInformation;
