"use client";

import { IntakeType } from "@/types/IntakeForm";
import {
  formatClientStatus,
  formatSpecificNeedsStatus,
} from "@/components/clients/ClientsPageWrapper";
import { FormsTable } from "./forms-table";
import { formatDate, formatLastModified } from "@/utils/helpers";
import SpecificNeedsPdfModal from "../assessment-tab/SpecificNeedsPdfModal";
import { retrieveSpecificNeedsForm } from "@/use-cases/specific-needs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import { createGenericSpecificNeeds } from "@/actions/clients/specific-needs/specificNeeds";
import { toast } from "@/components/ui/use-toast";

interface Props {
  client: IntakeType | undefined;
  clientId: string;
  admin?: boolean;
  clientManager?: boolean;
}

const FormsTab = ({ client, clientId, admin, clientManager }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token") as string;

  const { data: specificNeedsData, isLoading: specificNeedsLoading } = useQuery(
    {
      queryKey: ["specificNeeds", clientId],
      queryFn: async () => await retrieveSpecificNeedsForm(token, clientId),
      retry: false,
    }
  );

  const handleSpecificNeedsClick = async () => {
    if (
      !specificNeedsData ||
      !specificNeedsData?.data ||
      !specificNeedsData?.data?.id
    ) {
      try {
        const response = await createGenericSpecificNeeds(token, clientId);
        await queryClient.invalidateQueries({
          queryKey: ["specificNeeds", clientId],
        });

        if (!response.status) {
          toast({
            variant: "destructive",
            title: "Error Creating Specific Needs",
            description: response.errorMessage,
          });
          return;
        }

        const route = clientManager
          ? `/client-manager/clients/${clientId}/forms/specific-needs?mode=edit&formId=${response.data?.id}`
          : admin
          ? `/admin/clients/${clientId}/forms/specific-needs?mode=edit&formId=${response.data?.id}`
          : `/clients/${clientId}/forms/specific-needs?mode=view&formId=${response.data?.id}`;
        router.push(route);
      } catch (error) {
        console.error("Failed to create specific needs form:", error);
        return;
      }
      return;
    }

    const route = clientManager
      ? `/client-manager/clients/${clientId}/forms/specific-needs?mode=edit`
      : admin
      ? `/admin/clients/${clientId}/forms/specific-needs?mode=edit`
      : `/clients/${clientId}/forms/specific-needs?mode=view`;
    router.push(route);
  };

  const calculateIntakeProgress = (): number => {
    const totalSections = 8;
    const completedSections = new Set();

    if (client?.client_information_id) completedSections.add(1);
    if (client?.referral_information_id) completedSections.add(2);
    if (client?.intake_information_id) completedSections.add(3);
    if (
      client?.mother_contact_information_id &&
      client?.father_contact_information_id &&
      client?.emergency_contact_information_id &&
      client?.school_contact_information_id
    ) {
      completedSections.add(4);
    }
    if (client?.service_coordinator_information_id) completedSections.add(5);
    if (client?.more_about_information_id) completedSections.add(6);
    if (client?.medical_information_id) completedSections.add(7);
    if (client?.admission_information_id) completedSections.add(8);

    const completedPercentage = Math.floor(
      (completedSections.size / totalSections) * 100
    );

    return completedPercentage !== 100 && client?.status !== "draft"
      ? 100
      : completedPercentage;
  };

  const calculateSpecificNeedsProgress = (): number => {
    const totalSections = 4;
    const completedSections = new Set();

    if (specificNeedsData?.data?.basicInformation) completedSections.add(1);
    if (specificNeedsData?.data?.currentNeedOrSupport) completedSections.add(2);
    if (specificNeedsData?.data?.serviceNeeds) completedSections.add(3);
    if (specificNeedsData?.data?.authorization) completedSections.add(4);

    const completedPercentage = Math.floor(
      (completedSections.size / totalSections) * 100
    );

    return completedPercentage;
  };

  const tableData = [
    {
      id: "1",
      document: "Intake Form",
      progress: calculateIntakeProgress(),
      dateCreated: client?.created_at
        ? formatDate(new Date(client?.created_at))
        : "-",
      lastModified: client?.updated_at
        ? formatLastModified(client?.updated_at)
        : "-",
      route: clientManager
        ? `/client-manager/clients/${clientId}/forms/intake?mode=edit`
        : admin
        ? `/admin/clients/${clientId}/forms/intake?mode=edit`
        : `/clients/${clientId}/forms/intake?clientId=${clientId}&mode=view`,
      formId: client?.id ?? "",
      downloadLink: clientManager
        ? `/client-manager/clients/${clientId}/forms/intake?mode=view`
        : admin
        ? `/admin/clients/${clientId}/forms/intake?mode=view`
        : `/clients/${clientId}/forms/intake?clientId=${clientId}&mode=view`,
      admin: admin!,
      status: formatClientStatus(client?.status ?? "draft"),
      canDownload: false,
    },
    {
      id: "2",
      document: "Specific Needs",
      progress: calculateSpecificNeedsProgress(),
      dateCreated: specificNeedsData?.data?.createdAt
        ? formatDate(new Date(specificNeedsData?.data?.createdAt))
        : "-",
      lastModified: specificNeedsData?.data?.updatedAt
        ? formatLastModified(specificNeedsData?.data?.updatedAt)
        : "-",
      route: clientManager
        ? `/client-manager/clients/${clientId}/forms/specific-needs?mode=edit`
        : admin
        ? `/admin/clients/${clientId}/forms/specific-needs?mode=edit`
        : `/clients/${clientId}/forms/specific-needs?mode=view`,
      formId: specificNeedsData?.data?.id ?? "",
      downloadLink: clientManager
        ? `/client-manager/clients/${clientId}/forms/specific-needs?mode=view`
        : admin
        ? `/admin/clients/${clientId}/forms/specific-needs?mode=view`
        : `/clients/${clientId}/forms/specific-needs?mode=view`,
      admin: admin!,
      status: formatSpecificNeedsStatus(
        specificNeedsData?.data?.status ?? "not_started"
      ),
      canDownload: true,
    },
  ];

  if (specificNeedsLoading) {
    return <Loader height="h-[50px]" />;
  }

  return (
    <section className="w-full flex flex-col gap-5">
      <FormsTable
        data={tableData}
        admin={admin}
        onSpecificNeedsClick={handleSpecificNeedsClick}
      />
      <SpecificNeedsPdfModal />
    </section>
  );
};

export default FormsTab;
