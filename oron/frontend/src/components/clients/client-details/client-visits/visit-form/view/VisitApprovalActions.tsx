"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import useApproveVisit from "@/hooks/admin/useApproveVisit";
import useSendVisitReview from "@/hooks/admin/useSendVisitReview";

interface VisitApprovalActionsProps {
  visitId: string;
  visitStatus: string;
  clientId: string;
}

export default function VisitApprovalActions({
  visitId,
  visitStatus,
  clientId,
}: VisitApprovalActionsProps) {
  const router = useRouter();
  const [showReviewSection, setShowReviewSection] = useState(false);

  const {
    mutate: approve,
    isPending: isApproving,
    hasApproved,
  } = useApproveVisit(visitId);

  const {
    mutate: review,
    isPending: isReviewing,
    hasReviewed,
    reviewNote,
    handleChange,
  } = useSendVisitReview(visitId);

  // Don't show if not awaiting approval or already actioned
  if (visitStatus !== "awaiting_approval" || hasApproved || hasReviewed) {
    return null;
  }

  const handleApprove = () => {
    approve(null, {
      onSuccess: () => {
        setTimeout(() => {
          router.push(`/admin/clients/${clientId}`);
        }, 1500);
      },
    });
  };

  const handleReview = () => {
    review(null, {
      onSuccess: () => {
        setTimeout(() => {
          router.push(`/admin/clients/${clientId}`);
        }, 1500);
      },
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[5000]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Awaiting Approval
            </Badge>
            <span className="text-sm text-gray-600">
              This visit note requires your approval before it can be finalized.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {!showReviewSection ? (
          <div className="flex gap-3">
            <Button
              onClick={handleApprove}
              disabled={isApproving || isReviewing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Visit
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowReviewSection(true)}
              disabled={isApproving || isReviewing}
              variant="outline"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Send for Review
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">
                Send for Review (Return to Draft)
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReviewSection(false)}
                disabled={isReviewing}
              >
                Cancel
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Provide feedback to the staff member about what needs to be
              corrected
            </p>
            <Textarea
              placeholder="Enter review notes for the staff member..."
              value={reviewNote}
              onChange={(e) => handleChange(e.target.value)}
              rows={3}
              disabled={isReviewing}
              className="w-full"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleReview}
                disabled={isReviewing || !reviewNote || reviewNote.trim() === ""}
                variant="secondary"
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
              <Button
                onClick={handleApprove}
                disabled={isApproving || isReviewing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Visit
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
