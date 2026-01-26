import { AnimationEvent } from "@/shared-types";
import KeyFrame from "./keyframe";

export interface ComponentTagProps {
  animations: AnimationEvent[];
}

export default function ComponentTimeLine(props: ComponentTagProps) {
  return (
    <div className="h-10 w-full flex flex-row items-center relative">
      {props.animations.map((event: AnimationEvent) => (
        <KeyFrame key={event.id} event={event}></KeyFrame>
      ))}
    </div>
  );
}
