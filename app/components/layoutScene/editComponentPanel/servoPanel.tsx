"use client";

import { updateComponent } from "@/app/actions/components";
import { generateServoConfig, tryParseInt } from "@/app/services/parse";
import { Component as ComponentData } from "@/shared-types";
import { useCallback, useEffect, useRef, useState } from "react";

import { ServoConfig } from "@/app/constants/components";
import { Settings } from "lucide-react";
import ColourPalette from "../../colourPalette/colourPalette";
import SimpleInputField from "../../input/simpleInputField";

interface ServoPanelProps {
  component: ComponentData;
  refresh: () => void;
}

export function ServoPanel({ component, refresh }: ServoPanelProps) {
  const config: ServoConfig | null = component.config
    ? JSON.parse(component.config)
    : null;

  const [selectedColour, setSelectedColour] = useState(component.colour);
  const [pin, setPin] = useState(component.pin);
  const [pwmMinAngle, setPwmMinAngle] = useState(config?.pwmMinAngle ?? null);
  const [pwmMaxAngle, setPwmMaxAngle] = useState(config?.pwmMaxAngle ?? null);

  const [x, setX] = useState(component.x);
  const [y, setY] = useState(component.y);
  const [z, setZ] = useState(component.z);
  const [rotX, setRotX] = useState(component.rot_x);
  const [rotY, setRotY] = useState(component.rot_y);
  const [rotZ, setRotZ] = useState(component.rot_z);

  const configRef = useRef({
    selectedColour,
    pin,
    pwmMinAngle,
    pwmMaxAngle,
    x,
    y,
    z,
    rotX,
    rotY,
    rotZ,
  });

  useEffect(() => {
    configRef.current = {
      selectedColour,
      pin,
      pwmMinAngle,
      pwmMaxAngle,
      x,
      y,
      z,
      rotX,
      rotY,
      rotZ,
    };
  }, [
    selectedColour,
    pin,
    pwmMinAngle,
    pwmMaxAngle,
    x,
    y,
    z,
    rotX,
    rotY,
    rotZ,
  ]);

  const saveChanges = useCallback(async () => {
    console.log("saving changes");
    await updateComponent(component.id, {
      colour: configRef.current.selectedColour,
      pin: configRef.current.pin,
      config: generateServoConfig(
        configRef.current.pwmMinAngle,
        configRef.current.pwmMaxAngle,
      ),
      x: configRef.current.x,
      y: configRef.current.y,
      z: configRef.current.z,
      rot_x: configRef.current.rotX,
      rot_y: configRef.current.rotY,
      rot_z: configRef.current.rotZ,
    });
    await refresh();
  }, [component.id, refresh]);

  useEffect(() => {
    return () => {
      saveChanges();
    };
  }, [saveChanges]);

  const updateColour = (colour: string) => {
    setSelectedColour(colour);
  };

  return (
    <div className="bg-gray-light h-screen py-6">
      <div className="w-full px-6 pb-4 flex flex-row items-center justify-between border-b border-gray-light-medium">
        <div className="flex flex-row items-center gap-2">
          <Settings className="icon-default" />
          <h4>{component.name}</h4>
        </div>

        <div className="px-2 py-1 bg-gray-medium-dark text-white text-base rounded-lg">
          {component.type}
        </div>
      </div>

      <div className="w-full px-6 py-4 flex flex-col gap-2 border-b border-gray-light-medium">
        <h5>Colour</h5>
        <ColourPalette
          selectedColour={selectedColour}
          setSelectedColour={updateColour}
        />
      </div>

      <div className="w-full px-6 py-4 flex flex-col gap-2 border-b border-gray-light-medium">
        <h5>Settings</h5>
        <SimpleInputField
          label="Pin"
          fields={[
            {
              value: pin ?? 0,
              onChange: (value) => setPin(tryParseInt(value) ?? 0),
            },
          ]}
        />
        <SimpleInputField
          label="PWM Min"
          fields={[
            {
              value: pwmMinAngle ?? 0,
              onChange: (value) => setPwmMinAngle(tryParseInt(value) ?? 0),
            },
          ]}
        />
        <SimpleInputField
          label="PWM Max"
          fields={[
            {
              value: pwmMaxAngle ?? 0,
              onChange: (value) => setPwmMaxAngle(tryParseInt(value) ?? 0),
            },
          ]}
        />
      </div>

      <div className="w-full px-6 py-4 flex flex-col gap-2 border-b border-gray-light-medium">
        <h5>Transform</h5>
        <SimpleInputField
          label="Position"
          fields={[
            { value: x, onChange: (value) => setX(tryParseInt(value) ?? 0) },
            { value: y, onChange: (value) => setY(tryParseInt(value) ?? 0) },
            { value: z, onChange: (value) => setZ(tryParseInt(value) ?? 0) },
          ]}
        />
        <SimpleInputField
          label="Rotation"
          fields={[
            {
              value: rotX,
              onChange: (value) => setRotX(tryParseInt(value) ?? 0),
            },
            {
              value: rotY,
              onChange: (value) => setRotY(tryParseInt(value) ?? 0),
            },
            {
              value: rotZ,
              onChange: (value) => setRotZ(tryParseInt(value) ?? 0),
            },
          ]}
        />
      </div>
    </div>
  );
}
