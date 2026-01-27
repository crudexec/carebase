"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Label,
  Input,
} from "@/components/ui";
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  Filter,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  Star,
  Hash,
  List,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { FormFieldType } from "@prisma/client";

interface FormTemplate {
  id: string;
  name: string;
}

interface FieldInfo {
  id: string;
  label: string;
  type: FormFieldType;
  sectionTitle: string;
}

interface YesNoAggregation {
  type: "yes_no";
  yes: number;
  no: number;
  yesPercentage: number;
  noPercentage: number;
}

interface ChoiceAggregation {
  type: "choice";
  options: Array<{ option: string; count: number; percentage: number }>;
}

interface RatingAggregation {
  type: "rating";
  average: number;
  maxRating: number;
  distribution: Array<{ rating: number; count: number }>;
  totalRatings: number;
}

interface NumberAggregation {
  type: "number";
  count: number;
  sum: number;
  average: number;
  min: number;
  max: number;
}

interface TextAggregation {
  type: "text";
  totalResponses: number;
  sample: string[];
}

type FieldAggregation =
  | YesNoAggregation
  | ChoiceAggregation
  | RatingAggregation
  | NumberAggregation
  | TextAggregation;

interface FieldReport {
  field: FieldInfo;
  aggregation: FieldAggregation;
}

interface ReportData {
  template: { id: string; name: string };
  totalResponses: number;
  fields: FieldReport[];
  availableFields: FieldInfo[];
}

const FIELD_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  YES_NO: CheckCircle,
  SINGLE_CHOICE: List,
  MULTIPLE_CHOICE: List,
  RATING_SCALE: Star,
  NUMBER: Hash,
};

const QUICK_DATE_RANGES = [
  { label: "Last 7 days", getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: "Last 30 days", getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: "Last 90 days", getValue: () => ({ start: subDays(new Date(), 90), end: new Date() }) },
];

export default function VisitNoteFieldReportsPage() {
  const router = useRouter();
  const [templates, setTemplates] = React.useState<FormTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [loadingTemplates, setLoadingTemplates] = React.useState(true);
  const [reportData, setReportData] = React.useState<ReportData | null>(null);

  React.useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/visit-notes/templates?status=ACTIVE");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchReport = async () => {
    if (!selectedTemplate) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({ templateId: selectedTemplate });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/reports/visit-note-fields?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (selectedTemplate) {
      fetchReport();
    }
  }, [selectedTemplate]);

  const handleDateRangeSelect = (range: { start: Date; end: Date }) => {
    setStartDate(format(range.start, "yyyy-MM-dd"));
    setEndDate(format(range.end, "yyyy-MM-dd"));
  };

  const renderFieldAggregation = (field: FieldInfo, aggregation: FieldAggregation) => {
    switch (aggregation.type) {
      case "yes_no":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" /> Yes
                  </span>
                  <span>{aggregation.yes} ({aggregation.yesPercentage}%)</span>
                </div>
                <div className="h-3 bg-background-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${aggregation.yesPercentage}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircle className="w-4 h-4" /> No
                  </span>
                  <span>{aggregation.no} ({aggregation.noPercentage}%)</span>
                </div>
                <div className="h-3 bg-background-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${aggregation.noPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "choice":
        return (
          <div className="space-y-2">
            {aggregation.options.map((opt, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-foreground">{opt.option}</span>
                  <span className="text-foreground-secondary">
                    {opt.count} ({opt.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${opt.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case "rating":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: aggregation.maxRating }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(aggregation.average)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-semibold text-foreground">
                {aggregation.average}
              </span>
              <span className="text-sm text-foreground-secondary">
                / {aggregation.maxRating} ({aggregation.totalRatings} ratings)
              </span>
            </div>
            <div className="space-y-1">
              {aggregation.distribution.reverse().map((d) => (
                <div key={d.rating} className="flex items-center gap-2 text-sm">
                  <span className="w-8 text-right">{d.rating}</span>
                  <Star className="w-4 h-4 text-yellow-400" />
                  <div className="flex-1 h-2 bg-background-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{
                        width: `${
                          aggregation.totalRatings > 0
                            ? (d.count / aggregation.totalRatings) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-foreground-secondary">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "number":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-background-secondary rounded-lg">
              <p className="text-xs text-foreground-secondary">Count</p>
              <p className="text-lg font-semibold text-foreground">{aggregation.count}</p>
            </div>
            <div className="p-3 bg-background-secondary rounded-lg">
              <p className="text-xs text-foreground-secondary">Average</p>
              <p className="text-lg font-semibold text-foreground">{aggregation.average}</p>
            </div>
            <div className="p-3 bg-background-secondary rounded-lg">
              <p className="text-xs text-foreground-secondary">Min</p>
              <p className="text-lg font-semibold text-foreground">{aggregation.min}</p>
            </div>
            <div className="p-3 bg-background-secondary rounded-lg">
              <p className="text-xs text-foreground-secondary">Max</p>
              <p className="text-lg font-semibold text-foreground">{aggregation.max}</p>
            </div>
          </div>
        );

      case "text":
        return (
          <div>
            <p className="text-sm text-foreground-secondary mb-2">
              {aggregation.totalResponses} responses (text fields cannot be aggregated)
            </p>
            {aggregation.sample.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-foreground-secondary">Sample responses:</p>
                {aggregation.sample.map((s, i) => (
                  <p key={i} className="text-sm text-foreground bg-background-secondary p-2 rounded">
                    {s}
                  </p>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/reports")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Visit Note Field Reports</h1>
          <p className="text-sm text-foreground-secondary mt-1">
            Aggregate and analyze data from visit note form fields
          </p>
        </div>
      </div>

      {/* Template Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Select Form Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTemplates ? (
            <div className="flex items-center gap-2 text-sm text-foreground-secondary">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <p className="text-sm text-foreground-secondary">
              No active form templates found. Create a form template first.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  {template.name}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTemplate && (
        <>
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex gap-2">
                  {QUICK_DATE_RANGES.map((range) => (
                    <Button
                      key={range.label}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDateRangeSelect(range.getValue())}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
                <div className="flex items-end gap-2">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <Button onClick={fetchReport} disabled={loading}>
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Results */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : reportData ? (
            <div className="space-y-6">
              {/* Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{reportData.template.name}</h3>
                      <p className="text-sm text-foreground-secondary">
                        {reportData.totalResponses} visit notes in selected range
                      </p>
                    </div>
                    <Badge>
                      {reportData.fields.length} aggregatable fields
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Field Reports */}
              {reportData.fields.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BarChart3 className="w-12 h-12 mx-auto text-foreground-secondary/30 mb-3" />
                    <p className="text-foreground-secondary">
                      No aggregatable fields found in this template.
                    </p>
                    <p className="text-sm text-foreground-secondary/70 mt-1">
                      Fields like Yes/No, Choice, Rating, and Number can be aggregated.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {reportData.fields.map((fieldReport) => {
                    const Icon = FIELD_TYPE_ICONS[fieldReport.field.type] || BarChart3;
                    return (
                      <Card key={fieldReport.field.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                <Icon className="w-4 h-4 text-primary" />
                                {fieldReport.field.label}
                              </CardTitle>
                              <p className="text-xs text-foreground-secondary mt-1">
                                {fieldReport.field.sectionTitle} &bull;{" "}
                                {fieldReport.field.type.replace(/_/g, " ")}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {renderFieldAggregation(fieldReport.field, fieldReport.aggregation)}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
