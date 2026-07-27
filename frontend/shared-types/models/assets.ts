export type Asset = {
  id: number;
  type: string;
  name: string;
  colour: string;
  config: object;
};

export type CreateAsset = Omit<Asset, "id">;

export type UpdateAsset = Partial<Omit<Asset, "id">>;
