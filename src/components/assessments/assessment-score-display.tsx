"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui";
import { CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

interface AssessmentScoreDisplayProps {
  templateName: string;
  templateCode: string;
  totalScore: number;
  maxScore: number | null;
  percentageScore: number | null;
  interpretation: string | null;
  completedAt: string;
}

export function AssessmentScoreDisplay({
  templateName,
  templateCode,
  totalScore,
  maxScore,
  percentageScore,
  interpretation,
  completedAt,
}: AssessmentScoreDisplayProps) {
  // Get severity level based on template and score
  const getSeverity = (): "success" | "warning" | "error" | "info" => {
    switch (templateCode) {
      case "KATZ_ADL":
        if (totalScore >= 5) return "success";
        if (totalScore >= 3) return "warning";
        return "error";

      case "LAWTON_IADL":
        if (totalScore >= 7) return "success";
        if (totalScore >= 4) return "warning";
        return "error";

      case "PHQ9":
        if (totalScore <= 4) return "success";
        if (totalScore <= 9) return "info";
        if (totalScore <= 14) return "warning";
        return "error";

      case "MINI_COG":
        if (totalScore >= 3) return "success";
        return "warning";

      default:
        return "info";
    }
  };

  const severity = getSeverity();

  const severityStyles = {
    success: {
      bg: "bg-success/10",
      border: "border-success/30",
      text: "text-success",
      icon: CheckCircle,
    },
    warning: {
      bg: "bg-warning/10",
      border: "border-warning/30",
      text: "text-warning",
      icon: AlertTriangle,
    },
    error: {
      bg: "bg-error/10",
      border: "border-error/30",
      text: "text-error",
      icon: AlertCircle,
    },
    info: {
      bg: "bg-primary/10",
      border: "border-primary/30",
      text: "text-primary",
      icon: Info,
    },
  };

  const style = severityStyles[severity];
  const Icon = style.icon;

  return (
    <Card className={`${style.bg} ${style.border} border`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{templateName} Results</CardTitle>
          <span className="text-sm text-foreground-secondary">
            Completed {new Date(completedAt).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${style.bg}`}>
            <Icon className={`h-8 w-8 ${style.text}`} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${style.text}`}>
                {totalScore}
              </span>
              {maxScore && (
                <span className="text-lg text-foreground-secondary">
                  / {maxScore}
                </span>
              )}
            </div>
            {typeof percentageScore === "number" && (
              <p className="text-sm text-foreground-secondary">
                {percentageScore.toFixed(0)}% of maximum score
              </p>
            )}
          </div>
        </div>

        {/* Interpretation */}
        {interpretation && (
          <div className={`p-4 rounded-lg ${style.bg} border ${style.border}`}>
            <p className="font-medium">{interpretation}</p>
          </div>
        )}

        {/* Score Guidelines */}
        {renderScoreGuidelines(templateCode)}
      </CardContent>
    </Card>
  );
}

function renderScoreGuidelines(templateCode: string) {
  const guidelines: Record<string, { ranges: { range: string; label: string; level: string }[] }> = {
    KATZ_ADL: {
      ranges: [
        { range: "6", label: "Full function", level: "success" },
        { range: "4-5", label: "Moderate impairment", level: "warning" },
        { range: "2-3", label: "Severe impairment", level: "error" },
        { range: "0-1", label: "Very severe impairment", level: "error" },
      ],
    },
    LAWTON_IADL: {
      ranges: [
        { range: "8", label: "High function", level: "success" },
        { range: "5-7", label: "Moderate function", level: "warning" },
        { range: "0-4", label: "Low function", level: "error" },
      ],
    },
    PHQ9: {
      ranges: [
        { range: "0-4", label: "Minimal depression", level: "success" },
        { range: "5-9", label: "Mild depression", level: "info" },
        { range: "10-14", label: "Moderate depression", level: "warning" },
        { range: "15-19", label: "Moderately severe", level: "error" },
        { range: "20-27", label: "Severe depression", level: "error" },
      ],
    },
    MINI_COG: {
      ranges: [
        { range: "3-5", label: "Negative screen", level: "success" },
        { range: "0-2", label: "Positive screen", level: "warning" },
      ],
    },
  };

  const guide = guidelines[templateCode];
  if (!guide) return null;

  const levelColors = {
    success: "bg-success/20 text-success",
    warning: "bg-warning/20 text-warning",
    error: "bg-error/20 text-error",
    info: "bg-primary/20 text-primary",
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground-secondary">Score Interpretation Guide</p>
      <div className="flex flex-wrap gap-2">
        {guide.ranges.map((range) => (
          <div
            key={range.range}
            className={`px-3 py-1 rounded-full text-xs font-medium ${levelColors[range.level as keyof typeof levelColors]}`}
          >
            {range.range}: {range.label}
          </div>
        ))}
      </div>
    </div>
  );
}
