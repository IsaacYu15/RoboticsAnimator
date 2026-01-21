export interface ModuleDetails {
  id: number;
  name: string;
  address: string;
}

export interface ComponentDetails {
  id: number;
  type: string;
  pin: number;
  x: number;
  y: number;
}

export interface StateDetails {
  id: number;
  name: string;
  animation_id: number | null;
  x: number;
  y: number;
}

export interface TransitionDetails {
  id: number;
  from_id: number;
  to_id: number;
  condition: string;
}

export const emptyComponentDetails: ComponentDetails = {
  id: 0,
  type: "",
  pin: 0,
  x: 0,
  y: 0,
};

export interface Animation {
  id: number;
  name: string;
  duration_s: number;
  loop: boolean;
}

export interface AnimationEvent {
  id: number;
  animation_id: number;
  component_id: number;
  trigger_time: number;
  action: string;
}

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
