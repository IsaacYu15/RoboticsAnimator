export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const radiansToDegrees = (radians: number) => {
  return radians * (180 / Math.PI);
};

export const degreesToRadians = (degrees: number) => {
  return degrees * (Math.PI / 180);
};

export const round = (value: number, precision: number) => {
  return Math.round(value * precision) / precision;
};

export const linearInterpolation = (a: number, b: number, t: number) => {
  return a + (b - a) * t;
};
