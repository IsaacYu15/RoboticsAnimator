export const tryParseInt = (input: string) => {
  const value = parseInt(input.trim());

  if (Number.isNaN(value)) {
    return null;
  }

  return value;
};

export const tryParseFloat = (input: string, decimals: number = 2) => {
  const value = parseFloat(input.trim());

  if (Number.isNaN(value)) {
    return null;
  }

  return roundToDecimals(value, decimals);
};

export const roundToDecimals = (value: number, decimals: number = 2) => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};
