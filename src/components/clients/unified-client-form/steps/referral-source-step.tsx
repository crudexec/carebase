"use client";

import * as React from "react";
import { Input, DateInput, Label, Select, Textarea } from "@/components/ui";
import { FileText } from "lucide-react";
import { StepProps, ReferralSource, StaffMember } from "../types";

interface ReferralSourceStepProps extends StepProps {
  sources: ReferralSource[];
  staff: StaffMember[];
  isLoadingSources?: boolean;
  isLoadingStaff?: boolean;
}

export function ReferralSourceStep({
  data,
  onChange,
  sources,
  staff,
  isLoadingSources,
  isLoadingStaff,
}: ReferralSourceStepProps) {
  const showOtherField = data.referralSourceId === "OTHER";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Referral Source</h2>
          <p className="text-sm text-foreground-secondary">
            Track where this referral came from
          </p>
        </div>
      </div>

      {/* Source and Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="referralSourceId">Referral Source</Label>
          <Select
            id="referralSourceId"
            value={data.referralSourceId}
            onChange={(e) => onChange({ referralSourceId: e.target.value })}
            disabled={isLoadingSources}
          >
            <option value="">
              {isLoadingSources ? "Loading sources..." : "Select source..."}
            </option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name} ({source.type})
              </option>
            ))}
            <option value="OTHER">Other (specify below)</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="referralDate">Referral Date</Label>
          <DateInput
            id="referralDate"
            value={data.referralDate}
            onChange={(e) => onChange({ referralDate: e.target.value })}
          />
        </div>
      </div>

      {/* Other Source Field */}
      {showOtherField && (
        <div className="space-y-2">
          <Label htmlFor="referralSourceOther">Other Source</Label>
          <Input
            id="referralSourceOther"
            value={data.referralSourceOther}
            onChange={(e) => onChange({ referralSourceOther: e.target.value })}
            placeholder="Describe the referral source"
          />
        </div>
      )}

      {/* Assigned To */}
      <div className="space-y-2">
        <Label htmlFor="assignedToId">Assign To</Label>
        <Select
          id="assignedToId"
          value={data.assignedToId}
          onChange={(e) => onChange({ assignedToId: e.target.value })}
          disabled={isLoadingStaff}
        >
          <option value="">
            {isLoadingStaff ? "Loading staff..." : "Select staff member..."}
          </option>
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.firstName} {member.lastName}
            </option>
          ))}
        </Select>
        <p className="text-xs text-foreground-tertiary">
          Staff member responsible for follow-up on this referral
        </p>
      </div>

      {/* Reason for Referral */}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Referral</Label>
        <Textarea
          id="reason"
          value={data.reason}
          onChange={(e) => onChange({ reason: e.target.value })}
          rows={3}
          placeholder="Why is this client being referred for home care services?"
        />
      </div>
    </div>
  );
}
