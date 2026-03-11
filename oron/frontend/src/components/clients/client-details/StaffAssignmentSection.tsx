"use client";

import { useState } from "react";
import { Users, Plus, X, History, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  useClientAssignments,
  useAvailableStaff,
  useAssignStaff,
  useUnassignStaff,
  useAssignmentHistory,
} from "@/hooks/useClientStaffAssignment";

interface StaffAssignmentSectionProps {
  clientId: string;
  isAdmin: boolean;
  isClientManager: boolean;
}

export default function StaffAssignmentSection({
  clientId,
  isAdmin,
  isClientManager,
}: StaffAssignmentSectionProps) {
  const { toast } = useToast();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [unassignNotes, setUnassignNotes] = useState("");
  const [staffToUnassign, setStaffToUnassign] = useState<string | null>(null);

  const { data: assignments = [], isLoading: loadingAssignments } = useClientAssignments(clientId);
  const { data: availableStaff = [], isLoading: loadingAvailable } = useAvailableStaff(clientId);
  const { data: historyData } = useAssignmentHistory(clientId);
  const { mutate: assignStaff, isPending: isAssigning } = useAssignStaff(clientId);
  const { mutate: unassignStaff, isPending: isUnassigning } = useUnassignStaff(clientId);

  const canManageAssignments = isAdmin || isClientManager;

  const handleAssign = () => {
    if (selectedStaffIds.length === 0) {
      toast({
        title: "No staff selected",
        description: "Please select at least one staff member to assign",
        variant: "destructive",
      });
      return;
    }

    assignStaff(
      { staffIds: selectedStaffIds, notes: notes || undefined },
      {
        onSuccess: () => {
          toast({
            title: "Staff assigned successfully",
            description: `${selectedStaffIds.length} staff member(s) assigned to client`,
          });
          setShowAssignModal(false);
          setSelectedStaffIds([]);
          setNotes("");
        },
        onError: (error: any) => {
          toast({
            title: "Assignment failed",
            description: error.message || "Failed to assign staff to client",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleUnassign = (staffId: string) => {
    unassignStaff(
      { staffId, notes: unassignNotes || undefined },
      {
        onSuccess: () => {
          toast({
            title: "Staff unassigned successfully",
            description: "Staff member removed from client",
          });
          setStaffToUnassign(null);
          setUnassignNotes("");
        },
        onError: (error: any) => {
          toast({
            title: "Unassignment failed",
            description: error.message || "Failed to unassign staff from client",
            variant: "destructive",
          });
        },
      }
    );
  };

  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaffIds(prev =>
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  if (loadingAssignments) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-gradient-to-r from-[#F8FAFC] to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] flex items-center justify-center">
            <Users className="w-5 h-5 text-[#1A48AD]" />
          </div>
          <div>
            <h3 className="text-[16px] font-[600] text-[#101828]">Assigned Staff</h3>
            <p className="text-[13px] text-[#667085]">
              {assignments.length} staff member{assignments.length !== 1 ? 's' : ''} assigned
            </p>
          </div>
        </div>

        {canManageAssignments && (
          <div className="flex gap-2">
            <Button
              onClick={() => setShowHistoryModal(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <History className="w-4 h-4" />
              History
            </Button>
            <Button
              onClick={() => setShowAssignModal(true)}
              size="sm"
              className="gap-2 bg-[#1A48AD] hover:bg-[#153a8a]"
            >
              <Plus className="w-4 h-4" />
              Assign Staff
            </Button>
          </div>
        )}
      </div>

      {/* Assigned Staff List */}
      <div className="p-6">
        {assignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-[14px] font-[500]">No staff assigned yet</p>
            <p className="text-[13px] text-[#667085] mt-1">
              {canManageAssignments
                ? "Click 'Assign Staff' to add staff members to this client"
                : "Contact an administrator to assign staff"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="group relative flex items-center gap-3 p-4 border border-[#E5E7EB] rounded-lg hover:border-[#1A48AD] hover:shadow-md transition-all"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {assignment.staff.profile_picture ? (
                    <Image
                      src={assignment.staff.profile_picture}
                      alt={`${assignment.staff.first_name} ${assignment.staff.last_name}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#1A48AD] text-white text-[16px] font-[600]">
                      {assignment.staff.first_name.charAt(0)}
                      {assignment.staff.last_name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-[600] text-[#101828] truncate">
                    {assignment.staff.first_name} {assignment.staff.last_name}
                  </p>
                  <p className="text-[13px] text-[#667085] truncate">{assignment.staff.email}</p>
                  <p className="text-[12px] text-[#9CA3AF] mt-1">
                    Assigned by {assignment.assigned_by.first_name} {assignment.assigned_by.last_name}
                  </p>
                </div>

                {canManageAssignments && (
                  <button
                    onClick={() => setStaffToUnassign(assignment.staff.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-50 hover:bg-red-100 rounded-md"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Staff Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Staff to Client</DialogTitle>
            <DialogDescription>
              Select one or more staff members to assign to this client
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {loadingAvailable ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : availableStaff.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-[14px] font-[500]">No available staff</p>
                <p className="text-[13px] text-[#667085] mt-1">
                  All staff members are already assigned to this client
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {availableStaff.map((staff) => (
                    <button
                      key={staff.id}
                      onClick={() => toggleStaffSelection(staff.id)}
                      className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-all ${
                        selectedStaffIds.includes(staff.id)
                          ? "border-[#1A48AD] bg-[#EFF6FF]"
                          : "border-[#E5E7EB] hover:border-[#1A48AD]"
                      }`}
                    >
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {staff.profile_picture ? (
                          <Image
                            src={staff.profile_picture}
                            alt={staff.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#1A48AD] text-white text-[14px] font-[600]">
                            {staff.name.split(' ').map(n => n.charAt(0)).join('')}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 text-left">
                        <p className="text-[14px] font-[600] text-[#101828]">{staff.name}</p>
                        <p className="text-[13px] text-[#667085]">{staff.email}</p>
                      </div>

                      {selectedStaffIds.includes(staff.id) && (
                        <div className="w-6 h-6 rounded-full bg-[#1A48AD] flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-[600] text-[#344054]">
                    Notes (optional)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this assignment..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowAssignModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssign}
                    disabled={isAssigning || selectedStaffIds.length === 0}
                    className="flex-1 bg-[#1A48AD] hover:bg-[#153a8a]"
                  >
                    {isAssigning ? "Assigning..." : `Assign ${selectedStaffIds.length} Staff`}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Unassign Confirmation Dialog */}
      <Dialog open={!!staffToUnassign} onOpenChange={() => setStaffToUnassign(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unassign Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to unassign this staff member from the client?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[13px] font-[600] text-[#344054]">
                Reason (optional)
              </label>
              <Textarea
                value={unassignNotes}
                onChange={(e) => setUnassignNotes(e.target.value)}
                placeholder="Add reason for unassigning..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setStaffToUnassign(null);
                  setUnassignNotes("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => staffToUnassign && handleUnassign(staffToUnassign)}
                disabled={isUnassigning}
                variant="destructive"
                className="flex-1"
              >
                {isUnassigning ? "Unassigning..." : "Unassign Staff"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assignment History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assignment History</DialogTitle>
            <DialogDescription>
              View all staff assignment changes for this client
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {historyData?.history && historyData.history.length > 0 ? (
              historyData.history.map((record) => (
                <div
                  key={record.id}
                  className="flex items-start gap-3 p-4 border border-[#E5E7EB] rounded-lg"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      record.action === "assigned"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {record.action === "assigned" ? (
                      <Plus className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-[14px] font-[600] text-[#101828]">
                      {record.staff.name}{" "}
                      <span className="font-normal text-[#667085]">
                        was {record.action}
                      </span>
                    </p>
                    <p className="text-[13px] text-[#667085]">
                      By {record.action_by.name} •{" "}
                      {new Date(record.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    {record.notes && (
                      <p className="text-[13px] text-[#667085] mt-2 italic">
                        &ldquo;{record.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-[14px] font-[500]">No history available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
