import { BezierControlPoints, EASING_PRESETS } from "@/shared-types";
import { round } from "./math";

export const tryParseInt = (input?: string) => {
  if (!input) return null;

  const value = parseInt(input.trim());

  if (Number.isNaN(value)) {
    return null;
  }

  return value;
};

export const tryParseFloat = (input?: string, decimals: number = 2) => {
  if (!input) return null;

  const value = parseFloat(input.trim());

  if (Number.isNaN(value)) {
    return null;
  }

  return roundToDecimals(value, decimals);
};

export const roundToDecimals = (value: number, decimals: number = 2) => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

export const formatDecimals = (value: number, decimals: number = 2) => {
  return roundToDecimals(value, decimals).toFixed(decimals);
};

export const parseEasing = (rawEasing: string | null): BezierControlPoints => {
  if (!rawEasing) return EASING_PRESETS.linear;

  const parts = rawEasing.split(",").map(Number);
  if (parts.length !== 4 || parts.some(isNaN))
    throw new Error("Invalid easing string");

  return { x1: parts[0], y1: parts[1], x2: parts[2], y2: parts[3] };
};

export const serializeEasing = (points: BezierControlPoints): string => {
  return `${round(points.x1, 3)},${round(points.y1, 3)},${round(points.x2, 3)},${round(points.y2, 3)}`;
};
