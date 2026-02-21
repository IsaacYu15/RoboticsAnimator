import { ComponentWithAnimation } from "@/shared-types";
import axios from "axios";

type KeyFrame = {
  trigger_time: number;
  action: string;
};

type AnimatedComponent = {
  type: string;
  pin: number;
  keyframes: KeyFrame[];
};

type AnimationPayload = {
  animation: AnimatedComponent[];
};

export const sendAnimation = async (
  animationData: ComponentWithAnimation[],
  address?: string,
): Promise<void> => {
  try {
    if (!address) {
      console.log("Address is required");
      return;
    }

    const payload = JSON.stringify(buildPayload(animationData), null, 2);
    console.log("Sending animation payload:", payload);

    const response = await axios.post(`http://${address}/start`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });
    console.log("Animation sent successfully:", response.status);
  } catch (error) {
    throw new Error(`Failed to send animation to ESP32: ${error}`);
  }
};

const buildPayload = (
  animationData: ComponentWithAnimation[],
): AnimationPayload => {
  const payload: AnimatedComponent[] = animationData.map((value) => {
    console.log(value);
    if (value.type === null)
      throw new Error(`Component of id: ${value.id} is missing a type`);
    if (value.pin === null)
      throw new Error(`Component of id: ${value.id} is missing a pin`);

    const keyframes: KeyFrame[] = value.animation_events.map((event) => {
      return {
        trigger_time: event.trigger_time * 1000, //convert to millisecond
        action: event.action,
      };
    });

    return {
      type: value.type,
      pin: value.pin,
      keyframes: keyframes,
    };
  });

  return {
    animation: payload,
  };
};
