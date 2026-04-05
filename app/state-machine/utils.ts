import { AnimationEvent } from "@/shared-types";
import { linearInterpolation } from "../utils/math";

export const isInputFieldFocused = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement;

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
};

export const interpolateAngle = (
  events: AnimationEvent[],
  currentTime: number,
): number => {
  if (events.length === 0) return 0;

  let current = events[0];
  let next = events[0];

  for (let i = 0; i < events.length; i++) {
    if (Number(events[i].trigger_time) <= currentTime) {
      current = events[i];
      next = events[i + 1] ?? events[i];
    }
  }

  const currentAngle = parseInt(current.action) || 0;
  const nextAngle = parseInt(next.action) || 0;
  const currentKeyTime = Number(current.trigger_time);
  const nextKeyTime = Number(next.trigger_time);

  if (current === next || currentKeyTime === nextKeyTime) return currentAngle;

  const t = (currentTime - currentKeyTime) / (nextKeyTime - currentKeyTime);
  return Math.round(linearInterpolation(currentAngle, nextAngle, t));
};
