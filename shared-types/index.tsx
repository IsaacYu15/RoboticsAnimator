export * from "./modules";
export * from "./transitions";
export * from "./animations";
export * from "./states";
export * from "./animation-event";
export * from "./components";
export * from "./object-types";

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

export enum ComponentTypes {
  SERVO,
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
