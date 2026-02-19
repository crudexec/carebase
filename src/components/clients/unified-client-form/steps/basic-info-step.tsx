"use client";

import * as React from "react";
import { Input, DateInput, Label, Select } from "@/components/ui";
import { User } from "lucide-react";
import { StepProps, US_STATES } from "../types";

export function BasicInfoStep({ data, onChange, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
          <p className="text-sm text-foreground-secondary">
            Enter the client's personal and contact details
          </p>
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" required>
            First Name
          </Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            placeholder="Enter first name"
            className={errors?.firstName ? "border-error" : ""}
          />
          {errors?.firstName && (
            <p className="text-xs text-error">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" required>
            Last Name
          </Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            placeholder="Enter last name"
            className={errors?.lastName ? "border-error" : ""}
          />
          {errors?.lastName && (
            <p className="text-xs text-error">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* DOB and Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <DateInput
            id="dateOfBirth"
            value={data.dateOfBirth}
            onChange={(e) => onChange({ dateOfBirth: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Street Address</Label>
        <Input
          id="address"
          value={data.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="123 Main Street"
        />
      </div>

      {/* City, State, ZIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-2 col-span-2 sm:col-span-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Baltimore"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select
            id="state"
            value={data.state}
            onChange={(e) => onChange({ state: e.target.value })}
          >
            {US_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            value={data.zipCode}
            onChange={(e) => onChange({ zipCode: e.target.value })}
            placeholder="21201"
            maxLength={10}
          />
        </div>
      </div>
    </div>
  );
}
