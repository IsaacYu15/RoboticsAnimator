"use client";

import { useCallback, useRef, useState } from "react";
import { BezierControlPoints, EASING_PRESETS } from "@/shared-types";
import { clamp, cubicBezierEase, linearInterpolation } from "@/app/utils/math";
import ContextMenu from "@/app/components/input/contextMenu";
import {
  EASING_PRESET_ITEMS,
  EASING_HANDLE_RADIUS,
  EASING_PADDING,
  EASING_HOVER_RADIUS,
} from "./constants";

interface EasingCurveProps {
  startX: number;
  endX: number;
  height: number;
  start: number;
  end: number;
  min: number;
  max: number;
  controlPoints: BezierControlPoints;
  onControlPointsChange?: (cp: BezierControlPoints) => void;
}

export default function EasingCurve({
  startX,
  endX,
  height,
  start,
  end,
  min,
  max,
  controlPoints,
  onControlPointsChange,
}: EasingCurveProps) {
  const valueToY = useCallback(
    (value: number) => {
      const range = max - min;
      if (range <= 0) {
        throw new Error("Range for component is 0 or negative");
      }
      const t = (value - min) / range;
      return (
        height -
        linearInterpolation(
          EASING_PADDING * height,
          (1 - EASING_PADDING) * height,
          t,
        )
      );
    },
    [height, min, max],
  );

  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);

  const [selected, setSelected] = useState<BezierControlPoints | null>(null);
  const active = selected ?? controlPoints;

  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = useState<{
    svgX: number;
    svgY: number;
    angle: number;
  } | null>(null);

  const startY = valueToY(start);
  const endY = valueToY(end);
  const rangeX = endX - startX;
  const rangeY = endY - startY;

  const { x1, y1, x2, y2 } = active;
  const p0 = { x: 0, y: startY };
  const p1 = { x: x1 * rangeX, y: startY + rangeY * y1 };
  const p2 = { x: x2 * rangeX, y: startY + rangeY * y2 };
  const p3 = { x: rangeX, y: endY };

  const svgBezierPath = `M ${p0.x},${p0.y} C ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;

  const svgToNormalized = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { nx: 0, ny: 0 };

      const rect = svg.getBoundingClientRect();
      const width = clientX - rect.left;
      const height = clientY - rect.top;

      const nx = clamp(width / rangeX, 0, 1);
      const ny = clamp((height - startY) / rangeY, 0, 1);

      return { nx, ny };
    },
    [rangeX, rangeY, startY],
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
        setSelected(null);
        onControlPointsChange?.(current);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [svgToNormalized, active, onControlPointsChange],
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const svg = svgRef.current;
      if (!svg || isDragging.current) {
        setHover(null);
        return;
      }
      const rect = svg.getBoundingClientRect();
      const t = clamp((e.clientX - rect.left) / rangeX, 0, 1);
      const angle = cubicBezierEase(
        t,
        { x: x1, y: y1 },
        { x: x2, y: y2 },
        start,
        end,
      );
      const svgX = t * rangeX;
      const svgY = valueToY(angle);
      setHover({ svgX, svgY, angle });
    },
    [rangeX, x1, y1, x2, y2, start, end, valueToY],
  );

  const handleMouseLeave = useCallback(() => setHover(null), []);

  const handlePresetSelect = useCallback(
    (key: string) => {
      onControlPointsChange?.(EASING_PRESETS[key]);
      setMenu(null);
    },
    [onControlPointsChange],
  );

  return (
    <>
      <svg
        ref={svgRef}
        className="absolute top-0"
        style={{ left: startX, width: rangeX, height, overflow: "visible" }}
        viewBox={`0 0 ${rangeX} ${height}`}
        onContextMenu={handleContextMenu}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <path
          d={svgBezierPath}
          fill="none"
          stroke="var(--color-blue)"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
        {hover && (
          <>
            <circle
              cx={hover.svgX}
              cy={hover.svgY}
              r={EASING_HOVER_RADIUS}
              fill="var(--color-blue-dark)"
              pointerEvents="none"
            />
            <text
              x={hover.svgX}
              y={hover.svgY - 8}
              textAnchor="middle"
              fontSize={12}
              fill="var(--color-black)"
              pointerEvents="none"
              className="select-none"
            >
              {hover.angle}°
            </text>
          </>
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
      {menu && (
        <ContextMenu
          position={menu}
          items={EASING_PRESET_ITEMS}
          onSelect={handlePresetSelect}
          onClose={() => setMenu(null)}
        />
      )}
    </>
  );
}
