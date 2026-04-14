import { HORIZ_DRAGGABLE_SECTIONS } from "@/app/components/dragHandlers/constants";
import { ComponentTypes } from "@/shared-types";

export const KEYFRAME_TAG_HEIGHT = 40;
export const GRAPH_TAG_HEIGHT = 120;
export const TAG_COLUMN_WIDTH = HORIZ_DRAGGABLE_SECTIONS;
export const TIMELINE_HEADER_HEIGHT = 28;

export const SMALLEST_TIMELINE_UNIT_IN_SECONDS = 0.25;
export const ZOOM_FACTOR = 0.1;

export const MIN_TIMELINE_RANGE = 5;
export const MAX_TIMELINE_RANGE = 120;

export const EASING_HANDLE_RADIUS = 5;
export const EASING_HOVER_RADIUS = 3;
export const EASING_PADDING = 0.1;

export const EASING_PRESET_ITEMS = [
  { key: "linear", label: "Linear" },
  { key: "easeIn", label: "Ease In" },
  { key: "easeOut", label: "Ease Out" },
  { key: "easeInOut", label: "Ease In Out" },
];

export const CONST_COMPONENT_RANGE: Record<
  string,
  { min: number; max: number }
> = {
  [ComponentTypes.SERVO]: { min: 0, max: 180 },
};

export enum TimelineMode {
  KEYFRAME,
  GRAPH,
}
