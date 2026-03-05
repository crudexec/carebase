"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DataPoint {
  date: string;
  value: number;
  visitNoteId?: string;
}

interface TrendStats {
  average: number;
  min: number;
  max: number;
  count: number;
  slope: number;
  trend: "improving" | "worsening" | "stable";
}

interface FieldConfig {
  min?: number;
  max?: number;
  thresholdEnabled?: boolean;
}

interface TrendChartProps {
  fieldId: string;
  label: string;
  sectionTitle: string;
  dataPoints: DataPoint[];
  stats: TrendStats;
  config: FieldConfig;
  color?: string;
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ef4444", // red
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ec4899", // pink
];

export function TrendChart({
  label,
  sectionTitle,
  dataPoints,
  stats,
  config,
  color = COLORS[0],
}: TrendChartProps) {
  // Transform data for Recharts
  const chartData = useMemo(() => {
    return dataPoints.map((point) => ({
      date: point.date,
      value: point.value,
      visitNoteId: point.visitNoteId,
      // Format date for display
      displayDate: new Date(point.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [dataPoints]);

  // Calculate Y-axis domain
  const yDomain = useMemo(() => {
    if (dataPoints.length === 0) return [0, 10];

    let minValue = stats.min;
    let maxValue = stats.max;

    // Include threshold lines in domain calculation
    if (config.thresholdEnabled) {
      if (config.min !== undefined) {
        minValue = Math.min(minValue, config.min);
      }
      if (config.max !== undefined) {
        maxValue = Math.max(maxValue, config.max);
      }
    }

    // Add some padding
    const padding = (maxValue - minValue) * 0.1 || 1;
    return [Math.floor(minValue - padding), Math.ceil(maxValue + padding)];
  }, [dataPoints, stats, config]);

  const trendLabel = {
    improving: "Improving",
    worsening: "Worsening",
    stable: "Stable",
  };

  const trendColor = {
    improving: "text-success",
    worsening: "text-error",
    stable: "text-foreground-secondary",
  };

  if (dataPoints.length === 0) {
    return (
      <div className="border rounded-lg p-4 bg-background">
        <div className="mb-2">
          <h4 className="font-semibold text-foreground">{label}</h4>
          <p className="text-sm text-foreground-secondary">{sectionTitle}</p>
        </div>
        <div className="flex items-center justify-center h-48 text-foreground-secondary">
          No data available for this field
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-background">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-foreground">{label}</h4>
            <p className="text-sm text-foreground-secondary">{sectionTitle}</p>
          </div>
          <div className="flex items-center gap-1">
            {stats.trend === "improving" && <TrendingDown className="w-4 h-4 text-success" />}
            {stats.trend === "worsening" && <TrendingUp className="w-4 h-4 text-error" />}
            {stats.trend === "stable" && <Minus className="w-4 h-4 text-foreground-secondary" />}
            <span className={`text-sm font-medium ${trendColor[stats.trend]}`}>
              {trendLabel[stats.trend]}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12 }}
              className="text-foreground-secondary"
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 12 }}
              className="text-foreground-secondary"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "var(--foreground)" }}
              formatter={(value: number | undefined) => [value !== undefined ? value.toFixed(2) : "-", label]}
              labelFormatter={(labelValue) => `Date: ${labelValue}`}
            />
            <Legend />

            {/* Threshold lines */}
            {config.thresholdEnabled && config.min !== undefined && (
              <ReferenceLine
                y={config.min}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{
                  value: `Min: ${config.min}`,
                  position: "right",
                  fontSize: 10,
                  fill: "#ef4444",
                }}
              />
            )}
            {config.thresholdEnabled && config.max !== undefined && (
              <ReferenceLine
                y={config.max}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{
                  value: `Max: ${config.max}`,
                  position: "right",
                  fontSize: 10,
                  fill: "#ef4444",
                }}
              />
            )}

            {/* Average line */}
            <ReferenceLine
              y={stats.average}
              stroke="#6b7280"
              strokeDasharray="3 3"
              label={{
                value: `Avg: ${stats.average.toFixed(1)}`,
                position: "left",
                fontSize: 10,
                fill: "#6b7280",
              }}
            />

            {/* Data line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name={label}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-4 gap-4 text-center border-t pt-4">
        <div>
          <p className="text-xs text-foreground-secondary">Average</p>
          <p className="text-sm font-semibold text-foreground">{stats.average.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-foreground-secondary">Min</p>
          <p className="text-sm font-semibold text-foreground">{stats.min}</p>
        </div>
        <div>
          <p className="text-xs text-foreground-secondary">Max</p>
          <p className="text-sm font-semibold text-foreground">{stats.max}</p>
        </div>
        <div>
          <p className="text-xs text-foreground-secondary">Data Points</p>
          <p className="text-sm font-semibold text-foreground">{stats.count}</p>
        </div>
      </div>
    </div>
  );
}

// Export colors for consistent usage across multiple charts
export { COLORS as CHART_COLORS };
