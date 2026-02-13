/**
 * Browser Geolocation Service for Web EVV
 */

export interface BrowserLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export type LocationStatus =
  | "idle"
  | "requesting"
  | "success"
  | "error"
  | "denied"
  | "unavailable";

export interface LocationError {
  code: number;
  message: string;
}

/**
 * Check if browser geolocation is supported
 */
export function isGeolocationSupported(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

/**
 * Get current position using browser Geolocation API
 * @param options Optional position options
 * @returns Promise with location data
 */
export function getBrowserLocation(
  options?: PositionOptions
): Promise<BrowserLocationData> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject({
        code: 0,
        message: "Geolocation is not supported by this browser",
      } as LocationError);
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let message = "Unknown error occurred";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            message =
              "Location information is unavailable. Please check your device settings.";
            break;
          case error.TIMEOUT:
            message =
              "Location request timed out. Please try again.";
            break;
        }
        reject({
          code: error.code,
          message,
        } as LocationError);
      },
      { ...defaultOptions, ...options }
    );
  });
}

/**
 * Get browser location with timeout fallback
 */
export async function getBrowserLocationWithTimeout(
  timeoutMs: number = 15000
): Promise<BrowserLocationData | null> {
  try {
    const location = await getBrowserLocation({ timeout: timeoutMs });
    return location;
  } catch (error) {
    console.error("Failed to get browser location:", error);
    return null;
  }
}

/**
 * Format location error for display
 */
export function formatLocationError(error: LocationError): string {
  return error.message;
}

/**
 * Format accuracy for display
 */
export function formatBrowserAccuracy(accuracy: number): string {
  if (accuracy < 10) {
    return "Excellent";
  } else if (accuracy < 30) {
    return "Good";
  } else if (accuracy < 100) {
    return "Fair";
  } else {
    return "Poor";
  }
}
