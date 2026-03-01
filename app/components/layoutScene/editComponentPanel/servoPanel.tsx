"use client";

import { tryParseInt } from "@/app/services/parse";

import ColourPalette from "../../colourPalette/colourPalette";
import SimpleInputField from "../../input/simpleInputField";
import { PanelState, ServoPanelState } from "./panelState";

interface ServoPanelProps {
  state: ServoPanelState;
  setState: (state: PanelState | null) => void;
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

  return (
    <div className="bg-gray-light h-screen py-6">
      <div className=" w-full px-6 pb-4 flex flex-row items-center justify-between border-b border-gray-light-medium ">
        <input
          className="title-input-default text-lg"
          value={state.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
        <div className="px-2 py-1 bg-gray-medium-dark text-white text-base rounded-lg">
          {state.type}
        </div>
      </div>

      <div className="panel-section-col-default">
        <h5>Colour</h5>
        <ColourPalette
          selectedColour={state.colour}
          setSelectedColour={(colour) => updateField("colour", colour)}
        />
      </div>

      <div className="panel-section-col-default">
        <h5>Settings</h5>
        <SimpleInputField
          label="Pin"
          fields={[
            {
              value: state.pin ?? 0,
              onChange: (value) => updateField("pin", tryParseInt(value) ?? 0),
            },
          ]}
        />
        <SimpleInputField
          label="PWM Min"
          fields={[
            {
              value: state.pwmMinAngle ?? 0,
              onChange: (value) =>
                updateField("pwmMinAngle", tryParseInt(value) ?? 0),
            },
          ]}
        />
        <SimpleInputField
          label="PWM Max"
          fields={[
            {
              value: state.pwmMaxAngle ?? 0,
              onChange: (value) =>
                updateField("pwmMaxAngle", tryParseInt(value) ?? 0),
            },
          ]}
        />
      </div>

      <div className="panel-section-col-default">
        <h5>Transform</h5>
        <SimpleInputField
          label="Position"
          fields={[
            {
              value: state.x,
              onChange: (value) => updateField("x", tryParseInt(value) ?? 0),
            },
            {
              value: state.y,
              onChange: (value) => updateField("y", tryParseInt(value) ?? 0),
            },
            {
              value: state.z,
              onChange: (value) => updateField("z", tryParseInt(value) ?? 0),
            },
          ]}
        />
        <SimpleInputField
          label="Rotation"
          fields={[
            {
              value: state.rotX,
              onChange: (value) => updateField("rotX", tryParseInt(value) ?? 0),
            },
            {
              value: state.rotY,
              onChange: (value) => updateField("rotY", tryParseInt(value) ?? 0),
            },
            {
              value: state.rotZ,
              onChange: (value) => updateField("rotZ", tryParseInt(value) ?? 0),
            },
          ]}
        />
      </div>
    </div>
  );
}
