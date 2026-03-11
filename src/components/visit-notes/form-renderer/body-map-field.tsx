"use client";

import * as React from "react";
import {
  Button,
  Input,
  Label,
  Select,
  Textarea,
  Card,
  CardContent,
  Badge,
} from "@/components/ui";
import {
  X,
  Trash2,
  Camera,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BodyMapSVG, ViewLegend } from "./body-map-svg";

// Types
export interface BodyMapMarker {
  id: string;
  regionId: string;
  regionLabel: string;
  type: "pain" | "wound" | "bruise" | "rash" | "swelling" | "other";
  severity: "mild" | "moderate" | "severe";
  woundType?: string;
  size?: string;
  notes?: string;
  photo?: {
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  };
}

export type BodyMapValue = BodyMapMarker[];

interface BodyMapFieldProps {
  value: BodyMapValue;
  onChange: (value: BodyMapValue) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
}

const MARKER_TYPES = [
  { value: "pain", label: "Pain" },
  { value: "wound", label: "Wound" },
  { value: "bruise", label: "Bruise" },
  { value: "rash", label: "Rash" },
  { value: "swelling", label: "Swelling" },
  { value: "other", label: "Other" },
] as const;

const WOUND_TYPES = [
  { value: "pressure-ulcer", label: "Pressure Ulcer" },
  { value: "surgical", label: "Surgical Wound" },
  { value: "laceration", label: "Laceration" },
  { value: "abrasion", label: "Abrasion" },
  { value: "burn", label: "Burn" },
  { value: "diabetic-ulcer", label: "Diabetic Ulcer" },
  { value: "venous-ulcer", label: "Venous Ulcer" },
  { value: "skin-tear", label: "Skin Tear" },
  { value: "other", label: "Other" },
] as const;

const SEVERITY_LEVELS = [
  { value: "mild", label: "Mild", color: "bg-warning/20 text-warning" },
  { value: "moderate", label: "Moderate", color: "bg-orange-500/20 text-orange-600" },
  { value: "severe", label: "Severe", color: "bg-error/20 text-error" },
] as const;

