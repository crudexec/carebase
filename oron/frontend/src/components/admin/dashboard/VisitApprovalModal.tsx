"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useVisitDetails } from "@/hooks/admin/useVisitDetails";
import useApproveVisit from "@/hooks/admin/useApproveVisit";
import useSendVisitReview from "@/hooks/admin/useSendVisitReview";
import { useToast } from "@/components/ui/use-toast";
import { ExternalLink, Loader2 } from "lucide-react";

interface VisitApprovalModalProps {
  visitId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function VisitDetailsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-20 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
}

export default function VisitApprovalModal({
  visitId,
  isOpen,
  onClose,
}: VisitApprovalModalProps) {
  const { toast } = useToast();
  const { data: visitDetails, isLoading } = useVisitDetails(visitId);
  const { mutate: approve, isPending: isApproving } = useApproveVisit(
    visitId || ""
  );
  const {
    mutate: review,
    isPending: isReviewing,
    reviewNote,
    handleChange,
  } = useSendVisitReview(visitId || "");

  const handleApprove = () => {
    approve(null, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Visit approved successfully",
          variant: "success",
        });
        onClose();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to approve visit",
          variant: "destructive",
        });
      },
    });
  };

  const handleReview = () => {
    if (!reviewNote || reviewNote.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter review notes",
        variant: "destructive",
      });
      return;
    }

    review(null, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Review sent successfully",
          variant: "success",
        });
        onClose();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to send review",
          variant: "destructive",
        });
      },
    });
  };

  const handleViewFullVisit = () => {
    if (visitDetails) {
      window.open(
        `/admin/clients/${visitDetails.client_id}/visits/iiss-visit?formId=${visitId}`,
        "_blank"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Visit Details - {visitDetails?.client_name || "Loading..."}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <VisitDetailsSkeleton />
        ) : visitDetails ? (
          <div className="space-y-6">
            {/* Client Info Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Client Information
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">Name:</span>{" "}
                  <span className="text-gray-900">
                    {visitDetails.client_name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Age:</span>{" "}
                  <span className="text-gray-900">{visitDetails.client_age}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Visit Type:</span>{" "}
                  <span className="text-gray-900">{visitDetails.visit_type}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Staff:</span>{" "}
                  <span className="text-gray-900">{visitDetails.staff_name}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Submitted:</span>{" "}
                  <span className="text-gray-900">
                    {visitDetails.submitted_date
                      ? format(
                          new Date(visitDetails.submitted_date),
                          "MMM dd, yyyy 'at' h:mm a"
                        )
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Location:</span>{" "}
                  <span className="text-gray-900">
                    {visitDetails.location || "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Goals Summary Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Goals Summary ({visitDetails.goals_count} goals)
              </h3>
              <div className="space-y-2">
                {visitDetails.goals_summary.map((goal, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium text-gray-900">
                      Goal {goal.goal_number}: {goal.target_skill}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Steps completed with &quot;Yes&quot; response: {goal.steps_completed}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Highlights */}
            {visitDetails.session_highlights && (
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Session Highlights
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {visitDetails.session_highlights}
                </p>
              </div>
            )}

            {/* Approval Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={isApproving || isReviewing}
                  className="flex-1"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    "Approve Visit"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleViewFullVisit}
                  disabled={isApproving || isReviewing}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Full Visit
                </Button>
              </div>

              {/* Review Section */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Send for Review (Return to Draft)
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Provide feedback to the staff member about what needs to be
                  corrected
                </p>
                <Textarea
                  placeholder="Enter review notes for the staff member..."
                  value={reviewNote}
                  onChange={handleChange}
                  rows={4}
                  disabled={isApproving || isReviewing}
                  className="mb-3"
                />
                <Button
                  onClick={handleReview}
                  disabled={isApproving || isReviewing || !reviewNote}
                  variant="secondary"
                  className="w-full"
                >
                  {isReviewing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Review...
                    </>
                  ) : (
                    "Send Review"
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Visit details not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
