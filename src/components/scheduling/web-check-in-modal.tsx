"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X,
  Navigation,
} from "lucide-react";
import {
  getBrowserLocation,
  isGeolocationSupported,
  formatBrowserAccuracy,
  type BrowserLocationData,
  type LocationError,
} from "@/lib/evv/browser-location";

type CheckStatus =
  | "idle"
  | "getting-location"
  | "submitting"
  | "success"
  | "error";

interface WebCheckInModalProps {
  shiftId: string;
  clientName: string;
  action: "check-in" | "check-out";
  onSuccess: () => void;
  onClose: () => void;
}

interface EVVResponse {
  success: boolean;
  evvStatus?: string;
  evvIsWithinGeofence?: boolean;
  distanceFromClient?: number;
  evvMessage?: string;
}

export function WebCheckInModal({
  shiftId,
  clientName,
  action,
  onSuccess,
  onClose,
}: WebCheckInModalProps) {
  const [status, setStatus] = useState<CheckStatus>("idle");
  const [location, setLocation] = useState<BrowserLocationData | null>(null);
  const [evvResult, setEvvResult] = useState<EVVResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actionLabel = action === "check-in" ? "Check In" : "Check Out";
  const actioningLabel = action === "check-in" ? "Checking In" : "Checking Out";

  const handleAction = async () => {
    setError(null);

    // Check if geolocation is supported
    if (!isGeolocationSupported()) {
      setError(
        "Your browser does not support location services. Please use a modern browser or the mobile app."
      );
      setStatus("error");
      return;
    }

    // Get location
    setStatus("getting-location");
    try {
      const loc = await getBrowserLocation();
      setLocation(loc);

      // Submit to API
      setStatus("submitting");

      const endpoint =
        action === "check-in"
          ? `/api/check-in/${shiftId}/check-in`
          : `/api/check-in/${shiftId}/check-out`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: {
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracy: loc.accuracy,
          },
        }),
      });

      const data: EVVResponse = await response.json();

      if (response.ok && data.success) {
        setEvvResult(data);
        setStatus("success");

        // Auto-close after 2 seconds on success
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        throw new Error(
          (data as { error?: string }).error || `Failed to ${action}`
        );
      }
    } catch (err) {
      console.error(`${actionLabel} error:`, err);
      if ((err as LocationError).code !== undefined) {
        setError((err as LocationError).message);
      } else {
        setError(
          err instanceof Error ? err.message : `Failed to ${action}`
        );
      }
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-foreground-secondary hover:text-foreground transition-colors"
            disabled={status === "getting-location" || status === "submitting"}
          >
            <X className="w-5 h-5" />
          </button>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            EVV {actionLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Info */}
          <div className="text-center">
            <p className="text-foreground-secondary">
              {action === "check-in" ? "Starting shift with" : "Ending shift with"}
            </p>
            <p className="text-lg font-medium">{clientName}</p>
          </div>

          {/* Status Display */}
          {status === "idle" && (
            <div className="text-center space-y-4">
              <div className="bg-info/10 rounded-lg p-4">
                <Navigation className="w-8 h-8 text-info mx-auto mb-2" />
                <p className="text-sm text-foreground-secondary">
                  Your location will be captured for EVV verification.
                </p>
              </div>
              <Button onClick={handleAction} className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                {actionLabel} with Location
              </Button>
            </div>
          )}

          {status === "getting-location" && (
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
              <p className="text-foreground-secondary">Getting your location...</p>
              <p className="text-sm text-foreground-tertiary">
                Please allow location access if prompted
              </p>
            </div>
          )}

          {status === "submitting" && (
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
              <p className="text-foreground-secondary">{actioningLabel}...</p>
              {location && (
                <p className="text-xs text-foreground-tertiary">
                  GPS Accuracy: {formatBrowserAccuracy(location.accuracy)} (
                  {Math.round(location.accuracy)}m)
                </p>
              )}
            </div>
          )}

          {status === "success" && evvResult && (
            <div className="text-center space-y-4">
              {evvResult.evvIsWithinGeofence ? (
                <>
                  <CheckCircle className="w-12 h-12 text-success mx-auto" />
                  <div>
                    <p className="font-medium text-success">
                      {actionLabel} Successful
                    </p>
                    <p className="text-sm text-foreground-secondary mt-1">
                      Location verified within geofence
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-12 h-12 text-warning mx-auto" />
                  <div>
                    <p className="font-medium text-warning">
                      {actionLabel} Recorded
                    </p>
                    <p className="text-sm text-foreground-secondary mt-1">
                      {evvResult.evvMessage ||
                        `You are ${evvResult.distanceFromClient}m from client location`}
                    </p>
                  </div>
                </>
              )}
              {location && (
                <p className="text-xs text-foreground-tertiary">
                  GPS Accuracy: {formatBrowserAccuracy(location.accuracy)} (
                  {Math.round(location.accuracy)}m)
                </p>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-error mx-auto" />
              <div>
                <p className="font-medium text-error">{actionLabel} Failed</p>
                <p className="text-sm text-foreground-secondary mt-1">{error}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAction} className="flex-1">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
