"use client";

import { RefObject } from "react";
import { addAnimationEvent } from "@/app/actions/animation-event";
import { AnimationEvent, ComponentWithAnimation } from "@/shared-types";
import KeyFrame from "./keyframe";

interface ComponentTimeLineProps {
  timelineRef: RefObject<HTMLDivElement | null>;
  animations: AnimationEvent[];
  component: ComponentWithAnimation;
  animationId: number;
  refresh: () => void;
  onTimeChange: (time: number) => void;
  timelineUnitWidth: number;
  timelineUnitSeconds: number;
}

export default function ComponentTimeLine({
  timelineRef,
  animations,
  component,
  animationId,
  refresh,
  onTimeChange,
  timelineUnitWidth,
  timelineUnitSeconds,
}: ComponentTimeLineProps) {
  const handleDoubleClick = async (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;

    const timeline = e.currentTarget;
    const timelineRect = timeline.getBoundingClientRect();
    const rawX = e.clientX - timelineRect.left;
    const snappedUnits = Math.round(rawX / timelineUnitWidth);
    const newTriggerTime = snappedUnits * timelineUnitSeconds;

    //do not add keyframe if it already exists
    if (animations.some((a) => Number(a.trigger_time) === newTriggerTime))
      return;

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
          timelineRef={timelineRef}
          event={event}
          component={component}
          onRefresh={refresh}
          onTimeChange={onTimeChange}
          timelineUnitWidth={timelineUnitWidth}
          timelineUnitSeconds={timelineUnitSeconds}
        />
      ))}
    </div>
  );
}
