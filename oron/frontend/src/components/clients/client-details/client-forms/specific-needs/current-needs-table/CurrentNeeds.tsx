"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { currentNeedsSchema, type CurrentNeedsFormData } from "./schema";
import { DiagnosisRow } from "./diagnosis-row";
import { NutritionalRow } from "./nutritional-row";
import { HealthRow } from "./health-row";
import { AllergiesRow } from "./allergies-row";
import { MedicationRow } from "./medication-row";
import { ToiletingRow } from "./toileting-row";
import { CommunicationRow } from "./communication-row";
import { BehaviorsRow } from "./behaviors-row";
import { RewardsRow } from "./rewards-row";
import { TransportationRow } from "./transportation-row";
import { StaffRatioRow } from "./staff-ratio-row";
import { SupervisionRow } from "./supervision-row";
import { RecreationalRow } from "./recreational-row";
import { HouseRulesRow } from "./house-rules-row";
import { CommentsRow } from "./comments-row";
import { useSearchParams } from "next/navigation";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Form } from "@/components/ui/form";
import { submitCurrentNeedsForm } from "@/actions/clients/specific-needs/specificNeeds";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FullSpecificNeedsForm } from "@/types/SpecificNeeds";

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  clientId: string;
  specificNeedsData: FullSpecificNeedsForm | undefined;
  refetchSpecificNeeds: any;
}

