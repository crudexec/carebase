"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThresholdBreachData } from "@/lib/visit-notes/types";

interface ThresholdAlertBannerProps {
  breaches: ThresholdBreachData[];
  className?: string;
}

export function ThresholdAlertBanner({ breaches, className }: ThresholdAlertBannerProps) {
  if (!breaches || breaches.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-warning bg-warning/10 p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-warning" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-warning">
              Threshold Alert{breaches.length > 1 ? "s" : ""}
            </h3>
            <p className="text-sm text-foreground-secondary mt-1">
              {breaches.length === 1
                ? "A value in this visit note exceeded the configured threshold."
                : `${breaches.length} values in this visit note exceeded configured thresholds.`}
            </p>
          </div>

          <div className="space-y-2">
            {breaches.map((breach) => (
              <ThresholdBreachItem key={breach.id} breach={breach} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThresholdBreachItem({ breach }: { breach: ThresholdBreachData }) {
  const isBelow = breach.breachType === "BELOW_MIN";
  const thresholdValue = isBelow ? breach.minThreshold : breach.maxThreshold;
  const thresholdLabel = isBelow ? "minimum" : "maximum";

  return (
    <div className="rounded-md border border-warning/30 bg-background p-3 text-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="font-medium">{breach.fieldLabel}</span>
          <span className="text-foreground-secondary mx-2">-</span>
          <span className="text-foreground-secondary">
            Value entered:{" "}
            <span className="font-semibold text-warning">{breach.value}</span>
          </span>
        </div>
        <div className="text-foreground-secondary text-right">
          <span>
            {isBelow ? "Below" : "Above"} {thresholdLabel}:{" "}
            <span className="font-medium">{thresholdValue}</span>
          </span>
        </div>
      </div>

      {breach.customMessage && (
        <p className="mt-2 text-foreground-secondary border-t border-warning/20 pt-2">
          {breach.customMessage}
        </p>
      )}
    </div>
  );
}
