export enum ObjectType {
  SG90_SERVO,
}

export const OBJECT_TYPE_CONFIG: Record<
  ObjectType,
  { model: string; thumbnail: string }
> = {
  [ObjectType.SG90_SERVO]: {
    model: "/3D/sg90servo.gltf",
    thumbnail: "/thumbnails/sg90servo.png",
  },
};
