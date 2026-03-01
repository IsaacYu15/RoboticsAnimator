export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const degreesToRadians = (degrees: number) => {
  return degrees * (Math.PI / 180);
};

export const round = (value: number, precision: number) => {
  return Math.round(value * precision) / precision;
};
