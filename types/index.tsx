export interface ModuleDetails {
  id: number;
  name: string;
  address: string;
}

export interface AnimationEvent {
  module_id: number;
  delay: number;
  action: string;
}

export enum FormAction {
  UPDATE,
  ADD,
}
