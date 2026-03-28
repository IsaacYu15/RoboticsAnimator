export * from "./modules";
export * from "./transitions";
export * from "./animations";
export * from "./states";
export * from "./animation-event";
export * from "./components";
export * from "./object";
export * from "./assets";

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
