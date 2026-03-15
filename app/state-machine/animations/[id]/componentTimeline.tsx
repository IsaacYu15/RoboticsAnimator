"use client";

import { addAnimationEvent } from "@/app/actions/animation-event";
import { AnimationEvent, ComponentWithAnimation } from "@/shared-types";
import KeyFrame from "./keyframe";

interface ComponentTimeLineProps {
  animations: AnimationEvent[];
  component: ComponentWithAnimation;
  animationId: number;
  refresh: () => void;
  timelineUnitWidth: number;
  timelineUnitSeconds: number;
}

export default function ComponentTimeLine({
  animations,
  component,
  animationId,
  refresh,
  timelineUnitWidth,
  timelineUnitSeconds,
}: ComponentTimeLineProps) {
  const handleDoubleClick = async (e: React.MouseEvent) => {
    const timeline = e.currentTarget;
    const timelineRect = timeline.getBoundingClientRect();
    const rawX = e.clientX - timelineRect.left;
    const snappedUnits = Math.round(rawX / timelineUnitWidth);
    const newTriggerTime = snappedUnits * timelineUnitSeconds;

    await addAnimationEvent({
      animation_id: animationId,
      component_id: component.id,
      trigger_time: newTriggerTime,
      action: "0",
    });

    refresh();
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="h-full w-full bg-white border border-gray-light-medium border-t-0 flex flex-row items-center relative"
    >
      {animations.map((event: AnimationEvent) => (
        <KeyFrame
          key={event.id}
          event={event}
          onRefresh={refresh}
          timelineUnitWidth={timelineUnitWidth}
          timelineUnitSeconds={timelineUnitSeconds}
        />
      ))}
    </div>
  );
}
