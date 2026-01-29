"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Trash2 } from "lucide-react";

export interface SignaturePadProps {
  value?: string; // Base64 data URL
  onChange?: (value: string | null) => void;
  width?: number;
  height?: number;
  penColor?: string;
  backgroundColor?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

const SignaturePad = React.forwardRef<HTMLCanvasElement, SignaturePadProps>(
  (
    {
      value,
      onChange,
      width = 300,
      height = 80,
      penColor = "#000000",
      backgroundColor = "#ffffff",
      disabled,
      error,
      className,
    },
    ref
  ) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [hasSignature, setHasSignature] = React.useState(false);

    // Merge refs
    React.useImperativeHandle(ref, () => canvasRef.current!);

    // Initialize canvas and handle resizing
    React.useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Get the actual display width from container
      const displayWidth = container.clientWidth || width;
      const displayHeight = Math.round(displayWidth * (height / width));

      // Set canvas internal resolution (for crisp drawing)
      const dpr = window.devicePixelRatio || 1;
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;

      // Scale context to match device pixel ratio
      ctx.scale(dpr, dpr);

      // Set canvas display size
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Load existing value
      if (value) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
          setHasSignature(true);
        };
        img.src = value;
      }
    }, [width, height, backgroundColor, value]);

    const getCoordinates = (
      e: React.MouseEvent | React.TouchEvent
    ): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();

      // Get coordinates relative to the canvas display size (not internal resolution)
      if ("touches" in e) {
        const touch = e.touches[0];
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        };
      }

      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;

      const coords = getCoordinates(e);
      if (!coords) return;

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || disabled) return;

      const coords = getCoordinates(e);
      if (!coords) return;

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      setHasSignature(true);
    };

    const stopDrawing = () => {
      if (!isDrawing) return;

      setIsDrawing(false);

      const canvas = canvasRef.current;
      if (canvas && hasSignature) {
        onChange?.(canvas.toDataURL("image/png"));
      }
    };

    const clear = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const displayWidth = container.clientWidth || width;
      const displayHeight = Math.round(displayWidth * (height / width));

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, displayWidth, displayHeight);
      setHasSignature(false);
      onChange?.(null);
    };

    return (
      <div className={cn("space-y-2", className)}>
        <div
          ref={containerRef}
          className={cn(
            "relative overflow-hidden rounded-md border-2 w-full",
            error ? "border-error" : "border-border",
            disabled && "opacity-50"
          )}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className={cn(
              "block touch-none",
              disabled ? "cursor-not-allowed" : "cursor-crosshair"
            )}
          />
          {!hasSignature && !disabled && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <p className="text-xs text-foreground-tertiary">
                Sign here
              </p>
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clear}
          disabled={disabled || !hasSignature}
          className="w-full"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear signature
        </Button>
      </div>
    );
  }
);
SignaturePad.displayName = "SignaturePad";

export { SignaturePad };
