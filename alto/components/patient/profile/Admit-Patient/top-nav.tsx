"use client";
import React, { useState } from "react";
import { ImSpinner8 } from "react-icons/im";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Burger,
  SegmentedControl,
} from "@/components/ui";

import Sidebar from "./side-bar";

const TopNav = ({
  activeTab,
  setActiveTab,
  loading,
  patient,
  payer,
}: {
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  activeTab: string;
  loading: boolean;
  patient: {
    firstName: string;
    lastName: string;
    image: string;
  };
  payer: string;
}) => {
  const [open, setOpen] = useState(false);
  const toggleNav = () => {
    setOpen(!open);
  };
  return (
    <div className="bg-secondary sticky top-0 z-20">
      <div className="px-4 pb-2 pt-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {!loading ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={""} alt="patient-profile" />
              {(patient?.firstName || patient?.lastName) && (
                <AvatarFallback className="bg-primary text-primary-foreground uppercase">{`${patient?.firstName?.charAt(0)}${patient?.lastName?.charAt(0)}`}</AvatarFallback>
              )}
            </Avatar>
          ) : (
            <Avatar className="h-12 w-12 items-center justify-center place-items-center bg-border/60">
              <ImSpinner8 className="animate-spin" />
            </Avatar>
          )}
          <p className="text-base font-medium">
            {patient?.firstName} {patient?.lastName}
          </p>
        </div>
        <Burger
          toggleNav={toggleNav}
          opened={open}
          className="block lg:hidden"
        />
      </div>
      <SegmentedControl
        data={
          payer !== "MEDICARE_PATIENT"
            ? [
                { label: "Admission", value: "admission" },
                { label: "Policy Holder", value: "policyHolder" },
              ]
            : [{ label: "Admission", value: "admission" }]
        }
        value={activeTab}
        transparent
        className="mx-auto lg:flex justify-end rounded-none px-0 hidden"
        onChange={setActiveTab}
      />
      <Sidebar
        open={open}
        setOpen={setOpen}
        onClick={setActiveTab}
        tabs={
          payer !== "MEDICARE_PATIENT"
            ? [
                { label: "Admission", value: "admission" },
                { label: "Policy Holder", value: "policyHolder" },
              ]
            : [{ label: "Admission", value: "admission" }]
        }
      />
    </div>
  );
};

export default TopNav;
