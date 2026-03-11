"use client";

import { useState } from "react";
import { Mail, FileText, KeyRound, UserCog, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { resetUserPassword, fetchUserOfferLetter } from "@/use-cases/admin";
import { OfferLetterResponse } from "@/types/OfferLetterTypes";
import CreateOfferLetter from "../CreateOfferLetter";
import ExportVisits from "../ExportVisits";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Check } from "lucide-react";
import { updateUserStatus } from "@/actions/admin";

type QuickAction = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
};

interface EmployeeQuickActionsProps {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  currentStatus?: string;
  onStatusChange?: () => void;
}

export default function EmployeeQuickActions({
  employeeId,
  employeeName,
  employeeEmail,
  currentStatus,
  onStatusChange,
}: EmployeeQuickActionsProps) {
  const token = localStorage.getItem("token") as string;
  const { toast } = useToast();

  // Offer Letter state
  const [showOfferLetterModal, setShowOfferLetterModal] = useState(false);
  const [offerLetterData, setOfferLetterData] = useState<OfferLetterResponse | boolean>();
  const [offerLetterLoading, setOfferLetterLoading] = useState(false);
  const offerLetter =
    typeof offerLetterData !== "boolean" && typeof offerLetterData === "object"
      ? offerLetterData
      : undefined;

  // Export Visits state
  const [showExportVisitModal, setShowExportVisitModal] = useState(false);

  // Reset password state
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Copy invite state
  const [inviteCopied, setInviteCopied] = useState(false);

  // Change status state
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus || "ACTIVE");
  const [changeStatusLoading, setChangeStatusLoading] = useState(false);

  const handleOfferLetter = async () => {
    setShowOfferLetterModal(true);
    setOfferLetterLoading(true);
    const response = await fetchUserOfferLetter(employeeId, token);
    setOfferLetterData(response);
    setOfferLetterLoading(false);
  };

  const handleExportVisits = () => {
    setShowExportVisitModal(true);
  };

  const handleResetPassword = async () => {
    setResetPasswordLoading(true);
    setNewPassword(null);
    try {
      const response = await resetUserPassword(token, employeeId);
      setNewPassword(response.data.new_password);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "Failed to reset password",
      });
      setShowResetPasswordModal(false);
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (newPassword) {
      const credentials = `Email: ${employeeEmail}\nPassword: ${newPassword}`;
      navigator.clipboard.writeText(credentials);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    }
  };

  const handleCopyInvite = () => {
    const inviteText = `You have been invited to join Oron!

Login at: https://app.oronapp.com/login
Email: ${employeeEmail}

Please contact your administrator for your password.`;

    navigator.clipboard.writeText(inviteText);
    setInviteCopied(true);
    toast({
      description: "Invite instructions copied to clipboard!",
    });
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const handleCloseResetModal = () => {
    setShowResetPasswordModal(false);
    setNewPassword(null);
    setPasswordCopied(false);
  };

  const handleChangeStatus = async () => {
    if (!selectedStatus || selectedStatus === currentStatus) {
      toast({
        description: "Please select a different status",
      });
      return;
    }

    setChangeStatusLoading(true);
    try {
      await updateUserStatus(token, employeeId, selectedStatus as "ACTIVE" | "INACTIVE" | "DISENGAGED");
      toast({
        description: `Status updated to ${selectedStatus.toLowerCase()} successfully`,
      });
      setShowChangeStatusModal(false);
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "Failed to update status",
      });
    } finally {
      setChangeStatusLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: "offer-letter",
      title: "Send Offer Letter",
      description: "Create and send an offer letter",
      icon: <FileText className="w-5 h-5" />,
      color: "bg-blue-500",
      onClick: handleOfferLetter,
    },
    {
      id: "export-visits",
      title: "Export Visits",
      description: "Download visit records",
      icon: <FileSpreadsheet className="w-5 h-5" />,
      color: "bg-green-500",
      onClick: handleExportVisits,
    },
    {
      id: "reset-password",
      title: "Reset Password",
      description: "Generate a new password",
      icon: <KeyRound className="w-5 h-5" />,
      color: "bg-orange-500",
      onClick: () => {
        setShowResetPasswordModal(true);
        handleResetPassword();
      },
    },
    {
      id: "copy-invite",
      title: inviteCopied ? "Copied!" : "Copy Invite",
      description: "Copy invitation details",
      icon: <Mail className="w-5 h-5" />,
      color: "bg-purple-500",
      onClick: handleCopyInvite,
    },
    {
      id: "change-status",
      title: "Change Status",
      description: "Update employee status",
      icon: <UserCog className="w-5 h-5" />,
      color: "bg-gray-500",
      onClick: () => {
        setSelectedStatus(currentStatus || "ACTIVE");
        setShowChangeStatusModal(true);
      },
    },
  ];

  return (
    <>
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage employee account and settings
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className="group relative flex flex-col items-start p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
            >
              {/* Icon with colored background */}
              <div
                className={`${action.color} text-white p-3 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-200`}
              >
                {action.icon}
              </div>

              {/* Content */}
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-600">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <CreateOfferLetter
        showModal={showOfferLetterModal}
        setShowModal={setShowOfferLetterModal}
        offerLetterLoading={offerLetterLoading}
        employeeName={employeeName}
        offerLetter={offerLetter}
        employeeId={employeeId}
      />

      <ExportVisits
        showModal={showExportVisitModal}
        setShowModal={setShowExportVisitModal}
        employeeName={employeeName}
        employeeId={employeeId}
      />

      <Dialog open={showResetPasswordModal} onOpenChange={handleCloseResetModal}>
        <DialogContent className="bg-white max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-[600] text-[#101828]">
              Reset Password
            </DialogTitle>
          </DialogHeader>

          {resetPasswordLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Generating new password...</p>
            </div>
          ) : newPassword ? (
            <div className="flex flex-col gap-5 mt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium mb-2">
                  Password has been reset!
                </p>
                <p className="text-sm text-green-700">
                  Share these new credentials with {employeeName}. The password will not be shown again.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{employeeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{employeeEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">New Password</p>
                  <p className="font-mono font-medium bg-white p-2 rounded border">
                    {newPassword}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700"
                >
                  {passwordCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Credentials
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseResetModal}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md px-4 py-2"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={showChangeStatusModal} onOpenChange={setShowChangeStatusModal}>
        <DialogContent className="bg-white max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-[600] text-[#101828]">
              Change Employee Status
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5 mt-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Employee</p>
              <p className="font-medium">{employeeName}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                New Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="z-[99999]">
                  <SelectItem value="ACTIVE">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="INACTIVE">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Inactive
                    </div>
                  </SelectItem>
                  <SelectItem value="DISENGAGED">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Disengaged
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedStatus === "DISENGAGED" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> Setting status to Disengaged will remove all active client assignments for this employee.
                </p>
              </div>
            )}

            {selectedStatus === "INACTIVE" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Inactive employees cannot login or be assigned to new clients.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleChangeStatus}
                disabled={changeStatusLoading || selectedStatus === currentStatus}
                className="flex-1 bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changeStatusLoading ? "Updating..." : "Update Status"}
              </button>
              <button
                type="button"
                onClick={() => setShowChangeStatusModal(false)}
                disabled={changeStatusLoading}
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md px-4 py-2 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
