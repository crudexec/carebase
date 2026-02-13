/**
 * EVV (Electronic Visit Verification) Types
 */

export interface EVVLocationData {
  latitude: number;
  longitude: number;
  accuracy: number; // GPS accuracy in meters
  timestamp: string; // ISO 8601 timestamp
  source: "mobile" | "web";
  isWithinGeofence: boolean;
  distanceFromClient: number; // Distance in meters from client location
  geofenceRadius: number; // The geofence radius used for validation
}

export type EVVStatus =
  | "COMPLIANT"
  | "OUT_OF_RANGE"
  | "LOCATION_UNAVAILABLE"
  | "NOT_REQUIRED";

export interface EVVValidationResult {
  status: EVVStatus;
  isWithinGeofence: boolean;
  distanceFromClient: number | null;
  geofenceRadius: number;
  message: string;
}

export interface LocationInput {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface ClientLocation {
  latitude: number;
  longitude: number;
  geofenceRadius: number;
}
