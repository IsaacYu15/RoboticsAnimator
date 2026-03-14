"use client";

import { updateAnimationEvent } from "@/app/actions/animation-event";
import { AnimationEvent } from "@/shared-types";
import { useState, useEffect, useRef } from "react";
import KeyframeTooltip from "./keyframeTooltip";
import { clamp } from "@/app/services/math";

interface KeyFrameProps {
  event: AnimationEvent;
  onRefresh: () => void;
  timelineUnitWidth: number;
}

export default function KeyFrame({
  event,
  onRefresh,
  timelineUnitWidth,
}: KeyFrameProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const wasDragged = useRef(false);
  const [dragPosition, setDragPosition] = useState<number>();

  const position =
    dragPosition ?? Number(event.trigger_time) * timelineUnitWidth;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    wasDragged.current = false;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !ref.current) return;
      wasDragged.current = true;
      const timeline = ref.current.parentElement?.parentElement;
      if (timeline) {
        const timelineRect = timeline.getBoundingClientRect();
        const newX = clamp(
          0,
          e.clientX - timelineRect.left,
          timelineRect.width,
        );
        setDragPosition(newX);
      }
    };

    const handleMouseUp = async (e: MouseEvent) => {
      if (!isDragging) return;

      setIsDragging(false);

      if (wasDragged.current) {
        if (!ref.current) return;
        const timeline = ref.current.parentElement?.parentElement;
        if (timeline) {
          const timelineRect = timeline.getBoundingClientRect();
          const rawX = e.clientX - timelineRect.left;
          const snappedX =
            Math.round(rawX / timelineUnitWidth) * timelineUnitWidth;
          const newTriggerTime = snappedX / timelineUnitWidth;

          setDragPosition(snappedX);

          await updateAnimationEvent(event.id, {
            trigger_time: newTriggerTime,
          });

          await onRefresh();
          setDragPosition(undefined);
        }
      } else {
        setDragPosition(undefined);
        setShowTooltip((prev) => !prev);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, event.id, onRefresh, timelineUnitWidth]);

  return (
    <div className=" absolute -translate-x-1/2" style={{ left: position }}>
      <button
        ref={ref}
        onMouseDown={handleMouseDown}
        className="size-3 bg-gray-medium rotate-45 rounded-xs"
      ></button>
      {showTooltip && (
        <KeyframeTooltip
          event={event}
          onClose={() => {
            setShowTooltip(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
