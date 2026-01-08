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

export const emptyComponentDetails: ComponentDetails = {
  id: 0,
  type: "",
  pin: 0,
  x: 0,
  y: 0,
};

export interface AnimationEvent {
  module_id: number;
  delay: number;
  action: string;
}

export enum FormAction {
  UPDATE,
  ADD,
}
