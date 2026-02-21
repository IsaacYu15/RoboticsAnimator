export enum ObjectType {
  SG90_SERVO,
}

export const OBJECT_TYPE_TO_MODEL_PATH: Record<ObjectType, string> = {
  [ObjectType.SG90_SERVO]: "/3D/sg90servo.gltf",
};
