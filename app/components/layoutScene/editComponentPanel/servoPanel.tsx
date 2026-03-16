"use client";

import { tryParseFloat, tryParseInt } from "@/app/services/parse";
import { AXIS_COLOURS } from "@/app/constants";

import ColourPalette from "../../colourPalette/colourPalette";
import IconInputField from "../../input/iconInputField";
import SimpleInputField from "../../input/simpleInputField";
import { PanelState, ServoPanelState } from "./panelState";
import { Cable, FileUp } from "lucide-react";
import IconButton from "../../input/iconButton";
import { createAsset } from "@/app/actions/assets";
import { useToast } from "@/app/context/toastContext";
import { ToastMessages } from "../../toast/toastMessages";
import { PwmMax, PwmMin } from "@/public/icons/animation-page";

interface ServoPanelProps {
  state: ServoPanelState;
  setState: (state?: PanelState) => void;
}

export function ServoPanel({ state, setState }: ServoPanelProps) {
  const updateField = <K extends keyof ServoPanelState>(
    field: K,
    value: ServoPanelState[K],
  ) => {
    const newState = state.clone();
    (newState[field] as ServoPanelState[K]) = value;
    setState(newState);
  };

  const toast = useToast();

  const saveAsAsset = async () => {
    const asset = {
      name: state.name,
      type: "servo",
      config: state.generateConfig(),
    };
    const result = await createAsset(asset);

    if (result.success) {
      toast.toast(ToastMessages.ASSET_SAVED);
    } else {
      toast.toast(ToastMessages.ERROR(result.error));
    }
  };

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
    </div>
  );
}
