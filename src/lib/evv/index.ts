/**
 * EVV (Electronic Visit Verification) Utility Library
 */

import {
  EVVLocationData,
  EVVValidationResult,
  EVVStatus,
  LocationInput,
  ClientLocation,
} from "./types";

// Default geofence radius in meters (used if company default not set)
export const DEFAULT_GEOFENCE_RADIUS = 150;

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Validate EVV location against client geofence
 */
export function validateEVVLocation(
  location: LocationInput,
  client: ClientLocation
): EVVValidationResult {
  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    client.latitude,
    client.longitude
  );

  const roundedDistance = Math.round(distance);
  const isWithinGeofence = distance <= client.geofenceRadius;

  const status: EVVStatus = isWithinGeofence ? "COMPLIANT" : "OUT_OF_RANGE";

  return {
    status,
    isWithinGeofence,
    distanceFromClient: roundedDistance,
    geofenceRadius: client.geofenceRadius,
    message: isWithinGeofence
      ? "Location verified within geofence"
      : `Location is ${roundedDistance}m from client (geofence: ${client.geofenceRadius}m)`,
  };
}

/**
 * Create EVV location data object for storage
 */
export function createEVVLocationData(
  location: LocationInput,
  validationResult: EVVValidationResult,
  source: "mobile" | "web"
): EVVLocationData {
  return {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    timestamp: new Date().toISOString(),
    source,
    isWithinGeofence: validationResult.isWithinGeofence,
    distanceFromClient: validationResult.distanceFromClient ?? 0,
    geofenceRadius: validationResult.geofenceRadius,
  };
}

/**
 * Parse stored EVV location data from JSON
 */
export function parseEVVLocationData(
  json: unknown
): EVVLocationData | null {
  if (!json || typeof json !== "object") {
    return null;
  }

  const data = json as Record<string, unknown>;

  // Validate required fields
  if (
    typeof data.latitude !== "number" ||
    typeof data.longitude !== "number" ||
    typeof data.isWithinGeofence !== "boolean"
  ) {
    return null;
  }

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    accuracy: typeof data.accuracy === "number" ? data.accuracy : 0,
    timestamp: typeof data.timestamp === "string" ? data.timestamp : "",
    source: data.source === "web" ? "web" : "mobile",
    isWithinGeofence: data.isWithinGeofence,
    distanceFromClient:
      typeof data.distanceFromClient === "number" ? data.distanceFromClient : 0,
    geofenceRadius:
      typeof data.geofenceRadius === "number"
        ? data.geofenceRadius
        : DEFAULT_GEOFENCE_RADIUS,
  };
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export * from "./types";
