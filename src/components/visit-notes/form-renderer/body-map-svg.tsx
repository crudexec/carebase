"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Anatomical body regions with detailed SVG paths for front and back views
export const BODY_REGIONS = {
  front: [
    // Head & Neck
    { id: "head", label: "Head", path: "M 120,8 C 135,8 148,18 150,35 C 152,50 148,62 140,70 C 135,75 128,78 120,78 C 112,78 105,75 100,70 C 92,62 88,50 90,35 C 92,18 105,8 120,8 Z" },
    { id: "neck", label: "Neck", path: "M 108,78 L 132,78 L 135,95 C 130,97 125,98 120,98 C 115,98 110,97 105,95 Z" },

    // Shoulders & Arms
    { id: "left-shoulder", label: "Left Shoulder", path: "M 105,95 C 95,95 80,98 70,105 C 60,112 55,120 58,130 L 75,125 C 78,118 85,110 95,105 Z" },
    { id: "right-shoulder", label: "Right Shoulder", path: "M 135,95 C 145,95 160,98 170,105 C 180,112 185,120 182,130 L 165,125 C 162,118 155,110 145,105 Z" },

    // Chest - Left and Right pecs
    { id: "left-chest", label: "Left Chest", path: "M 95,105 C 100,102 110,100 120,100 L 120,145 C 110,148 100,148 90,145 L 85,130 C 82,120 88,110 95,105 Z" },
    { id: "right-chest", label: "Right Chest", path: "M 145,105 C 140,102 130,100 120,100 L 120,145 C 130,148 140,148 150,145 L 155,130 C 158,120 152,110 145,105 Z" },

    // Upper Arms (shorter, more realistic - ends at elbow around y=175)
    { id: "left-upper-arm", label: "Left Upper Arm", path: "M 58,130 C 54,140 50,152 48,165 L 62,168 C 66,158 70,145 75,125 Z" },
    { id: "right-upper-arm", label: "Right Upper Arm", path: "M 182,130 C 186,140 190,152 192,165 L 178,168 C 174,158 170,145 165,125 Z" },

    // Elbows (positioned around y=165-190)
    { id: "left-elbow", label: "Left Elbow", path: "M 48,165 C 46,175 45,183 46,190 L 60,192 C 62,185 62,176 62,168 Z" },
    { id: "right-elbow", label: "Right Elbow", path: "M 192,165 C 194,175 195,183 194,190 L 180,192 C 178,185 178,176 178,168 Z" },

    // Forearms (y=190 to y=235)
    { id: "left-forearm", label: "Left Forearm", path: "M 46,190 C 44,205 42,218 42,232 L 56,235 C 58,222 59,208 60,192 Z" },
    { id: "right-forearm", label: "Right Forearm", path: "M 194,190 C 196,205 198,218 198,232 L 184,235 C 182,222 181,208 180,192 Z" },

    // Hands (y=232 to y=265 - ends at hip level)
    { id: "left-hand", label: "Left Hand", path: "M 42,232 C 40,242 38,252 40,260 C 43,268 50,268 55,260 C 58,252 58,242 56,235 Z" },
    { id: "right-hand", label: "Right Hand", path: "M 198,232 C 200,242 202,252 200,260 C 197,268 190,268 185,260 C 182,252 182,242 184,235 Z" },

    // Abs - segmented
    { id: "upper-abs", label: "Upper Abs", path: "M 105,145 L 135,145 L 135,175 L 105,175 Z" },
    { id: "middle-abs", label: "Middle Abs", path: "M 105,175 L 135,175 L 135,205 L 105,205 Z" },
    { id: "lower-abs", label: "Lower Abs", path: "M 105,205 L 135,205 L 135,235 L 105,235 Z" },

    // Obliques
    { id: "left-oblique", label: "Left Oblique", path: "M 90,145 L 105,145 L 105,235 L 90,235 C 85,220 82,195 85,170 C 86,158 88,150 90,145 Z" },
    { id: "right-oblique", label: "Right Oblique", path: "M 150,145 L 135,145 L 135,235 L 150,235 C 155,220 158,195 155,170 C 154,158 152,150 150,145 Z" },

    // Hips/Groin
    { id: "left-hip", label: "Left Hip", path: "M 90,235 L 120,235 L 115,270 C 108,275 98,276 90,272 C 85,268 83,258 85,248 Z" },
    { id: "right-hip", label: "Right Hip", path: "M 150,235 L 120,235 L 125,270 C 132,275 142,276 150,272 C 155,268 157,258 155,248 Z" },

    // Thighs
    { id: "left-thigh", label: "Left Thigh", path: "M 90,272 C 98,276 108,278 115,275 L 110,360 C 105,362 98,364 92,364 C 86,364 82,362 78,360 L 75,310 C 78,295 82,282 90,272 Z" },
    { id: "right-thigh", label: "Right Thigh", path: "M 150,272 C 142,276 132,278 125,275 L 130,360 C 135,362 142,364 148,364 C 154,364 158,362 162,360 L 165,310 C 162,295 158,282 150,272 Z" },

    // Knees
    { id: "left-knee", label: "Left Knee", path: "M 78,360 C 82,362 86,364 92,364 C 98,364 105,362 110,360 L 108,400 C 104,402 98,404 92,404 C 86,404 82,402 78,400 Z" },
    { id: "right-knee", label: "Right Knee", path: "M 162,360 C 158,362 154,364 148,364 C 142,364 135,362 130,360 L 132,400 C 136,402 142,404 148,404 C 154,404 158,402 162,400 Z" },

    // Shins
    { id: "left-shin", label: "Left Shin", path: "M 78,400 C 82,402 86,404 92,404 C 98,404 104,402 108,400 L 105,480 C 102,482 97,484 92,484 C 87,484 83,482 80,480 Z" },
    { id: "right-shin", label: "Right Shin", path: "M 162,400 C 158,402 154,404 148,404 C 142,404 136,402 132,400 L 135,480 C 138,482 143,484 148,484 C 153,484 157,482 160,480 Z" },

    // Ankles & Feet
    { id: "left-ankle", label: "Left Ankle", path: "M 80,480 C 83,482 87,484 92,484 C 97,484 102,482 105,480 L 103,500 C 100,502 96,504 92,504 C 88,504 84,502 82,500 Z" },
    { id: "right-ankle", label: "Right Ankle", path: "M 160,480 C 157,482 153,484 148,484 C 143,484 138,482 135,480 L 137,500 C 140,502 144,504 148,504 C 152,504 156,502 158,500 Z" },
    { id: "left-foot", label: "Left Foot", path: "M 82,500 C 84,502 88,504 92,504 C 96,504 100,502 103,500 L 105,515 C 108,522 104,530 95,532 C 84,534 75,528 73,520 C 72,514 75,506 82,500 Z" },
    { id: "right-foot", label: "Right Foot", path: "M 158,500 C 156,502 152,504 148,504 C 144,504 140,502 137,500 L 135,515 C 132,522 136,530 145,532 C 156,534 165,528 167,520 C 168,514 165,506 158,500 Z" },
  ],
  back: [
    // Head & Neck
    { id: "back-head", label: "Back of Head", path: "M 120,8 C 135,8 148,18 150,35 C 152,50 148,62 140,70 C 135,75 128,78 120,78 C 112,78 105,75 100,70 C 92,62 88,50 90,35 C 92,18 105,8 120,8 Z" },
    { id: "back-neck", label: "Back of Neck", path: "M 108,78 L 132,78 L 135,95 C 130,97 125,98 120,98 C 115,98 110,97 105,95 Z" },

    // Shoulders
    { id: "left-shoulder-back", label: "Left Shoulder", path: "M 105,95 C 95,95 80,98 70,105 C 60,112 55,120 58,130 L 75,125 C 78,118 85,110 95,105 Z" },
    { id: "right-shoulder-back", label: "Right Shoulder", path: "M 135,95 C 145,95 160,98 170,105 C 180,112 185,120 182,130 L 165,125 C 162,118 155,110 145,105 Z" },

    // Trapezius
    { id: "left-trap", label: "Left Trapezius", path: "M 105,95 L 120,98 L 120,125 L 95,125 C 95,115 98,105 105,95 Z" },
    { id: "right-trap", label: "Right Trapezius", path: "M 135,95 L 120,98 L 120,125 L 145,125 C 145,115 142,105 135,95 Z" },

    // Upper Back / Lats
    { id: "left-upper-back", label: "Left Upper Back", path: "M 95,125 L 120,125 L 120,180 L 88,175 C 85,160 88,140 95,125 Z" },
    { id: "right-upper-back", label: "Right Upper Back", path: "M 145,125 L 120,125 L 120,180 L 152,175 C 155,160 152,140 145,125 Z" },

    // Triceps (shorter, more realistic - ends at elbow around y=175)
    { id: "left-tricep", label: "Left Tricep", path: "M 58,130 C 54,140 50,152 48,165 L 62,168 C 66,158 70,145 75,125 Z" },
    { id: "right-tricep", label: "Right Tricep", path: "M 182,130 C 186,140 190,152 192,165 L 178,168 C 174,158 170,145 165,125 Z" },

    // Elbows (positioned around y=165-190)
    { id: "left-elbow-back", label: "Left Elbow", path: "M 48,165 C 46,175 45,183 46,190 L 60,192 C 62,185 62,176 62,168 Z" },
    { id: "right-elbow-back", label: "Right Elbow", path: "M 192,165 C 194,175 195,183 194,190 L 180,192 C 178,185 178,176 178,168 Z" },

    // Lower Back
    { id: "mid-back", label: "Mid Back", path: "M 88,175 L 152,175 L 152,210 L 88,210 Z" },
    { id: "lower-back", label: "Lower Back", path: "M 88,210 L 152,210 L 152,245 L 88,245 Z" },

    // Forearms (y=190 to y=235)
    { id: "left-forearm-back", label: "Left Forearm", path: "M 46,190 C 44,205 42,218 42,232 L 56,235 C 58,222 59,208 60,192 Z" },
    { id: "right-forearm-back", label: "Right Forearm", path: "M 194,190 C 196,205 198,218 198,232 L 184,235 C 182,222 181,208 180,192 Z" },

    // Hands (y=232 to y=265 - ends at hip level)
    { id: "left-hand-back", label: "Left Hand", path: "M 42,232 C 40,242 38,252 40,260 C 43,268 50,268 55,260 C 58,252 58,242 56,235 Z" },
    { id: "right-hand-back", label: "Right Hand", path: "M 198,232 C 200,242 202,252 200,260 C 197,268 190,268 185,260 C 182,252 182,242 184,235 Z" },

    // Glutes
    { id: "left-glute", label: "Left Glute", path: "M 88,245 L 120,245 L 120,295 C 110,300 98,302 88,295 C 82,288 82,270 85,255 Z" },
    { id: "right-glute", label: "Right Glute", path: "M 152,245 L 120,245 L 120,295 C 130,300 142,302 152,295 C 158,288 158,270 155,255 Z" },

    // Hamstrings
    { id: "left-hamstring", label: "Left Hamstring", path: "M 88,295 C 98,302 110,302 120,295 L 115,365 C 108,368 98,368 90,365 C 82,362 78,340 82,315 Z" },
    { id: "right-hamstring", label: "Right Hamstring", path: "M 152,295 C 142,302 130,302 120,295 L 125,365 C 132,368 142,368 150,365 C 158,362 162,340 158,315 Z" },

    // Back of Knees
    { id: "left-knee-back", label: "Left Knee", path: "M 82,365 C 88,368 96,370 105,368 L 108,405 C 102,408 94,408 88,405 C 82,402 80,385 82,365 Z" },
    { id: "right-knee-back", label: "Right Knee", path: "M 158,365 C 152,368 144,370 135,368 L 132,405 C 138,408 146,408 152,405 C 158,402 160,385 158,365 Z" },

    // Calves
    { id: "left-calf", label: "Left Calf", path: "M 82,405 C 88,410 96,412 105,408 L 102,485 C 98,488 92,488 88,485 C 80,478 78,450 82,405 Z" },
    { id: "right-calf", label: "Right Calf", path: "M 158,405 C 152,410 144,412 135,408 L 138,485 C 142,488 148,488 152,485 C 160,478 162,450 158,405 Z" },

    // Heels
    { id: "left-heel", label: "Left Heel", path: "M 85,485 C 90,490 98,492 105,488 L 103,515 C 100,520 95,522 90,520 C 85,518 82,508 85,495 Z" },
    { id: "right-heel", label: "Right Heel", path: "M 155,485 C 150,490 142,492 135,488 L 137,515 C 140,520 145,522 150,520 C 155,518 158,508 155,495 Z" },
  ],
} as const;

