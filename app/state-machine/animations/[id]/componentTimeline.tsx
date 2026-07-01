"use client";

import { RefObject } from "react";
import { addAnimationEvent } from "@/app/actions/animation-event";
import { AnimationEvent, ComponentWithAnimation } from "@/shared-types";
import KeyFrame from "./keyframe";
import { roundToDecimals } from "@/app/utils/parse";
import { MATCH_TOLERANCE } from "./constants";

interface ComponentTimeLineProps {
  timelineRef: RefObject<HTMLDivElement | null>;
  animations: AnimationEvent[];
  component: ComponentWithAnimation;
  animationId: number;
  currentTime: number;
  onEventTimeChange: (
    componentId: number,
    eventId: number,
    newTime: number,
  ) => void;
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
  currentTime,
  onEventTimeChange,
  refresh,
  onTimeChange,
  timelineUnitWidth,
  timelineUnitSeconds,
}: ComponentTimeLineProps) {
  const handleDoubleClick = async (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    if (timelineUnitWidth <= 0) return;

    const timeline = e.currentTarget;
    const timelineRect = timeline.getBoundingClientRect();
    const rawX = e.clientX - timelineRect.left;
    const newTriggerTime = roundToDecimals(
      Math.max(0, (rawX / timelineUnitWidth) * timelineUnitSeconds),
      3,
    );

    if (
      animations.some(
        (a) =>
          Math.abs(Number(a.trigger_time) - newTriggerTime) < MATCH_TOLERANCE,
      )
    )
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
      className="h-full w-full bg-white border border-gray-light-medium border-t-0 flex flex-row items-center relative overflow-visible"
    >
      {animations.map((event) => (
        <KeyFrame
          key={event.id}
          timelineRef={timelineRef}
          event={event}
          component={component}
          currentTime={currentTime}
          onEventTimeChange={onEventTimeChange}
          onRefresh={refresh}
          onTimeChange={onTimeChange}
          timelineUnitWidth={timelineUnitWidth}
          timelineUnitSeconds={timelineUnitSeconds}
        />
      ))}
    </div>
  );
}
