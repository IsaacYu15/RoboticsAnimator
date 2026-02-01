import { ComponentWithAnimation } from "@/shared-types";
import axios from "axios";

export const sendAnimation = async (
  animationData: ComponentWithAnimation[],
  address?: string,
): Promise<void> => {
  try {
    if (!address) {
      console.log("Address is required");
      return;
    }

    const payload = JSON.stringify(animationData, null, 2);
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