export type BodyView = "front" | "back";

interface BodyRegion {
  id: string;
  label: string;
  path: string;
}

interface BodyMapSVGProps {
  selectedRegions: string[];
  markerRegions: string[];
  onRegionClick: (regionId: string, regionLabel: string) => void;
  className?: string;
}

// Helper to get approximate center of a path for marker placement
function getRegionCenter(pathData: string): { x: number; y: number } {
  const coords: { x: number; y: number }[] = [];
  const commands = pathData.match(/[MLCQZ][^MLCQZ]*/gi) || [];

  commands.forEach((cmd) => {
    const type = cmd[0].toUpperCase();
    const numbers = cmd.slice(1).match(/-?[\d.]+/g);

    if (numbers && type !== 'Z') {
      for (let i = 0; i < numbers.length - 1; i += 2) {
        coords.push({
          x: parseFloat(numbers[i]),
          y: parseFloat(numbers[i + 1])
        });
      }
    }
  });

  if (coords.length === 0) return { x: 0, y: 0 };

  const sumX = coords.reduce((sum, c) => sum + c.x, 0);
  const sumY = coords.reduce((sum, c) => sum + c.y, 0);

  return {
    x: sumX / coords.length,
    y: sumY / coords.length,
  };
}

export function BodyMapSVG({
  selectedRegions,
  markerRegions,
  onRegionClick,
  className,
}: BodyMapSVGProps) {
  const [hoveredRegion, setHoveredRegion] = React.useState<string | null>(null);

  const renderBodyView = (
    regions: readonly BodyRegion[],
    offsetX: number,
    viewLabel: string
  ) => (
    <g transform={`translate(${offsetX}, 0)`}>
      {/* View label */}
      <text
        x="120"
        y="545"
        textAnchor="middle"
        className="fill-foreground-secondary text-xs font-medium"
        style={{ fontSize: '12px' }}
      >
        {viewLabel}
      </text>

      {/* Body outline for visual continuity - with realistic arm proportions */}
      <path
        d="M 120,8 C 150,8 155,40 155,60 C 155,75 145,85 135,95 C 160,98 185,115 185,135 L 195,165 L 198,195 L 200,235 L 198,260 L 185,260 L 182,235 L 180,195 L 178,170 L 165,130 C 160,120 155,250 155,250 C 155,280 148,320 148,360 C 150,380 155,440 155,530 L 145,530 C 145,480 140,400 138,360 C 136,320 130,280 125,270 L 120,270 L 115,270 C 110,280 104,320 102,360 C 100,400 95,480 95,530 L 85,530 C 85,440 90,380 92,360 C 92,320 85,280 85,250 C 85,250 80,120 75,130 L 62,170 L 60,195 L 58,235 L 55,260 L 42,260 L 40,235 L 42,195 L 45,165 L 55,135 C 55,115 80,98 105,95 C 95,85 85,75 85,60 C 85,40 90,8 120,8 Z"
        className="fill-none stroke-foreground/20 stroke-[0.8]"
      />

      {/* Render each region */}
      {regions.map((region) => {
        const hasMarker = markerRegions.includes(region.id);
        const isSelected = selectedRegions.includes(region.id);
        const isHovered = hoveredRegion === region.id;

        return (
          <g key={region.id}>
            <path
              d={region.path}
              className={cn(
                "cursor-pointer transition-all duration-150",
                hasMarker
                  ? "fill-error/25 stroke-error stroke-[1.5]"
                  : isSelected
                    ? "fill-primary/25 stroke-primary stroke-[1.5]"
                    : isHovered
                      ? "fill-primary/15 stroke-primary/70 stroke-[1.2]"
                      : "fill-[#f8f9fa] stroke-[#4b5563] stroke-[1]"
              )}
              onClick={() => onRegionClick(region.id, region.label)}
              onMouseEnter={() => setHoveredRegion(region.id)}
              onMouseLeave={() => setHoveredRegion(null)}
              onTouchStart={() => setHoveredRegion(region.id)}
              onTouchEnd={() => setHoveredRegion(null)}
            />
            {/* Marker indicator dot */}
            {hasMarker && (
              <g>
                <circle
                  cx={getRegionCenter(region.path).x}
                  cy={getRegionCenter(region.path).y}
                  r="6"
                  className="fill-error stroke-white stroke-[1.5]"
                />
                <circle
                  cx={getRegionCenter(region.path).x}
                  cy={getRegionCenter(region.path).y}
                  r="2"
                  className="fill-white"
                />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );

  const hoveredRegionData = hoveredRegion
    ? [...BODY_REGIONS.front, ...BODY_REGIONS.back].find(r => r.id === hoveredRegion)
    : null;

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 500 560"
        className="w-full h-auto"
        style={{ touchAction: "manipulation", maxHeight: "500px" }}
      >
        <defs>
          <filter id="regionShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Front view */}
        {renderBodyView(BODY_REGIONS.front as unknown as BodyRegion[], 0, "Front")}

        {/* Back view - offset by 260 */}
        {renderBodyView(BODY_REGIONS.back as unknown as BodyRegion[], 260, "Back")}
      </svg>

      {/* Hover tooltip */}
      {hoveredRegionData && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-full shadow-lg pointer-events-none whitespace-nowrap z-10"
        >
          {hoveredRegionData.label}
        </div>
      )}
    </div>
  );
}

// Simplified view selector - now just a legend since both views are visible
interface ViewLegendProps {
  markerCount: number;
}

export function ViewLegend({ markerCount }: ViewLegendProps) {
  return (
    <div className="flex items-center justify-center gap-4 text-xs text-foreground-secondary">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-error/25 border border-error" />
        <span>Marked region</span>
      </div>
      {markerCount > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">{markerCount}</span>
          <span>marker{markerCount !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}

// Keep for backwards compatibility
export type { BodyView as BodyViewType };
export function ViewSelector({ currentView: _currentView, onViewChange: _onViewChange, markerCounts: _markerCounts }: {
  currentView: string;
  onViewChange: (view: BodyView) => void;
  markerCounts: Record<string, number>;
}) {
  // No longer needed since both views are visible
  return null;
}
