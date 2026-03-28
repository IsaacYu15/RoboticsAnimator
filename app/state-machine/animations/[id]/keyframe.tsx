"use client";

import { RefObject, useEffect, useCallback } from "react";
import {
  deleteAnimationEvent,
  updateAnimationEvent,
} from "@/app/actions/animation-event";
import { useSelection } from "@/app/context/selectionContext";
import { AnimationEvent, Component } from "@/shared-types";
import { KEY_BACKSPACE } from "@/app/constants";
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
  const { selectComponent, selectedKeyframeId, selectKeyframe } =
    useSelection();

  const isSelected = selectedKeyframeId === event.id;

  const handleDragEnd = useCallback(
    async (newTime: number) => {
      await updateAnimationEvent(event.id, { trigger_time: newTime });
      await onRefresh();
    },
    [event.id, onRefresh],
  );

  const handleClick = useCallback(() => {
    selectKeyframe(event.id);
    selectComponent(component);
    onTimeChange(Number(event.trigger_time));
  }, [selectKeyframe, selectComponent, event.id, component, onTimeChange, event.trigger_time]);

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

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!isSelected) return;

      if (e.key === KEY_BACKSPACE) {
        e.stopPropagation();
        e.preventDefault();

        selectKeyframe(undefined);
        await deleteAnimationEvent(event.id);
        onRefresh();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isSelected, event.id, onRefresh, selectKeyframe]);

  return (
    <div className="absolute -translate-x-1/2" style={{ left: position }}>
      <button
        ref={ref}
        onMouseDown={handleMouseDown}
        className={`size-3 rotate-45 rounded-xs ${isSelected ? "bg-gray-medium-dark" : "bg-gray-medium"}`}
      ></button>
    </div>
  );
}
