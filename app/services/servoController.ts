import {
  ComponentTypes,
  ComponentWithAnimation,
  AnimationEvent,
} from "@/shared-types";
import { getHttpUrl } from "@/shared-types/esp";
import axios from "axios";
import { interpolateAngle } from "../state-machine/utils";

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
  animationLength: number;
  animation: AnimatedComponent[];
};

type ControllerResponse = {
  success: boolean;
};

export const calibrateComponent = async (
  pin: number,
  type: ComponentTypes,
  address?: string,
): Promise<ControllerResponse> => {
  try {
    if (!address) {
      console.log("Address is required");
      return { success: false };
    }

    const payload = JSON.stringify({
      pin,
      type,
    });

    const response = await axios.post(
      getHttpUrl(address, "/calibrate"),
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
      },
    );

    return { success: response.status === 200 };
  } catch (error) {
    throw new Error(`Failed to calibrate component: ${error}`);
  }
};

export const sendAnimation = async (
  animationData: ComponentWithAnimation[],
  address?: string,
): Promise<ControllerResponse> => {
  try {
    if (!address) {
      console.log("Address is required");
      return { success: false };
    }

    const payload = JSON.stringify(buildPayload(animationData), null, 2);
    const url = getHttpUrl(address, "/start");
    console.log(`Sending to: ${url}`);
    console.log("Sending animation payload:", payload);

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });

    return { success: response.status === 200 };
  } catch (error) {
    throw new Error(`Failed to send animation to ESP32: ${error}`);
  }
};

export const buildFramePayload = (
  currentTime: number,
  animationData: ComponentWithAnimation[],
): AnimationEvent[] => {
  console.log("Building frame payload for current time:", currentTime);
  return animationData.flatMap((component) => {
    if (
      component.animation_events.length === 0 ||
      component.type === null ||
      component.pin === null
    )
      return [];

    const angle = interpolateAngle(component.animation_events, currentTime);

    return {
      id: 0,
      animation_id: 0,
      component_id: component.id,
      trigger_time: 0,
      pin: component.pin,
      type: component.type,
      action: angle.toString(),
    };
  });
};

const buildPayload = (
  animationData: ComponentWithAnimation[],
): AnimationPayload => {
  let animationLength = 0;

  const payload: AnimatedComponent[] = animationData.map((value) => {
    console.log("Sending payload: \n", value);
    if (value.type === null)
      throw new Error(`Component of id: ${value.id} is missing a type`);
    if (value.pin === null)
      throw new Error(`Component of id: ${value.id} is missing a pin`);

    const keyframes: KeyFrame[] = value.animation_events.map((event) => {
      animationLength = Math.max(animationLength, event.trigger_time * 1000);
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
    animationLength: animationLength,
    animation: payload,
  };
};
