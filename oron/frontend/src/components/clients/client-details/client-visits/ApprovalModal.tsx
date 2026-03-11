"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useApproveVisit from "@/hooks/admin/useApproveVisit";
import useSendVisitReview from "@/hooks/admin/useSendVisitReview";

type ApprovalModalProps = {
  visitId: string;
  isOpen: boolean;
  onClose: () => void;
};

export const ApprovalModal = ({
  visitId,
  isOpen,
  onClose,
}: ApprovalModalProps) => {
  const { mutate: approve, isPending: isApproving } =
    useApproveVisit(visitId);
  const {
    mutate: review,
    isPending: isReviewing,
    reviewNote,
    handleChange,
  } = useSendVisitReview(visitId);

  const handleApprove = () => {
    approve(null, {
      onSuccess: () => {
        onClose();
        window.location.reload(); // Refresh to show updated status
      },
    });
  };

  const handleReview = () => {
    review(null, {
      onSuccess: () => {
        onClose();
        window.location.reload();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review Visit Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Approve this visit note or send it back for corrections.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleApprove}
              disabled={isApproving}
              className="flex-1"
            >
              {isApproving ? "Approving..." : "Approve"}
            </Button>

            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>

          <div className="border-t pt-4">
            <label className="text-sm font-medium">
              Or send back for corrections:
            </label>
            <Textarea
              placeholder="Enter review notes..."
              value={reviewNote}
              onChange={(e) => handleChange(e.target.value)}
              className="mt-2"
              rows={4}
            />
            <Button
              onClick={handleReview}
              disabled={isReviewing || !reviewNote}
              variant="secondary"
              className="mt-2 w-full"
            >
              {isReviewing ? "Sending..." : "Send Review Notes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
