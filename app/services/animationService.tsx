import { AnimationEvent, ModuleDetails } from "@/types";

export const executePin = async (
  address: string,
  pin: number,
  action: string
) => {
  try {
    const response = await fetch(`http://${address}/${pin}/${action}`);
    console.log(response);
  } catch (error) {
    console.error("Error: ", error);
  }
};

export const executeAnimationEvents = async (
  events: AnimationEvent[],
  moduleIdDictionary: Map<number, ModuleDetails>
) => {
  for (const event of events) {
    executePin(moduleIdDictionary.get(event.module_id)?.address ?? "", event.pin, event.action);
    await sleep(event.delay * 1000);
    console.log("yes");
  };
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
