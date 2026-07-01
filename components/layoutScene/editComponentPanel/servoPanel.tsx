"use client";

import {
  parseEasing,
  serializeEasing,
  tryParseFloat,
  tryParseInt,
} from "@/utils/parse";
import { interpolateAngle } from "@/app/animate/animation/[id]/utils";
import { AXIS_COLOURS } from "@/constants";
import {
  EASING_PRESET_ITEMS,
  MATCH_TOLERANCE,
} from "@/app/animate/animation/[id]/constants";
import EasingCurve from "./easingCurve";
import ColourPalette from "../../colourPalette/colourPalette";
import IconInputField from "../../input/iconInputField";
import SimpleInputField from "../../input/simpleInputField";
import { PanelState, ServoPanelState } from "./panelState";
import { Cable, FileUp, TriangleRight, Wrench } from "lucide-react";
import IconButton from "../../input/iconButton";
import { createAsset } from "@/actions/assets";
import { useToast } from "@/context/toastContext";
import { PwmMax, PwmMin } from "@/public/icons/animation-page";
import { useSelection } from "@/context/selectionContext";
import {
  addAnimationEvent,
  updateAnimationEvent,
} from "@/actions/animation-event";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimationEvent,
  BezierControlPoints,
  ComponentTypes,
  EASING_PRESETS,
} from "@/shared-types";
import { calibrateComponent } from "@/services/servoController";
import { clamp } from "@/utils/math";

interface ServoPanelProps {
  moduleAddress?: string;
  state: ServoPanelState;
  setState: (state?: PanelState) => void;
  currentTime: number;
  componentEvents: AnimationEvent[];
  animationId: number;
  onRefresh: () => void;
}

const DEFAULT_CONTROL_POINTS: BezierControlPoints = {
  x1: 0,
  y1: 0,
  x2: 1,
  y2: 1,
};

const CURVE_EDITOR_DEFAULT_SIZE = 220;

const areControlPointsEqual = (
  a: BezierControlPoints,
  b: BezierControlPoints,
) =>
  Math.abs(a.x1 - b.x1) <= MATCH_TOLERANCE &&
  Math.abs(a.y1 - b.y1) <= MATCH_TOLERANCE &&
  Math.abs(a.x2 - b.x2) <= MATCH_TOLERANCE &&
  Math.abs(a.y2 - b.y2) <= MATCH_TOLERANCE;

