"use client";

import Link from "next/link";
import { Clock, AlertTriangle, Check, X, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MedPassDose,
  MEDICATION_ROUTE_LABELS,
  ADMINISTRATION_RESULT_LABELS,
} from "@/lib/emar/types";
import { format } from "date-fns";

interface MedPassCardProps {
  dose: MedPassDose;
  onAdminister: (dose: MedPassDose) => void;
}

export function MedPassCard({ dose, onAdminister }: MedPassCardProps) {
  const isControlled = dose.medication.controlledSchedule !== "NOT_CONTROLLED";
  const isCompleted = dose.status === "COMPLETED";
  const isMissed = dose.status === "MISSED";
  const isPending = dose.status === "PENDING";

  // Check if within administration window
  const now = new Date();
  const isInWindow = now >= dose.windowStart && now <= dose.windowEnd;
  const isUpcoming = now < dose.windowStart;

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        isCompleted && "bg-green-50 border-green-200",
        isMissed && "bg-red-50 border-red-200",
        isPending && isInWindow && "bg-blue-50 border-blue-200",
        isControlled && !isCompleted && "ring-2 ring-orange-300"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Medication Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm truncate">
                {dose.medication.name}
              </h4>
              {isControlled && (
                <Badge variant="warning" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {dose.medication.controlledSchedule.replace("_", " ")}
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {dose.medication.strength} {dose.medication.form} -{" "}
              {MEDICATION_ROUTE_LABELS[dose.medication.route]}
            </p>

            <p className="text-sm font-medium mt-1">
              Dose: {dose.medication.doseAmount}
            </p>

            {dose.medication.specialInstructions && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                {dose.medication.specialInstructions}
              </p>
            )}

            {/* Client Info */}
            <Link
              href={`/clients/${dose.client.id}`}
              className="flex items-center gap-1 mt-2 text-sm text-primary hover:underline py-1 touch-manipulation"
            >
              <User className="h-4 w-4" />
              <span className="font-medium">
                {dose.client.firstName} {dose.client.lastName}
              </span>
            </Link>
          </div>

          {/* Time and Status */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {format(new Date(dose.scheduledTime), "h:mm a")}
              </span>
            </div>

            {/* Status Badge */}
            {isCompleted && dose.administration && (
              <Badge variant="success">
                <Check className="h-3 w-3 mr-1" />
                {ADMINISTRATION_RESULT_LABELS[dose.administration.result]}
              </Badge>
            )}

            {isMissed && (
              <Badge variant="error">
                <X className="h-3 w-3 mr-1" />
                Missed
              </Badge>
            )}

            {isPending && isInWindow && (
              <Badge variant="primary">Due Now</Badge>
            )}

            {isPending && isUpcoming && (
              <Badge variant="default">Upcoming</Badge>
            )}

            {/* Window Info */}
            <p className="text-xs text-muted-foreground">
              Window: {format(new Date(dose.windowStart), "h:mm a")} -{" "}
              {format(new Date(dose.windowEnd), "h:mm a")}
            </p>

            {/* Action Button */}
            {!isCompleted && (
              <Button
                variant={isMissed ? "error" : "default"}
                onClick={() => onAdminister(dose)}
                className="mt-2 min-h-[44px] px-4 touch-manipulation"
              >
                {isMissed ? "Document Missed" : "Administer"}
              </Button>
            )}

            {isCompleted && dose.administration?.administeredAt && (
              <p className="text-xs text-green-600">
                Given at{" "}
                {format(new Date(dose.administration.administeredAt), "h:mm a")}
              </p>
            )}
          </div>
        </div>

        {/* Witness Requirement Warning */}
        {dose.medication.requiresWitness && !isCompleted && (
          <div className="mt-3 p-2 bg-orange-100 rounded-md">
            <p className="text-xs text-orange-700 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Witness signature required for this medication
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
