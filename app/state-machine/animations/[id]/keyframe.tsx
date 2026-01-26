import { AnimationEvent } from "@/shared-types";

export interface KeyFrameProps {
  event: AnimationEvent;
}
export default function KeyFrame(props: KeyFrameProps) {
  return (
    <button
      className="w-5 h-5 bg-white absolute -translate-x-1/2"
      style={{ left: `${Number(props.event.trigger_time) * 100}px` }}
    ></button>
  );
}
