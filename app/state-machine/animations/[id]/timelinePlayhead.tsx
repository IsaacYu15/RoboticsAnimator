"use client";

import { RefObject } from "react";
import { useTimelineDrag } from "./useTimelineDrag";
import { TIMELINE_HEADER_HEIGHT } from "./constants";

interface TimelinePlayheadProps {
  timelineRef: RefObject<HTMLDivElement | null>;
  timelineUnitWidth: number;
  timelineUnitSeconds: number;
  currentTime: number;
  onTimeChange: (time: number) => void;
  leftOffset?: number;
}

export default function TimelinePlayhead({
  timelineRef,
  timelineUnitWidth,
  timelineUnitSeconds,
  currentTime,
  onTimeChange,
  leftOffset = 0,
}: TimelinePlayheadProps) {
  const { ref, position, handleMouseDown } = useTimelineDrag<HTMLDivElement>({
    timelineRef,
    timelineUnitWidth,
    timelineUnitSeconds,
    initialTime: currentTime,
    onDragEnd: onTimeChange,
  });

  return (
    <div
      className="absolute top-0 bottom-0 -translate-x-1/2 flex flex-col items-center pointer-events-none z-100"
      style={{ left: leftOffset + position }}
    >
      <div
        ref={ref}
        onMouseDown={handleMouseDown}
        className="w-4 bg-blue cursor-ew-resize pointer-events-auto"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%)",
          height: TIMELINE_HEADER_HEIGHT,
        }}
      />
      <div className="w-0.5 bg-blue h-full" />
    </div>
  );
}
