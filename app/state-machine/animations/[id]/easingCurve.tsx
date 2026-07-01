"use client";

import { useCallback, useRef, useState } from "react";
import { BezierControlPoints } from "@/shared-types";
import { clamp, cubicBezierProgressAtX } from "@/app/utils/math";
import {
  EASING_HANDLE_RADIUS,
  EASING_PADDING,
  EASING_HOVER_RADIUS,
} from "./constants";

interface EasingCurveProps {
  startX: number;
  endX: number;
  height: number;
  startTime: number;
  endTime: number;
  currentTime?: number;
  controlPoints: BezierControlPoints;
  onControlPointsChange?: (cp: BezierControlPoints) => void;
}

export default function EasingCurve({
  startX,
  endX,
  height,
  startTime,
  endTime,
  currentTime,
  controlPoints,
  onControlPointsChange,
}: EasingCurveProps) {
  const rangeX = Math.max(endX - startX, 1);
  const plotLeft = EASING_PADDING * rangeX;
  const plotRight = (1 - EASING_PADDING) * rangeX;
  const plotWidth = Math.max(plotRight - plotLeft, 1);
  const plotTop = EASING_PADDING * height;
  const plotBottom = (1 - EASING_PADDING) * height;
  const plotHeight = Math.max(plotBottom - plotTop, 1);
  const progressToY = useCallback(
    (progress: number) => plotBottom - clamp(progress, 0, 1) * plotHeight,
    [plotBottom, plotHeight],
  );

  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);

  const [selected, setSelected] = useState<BezierControlPoints | null>(null);
  const active = selected ?? controlPoints;

  const { x1, y1, x2, y2 } = active;
  const p0 = { x: plotLeft, y: progressToY(0) };
  const p1 = { x: plotLeft + x1 * plotWidth, y: progressToY(y1) };
  const p2 = { x: plotLeft + x2 * plotWidth, y: progressToY(y2) };
  const p3 = { x: plotRight, y: progressToY(1) };

  const svgBezierPath = `M ${p0.x},${p0.y} C ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
  const timeRange = endTime - startTime;
  const hasPlaybackPoint =
    currentTime !== undefined && Math.abs(timeRange) > 1e-6;
  const playbackT = hasPlaybackPoint
    ? clamp((currentTime - startTime) / timeRange, 0, 1)
    : 0;
  const playbackProgress = hasPlaybackPoint
    ? cubicBezierProgressAtX(
        playbackT,
        { x: x1, y: y1 },
        { x: x2, y: y2 },
      )
    : 0;
  const playbackX = plotLeft + playbackT * plotWidth;
  const playbackY = progressToY(playbackProgress);

  const svgToNormalized = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { nx: 0, ny: 0 };

      const rect = svg.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const nx = clamp((x - plotLeft) / plotWidth, 0, 1);
      const ny = clamp((plotBottom - y) / plotHeight, 0, 1);

      return { nx, ny };
    },
    [plotLeft, plotWidth, plotBottom, plotHeight],
  );

  const handleMouseDown = useCallback(
    (handle: "p1" | "p2") => (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      isDragging.current = true;

      let current = active;

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        const { nx, ny } = svgToNormalized(e.clientX, e.clientY);
        current =
          handle === "p1"
            ? { ...current, x1: nx, y1: ny }
            : { ...current, x2: nx, y2: ny };
        setSelected(current);
      };

      const onMouseUp = () => {
        isDragging.current = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        onControlPointsChange?.(current);
        setSelected(null);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [svgToNormalized, active, onControlPointsChange],
  );


  return (
    <svg
      ref={svgRef}
      className="absolute top-0"
      style={{ left: startX, width: rangeX, height, overflow: "visible" }}
      viewBox={`0 0 ${rangeX} ${height}`}
    >
      <path
        d={svgBezierPath}
        fill="none"
        stroke="var(--color-blue)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      {hasPlaybackPoint && (
        <circle
          cx={playbackX}
          cy={playbackY}
          r={EASING_HOVER_RADIUS}
          fill="var(--color-blue)"
          pointerEvents="none"
        />
      )}
      <line
        x1={p0.x}
        y1={p0.y}
        x2={p1.x}
        y2={p1.y}
        stroke="var(--color-gray-medium)"
        strokeWidth={1}
        strokeDasharray="3 3"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={p3.x}
        y1={p3.y}
        x2={p2.x}
        y2={p2.y}
        stroke="var(--color-gray-medium)"
        strokeWidth={1}
        strokeDasharray="3 3"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={p1.x}
        cy={p1.y}
        r={EASING_HANDLE_RADIUS}
        fill="white"
        stroke="var(--color-blue)"
        strokeWidth={2}
        className="cursor-grab active:cursor-grabbing"
        vectorEffect="non-scaling-stroke"
        onMouseDown={handleMouseDown("p1")}
      />
      <circle
        cx={p2.x}
        cy={p2.y}
        r={EASING_HANDLE_RADIUS}
        fill="white"
        stroke="var(--color-blue)"
        strokeWidth={2}
        className="cursor-grab active:cursor-grabbing"
        vectorEffect="non-scaling-stroke"
        onMouseDown={handleMouseDown("p2")}
      />
    </svg>
  );
}