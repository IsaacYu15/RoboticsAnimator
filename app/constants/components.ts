export enum ComponentType {
  SERVO = "servo",
}

export type ServoConfig = {
  pwmMinAngle: number;
  pwmMaxAngle: number;
};
