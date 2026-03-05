/**
 * Trend Calculation Utilities for Visit Note Reports
 */

export interface DataPoint {
  date: Date;
  value: number;
  visitNoteId?: string;
}

export interface TrendStats {
  average: number;
  min: number;
  max: number;
  count: number;
  slope: number;
  trend: "improving" | "worsening" | "stable";
}

/**
 * Calculate linear regression slope
 * Positive slope = values increasing over time
 * Negative slope = values decreasing over time
 */
export function calculateSlope(dataPoints: DataPoint[]): number {
  const n = dataPoints.length;
  if (n < 2) return 0;

  // Sort by date
  const sorted = [...dataPoints].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Convert dates to day numbers (0, 1, 2, ...)
  const startDate = sorted[0].date.getTime();
  const points = sorted.map((p) => ({
    x: (p.date.getTime() - startDate) / (1000 * 60 * 60 * 24), // days since start
    y: p.value,
  }));

  // Calculate averages
  const avgX = points.reduce((sum, p) => sum + p.x, 0) / n;
  const avgY = points.reduce((sum, p) => sum + p.y, 0) / n;

  // Calculate slope using least squares formula
  const numerator = points.reduce((sum, p) => sum + (p.x - avgX) * (p.y - avgY), 0);
  const denominator = points.reduce((sum, p) => sum + (p.x - avgX) ** 2, 0);

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Determine trend direction based on slope
 * For most health metrics, decreasing = improving (pain, symptoms)
 * Can be inverted for metrics where increasing = good (mobility, strength)
 */
export function determineTrend(
  slope: number,
  invertDirection: boolean = false
): "improving" | "worsening" | "stable" {
  const threshold = 0.1; // Values per day threshold

  if (Math.abs(slope) <= threshold) {
    return "stable";
  }

  const isIncreasing = slope > 0;

  // For inverted metrics (like mobility score), increasing is improving
  if (invertDirection) {
    return isIncreasing ? "improving" : "worsening";
  }

  // For normal metrics (like pain), decreasing is improving
  return isIncreasing ? "worsening" : "improving";
}

/**
 * Calculate comprehensive statistics for a set of data points
 */
export function calculateStats(
  dataPoints: DataPoint[],
  invertTrendDirection: boolean = false
): TrendStats {
  if (dataPoints.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      count: 0,
      slope: 0,
      trend: "stable",
    };
  }

  const values = dataPoints.map((p) => p.value);
  const sum = values.reduce((a, b) => a + b, 0);
  const slope = calculateSlope(dataPoints);

  return {
    average: Math.round((sum / values.length) * 100) / 100,
    min: Math.min(...values),
    max: Math.max(...values),
    count: dataPoints.length,
    slope: Math.round(slope * 1000) / 1000, // Round to 3 decimal places
    trend: determineTrend(slope, invertTrendDirection),
  };
}

/**
 * Aggregate multiple data points on the same day
 */
export function aggregateByDay(
  dataPoints: DataPoint[],
  method: "average" | "latest" | "first" = "latest"
): DataPoint[] {
  // Group by date (YYYY-MM-DD)
  const grouped = new Map<string, DataPoint[]>();

  for (const point of dataPoints) {
    const dateKey = point.date.toISOString().split("T")[0];
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(point);
  }

  // Aggregate each group
  const result: DataPoint[] = [];

  for (const [dateKey, points] of grouped) {
    // Sort by date within the day
    points.sort((a, b) => a.date.getTime() - b.date.getTime());

    let aggregatedValue: number;
    let selectedPoint: DataPoint;

    switch (method) {
      case "average":
        aggregatedValue = points.reduce((sum, p) => sum + p.value, 0) / points.length;
        selectedPoint = {
          date: new Date(dateKey),
          value: Math.round(aggregatedValue * 100) / 100,
          visitNoteId: points[points.length - 1].visitNoteId, // Use latest note ID
        };
        break;
      case "first":
        selectedPoint = points[0];
        break;
      case "latest":
      default:
        selectedPoint = points[points.length - 1];
        break;
    }

    result.push({
      ...selectedPoint,
      date: new Date(dateKey), // Normalize to start of day
    });
  }

  // Sort by date
  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Get preset date ranges
 */
export function getDateRange(preset: "7d" | "30d" | "90d" | "custom", customStart?: Date, customEnd?: Date) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  let start: Date;

  switch (preset) {
    case "7d":
      start = new Date();
      start.setDate(start.getDate() - 7);
      break;
    case "30d":
      start = new Date();
      start.setDate(start.getDate() - 30);
      break;
    case "90d":
      start = new Date();
      start.setDate(start.getDate() - 90);
      break;
    case "custom":
      if (!customStart || !customEnd) {
        throw new Error("Custom date range requires start and end dates");
      }
      return { start: customStart, end: customEnd };
    default:
      start = new Date();
      start.setDate(start.getDate() - 30);
  }

  start.setHours(0, 0, 0, 0);

  return { start, end };
}
