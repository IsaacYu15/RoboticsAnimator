import { TAG_COLUMN_WIDTH, TimelineMode } from "./constants";
import { Diamond } from "lucide-react";
import { Spline } from "lucide-react";

interface TimelineOptions {
  timelineMode: TimelineMode;
  setTimelineMode: (mode: TimelineMode) => void;
}
export default function TimelineOptions({
  timelineMode,
  setTimelineMode,
}: TimelineOptions) {
  return (
    <div
      className="bg-gray-medium flex items-center px-2"
      style={{ width: TAG_COLUMN_WIDTH }}
    >
      <button
        onClick={() =>
          setTimelineMode(
            timelineMode === TimelineMode.KEYFRAME
              ? TimelineMode.GRAPH
              : TimelineMode.KEYFRAME,
          )
        }
      >
        {timelineMode === TimelineMode.KEYFRAME ? (
          <Diamond className="size-4 text-white" />
        ) : (
          <Spline className="size-4 text-white" />
        )}
      </button>
    </div>
  );
}