const CurrentNeeds = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  clientId,
  specificNeedsData,
  refetchSpecificNeeds,
}: Props) => {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isFormDisabled = mode === "view";

  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CurrentNeedsFormData>({
    resolver: zodResolver(currentNeedsSchema),
    defaultValues: {
      diagnosis: {
        category: "diagnosis",
        specificNeeds: [{ id: "A", value: "" }],
        recommendations: "",
      },
      nutritional: {
        category: "nutritional",
        specificNeeds: [{ id: "A", value: "" }],
        recommendations: "",
      },
      health: {
        category: "health",
        specificNeeds: [{ id: "A", value: "" }],
        recommendations: "",
      },
      allergies: {
        category: "allergies",
        specificNeeds: [{ id: "A", value: "" }],
        recommendations: "",
      },
      medication: {
        category: "medication",
        specificNeeds: [{ id: "A", value: "" }],
        recommendations: "",
      },
      toileting: {
        category: "toileting",
        specificNeeds: "",
        recommendations: "",
      },
      communication: {
        category: "communication",
        description: "",
        specificNeeds: "",
        recommendations: "",
      },
      behaviors: {
        category: "behaviors",
        description: [],
        displayedBehaviors: [{ id: "A", value: "" }],
        managementStrategies: [{ id: "A", value: "" }],
        triggers: [{ id: "A", value: "" }],
        recommendations: "",
      },
      rewards: {
        category: "rewards",
        description: [],
        specificNeeds: [{ id: "A", value: "" }],
        recommendations: "",
      },
      transportation: {
        category: "transportation",
        description: [],
        canBeTransportedAlone: null,
        recommendations: "",
      },
      staffRatio: {
        category: "staff_ratio",
        description: [],
        comments: "",
        recommendations: "",
      },
      supervision: {
        category: "supervision",
        description: [],
        comments: "",
        recommendations: "",
      },
      recreational: {
        category: "recreational",
        description: [],
        specificNeeds: [{ id: "A", value: "" }],
        recommendations: "",
      },
      houseRules: {
        category: "house_rules",
        description: [],
        specificNeeds: [{ id: "A", value: "" }],
        recommendations: "",
      },
      communityOuting: {
        category: "community_outing",
        comments: "",
        recommendations: "",
      },
      specialAlerts: {
        category: "special_alerts",
        comments: "",
        recommendations: "",
      },
    },
  });

  useEffect(() => {
    if (!specificNeedsData) return;

    const data = specificNeedsData?.data;
    const currentNeedOrSupport = data?.currentNeedOrSupport;

    if (currentNeedOrSupport) {
      setMethod("PATCH");

      const currentNeeds = currentNeedOrSupport.current_needs;

      // Map current needs to form values
      const formValues: CurrentNeedsFormData = {
        diagnosis: {
          category: "diagnosis",
          description: currentNeeds
            .find((n) => n.current_need_details === "diagnosis")
            ?.description?.startsWith("[OTHER]")
            ? "Other"
            : currentNeeds.find((n) => n.current_need_details === "diagnosis")
                ?.description || "",
          otherDescription: currentNeeds
            .find((n) => n.current_need_details === "diagnosis")
            ?.description?.startsWith("[OTHER]")
            ? currentNeeds
                .find((n) => n.current_need_details === "diagnosis")
                ?.description?.replace("[OTHER]", "")
                .trim() || ""
            : "",
          specificNeeds: currentNeeds
            .find((n) => n.current_need_details === "diagnosis")
            ?.specificNeeds.map((value, index) => ({
              id: String.fromCharCode(65 + index),
              value,
            })) || [{ id: "A", value: "" }],
          recommendations:
            currentNeeds.find((n) => n.current_need_details === "diagnosis")
              ?.recommendation || "",
        },
        nutritional: {
          category: "nutritional",
          description: currentNeeds
            .find((n) => n.current_need_details === "nutritional")
            ?.description?.startsWith("[OTHER]")
            ? "Other"
            : currentNeeds.find((n) => n.current_need_details === "nutritional")
                ?.description || "",
          otherDescription: currentNeeds
            .find((n) => n.current_need_details === "nutritional")
            ?.description?.startsWith("[OTHER]")
            ? currentNeeds
                .find((n) => n.current_need_details === "nutritional")
                ?.description?.replace("[OTHER]", "")
                .trim() || ""
            : "",
          specificNeeds: currentNeeds
            .find((n) => n.current_need_details === "nutritional")
            ?.specificNeeds.map((value, index) => ({
              id: String.fromCharCode(65 + index),
              value,
            })) || [{ id: "A", value: "" }],
          recommendations:
            currentNeeds.find((n) => n.current_need_details === "nutritional")
              ?.recommendation || "",
        },
        health: {
          category: "health",
          description: currentNeeds
            .find((n) => n.current_need_details === "health")
            ?.description?.startsWith("[OTHER]")
            ? "Other"
            : currentNeeds.find((n) => n.current_need_details === "health")
                ?.description || "",
          otherDescription: currentNeeds
            .find((n) => n.current_need_details === "health")
            ?.description?.startsWith("[OTHER]")
            ? currentNeeds
                .find((n) => n.current_need_details === "health")
                ?.description?.replace("[OTHER]", "")
                .trim() || ""
            : "",
          specificNeeds: currentNeeds
            .find((n) => n.current_need_details === "health")
            ?.specificNeeds.map((value, index) => ({
              id: String.fromCharCode(65 + index),
              value,
            })) || [{ id: "A", value: "" }],
          recommendations:
            currentNeeds.find((n) => n.current_need_details === "health")
              ?.recommendation || "",
        },
        allergies: {
          category: "allergies",
          description: currentNeeds
            .find((n) => n.current_need_details === "allergies")
            ?.description?.startsWith("[OTHER]")
            ? "Other"
            : currentNeeds.find((n) => n.current_need_details === "allergies")
                ?.description || "",
          otherDescription: currentNeeds
            .find((n) => n.current_need_details === "allergies")
            ?.description?.startsWith("[OTHER]")
            ? currentNeeds
                .find((n) => n.current_need_details === "allergies")
                ?.description?.replace("[OTHER]", "")
                .trim() || ""
            : "",
          specificNeeds: currentNeeds
            .find((n) => n.current_need_details === "allergies")
            ?.specificNeeds.map((value, index) => ({
              id: String.fromCharCode(65 + index),
              value,
            })) || [{ id: "A", value: "" }],
          recommendations:
            currentNeeds.find((n) => n.current_need_details === "allergies")
              ?.recommendation || "",
        },
        medication: {
          category: "medication",
          description: currentNeeds
            .find((n) => n.current_need_details === "medication")
            ?.description?.startsWith("[OTHER]")
            ? "Other"
            : currentNeeds.find((n) => n.current_need_details === "medication")
                ?.description || "",
          otherDescription: currentNeeds
            .find((n) => n.current_need_details === "medication")
            ?.description?.startsWith("[OTHER]")
            ? currentNeeds
                .find((n) => n.current_need_details === "medication")
                ?.description?.replace("[OTHER]", "")
                .trim() || ""
            : "",
          specificNeeds: currentNeeds
            .find((n) => n.current_need_details === "medication")
            ?.specificNeeds.map((value, index) => ({
              id: String.fromCharCode(65 + index),
              value,
            })) || [{ id: "A", value: "" }],
          recommendations:
            currentNeeds.find((n) => n.current_need_details === "medication")
              ?.recommendation || "",
        },
        toileting: {
          category: "toileting",
          description: currentNeeds
            .find((n) => n.current_need_details === "toileting")
            ?.description?.startsWith("[OTHER]")
            ? "Other"
            : currentNeeds.find((n) => n.current_need_details === "toileting")
                ?.description || "",
          otherDescription: currentNeeds
            .find((n) => n.current_need_details === "toileting")
            ?.description?.startsWith("[OTHER]")
            ? currentNeeds
                .find((n) => n.current_need_details === "toileting")
                ?.description?.replace("[OTHER]", "")
                .trim() || ""
            : "",
          specificNeeds:
            currentNeeds.find((n) => n.current_need_details === "toileting")
              ?.specificNeeds[0] || "",
          recommendations:
            currentNeeds.find((n) => n.current_need_details === "toileting")
              ?.recommendation || "",
        },
        communication: {
          category: "communication",
          description:
            currentNeeds.find((n) => n.current_need_details === "communication")
              ?.description || "",
          specificNeeds:
            currentNeeds.find((n) => n.current_need_details === "communication")
              ?.specificNeeds[0] || "",
          recommendations:
            currentNeeds.find((n) => n.current_need_details === "communication")
              ?.recommendation || "",
        },
        behaviors: {
          category: "behaviors",
          description: currentNeeds
            .find((n) => n.current_need_details === "behaviors")
            ?.description?.startsWith("[OTHER]")
            ? ["Other"]
            : currentNeeds
                .find((n) => n.current_need_details === "behaviors")
                ?.description?.split(", ") || [],
          otherDescription: currentNeeds
            .find((n) => n.current_need_details === "behaviors")
            ?.description?.startsWith("[OTHER]")
            ? currentNeeds
                .find((n) => n.current_need_details === "behaviors")
                ?.description?.replace("[OTHER]", "")
                .trim() || ""
            : "",
          displayedBehaviors: currentNeeds
            .find((n) => n.current_need_details === "behaviors")
            ?.specificNeeds.filter((n) => n.startsWith("[BEHAVIOR]"))
            .map((value, index) => ({
              id: String.fromCharCode(65 + index),
              value: value.replace("[BEHAVIOR]", ""),
            })) || [{ id: "A", value: "" }],
          managementStrategies: currentNeeds
            .find((n) => n.current_need_details === "behaviors")
            ?.specificNeeds.filter((n) => n.startsWith("[STRATEGY]"))
            .map((value, index) => ({
              id: String.fromCharCode(65 + index),
              value: value.replace("[STRATEGY]", ""),
            })) || [{ id: "A", value: "" }],
          triggers: currentNeeds
            .find((n) => n.current_need_details === "behaviors")
            ?.specificNeeds.filter((n) => n.startsWith("[TRIGGER]"))
            .map((value, index) => ({
              id: String.fromCharCode(65 + index),
              value: value.replace("[TRIGGER]", ""),
            })) || [{ id: "A", value: "" }],
          recommendations:
            currentNeeds.find((n) => n.current_need_details === "behaviors")
              ?.recommendation || "",
        },
        rewards: {
          category: "rewards",
          description: currentNeeds
            .find((n) => n.current_need_details === "rewards")
            ?.description?.startsWith("[OTHER]")
            ? ["Other"]
            : currentNeeds
                .find((n) => n.current_need_details === "rewards")
                ?.description?.split(", ") || [],
          otherDescription: currentNeeds
            .find((n) => n.current_need_details === "rewards")
            ?.description?.startsWith("[OTHER]")
            ? currentNeeds
                .find((n) => n.current_need_details === "rewards")
                ?.description?.replace("[OTHER]", "")
                .trim() || ""
            : "",
          specificNeeds: currentNeeds
            .find((n) => n.current_need_details === "rewards")
            ?.specificNeeds.map((value, index) => ({
              id: String.fromCharCode(65 + index),
              value,
            })) || [{ id: "A", value: "" }],
          recommendations:
            currentNeeds.find((n) => n.current_need_details === "rewards")
              ?.recommendation || "",
        },
        transportation: {
          category: "transportation",
          description: currentNeeds
            .find((n) => n.current_need_details === "transportation")
            ?.description?.startsWith("[OTHER]")
            ? ["Other"]
            : currentNeeds
                .find((n) => n.current_need_details === "transportation")
                ?.description?.split(", ") || [],
          otherDescription: currentNeeds
            .find((n) => n.current_need_details === "transportation")
            ?.description?.startsWith("[OTHER]")
            ? currentNeeds
                .find((n) => n.current_need_details === "transportation")
                ?.description?.replace("[OTHER]", "")
                .trim() || ""
            : "",
          canBeTransportedAlone:
            currentNeeds.find(
              (n) => n.current_need_details === "transportation"
            )?.specificNeeds[0] === "Can be transported alone",
          recommendations:
            currentNeeds.find(
              (n) => n.current_need_details === "transportation"
            )?.recommendation || "",
        },
        staffRatio: {
          category: "staff_ratio",
          description: currentNeeds
            .find((n) => n.current_need_details === "staff_ratio")
            ?.description?.startsWith("[OTHER]")
            ? ["Other"]
            : currentNeeds
                .find((n) => n.current_need_details === "staff_ratio")
                ?.description?.split(", ") || [],
          otherDescription: currentNeeds
            .find((n) => n.current_need_details === "staff_ratio")
            ?.description?.startsWith("[OTHER]")
            ? currentNeeds
                .find((n) => n.current_need_details === "staff_ratio")
                ?.description?.replace("[OTHER]", "")
                .trim() || ""
            : "",
          comments:
            currentNeeds.find((n) => n.current_need_details === "staff_ratio")
              ?.specificNeeds[0] || "",
          recommendations:
            currentNeeds.find((n) => n.current_need_details === "staff_ratio")
              ?.recommendation || "",
        },
        supervision: {
          category: "supervision",
          description: currentNeeds
            .find((n) => n.current_need_details === "supervision")
            ?.description?.startsWith("[OTHER]")
            ? ["Other"]
            : currentNeeds
                .find((n) => n.current_need_details === "supervision")
                ?.description?.split(", ") || [],
          otherDescription: currentNeeds
            .find((n) => n.current_need_details === "supervision")
            ?.description?.startsWith("[OTHER]")
            ? currentNeeds
                .find((n) => n.current_need_details === "supervision")
                ?.description?.replace("[OTHER]", "")
                .trim() || ""
            : "",
          comments:
            currentNeeds.find((n) => n.current_need_details === "supervision")
              ?.specificNeeds[0] || "",
          recommendations:
            currentNeeds.find((n) => n.current_need_details === "supervision")
              ?.recommendation || "",
        },
        recreational: {
          category: "recreational",
          description: currentNeeds
            .find((n) => n.current_need_details === "recreational")
            ?.description?.startsWith("[OTHER]")
            ? ["Other"]
            : currentNeeds
                .find((n) => n.current_need_details === "recreational")
                ?.description?.split(", ") || [],
          otherDescription: currentNeeds
            .find((n) => n.current_need_details === "recreational")
            ?.description?.startsWith("[OTHER]")
            ? currentNeeds
                .find((n) => n.current_need_details === "recreational")
                ?.description?.replace("[OTHER]", "")
                .trim() || ""
            : "",
          specificNeeds: currentNeeds
            .find((n) => n.current_need_details === "recreational")
            ?.specificNeeds.map((value, index) => ({
              id: String.fromCharCode(65 + index),
              value,
            })) || [{ id: "A", value: "" }],
          recommendations:
            currentNeeds.find((n) => n.current_need_details === "recreational")
              ?.recommendation || "",
        },
        houseRules: {
          category: "house_rules",
          description: currentNeeds
            .find((n) => n.current_need_details === "house_rules")
            ?.description?.startsWith("[OTHER]")
            ? ["Other"]
            : currentNeeds
                .find((n) => n.current_need_details === "house_rules")
                ?.description?.split(", ") || [],
          otherDescription: currentNeeds
            .find((n) => n.current_need_details === "house_rules")
            ?.description?.startsWith("[OTHER]")
            ? currentNeeds
                .find((n) => n.current_need_details === "house_rules")
                ?.description?.replace("[OTHER]", "")
                .trim() || ""
            : "",
          specificNeeds: currentNeeds
            .find((n) => n.current_need_details === "house_rules")
            ?.specificNeeds.map((value, index) => ({
              id: String.fromCharCode(65 + index),
              value,
            })) || [{ id: "A", value: "" }],
          recommendations:
            currentNeeds.find((n) => n.current_need_details === "house_rules")
              ?.recommendation || "",
        },
        communityOuting: {
          category: "community_outing",
          comments:
            currentNeeds.find(
              (n) => n.current_need_details === "community_outing"
            )?.description || "",
          recommendations:
            currentNeeds.find(
              (n) => n.current_need_details === "community_outing"
            )?.recommendation || "",
        },
        specialAlerts: {
          category: "special_alerts",
          comments:
            currentNeeds.find(
              (n) => n.current_need_details === "special_alerts"
            )?.description || "",
          recommendations:
            currentNeeds.find(
              (n) => n.current_need_details === "special_alerts"
            )?.recommendation || "",
        },
      };

      form.reset(formValues);
    }
  }, [specificNeedsData, form]);

  const onSubmit = async (data: CurrentNeedsFormData) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token") as string;
      const currentNeeds = specificNeedsData?.data?.currentNeedOrSupport;

      const requestBody: CurrentNeedsFormData = {
        diagnosis: data.diagnosis,
        nutritional: data.nutritional,
        health: data.health,
        allergies: data.allergies,
        medication: data.medication,
        toileting: data.toileting,
        communication: data.communication,
        behaviors: data.behaviors,
        rewards: data.rewards,
        transportation: data.transportation,
        staffRatio: data.staffRatio,
        supervision: data.supervision,
        recreational: data.recreational,
        houseRules: data.houseRules,
        communityOuting: data.communityOuting,
        specialAlerts: data.specialAlerts,
      };

      const { status, errorMessage } = await submitCurrentNeedsForm(
        token,
        requestBody,
        clientId,
        method,
        specificNeedsData?.data?.id!,
        currentNeeds?.id
      );

      if (!status) {
        toast({
          variant: "destructive",
          description: errorMessage,
        });
        return;
      }

      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to submit form",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftSubmit = async () => {
    try {
      setIsSubmittingDraft(true);
      const data = form.getValues();
      const token = localStorage.getItem("token") as string;
      const currentNeeds = specificNeedsData?.data?.currentNeedOrSupport;

      const requestBody: CurrentNeedsFormData = {
        diagnosis: data.diagnosis,
        nutritional: data.nutritional,
        health: data.health,
        allergies: data.allergies,
        medication: data.medication,
        toileting: data.toileting,
        communication: data.communication,
        behaviors: data.behaviors,
        rewards: data.rewards,
        transportation: data.transportation,
        staffRatio: data.staffRatio,
        supervision: data.supervision,
        recreational: data.recreational,
        houseRules: data.houseRules,
        communityOuting: data.communityOuting,
        specialAlerts: data.specialAlerts,
      };

      const { status, errorMessage } = await submitCurrentNeedsForm(
        token,
        requestBody,
        clientId,
        method,
        specificNeedsData?.data?.id!,
        currentNeeds?.id
      );

      // await refetchSpecificNeeds();

      if (!status) {
        toast({
          variant: "destructive",
          description: errorMessage,
        });
        return;
      }

      toast({
        description: "Draft saved successfully",
      });
    } catch (err) {
      console.error("Error saving draft:", err);
      toast({
        variant: "destructive",
        description: "An error occurred while saving the draft",
      });
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 mt-[4vh] relative">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="relative w-full border rounded-lg">
            <div className="overflow-auto">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px] sticky left-0 bg-white">
                      Current Needs
                    </TableHead>
                    <TableHead className="w-[250px]">Description</TableHead>
                    <TableHead className="w-[300px]">Specific Need</TableHead>
                    <TableHead className="w-[250px]">Recommendations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <DiagnosisRow control={form.control} name="diagnosis" />
                  <NutritionalRow control={form.control} name="nutritional" />
                  <HealthRow control={form.control} name="health" />
                  <AllergiesRow control={form.control} name="allergies" />
                  <MedicationRow control={form.control} name="medication" />
                  <ToiletingRow control={form.control} name="toileting" />
                  <CommunicationRow
                    control={form.control}
                    name="communication"
                  />
                  <BehaviorsRow control={form.control} name="behaviors" />
                  <RewardsRow control={form.control} name="rewards" />
                  <TransportationRow
                    control={form.control}
                    name="transportation"
                  />
                  <StaffRatioRow control={form.control} name="staffRatio" />
                  <SupervisionRow control={form.control} name="supervision" />
                  <RecreationalRow control={form.control} name="recreational" />
                  <HouseRulesRow control={form.control} name="houseRules" />
                  <CommentsRow
                    control={form.control}
                    name="communityOuting"
                    label="Community Outing"
                    category="community_outing"
                  />
                  <CommentsRow
                    control={form.control}
                    name="specialAlerts"
                    label="Special Alerts"
                    category="special_alerts"
                  />
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[calc(100%-250px)]">
            <Button
              variant="light"
              onClick={() => handleChangeIndex(currentIndex - 1)}
              type="button"
              disabled={currentIndex === 1}
              data-testid="previous-section-button"
            >
              <DoubleArrowLeftIcon className="w-5 h-5" />
              Previous Section
            </Button>

            {!isFormDisabled && (
              <Button
                variant="light"
                type="button"
                data-testid="save-draft-button"
                onClick={handleDraftSubmit}
                disabled={isSubmittingDraft}
                isLoading={isSubmittingDraft}
              >
                Save Draft
              </Button>
            )}

            <Button
              data-testid="next-section-button"
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {isLoading ? "Saving..." : "Next Section"}{" "}
              <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default CurrentNeeds;
