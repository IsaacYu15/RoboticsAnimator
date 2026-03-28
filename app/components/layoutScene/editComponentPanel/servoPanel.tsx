"use client";

import { tryParseFloat, tryParseInt } from "@/app/services/parse";
import { AXIS_COLOURS } from "@/app/constants";

import ColourPalette from "../../colourPalette/colourPalette";
import IconInputField from "../../input/iconInputField";
import SimpleInputField from "../../input/simpleInputField";
import { PanelState, ServoPanelState } from "./panelState";
import { Cable, FileUp, TriangleRight, Wrench } from "lucide-react";
import IconButton from "../../input/iconButton";
import { createAsset } from "@/app/actions/assets";
import { useToast } from "@/app/context/toastContext";
import { PwmMax, PwmMin } from "@/public/icons/animation-page";
import { useSelection } from "@/app/context/selectionContext";
import {
  addAnimationEvent,
  updateAnimationEvent,
} from "@/app/actions/animation-event";
import { useEffect, useState, useMemo } from "react";
import { AnimationEvent, ComponentTypes } from "@/shared-types";
import { linearInterpolation } from "@/app/services/math";
import { calibrateComponent } from "@/app/services/servoController";

interface ServoPanelProps {
  moduleAddress?: string;
  state: ServoPanelState;
  setState: (state?: PanelState) => void;
  currentTime: number;
  componentEvents: AnimationEvent[];
  animationId: number;
  onRefresh: () => void;
}

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

  const interpolatedAngle = useMemo(() => {
    if (componentEvents.length === 0) return 0;

    let currentKeyframe = componentEvents[0];
    let nextKeyframe = componentEvents[0];

    for (let i = 0; i < componentEvents.length; i++) {
      const eventTime = Number(componentEvents[i].trigger_time);
      if (eventTime <= currentTime) {
        currentKeyframe = componentEvents[i];
        nextKeyframe = componentEvents[i + 1] ?? componentEvents[i];
      }
    }

    const currentAngle = tryParseInt(currentKeyframe.action) ?? 0;
    const nextAngle = tryParseInt(nextKeyframe.action) ?? 0;
    const currentKeyTime = Number(currentKeyframe.trigger_time);
    const nextKeyTime = Number(nextKeyframe.trigger_time);

    if (currentKeyframe === nextKeyframe || currentKeyTime === nextKeyTime) {
      return currentAngle;
    }

    const t = (currentTime - currentKeyTime) / (nextKeyTime - currentKeyTime);
    return Math.round(linearInterpolation(currentAngle, nextAngle, t));
  }, [currentTime, componentEvents]);

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
      (e) => Number(e.trigger_time) === currentTime,
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

  useEffect(() => {
    setAngle(interpolatedAngle);
  }, [interpolatedAngle]);

  return (
    <div className="bg-gray-light h-screen py-6">
      <div className="w-full px-6 pb-4 flex flex-row items-start justify-between border-b border-gray-light-medium ">
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
      </div>
    </div>
  );
}
