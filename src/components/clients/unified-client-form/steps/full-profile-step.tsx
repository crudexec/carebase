"use client";

import * as React from "react";
import { Input, Label, Textarea } from "@/components/ui";
import {
  Phone,
  CreditCard,
  Stethoscope,
  HeartPulse,
  User,
} from "lucide-react";
import { StepProps, CarerData } from "../types";
import { StaffSearchSelect } from "@/components/staff";

interface FullProfileStepProps extends StepProps {
  onCarerChange?: (carerId: string, carer: CarerData | null) => void;
}

export function FullProfileStep({ data, onChange, onCarerChange }: FullProfileStepProps) {
  const handleCarerChange = (carerId: string, carer: CarerData | null) => {
    onChange({ assignedCarerId: carerId });
    onCarerChange?.(carerId, carer);
  };

  return (
    <div className="space-y-8">
      {/* Emergency Contact Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="p-2 rounded-lg bg-error/10 text-error">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Emergency Contact</h3>
            <p className="text-xs text-foreground-secondary">
              Primary contact in case of emergency
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Contact Name</Label>
            <Input
              id="emergencyContact"
              value={data.emergencyContact}
              onChange={(e) => onChange({ emergencyContact: e.target.value })}
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Phone Number</Label>
            <Input
              id="emergencyPhone"
              type="tel"
              value={data.emergencyPhone}
              onChange={(e) => onChange({ emergencyPhone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyRelation">Relationship</Label>
            <Input
              id="emergencyRelation"
              value={data.emergencyRelation}
              onChange={(e) => onChange({ emergencyRelation: e.target.value })}
              placeholder="e.g., Daughter, Spouse"
            />
          </div>
        </div>
      </div>

      {/* Insurance Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Insurance Details</h3>
            <p className="text-xs text-foreground-secondary">
              Medicaid and secondary insurance information
            </p>
          </div>
        </div>

        {/* Primary Insurance */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Primary Insurance (Medicaid)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medicaidId">Medicaid Member ID</Label>
              <Input
                id="medicaidId"
                value={data.medicaidId}
                onChange={(e) => onChange({ medicaidId: e.target.value })}
                placeholder="Enter member ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicaidPayerId">Medicaid Payer ID</Label>
              <Input
                id="medicaidPayerId"
                value={data.medicaidPayerId}
                onChange={(e) => onChange({ medicaidPayerId: e.target.value })}
                placeholder="Enter payer ID"
              />
            </div>
          </div>
        </div>

        {/* Secondary Insurance */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground-tertiary" />
            Secondary Insurance
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="secondaryInsuranceId">Secondary Member ID</Label>
              <Input
                id="secondaryInsuranceId"
                value={data.secondaryInsuranceId}
                onChange={(e) => onChange({ secondaryInsuranceId: e.target.value })}
                placeholder="Enter member ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryPayerId">Secondary Payer ID</Label>
              <Input
                id="secondaryPayerId"
                value={data.secondaryPayerId}
                onChange={(e) => onChange({ secondaryPayerId: e.target.value })}
                placeholder="Enter payer ID"
              />
            </div>
          </div>
        </div>

        {/* Additional Insurance Info */}
        <div className="space-y-2">
          <Label htmlFor="insuranceInfo">Additional Insurance Notes</Label>
          <Textarea
            id="insuranceInfo"
            value={data.insuranceInfo}
            onChange={(e) => onChange({ insuranceInfo: e.target.value })}
            rows={2}
            placeholder="Insurance carrier, plan type, authorization details..."
          />
        </div>
      </div>

      {/* PCP Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="p-2 rounded-lg bg-success/10 text-success">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Primary Care Physician</h3>
            <p className="text-xs text-foreground-secondary">
              PCP contact and practice information
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="physicianName">Physician Name</Label>
            <Input
              id="physicianName"
              value={data.physicianName}
              onChange={(e) => onChange({ physicianName: e.target.value })}
              placeholder="Dr. John Smith"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="physicianNpi">NPI Number</Label>
            <Input
              id="physicianNpi"
              value={data.physicianNpi}
              onChange={(e) => onChange({ physicianNpi: e.target.value })}
              placeholder="10-digit NPI"
              maxLength={10}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="physicianPhone">Phone Number</Label>
            <Input
              id="physicianPhone"
              type="tel"
              value={data.physicianPhone}
              onChange={(e) => onChange({ physicianPhone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="physicianFax">Fax Number</Label>
            <Input
              id="physicianFax"
              type="tel"
              value={data.physicianFax}
              onChange={(e) => onChange({ physicianFax: e.target.value })}
              placeholder="(555) 123-4568"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="physicianAddress">Office Address</Label>
            <Input
              id="physicianAddress"
              value={data.physicianAddress}
              onChange={(e) => onChange({ physicianAddress: e.target.value })}
              placeholder="123 Medical Center Dr, City, State 12345"
            />
          </div>
        </div>
      </div>

      {/* Medical Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="p-2 rounded-lg bg-warning/10 text-warning">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Medical Notes</h3>
            <p className="text-xs text-foreground-secondary">
              Additional medical information and care requirements
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Textarea
            id="medicalNotes"
            value={data.medicalNotes}
            onChange={(e) => onChange({ medicalNotes: e.target.value })}
            rows={4}
            placeholder="Enter medical conditions, medications, allergies, or special care requirements..."
          />
        </div>
      </div>

      {/* Caregiver Assignment */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Caregiver Assignment</h3>
            <p className="text-xs text-foreground-secondary">
              Assign a primary caregiver to this client
            </p>
          </div>
        </div>
        <StaffSearchSelect
          value={data.assignedCarerId}
          onChange={handleCarerChange}
          label="Assigned Caregiver"
          placeholder="Search for caregiver..."
          role="CARER"
        />
      </div>
    </div>
  );
}
