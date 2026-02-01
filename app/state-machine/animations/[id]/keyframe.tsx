"use client";

import { updateAnimationEvent } from "@/app/actions/animation-event";
import { AnimationEvent } from "@/shared-types";
import { useState, useEffect, useRef } from "react";
import KeyframeTooltip from "./keyframeTooltip";

export interface KeyFrameProps {
  event: AnimationEvent;
  onRefresh: () => void;
}

export default function KeyFrame({ event, onRefresh }: KeyFrameProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const wasDragged = useRef(false);
  const [position, setPosition] = useState(Number(event.trigger_time) * 100);

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
        const newX = e.clientX - timelineRect.left;
        setPosition(newX);
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
          const newX = e.clientX - timelineRect.left;
          const newTriggerTime = newX / 100;
          await updateAnimationEvent(event.id, {
            trigger_time: newTriggerTime,
          }).then(() => onRefresh());
        }
      } else {
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
  }, [isDragging, event.id, onRefresh]);

  return (
    <div
      className="absolute -translate-x-1/2"
      style={{ left: `${position}px` }}
    >
      <button
        ref={ref}
        onMouseDown={handleMouseDown}
        className="w-5 h-5 bg-white"
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
