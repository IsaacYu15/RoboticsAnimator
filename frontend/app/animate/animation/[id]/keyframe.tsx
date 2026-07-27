"use client";

import { RefObject, useCallback } from "react";
import { useAnimationEvents } from "@/hooks/useAnimationEvents";
import { useSelection } from "@/context/selectionContext";
import { AnimationEvent, Component } from "@/shared-types";
import { useTimelineDrag } from "./useTimelineDrag";

interface KeyFrameProps {
  timelineRef: RefObject<HTMLDivElement | null>;
  event: AnimationEvent;
  component: Component;
  currentTime: number;
  onEventTimeChange: (
    componentId: number,
    eventId: number,
    newTime: number,
  ) => void;
  onRefresh: () => void;
  onTimeChange: (time: number) => void;
  timelineUnitWidth: number;
  timelineUnitSeconds: number;
}

export default function KeyFrame({
  timelineRef,
  event,
  component,
  currentTime,
  onEventTimeChange,
  onRefresh,
  onTimeChange,
  timelineUnitWidth,
  timelineUnitSeconds,
}: KeyFrameProps) {
  const { selectComponent } = useSelection();
  const { updateAnimationEvent } = useAnimationEvents();
  const snapThresholdSeconds =
    timelineUnitWidth > 0 ? (4 / timelineUnitWidth) * timelineUnitSeconds : 0;
  const snapToPlayhead = useCallback(
    (time: number) => {
      if (snapThresholdSeconds <= 0) return time;
      return Math.abs(time - currentTime) <= snapThresholdSeconds
        ? currentTime
        : time;
    },
    [currentTime, snapThresholdSeconds],
  );

  const handleDragEnd = useCallback(
    async (newTime: number) => {
      const previousTime = Number(event.trigger_time);
      onEventTimeChange(component.id, event.id, newTime);

      try {
        await updateAnimationEvent(event.id, {
          trigger_time: newTime,
        });

        onEventTimeChange(component.id, event.id, previousTime);
        await onRefresh();
      } catch {
        onEventTimeChange(component.id, event.id, previousTime);
        await onRefresh();
      }
    },
    [
      component.id,
      event.id,
      event.trigger_time,
      onEventTimeChange,
      onRefresh,
      updateAnimationEvent,
    ],
  );

  const handleClick = useCallback(() => {
    selectComponent(component);
    onTimeChange(Number(event.trigger_time));
  }, [selectComponent, component, onTimeChange, event.trigger_time]);

  const { ref, position, handleMouseDown } = useTimelineDrag<HTMLButtonElement>(
    {
      timelineRef,
      timelineUnitWidth,
      timelineUnitSeconds,
      initialTime: Number(event.trigger_time),
      onDragEnd: handleDragEnd,
      onClick: handleClick,
      snapTimeOnDrag: snapToPlayhead,
      snapTime: snapToPlayhead,
    },
  );

  return (
    <div
      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ left: position }}
    >
      <button
        ref={ref}
        onMouseDown={handleMouseDown}
        className={`size-3 rotate-45 rounded-xs bg-gray-medium`}
      ></button>
    </div>
  );
}
