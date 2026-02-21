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
