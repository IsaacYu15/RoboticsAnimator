export const tryParseInt = (input: string) => {
  const value = parseInt(input.trim());

  if (Number.isNaN(value)) {
    return null;
  }

  return value;
};

export const generateServoConfig = (
  pwmMinAngle: number | null,
  pwmMaxAngle: number | null,
) => {
  return JSON.stringify({
    pwmMinAngle: pwmMinAngle,
    pwmMaxAngle: pwmMaxAngle,
  });
};
