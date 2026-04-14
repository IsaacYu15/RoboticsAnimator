import { formatDecimals } from "@/app/utils/parse";
import {
  MAX_TIMELINE_RANGE,
  MIN_TIMELINE_RANGE,
  SMALLEST_TIMELINE_UNIT_IN_SECONDS,
  ZOOM_FACTOR,
} from "./constants";
import { useCallback } from "react";

interface TimelineTimeProps {
  timelineWidth: () => number;
  timelineUnitWidth: number;
  timelineStart: number;
  timelineEnd: number;
  setTimelineEnd: (end: number) => void;
}

export default function TimelineTime({
  timelineWidth,
  timelineUnitWidth,
  timelineStart,
  timelineEnd,
  setTimelineEnd,
}: TimelineTimeProps) {
  const handleTimelineWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      const delta = e.deltaY / Math.abs(e.deltaY);
      const currentRange = timelineEnd - timelineStart;
      const zoomAmount = currentRange * ZOOM_FACTOR * delta;

      const newEnd = timelineEnd + zoomAmount;

      if (
        newEnd - timelineStart >= MIN_TIMELINE_RANGE &&
        newEnd - timelineStart <= MAX_TIMELINE_RANGE
      ) {
        setTimelineEnd(newEnd);
      }
    },
    [timelineStart, timelineEnd, setTimelineEnd],
  );

  return (
    <div
      className="flex-1 bg-gray-medium relative"
      onWheel={handleTimelineWheel}
    >
      {Array.from({ length: timelineWidth() }).map((_, i) => {
        const timeUnit = i * SMALLEST_TIMELINE_UNIT_IN_SECONDS;
        const isFullSecond = i % (1 / SMALLEST_TIMELINE_UNIT_IN_SECONDS) == 0;
        return (
          <div
            key={i}
            className="h-full absolute flex flex-col items-center justify-end"
            style={{ left: i * timelineUnitWidth }}
          >
            <div
              className={`relative w-0 border border-r border-white ${isFullSecond ? "h-2.5" : "h-1.5"}`}
            >
              {isFullSecond && (
                <span className="text-white text-[8px] absolute bottom-1 -translate-y-1/2 -translate-x-1/2">
                  {formatDecimals(timeUnit, 2)}s
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
