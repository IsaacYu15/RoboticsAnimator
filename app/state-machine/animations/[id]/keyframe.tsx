"use client";

import { RefObject, useEffect, useCallback } from "react";
import { updateAnimationEvent } from "@/app/actions/animation-event";
import { useSelection } from "@/app/context/selectionContext";
import { AnimationEvent, Component } from "@/shared-types";
import { useTimelineDrag } from "./useTimelineDrag";

interface KeyFrameProps {
  timelineRef: RefObject<HTMLDivElement | null>;
  event: AnimationEvent;
  component: Component;
  onRefresh: () => void;
  onTimeChange: (time: number) => void;
  timelineUnitWidth: number;
  timelineUnitSeconds: number;
}

export default function KeyFrame({
  timelineRef,
  event,
  component,
  onRefresh,
  onTimeChange,
  timelineUnitWidth,
  timelineUnitSeconds,
}: KeyFrameProps) {
  const { selectComponent } = useSelection();

  const handleDragEnd = useCallback(
    async (newTime: number) => {
      await updateAnimationEvent(event.id, { trigger_time: newTime });
      await onRefresh();
    },
    [event.id, onRefresh],
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
    },
  );

  return (
    <div className="absolute -translate-x-1/2" style={{ left: position }}>
      <button
        ref={ref}
        onMouseDown={handleMouseDown}
        className={`size-3 rotate-45 rounded-xs bg-gray-medium`}
      ></button>
    </div>
  );
}
