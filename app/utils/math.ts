import { Point } from "@/shared-types";

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const radiansToDegrees = (radians: number) => {
  return radians * (180 / Math.PI);
};

export const degreesToRadians = (degrees: number) => {
  return degrees * (Math.PI / 180);
};

export const round = (value: number, precision: number) => {
  return Math.round(value * precision) / precision;
};

export const linearInterpolation = (a: number, b: number, t: number) => {
  return a + (b - a) * t;
};

export const cubicBezierEase = (
  x: number,
  p1: Point,
  p2: Point,
  startRange: number,
  endRange: number,
): number => {
  const origin: Point = { x: 0, y: 0 };
  const end: Point = { x: 1, y: 1 };

  let t = x;
  for (let i = 0; i < 8; i++) {
    const ftx = cubicBezier(t, origin, p1, p2, end).x;
    const ftangent = cubicBezierDxDt(t, origin, p1, p2, end);
    if (Math.abs(ftangent) < 1e-6) break;

    const error = ftx - x;
    t = t - error / ftangent;
    t = clamp(t, 0, 1);
  }

  const eased = cubicBezier(t, origin, p1, p2, end).y;
  return Math.round(linearInterpolation(startRange, endRange, eased));
};

const cubicBezier = (
  t: number,
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
): Point => {
  const a = multiplyPoint(p0, Math.pow(1 - t, 3));
  const b = multiplyPoint(p1, 3 * Math.pow(1 - t, 2) * t);
  const c = multiplyPoint(p2, 3 * (1 - t) * Math.pow(t, 2));
  const d = multiplyPoint(p3, Math.pow(t, 3));

  return addPoints(a, b, c, d);
};

const cubicBezierDxDt = (
  t: number,
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
): number => {
  const a = -3 * p0.x * (1 - t) * (1 - t);
  const b = 3 * p1.x * (1 - 4 * t + 3 * t * t);
  const c = 3 * p2.x * (2 * t - 3 * t * t);
  const d = 3 * p3.x * t * t;

  return a + b + c + d;
};

export const multiplyPoint = (point: Point, factor: number) => {
  return {
    x: point.x * factor,
    y: point.y * factor,
  };
};

export const addPoints = (...points: Point[]) => {
  let x = 0;
  let y = 0;
  for (const point of points) {
    x += point.x;
    y += point.y;
  }
  return { x, y };
};
