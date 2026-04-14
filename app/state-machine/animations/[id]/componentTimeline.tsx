"use client";

import { RefObject, useCallback } from "react";
import {
  addAnimationEvent,
  updateAnimationEvent,
} from "@/app/actions/animation-event";
import {
  AnimationEvent,
  BezierControlPoints,
  ComponentWithAnimation,
} from "@/shared-types";
import {
  GRAPH_TAG_HEIGHT,
  TimelineMode,
  CONST_COMPONENT_RANGE,
} from "./constants";
import KeyFrame from "./keyframe";
import EasingCurve from "./easingCurve";
import { parseEasing, serializeEasing } from "@/app/utils/parse";

interface ComponentTimeLineProps {
  timelineRef: RefObject<HTMLDivElement | null>;
  animations: AnimationEvent[];
  component: ComponentWithAnimation;
  animationId: number;
  refresh: () => void;
  onTimeChange: (time: number) => void;
  timelineUnitWidth: number;
  timelineUnitSeconds: number;
  timelineMode: TimelineMode;
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
  timelineMode,
}: ComponentTimeLineProps) {
  const timeToPosition = useCallback(
    (time: number) => (time / timelineUnitSeconds) * timelineUnitWidth,
    [timelineUnitSeconds, timelineUnitWidth],
  );

  const setControlPoints = useCallback(
    async (eventId: number, cp: BezierControlPoints) => {
      await updateAnimationEvent(eventId, { easing: serializeEasing(cp) });
      refresh();
    },
    [refresh],
  );

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
      className="h-full w-full bg-white border border-gray-light-medium border-t-0 flex flex-row items-center relative overflow-visible"
    >
      {animations.map((event) => {
        return (
          <div key={event.id}>
            {timelineMode === TimelineMode.KEYFRAME && (
              <KeyFrame
                timelineRef={timelineRef}
                event={event}
                component={component}
                onRefresh={refresh}
                onTimeChange={onTimeChange}
                timelineUnitWidth={timelineUnitWidth}
                timelineUnitSeconds={timelineUnitSeconds}
              />
            )}
          </div>
        );
      })}
      {timelineMode === TimelineMode.GRAPH &&
        animations.map((event, i) => {
          const next = animations[i + 1];
          if (!next) return null;
          return (
            <EasingCurve
              key={`curve-${event.id}`}
              startX={timeToPosition(Number(event.trigger_time))}
              endX={timeToPosition(Number(next.trigger_time))}
              height={GRAPH_TAG_HEIGHT}
              start={parseInt(event.action) || 0}
              end={parseInt(next.action) || 0}
              min={CONST_COMPONENT_RANGE[component.type ?? ""].min}
              max={CONST_COMPONENT_RANGE[component.type ?? ""].max}
              controlPoints={parseEasing(event.easing)}
              onControlPointsChange={(cp) => setControlPoints(event.id, cp)}
            />
          );
        })}
    </div>
  );
}
