import { AnimationEvent } from "./animation-events";

export type Component = {
  id: number;
  type: string;
  pin: number;
  x: number;
  y: number;
  z: number;
  name: string;
  rot_x: number;
  rot_y: number;
  rot_z: number;
  colour: string;
  config: object;
};

export type ComponentWithAnimations = Component & {
  animation_events: AnimationEvent[];
};

export type CreateComponent = Omit<
  Component,
  "id" | "x" | "y" | "z" | "rot_x" | "rot_y" | "rot_z" | "colour" | "config"
> &
  Partial<Pick<Component, "colour" | "config">>;

export type UpdateComponent = Partial<Omit<Component, "id">>;