export function BodyMapField({
  value = [],
  onChange,
  disabled = false,
  label,
  description,
}: BodyMapFieldProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingMarker, setEditingMarker] = React.useState<BodyMapMarker | null>(null);
  const [selectedRegion, setSelectedRegion] = React.useState<{
    id: string;
    label: string;
  } | null>(null);

  // Get marker region IDs
  const markerRegionIds = value.map((m) => m.regionId);

  const handleRegionClick = (regionId: string, regionLabel: string) => {
    if (disabled) return;

    // Check if there's already a marker for this region
    const existingMarker = value.find((m) => m.regionId === regionId);

    if (existingMarker) {
      // Edit existing marker
      setEditingMarker(existingMarker);
    } else {
      // Create new marker
      setSelectedRegion({ id: regionId, label: regionLabel });
    }
    setIsModalOpen(true);
  };

  const handleSaveMarker = (markerData: Omit<BodyMapMarker, "id" | "regionId" | "regionLabel">) => {
    if (editingMarker) {
      // Update existing marker
      const updated = value.map((m) =>
        m.id === editingMarker.id ? { ...m, ...markerData } : m
      );
      onChange(updated);
    } else if (selectedRegion) {
      // Create new marker
      const newMarker: BodyMapMarker = {
        id: `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        regionId: selectedRegion.id,
        regionLabel: selectedRegion.label,
        ...markerData,
      };
      onChange([...value, newMarker]);
    }

    setIsModalOpen(false);
    setEditingMarker(null);
    setSelectedRegion(null);
  };

  const handleDeleteMarker = (markerId: string) => {
    onChange(value.filter((m) => m.id !== markerId));
    setIsModalOpen(false);
    setEditingMarker(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMarker(null);
    setSelectedRegion(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      {(label || description) && (
        <div>
          {label && (
            <h3 className="text-sm font-medium text-foreground">{label}</h3>
          )}
          {description && (
            <p className="text-xs text-foreground-secondary mt-1">{description}</p>
          )}
        </div>
      )}

      {/* Body Map */}
      <div className="space-y-4">
        {/* SVG Body Map - Front and Back side by side */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <BodyMapSVG
              selectedRegions={[]}
              markerRegions={markerRegionIds}
              onRegionClick={handleRegionClick}
            />
            <ViewLegend markerCount={value.length} />
          </CardContent>
        </Card>

        {/* Markers List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Markers ({value.length})
            </h4>
          </div>

          {value.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <MapPin className="h-8 w-8 mx-auto text-foreground-tertiary mb-2" />
                <p className="text-sm text-foreground-secondary">
                  No markers added yet
                </p>
                <p className="text-xs text-foreground-tertiary mt-1">
                  Tap on the body diagram to add markers
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {value.map((marker) => (
                <MarkerCard
                  key={marker.id}
                  marker={marker}
                  onClick={() => {
                    setEditingMarker(marker);
                    setIsModalOpen(true);
                  }}
                  disabled={disabled}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Marker Detail Modal */}
      {isModalOpen && (
        <MarkerDetailModal
          marker={editingMarker}
          regionLabel={editingMarker?.regionLabel || selectedRegion?.label || ""}
          onSave={handleSaveMarker}
          onDelete={editingMarker ? () => handleDeleteMarker(editingMarker.id) : undefined}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

// Marker Card Component
interface MarkerCardProps {
  marker: BodyMapMarker;
  onClick: () => void;
  disabled?: boolean;
}

function MarkerCard({ marker, onClick, disabled }: MarkerCardProps) {
  const severityConfig = SEVERITY_LEVELS.find((s) => s.value === marker.severity);
  const typeLabel = MARKER_TYPES.find((t) => t.value === marker.type)?.label;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full p-3 rounded-lg border text-left transition-all",
        "hover:border-primary/50 hover:shadow-sm",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{marker.regionLabel}</span>
            <Badge variant="default" className="text-xs">
              {typeLabel}
            </Badge>
            {severityConfig && (
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", severityConfig.color)}>
                {severityConfig.label}
              </span>
            )}
          </div>

          {marker.type === "wound" && marker.woundType && (
            <p className="text-xs text-foreground-secondary mt-1">
              {WOUND_TYPES.find((w) => w.value === marker.woundType)?.label}
              {marker.size && ` • ${marker.size}`}
            </p>
          )}

          {marker.notes && (
            <p className="text-xs text-foreground-tertiary mt-1 line-clamp-1">
              {marker.notes}
            </p>
          )}
        </div>

        {marker.photo && (
          <div className="w-10 h-10 rounded bg-background-secondary flex items-center justify-center flex-shrink-0">
            <Camera className="h-4 w-4 text-foreground-tertiary" />
          </div>
        )}
      </div>
    </button>
  );
}

// Marker Detail Modal
interface MarkerDetailModalProps {
  marker: BodyMapMarker | null;
  regionLabel: string;
  onSave: (data: Omit<BodyMapMarker, "id" | "regionId" | "regionLabel">) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function MarkerDetailModal({
  marker,
  regionLabel,
  onSave,
  onDelete,
  onClose,
}: MarkerDetailModalProps) {
  const [type, setType] = React.useState<BodyMapMarker["type"]>(marker?.type || "pain");
  const [severity, setSeverity] = React.useState<BodyMapMarker["severity"]>(marker?.severity || "mild");
  const [woundType, setWoundType] = React.useState(marker?.woundType || "");
  const [size, setSize] = React.useState(marker?.size || "");
  const [notes, setNotes] = React.useState(marker?.notes || "");
  const [photo, setPhoto] = React.useState<BodyMapMarker["photo"] | undefined>(marker?.photo);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    onSave({
      type,
      severity,
      woundType: type === "wound" ? woundType : undefined,
      size: type === "wound" ? size : undefined,
      notes,
      photo,
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Upload to server
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "photo");

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPhoto({
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileType: data.fileType,
          fileSize: data.fileSize,
        });
      }
    } catch {
      // Fallback to base64 for preview
      const reader = new FileReader();
      reader.onload = () => {
        setPhoto({
          fileUrl: reader.result as string,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="font-semibold">
                {marker ? "Edit Marker" : "Add Marker"}
              </h3>
              <p className="text-sm text-foreground-secondary">{regionLabel}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-background-secondary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-4 space-y-4">
            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="marker-type">Type *</Label>
              <Select
                id="marker-type"
                value={type}
                onChange={(e) => setType(e.target.value as BodyMapMarker["type"])}
              >
                {MARKER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Wound Type (conditional) */}
            {type === "wound" && (
              <div className="space-y-2">
                <Label htmlFor="wound-type">Wound Type</Label>
                <Select
                  id="wound-type"
                  value={woundType}
                  onChange={(e) => setWoundType(e.target.value)}
                >
                  <option value="">Select wound type...</option>
                  {WOUND_TYPES.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Severity */}
            <div className="space-y-2">
              <Label>Severity *</Label>
              <div className="flex gap-2">
                {SEVERITY_LEVELS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSeverity(s.value)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all",
                      severity === s.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className={cn("inline-block w-2 h-2 rounded-full mr-2", s.color.split(" ")[0])} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size (for wounds) */}
            {type === "wound" && (
              <div className="space-y-2">
                <Label htmlFor="wound-size">Size</Label>
                <Input
                  id="wound-size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g., 2cm x 3cm"
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="marker-notes">Notes</Label>
              <Textarea
                id="marker-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional observations..."
                rows={3}
              />
            </div>

            {/* Photo */}
            <div className="space-y-2">
              <Label>Photo</Label>
              {photo ? (
                <div className="relative">
                  <img
                    src={photo.fileUrl}
                    alt="Marker photo"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 p-1 rounded-full bg-error text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors"
                >
                  <Camera className="h-6 w-6 mx-auto text-foreground-tertiary mb-1" />
                  <p className="text-sm text-foreground-secondary">
                    Add photo
                  </p>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onDelete}
                  className="text-error hover:bg-error/10"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
              <div className="flex-1" />
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit}>
                {marker ? "Update" : "Add"} Marker
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
