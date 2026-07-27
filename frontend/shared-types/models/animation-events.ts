export type AnimationEvent = {
  id: number;
  animation_id: number;
  component_id: number;
  trigger_time: number;
  action: string;
  easing: string;
};

export type CreateAnimationEvent = Omit<AnimationEvent, "id" | "easing"> & {
  easing?: string;
};

export type UpdateAnimationEvent = Partial<Omit<AnimationEvent, "id">>;
