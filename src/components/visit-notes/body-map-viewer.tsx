"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, AlertCircle, Camera } from "lucide-react";
import { Badge } from "@/components/ui";

// Body map marker type (matches the form renderer)
interface BodyMapMarker {
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

// Body regions data
const BODY_REGIONS = {
  front: [
    { id: "head", label: "Head", path: "M 120,8 C 135,8 148,18 150,35 C 152,50 148,62 140,70 C 135,75 128,78 120,78 C 112,78 105,75 100,70 C 92,62 88,50 90,35 C 92,18 105,8 120,8 Z" },
    { id: "neck", label: "Neck", path: "M 108,78 L 132,78 L 135,95 C 130,97 125,98 120,98 C 115,98 110,97 105,95 Z" },
    { id: "left-shoulder", label: "Left Shoulder", path: "M 105,95 C 95,95 80,98 70,105 C 60,112 55,120 58,130 L 75,125 C 78,118 85,110 95,105 Z" },
    { id: "right-shoulder", label: "Right Shoulder", path: "M 135,95 C 145,95 160,98 170,105 C 180,112 185,120 182,130 L 165,125 C 162,118 155,110 145,105 Z" },
    { id: "left-chest", label: "Left Chest", path: "M 95,105 C 100,102 110,100 120,100 L 120,145 C 110,148 100,148 90,145 L 85,130 C 82,120 88,110 95,105 Z" },
    { id: "right-chest", label: "Right Chest", path: "M 145,105 C 140,102 130,100 120,100 L 120,145 C 130,148 140,148 150,145 L 155,130 C 158,120 152,110 145,105 Z" },
    { id: "left-upper-arm", label: "Left Upper Arm", path: "M 58,130 C 54,140 50,152 48,165 L 62,168 C 66,158 70,145 75,125 Z" },
    { id: "right-upper-arm", label: "Right Upper Arm", path: "M 182,130 C 186,140 190,152 192,165 L 178,168 C 174,158 170,145 165,125 Z" },
    { id: "left-elbow", label: "Left Elbow", path: "M 48,165 C 46,175 45,183 46,190 L 60,192 C 62,185 62,176 62,168 Z" },
    { id: "right-elbow", label: "Right Elbow", path: "M 192,165 C 194,175 195,183 194,190 L 180,192 C 178,185 178,176 178,168 Z" },
    { id: "left-forearm", label: "Left Forearm", path: "M 46,190 C 44,205 42,218 42,232 L 56,235 C 58,222 59,208 60,192 Z" },
    { id: "right-forearm", label: "Right Forearm", path: "M 194,190 C 196,205 198,218 198,232 L 184,235 C 182,222 181,208 180,192 Z" },
    { id: "left-hand", label: "Left Hand", path: "M 42,232 C 40,242 38,252 40,260 C 43,268 50,268 55,260 C 58,252 58,242 56,235 Z" },
    { id: "right-hand", label: "Right Hand", path: "M 198,232 C 200,242 202,252 200,260 C 197,268 190,268 185,260 C 182,252 182,242 184,235 Z" },
    { id: "upper-abs", label: "Upper Abs", path: "M 105,145 L 135,145 L 135,175 L 105,175 Z" },
    { id: "middle-abs", label: "Middle Abs", path: "M 105,175 L 135,175 L 135,205 L 105,205 Z" },
    { id: "lower-abs", label: "Lower Abs", path: "M 105,205 L 135,205 L 135,235 L 105,235 Z" },
    { id: "left-oblique", label: "Left Oblique", path: "M 90,145 L 105,145 L 105,235 L 90,235 C 85,220 82,195 85,170 C 86,158 88,150 90,145 Z" },
    { id: "right-oblique", label: "Right Oblique", path: "M 150,145 L 135,145 L 135,235 L 150,235 C 155,220 158,195 155,170 C 154,158 152,150 150,145 Z" },
    { id: "left-hip", label: "Left Hip", path: "M 90,235 L 120,235 L 115,270 C 108,275 98,276 90,272 C 85,268 83,258 85,248 Z" },
    { id: "right-hip", label: "Right Hip", path: "M 150,235 L 120,235 L 125,270 C 132,275 142,276 150,272 C 155,268 157,258 155,248 Z" },
    { id: "left-thigh", label: "Left Thigh", path: "M 90,272 C 98,276 108,278 115,275 L 110,360 C 105,362 98,364 92,364 C 86,364 82,362 78,360 L 75,310 C 78,295 82,282 90,272 Z" },
    { id: "right-thigh", label: "Right Thigh", path: "M 150,272 C 142,276 132,278 125,275 L 130,360 C 135,362 142,364 148,364 C 154,364 158,362 162,360 L 165,310 C 162,295 158,282 150,272 Z" },
    { id: "left-knee", label: "Left Knee", path: "M 78,360 C 82,362 86,364 92,364 C 98,364 105,362 110,360 L 108,400 C 104,402 98,404 92,404 C 86,404 82,402 78,400 Z" },
    { id: "right-knee", label: "Right Knee", path: "M 162,360 C 158,362 154,364 148,364 C 142,364 135,362 130,360 L 132,400 C 136,402 142,404 148,404 C 154,404 158,402 162,400 Z" },
    { id: "left-shin", label: "Left Shin", path: "M 78,400 C 82,402 86,404 92,404 C 98,404 104,402 108,400 L 105,480 C 102,482 97,484 92,484 C 87,484 83,482 80,480 Z" },
    { id: "right-shin", label: "Right Shin", path: "M 162,400 C 158,402 154,404 148,404 C 142,404 136,402 132,400 L 135,480 C 138,482 143,484 148,484 C 153,484 157,482 160,480 Z" },
    { id: "left-ankle", label: "Left Ankle", path: "M 80,480 C 83,482 87,484 92,484 C 97,484 102,482 105,480 L 103,500 C 100,502 96,504 92,504 C 88,504 84,502 82,500 Z" },
    { id: "right-ankle", label: "Right Ankle", path: "M 160,480 C 157,482 153,484 148,484 C 143,484 138,482 135,480 L 137,500 C 140,502 144,504 148,504 C 152,504 156,502 158,500 Z" },
    { id: "left-foot", label: "Left Foot", path: "M 82,500 C 84,502 88,504 92,504 C 96,504 100,502 103,500 L 105,515 C 108,522 104,530 95,532 C 84,534 75,528 73,520 C 72,514 75,506 82,500 Z" },
    { id: "right-foot", label: "Right Foot", path: "M 158,500 C 156,502 152,504 148,504 C 144,504 140,502 137,500 L 135,515 C 132,522 136,530 145,532 C 156,534 165,528 167,520 C 168,514 165,506 158,500 Z" },
  ],
  back: [
    { id: "back-head", label: "Back of Head", path: "M 120,8 C 135,8 148,18 150,35 C 152,50 148,62 140,70 C 135,75 128,78 120,78 C 112,78 105,75 100,70 C 92,62 88,50 90,35 C 92,18 105,8 120,8 Z" },
    { id: "back-neck", label: "Back of Neck", path: "M 108,78 L 132,78 L 135,95 C 130,97 125,98 120,98 C 115,98 110,97 105,95 Z" },
    { id: "left-shoulder-back", label: "Left Shoulder", path: "M 105,95 C 95,95 80,98 70,105 C 60,112 55,120 58,130 L 75,125 C 78,118 85,110 95,105 Z" },
    { id: "right-shoulder-back", label: "Right Shoulder", path: "M 135,95 C 145,95 160,98 170,105 C 180,112 185,120 182,130 L 165,125 C 162,118 155,110 145,105 Z" },
    { id: "left-trap", label: "Left Trapezius", path: "M 105,95 L 120,98 L 120,125 L 95,125 C 95,115 98,105 105,95 Z" },
    { id: "right-trap", label: "Right Trapezius", path: "M 135,95 L 120,98 L 120,125 L 145,125 C 145,115 142,105 135,95 Z" },
    { id: "left-upper-back", label: "Left Upper Back", path: "M 95,125 L 120,125 L 120,180 L 88,175 C 85,160 88,140 95,125 Z" },
    { id: "right-upper-back", label: "Right Upper Back", path: "M 145,125 L 120,125 L 120,180 L 152,175 C 155,160 152,140 145,125 Z" },
    { id: "left-tricep", label: "Left Tricep", path: "M 58,130 C 54,140 50,152 48,165 L 62,168 C 66,158 70,145 75,125 Z" },
    { id: "right-tricep", label: "Right Tricep", path: "M 182,130 C 186,140 190,152 192,165 L 178,168 C 174,158 170,145 165,125 Z" },
    { id: "left-elbow-back", label: "Left Elbow", path: "M 48,165 C 46,175 45,183 46,190 L 60,192 C 62,185 62,176 62,168 Z" },
    { id: "right-elbow-back", label: "Right Elbow", path: "M 192,165 C 194,175 195,183 194,190 L 180,192 C 178,185 178,176 178,168 Z" },
    { id: "mid-back", label: "Mid Back", path: "M 88,175 L 152,175 L 152,210 L 88,210 Z" },
    { id: "lower-back", label: "Lower Back", path: "M 88,210 L 152,210 L 152,245 L 88,245 Z" },
    { id: "left-forearm-back", label: "Left Forearm", path: "M 46,190 C 44,205 42,218 42,232 L 56,235 C 58,222 59,208 60,192 Z" },
    { id: "right-forearm-back", label: "Right Forearm", path: "M 194,190 C 196,205 198,218 198,232 L 184,235 C 182,222 181,208 180,192 Z" },
    { id: "left-hand-back", label: "Left Hand", path: "M 42,232 C 40,242 38,252 40,260 C 43,268 50,268 55,260 C 58,252 58,242 56,235 Z" },
    { id: "right-hand-back", label: "Right Hand", path: "M 198,232 C 200,242 202,252 200,260 C 197,268 190,268 185,260 C 182,252 182,242 184,235 Z" },
    { id: "left-glute", label: "Left Glute", path: "M 88,245 L 120,245 L 120,295 C 110,300 98,302 88,295 C 82,288 82,270 85,255 Z" },
    { id: "right-glute", label: "Right Glute", path: "M 152,245 L 120,245 L 120,295 C 130,300 142,302 152,295 C 158,288 158,270 155,255 Z" },
    { id: "left-hamstring", label: "Left Hamstring", path: "M 88,295 C 98,302 110,302 120,295 L 115,365 C 108,368 98,368 90,365 C 82,362 78,340 82,315 Z" },
    { id: "right-hamstring", label: "Right Hamstring", path: "M 152,295 C 142,302 130,302 120,295 L 125,365 C 132,368 142,368 150,365 C 158,362 162,340 158,315 Z" },
    { id: "left-knee-back", label: "Left Knee", path: "M 82,365 C 88,368 96,370 105,368 L 108,405 C 102,408 94,408 88,405 C 82,402 80,385 82,365 Z" },
    { id: "right-knee-back", label: "Right Knee", path: "M 158,365 C 152,368 144,370 135,368 L 132,405 C 138,408 146,408 152,405 C 158,402 160,385 158,365 Z" },
    { id: "left-calf", label: "Left Calf", path: "M 82,405 C 88,410 96,412 105,408 L 102,485 C 98,488 92,488 88,485 C 80,478 78,450 82,405 Z" },
    { id: "right-calf", label: "Right Calf", path: "M 158,405 C 152,410 144,412 135,408 L 138,485 C 142,488 148,488 152,485 C 160,478 162,450 158,405 Z" },
    { id: "left-heel", label: "Left Heel", path: "M 85,485 C 90,490 98,492 105,488 L 103,515 C 100,520 95,522 90,520 C 85,518 82,508 85,495 Z" },
    { id: "right-heel", label: "Right Heel", path: "M 155,485 C 150,490 142,492 135,488 L 137,515 C 140,520 145,522 150,520 C 155,518 158,508 155,495 Z" },
  ],
};

const MARKER_TYPES = {
  pain: { label: "Pain", color: "bg-orange-500" },
  wound: { label: "Wound", color: "bg-red-500" },
  bruise: { label: "Bruise", color: "bg-purple-500" },
  rash: { label: "Rash", color: "bg-pink-500" },
  swelling: { label: "Swelling", color: "bg-blue-500" },
  other: { label: "Other", color: "bg-gray-500" },
};

const SEVERITY_CONFIG = {
  mild: { label: "Mild", color: "bg-warning/20 text-warning border-warning" },
  moderate: { label: "Moderate", color: "bg-orange-500/20 text-orange-600 border-orange-500" },
  severe: { label: "Severe", color: "bg-error/20 text-error border-error" },
};

const WOUND_TYPES: Record<string, string> = {
  "pressure-ulcer": "Pressure Ulcer",
  surgical: "Surgical Wound",
  laceration: "Laceration",
  abrasion: "Abrasion",
  burn: "Burn",
  "diabetic-ulcer": "Diabetic Ulcer",
  "venous-ulcer": "Venous Ulcer",
  "skin-tear": "Skin Tear",
  other: "Other",
};

// Get center of path for marker placement
function getRegionCenter(pathData: string): { x: number; y: number } {
  const coords: { x: number; y: number }[] = [];
  const commands = pathData.match(/[MLCQZ][^MLCQZ]*/gi) || [];

  commands.forEach((cmd) => {
    const type = cmd[0].toUpperCase();
    const numbers = cmd.slice(1).match(/-?[\d.]+/g);
    if (numbers && type !== "Z") {
      for (let i = 0; i < numbers.length - 1; i += 2) {
        coords.push({ x: parseFloat(numbers[i]), y: parseFloat(numbers[i + 1]) });
      }
    }
  });

  if (coords.length === 0) return { x: 0, y: 0 };
  const sumX = coords.reduce((sum, c) => sum + c.x, 0);
  const sumY = coords.reduce((sum, c) => sum + c.y, 0);
  return { x: sumX / coords.length, y: sumY / coords.length };
}

interface BodyMapViewerProps {
  markers: BodyMapMarker[];
  className?: string;
}

export function BodyMapViewer({ markers, className }: BodyMapViewerProps) {
  const [selectedMarker, setSelectedMarker] = React.useState<BodyMapMarker | null>(null);
  const [hoveredMarker, setHoveredMarker] = React.useState<string | null>(null);

  // Get all marker region IDs
  const _markerRegionIds = markers.map((m) => m.regionId);

  // Find which region a marker belongs to
  const _getMarkerRegion = (regionId: string) => {
    for (const [, regions] of Object.entries(BODY_REGIONS)) {
      const region = regions.find((r) => r.id === regionId);
      if (region) return region;
    }
    return null;
  };

  const renderBodyView = (
    regions: typeof BODY_REGIONS.front,
    offsetX: number,
    viewLabel: string
  ) => (
    <g transform={`translate(${offsetX}, 0)`}>
      <text
        x="120"
        y="545"
        textAnchor="middle"
        className="fill-foreground-secondary"
        style={{ fontSize: "11px", fontWeight: 500 }}
      >
        {viewLabel}
      </text>

      {regions.map((region) => {
        const marker = markers.find((m) => m.regionId === region.id);
        const hasMarker = !!marker;
        const isHovered = hoveredMarker === marker?.id;
        const isSelected = selectedMarker?.id === marker?.id;

        return (
          <g key={region.id}>
            <path
              d={region.path}
              className={cn(
                "transition-all duration-150",
                hasMarker
                  ? isSelected
                    ? "fill-error/40 stroke-error stroke-2"
                    : isHovered
                      ? "fill-error/30 stroke-error stroke-[1.5]"
                      : "fill-error/20 stroke-error stroke-[1.2]"
                  : "fill-[#f8f9fa] stroke-[#4b5563] stroke-[0.8]"
              )}
              style={{ cursor: hasMarker ? "pointer" : "default" }}
              onClick={() => marker && setSelectedMarker(marker)}
              onMouseEnter={() => marker && setHoveredMarker(marker.id)}
              onMouseLeave={() => setHoveredMarker(null)}
            />
            {hasMarker && (
              <g
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedMarker(marker)}
                onMouseEnter={() => setHoveredMarker(marker.id)}
                onMouseLeave={() => setHoveredMarker(null)}
              >
                <circle
                  cx={getRegionCenter(region.path).x}
                  cy={getRegionCenter(region.path).y}
                  r={isSelected ? 9 : isHovered ? 8 : 7}
                  className={cn(
                    "fill-error stroke-white transition-all duration-150",
                    isSelected ? "stroke-[2.5]" : "stroke-2"
                  )}
                  style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))" }}
                />
                <circle
                  cx={getRegionCenter(region.path).x}
                  cy={getRegionCenter(region.path).y}
                  r={isSelected ? 3.5 : 3}
                  className="fill-white"
                />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );

  if (markers.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <AlertCircle className="w-8 h-8 mx-auto text-foreground-tertiary mb-2" />
        <p className="text-sm text-foreground-secondary">No body map markers recorded</p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", className)}>
      {/* Body Map SVG */}
      <div className="bg-background-secondary/30 rounded-lg p-4">
        <svg
          viewBox="0 0 500 560"
          className="w-full h-auto"
          style={{ maxHeight: "450px" }}
        >
          {renderBodyView(BODY_REGIONS.front, 0, "Front")}
          {renderBodyView(BODY_REGIONS.back, 260, "Back")}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-foreground-secondary">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-error/20 border border-error" />
            <span>Marked area</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground">{markers.length}</span>
            <span>marker{markers.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* Marker Details Panel */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground-secondary">
          {selectedMarker ? "Marker Details" : "Select a marker to view details"}
        </h4>

        {selectedMarker ? (
          <MarkerDetailPanel
            marker={selectedMarker}
            onClose={() => setSelectedMarker(null)}
          />
        ) : (
          <div className="space-y-2">
            {markers.map((marker) => (
              <button
                key={marker.id}
                type="button"
                onClick={() => setSelectedMarker(marker)}
                onMouseEnter={() => setHoveredMarker(marker.id)}
                onMouseLeave={() => setHoveredMarker(null)}
                className={cn(
                  "w-full p-3 rounded-lg border text-left transition-all",
                  "hover:border-primary/50 hover:bg-background-secondary/50",
                  hoveredMarker === marker.id && "border-primary/50 bg-background-secondary/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("w-2.5 h-2.5 rounded-full", MARKER_TYPES[marker.type].color)} />
                  <span className="font-medium text-sm">{marker.regionLabel}</span>
                  <Badge variant="default" className="text-xs ml-auto">
                    {MARKER_TYPES[marker.type].label}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Marker detail panel component
function MarkerDetailPanel({
  marker,
  onClose,
}: {
  marker: BodyMapMarker;
  onClose: () => void;
}) {
  const severityConfig = SEVERITY_CONFIG[marker.severity];
  const typeConfig = MARKER_TYPES[marker.type];

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden animate-in fade-in slide-in-from-right-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-background-secondary/50">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", typeConfig.color)} />
          <span className="font-semibold text-sm">{marker.regionLabel}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-background-secondary text-foreground-tertiary hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Type & Severity */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="default">{typeConfig.label}</Badge>
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", severityConfig.color)}>
            {severityConfig.label}
          </span>
        </div>

        {/* Wound details */}
        {marker.type === "wound" && marker.woundType && (
          <div>
            <p className="text-xs text-foreground-secondary mb-1">Wound Type</p>
            <p className="text-sm font-medium">{WOUND_TYPES[marker.woundType] || marker.woundType}</p>
          </div>
        )}

        {marker.size && (
          <div>
            <p className="text-xs text-foreground-secondary mb-1">Size</p>
            <p className="text-sm font-medium">{marker.size}</p>
          </div>
        )}

        {/* Notes */}
        {marker.notes && (
          <div>
            <p className="text-xs text-foreground-secondary mb-1">Notes</p>
            <p className="text-sm bg-background-secondary/50 rounded p-2">{marker.notes}</p>
          </div>
        )}

        {/* Photo */}
        {marker.photo && (
          <div>
            <p className="text-xs text-foreground-secondary mb-1 flex items-center gap-1">
              <Camera className="w-3 h-3" />
              Photo
            </p>
            <img
              src={marker.photo.fileUrl}
              alt="Marker photo"
              className="w-full rounded-lg border border-border"
            />
          </div>
        )}
      </div>
    </div>
  );
}
