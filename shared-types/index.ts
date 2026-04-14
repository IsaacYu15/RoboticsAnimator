export * from "./modules";
export * from "./transitions";
export * from "./animations";
export * from "./states";
export * from "./animation-event";
export * from "./components";
export * from "./object";
export * from "./assets";
export * from "./esp";

export type Point = {
  x: number;
  y: number;
};

export enum Axis {
  X = "x",
  Y = "y",
  Z = "z",
}

export type Transform = {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
};

export type TransformMode = "translate" | "rotate";

export type MovementMode = "pan" | "firstPerson";

export enum ComponentTypes {
  SERVO = "servo",
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected";

export enum FormAction {
  UPDATE,
  ADD,
}

export enum Direction {
  RIGHT,
  LEFT,
  UP,
  DOWN,
}

export type IconButtonVariant = "default" | "blue";

export type BezierControlPoints = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export const EASING_PRESETS: Record<string, BezierControlPoints> = {
  linear: { x1: 0, y1: 0, x2: 1, y2: 1 },
  easeIn: { x1: 0.42, y1: 0, x2: 1, y2: 1 },
  easeOut: { x1: 0, y1: 0, x2: 0.58, y2: 1 },
  easeInOut: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
};