export function ServoPanel({
  moduleAddress,
  state,
  setState,
  currentTime,
  componentEvents,
  animationId,
  onRefresh,
}: ServoPanelProps) {
  const toast = useToast();
  const { selectedComponent } = useSelection();
  const [angle, setAngle] = useState(0);
  const curveContainerRef = useRef<HTMLDivElement>(null);
  const [curveEditorDimensions, setCurveEditorDimensions] = useState({
    width: CURVE_EDITOR_DEFAULT_SIZE,
    height: CURVE_EDITOR_DEFAULT_SIZE,
  });
  const [displayControlPoints, setDisplayControlPoints] =
    useState<BezierControlPoints>(DEFAULT_CONTROL_POINTS);

  const interpolatedAngle = useMemo(
    () => interpolateAngle(componentEvents, currentTime),
    [currentTime, componentEvents],
  );

  const activeSegmentStartIndex = useMemo(() => {
    if (componentEvents.length < 2) return -1;

    const n = componentEvents.length;
    const timeAt = (i: number) => Number(componentEvents[i].trigger_time);

    let l = 0;
    let r = n - 1;
    let idx = 0;

    while (l <= r) {
      const mid = Math.floor((l + r) / 2);

      if (timeAt(mid) == currentTime) {
        idx = mid;
        break;
      }

      if (timeAt(mid) < currentTime) {
        idx = mid;
        l = mid + 1;
      } else {
        r = mid - 1;
      }
    }

    return clamp(idx, 0, n - 2);
  }, [componentEvents, currentTime]);

  const segmentStartKeyframe =
    activeSegmentStartIndex >= 0
      ? componentEvents[activeSegmentStartIndex]
      : undefined;

  const segmentEndKeyframe =
    activeSegmentStartIndex >= 0
      ? componentEvents[activeSegmentStartIndex + 1]
      : undefined;

  const startTime = Number(segmentStartKeyframe?.trigger_time ?? currentTime);

  const endTime = Number(
    segmentEndKeyframe?.trigger_time ??
      segmentStartKeyframe?.trigger_time ??
      currentTime,
  );

  const selectedControlPoints = useMemo(() => {
    if (!segmentStartKeyframe) return DEFAULT_CONTROL_POINTS;

    try {
      return parseEasing(segmentStartKeyframe.easing);
    } catch {
      return DEFAULT_CONTROL_POINTS;
    }
  }, [segmentStartKeyframe]);

  useEffect(() => {
    setDisplayControlPoints(selectedControlPoints);
  }, [selectedControlPoints]);

  const selectedPresetKey = useMemo(() => {
    const matched = Object.entries(EASING_PRESETS).find(([, points]) =>
      areControlPointsEqual(points, displayControlPoints),
    );
    return matched?.[0];
  }, [displayControlPoints]);

  const updateField = <K extends keyof ServoPanelState>(
    field: K,
    value: ServoPanelState[K],
  ) => {
    const newState = state.clone();
    (newState[field] as ServoPanelState[K]) = value;
    setState(newState);
  };

  const saveAsAsset = async () => {
    const asset = {
      name: state.name,
      type: "servo",
      config: state.generateConfig(),
    };
    const result = await createAsset(asset);

    if (result.success) {
      toast.toast("Asset Saved");
    } else {
      toast.toast("Error saving asset");
    }
  };

  const handleAngleChange = async (newAngle: number) => {
    if (!selectedComponent) return;

    const existingKeyframe = componentEvents.find(
      (event) => Number(event.trigger_time) === currentTime,
    );

    if (existingKeyframe) {
      await updateAnimationEvent(existingKeyframe.id, {
        action: newAngle.toString(),
      });
    } else {
      await addAnimationEvent({
        animation_id: animationId,
        component_id: selectedComponent.id,
        trigger_time: currentTime,
        action: newAngle.toString(),
      });
    }

    setAngle(newAngle);
    onRefresh();
  };

  const handleEasingGraphChange = async (
    controlPoints: BezierControlPoints,
  ) => {
    if (!segmentStartKeyframe) return;
    setDisplayControlPoints(controlPoints);

    await updateAnimationEvent(segmentStartKeyframe.id, {
      easing: serializeEasing(controlPoints),
    });
    await onRefresh();
  };

  const handleEasingPresetChange = async (presetKey: string) => {
    if (!segmentStartKeyframe || !presetKey || !(presetKey in EASING_PRESETS))
      return;
    const presetControlPoints = { ...EASING_PRESETS[presetKey] };
    setDisplayControlPoints(presetControlPoints);

    await updateAnimationEvent(segmentStartKeyframe.id, {
      easing: serializeEasing(presetControlPoints),
    });
    await onRefresh();
  };

  useEffect(() => {
    setAngle(interpolatedAngle);
  }, [interpolatedAngle]);

  useEffect(() => {
    const container = curveContainerRef.current;
    if (!container) return;

    const updateSize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width > 0 && height > 0) {
        setCurveEditorDimensions({ width, height });
      }
    };

    updateSize();

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setCurveEditorDimensions({ width, height });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-gray-light h-full pb-6 overflow-y-auto scrollbar-hidden">
      <div className="w-full px-6 pb-4 pt-6 flex flex-row items-start justify-between border-b border-gray-light-medium sticky top-0 z-20 bg-gray-light">
        <input
          className="title-input-default text-sm"
          value={state.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
        <IconButton icon={FileUp} onClick={saveAsAsset} />
      </div>
      <div className="panel-section-col-default">
        <h5>Settings</h5>
        <div className="grid grid-cols-2 gap-2">
          <ColourPalette
            selectedColour={state.colour}
            setSelectedColour={(colour) => updateField("colour", colour)}
          />
          <IconInputField
            icon={Cable}
            field={{
              value: state.pin ?? 0,
              onValidate: (value) =>
                updateField("pin", tryParseInt(value) ?? 0),
            }}
          />
          <IconInputField
            icon={PwmMin}
            field={{
              value: state.pwmMinAngle ?? 0,
              onValidate: (value) =>
                updateField("pwmMinAngle", tryParseInt(value) ?? 0),
            }}
          />
          <IconInputField
            icon={PwmMax}
            field={{
              value: state.pwmMaxAngle ?? 0,
              onValidate: (value) =>
                updateField("pwmMaxAngle", tryParseInt(value) ?? 0),
            }}
          />
        </div>
      </div>
      <div className="panel-section-col-default">
        <h5>Transform</h5>
        <SimpleInputField
          label="Position"
          fields={[
            {
              value: state.x,
              onValidate: (value) =>
                updateField("x", tryParseFloat(value) ?? 0),
              barColor: AXIS_COLOURS.x,
            },
            {
              value: state.y,
              onValidate: (value) =>
                updateField("y", tryParseFloat(value) ?? 0),
              barColor: AXIS_COLOURS.y,
            },
            {
              value: state.z,
              onValidate: (value) =>
                updateField("z", tryParseFloat(value) ?? 0),
              barColor: AXIS_COLOURS.z,
            },
          ]}
        />
        <SimpleInputField
          label="Rotation"
          fields={[
            {
              value: state.rotX,
              onValidate: (value) =>
                updateField("rotX", tryParseFloat(value) ?? 0),
              barColor: AXIS_COLOURS.x,
            },
            {
              value: state.rotY,
              onValidate: (value) =>
                updateField("rotY", tryParseFloat(value) ?? 0),
              barColor: AXIS_COLOURS.y,
            },
            {
              value: state.rotZ,
              onValidate: (value) =>
                updateField("rotZ", tryParseFloat(value) ?? 0),
              barColor: AXIS_COLOURS.z,
            },
          ]}
        />
      </div>
      <div className="panel-section-col-default">
        <h5>Action</h5>
        <div className="flex flex-row items-center gap-2">
          <div className="flex-1">
            <IconInputField
              icon={TriangleRight}
              field={{
                value: angle,
                onValidate: (value) => {
                  handleAngleChange(tryParseInt(value) ?? 0);
                },
              }}
            />
          </div>
          <IconButton
            icon={Wrench}
            onClick={() =>
              calibrateComponent(
                state.pin ?? 0,
                ComponentTypes.SERVO,
                moduleAddress,
              )
            }
            variant="blue"
          />
        </div>
        {segmentStartKeyframe && segmentEndKeyframe && (
          <div className="mt-2 w-full">
            <div className="mb-2 flex items-center gap-2">
              <select
                className="input-default flex-1"
                value={selectedPresetKey ?? "custom"}
                onChange={(e) => handleEasingPresetChange(e.target.value)}
              >
                {EASING_PRESET_ITEMS.map((preset) => (
                  <option key={preset.key} value={preset.key}>
                    {preset.label}
                  </option>
                ))}
                <option value="custom" disabled>
                  Custom Bezier Curve
                </option>
              </select>
            </div>
            <div
              ref={curveContainerRef}
              className="relative w-full aspect-square bg-white border border-gray-light-medium rounded-sm overflow-hidden"
            >
              <EasingCurve
                startX={0}
                endX={curveEditorDimensions.width}
                height={curveEditorDimensions.height}
                startTime={startTime}
                endTime={endTime}
                currentTime={currentTime}
                controlPoints={displayControlPoints}
                onControlPointsChange={handleEasingGraphChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
