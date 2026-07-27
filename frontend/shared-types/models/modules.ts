export type Module = {
  id: number;
  name: string;
  type: string;
  address: string;
};

export type CreateModule = Omit<Module, "id">;
export type UpdateModule = Partial<Omit<Module, "id">>;
