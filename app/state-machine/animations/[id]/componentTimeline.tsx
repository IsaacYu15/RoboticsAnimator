"use client";

import { addAnimationEvent } from "@/app/actions/animation-event";
import { AnimationEvent, ComponentWithAnimation } from "@/shared-types";
import KeyFrame from "./keyframe";

export interface ComponentTimeLineProps {
  animations: AnimationEvent[];
  component: ComponentWithAnimation;
  animationId: number;
  refresh: () => void;
}

export default function ComponentTimeLine(props: ComponentTimeLineProps) {
  const handleDoubleClick = async (e: React.MouseEvent) => {
    const timeline = e.currentTarget;
    const timelineRect = timeline.getBoundingClientRect();
    const newX = e.clientX - timelineRect.left;
    const newTriggerTime = newX / 100;

    await addAnimationEvent({
      animation_id: props.animationId,
      component_id: props.component.id,
      trigger_time: newTriggerTime,
      action: "0",
    });

    props.refresh();
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="h-10 w-full flex flex-row items-center relative"
    >
      {props.animations.map((event: AnimationEvent) => (
        <KeyFrame key={event.id} event={event} onRefresh={props.refresh} />
      ))}
    </div>
  );
}
