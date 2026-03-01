export const tryParseInt = (input: string) => {
  const value = parseInt(input.trim());

  if (Number.isNaN(value)) {
    return null;
  }

  return value;
};
