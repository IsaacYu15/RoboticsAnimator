export type Animation = {
  id: number;
  name: string;
};

export type CreateAnimation = Omit<Animation, "id">;
export type UpdateAnimation = Partial<Omit<Animation, "id">>;
