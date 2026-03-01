"use client";

import { updateComponent } from "@/app/actions/components";
import { HORIZ_DRAGGABLE_SECTIONS } from "@/app/components/dragHandlers/constants";
import { ComponentType } from "@/app/constants/components";
import { Component, Direction } from "@/shared-types";
import { useEffect, useRef, useState } from "react";
import { Mesh, Object3D } from "three";
import DragResizer from "../dragHandlers/dragResizer";
import {
  createPanelState,
  PanelState,
  ServoPanelState,
} from "./editComponentPanel/panelState";
import { ServoPanel } from "./editComponentPanel/servoPanel";
import PropertiesPanel from "./properties/propertiesPanel";
import Scene from "./sceneObjects/scene";
import { degreesToRadians, radiansToDegrees } from "@/app/services/math";

export interface LayoutSceneProps {
  title: string;
  components: Component[];
  refresh: () => void;
}

export default function LayoutScene(props: LayoutSceneProps) {
  const [canvasActive, setCanvasActive] = useState(false);

  const selectedComponentIdRef = useRef<number | null>(null);
  const [selectedObject, setSelectedObject] = useState<Object3D | null>(null);
  const [panelState, setPanelState] = useState<PanelState | null>(null);

  //for any changes to the panel state we want to see an immediate update
  useEffect(() => {
    if (selectedObject && panelState) {
      selectedObject.position.set(panelState.x, panelState.y, panelState.z);
      selectedObject.rotation.set(
        degreesToRadians(panelState.rotX),
        degreesToRadians(panelState.rotY),
        degreesToRadians(panelState.rotZ),
      );
      selectedObject.traverse((child) => {
        if (child instanceof Mesh) {
          child.material.color.set(panelState.colour);
        }
      });
    }
  }, [selectedObject, panelState]);

  const handleSelectObject = async (obj: Object3D | null) => {
    setSelectedObject(obj);

    if (obj?.userData?.data) {
      const component = obj.userData.data as Component;
      selectedComponentIdRef.current = component.id;
      setPanelState(createPanelState(component));
    } else {
      //only on exiting the panel, we will save the changes to the component
      if (selectedComponentIdRef.current) {
        await updateComponent(selectedComponentIdRef.current, {
          name: panelState?.name,
          x: selectedObject?.position.x ?? 0,
          y: selectedObject?.position.y ?? 0,
          z: selectedObject?.position.z ?? 0,
          rot_x: radiansToDegrees(selectedObject?.rotation.x ?? 0),
          rot_y: radiansToDegrees(selectedObject?.rotation.y ?? 0),
          rot_z: radiansToDegrees(selectedObject?.rotation.z ?? 0),
          colour: panelState?.colour,
          pin: panelState?.pin,
          config: panelState?.generateConfig(),
        });
        await props.refresh();
      }

      selectedComponentIdRef.current = null;
      setPanelState(null);
    }
  };

  //strictly used for saving the object when transforming with gizmos
  const saveObjectTransform = async () => {
    if (!selectedObject || !panelState) return;

    const data = selectedObject.userData.data;

    await updateComponent(data.id, {
      x: selectedObject.position.x,
      y: selectedObject.position.y,
      z: selectedObject.position.z,
      rot_x: radiansToDegrees(selectedObject.rotation.x),
      rot_y: radiansToDegrees(selectedObject.rotation.y),
      rot_z: radiansToDegrees(selectedObject.rotation.z),
    });

    setPanelState((prev) =>
      prev
        ? prev.clone().updateTransform({
            x: selectedObject.position.x,
            y: selectedObject.position.y,
            z: selectedObject.position.z,
            rotX: radiansToDegrees(selectedObject.rotation.x),
            rotY: radiansToDegrees(selectedObject.rotation.y),
            rotZ: radiansToDegrees(selectedObject.rotation.z),
          })
        : null,
    );
  };

  //renders different panels for the component
  const getComponentPanel = (component: Component) => {
    if (!panelState) return null;

    switch (component.type) {
      case ComponentType.SERVO:
        return (
          <ServoPanel
            component={component}
            state={panelState as ServoPanelState}
            setState={setPanelState}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div onClick={() => setCanvasActive(false)}>
        <DragResizer
          minDim={HORIZ_DRAGGABLE_SECTIONS}
          dragDirection={Direction.RIGHT}
        >
          <PropertiesPanel
            title={props.title}
            components={props.components}
            selectedComponent={selectedComponentIdRef}
          ></PropertiesPanel>
        </DragResizer>
      </div>

      <Scene
        selectedObject={selectedObject}
        setSelectedObject={handleSelectObject}
        canvasActive={canvasActive}
        setCanvasActive={setCanvasActive}
        saveObjectChanges={saveObjectTransform}
        components={props.components}
      ></Scene>

      {selectedObject && selectedObject.userData?.data && (
        <div onClick={() => setCanvasActive(false)}>
          <DragResizer
            minDim={HORIZ_DRAGGABLE_SECTIONS}
            dragDirection={Direction.LEFT}
          >
            {getComponentPanel(selectedObject.userData.data)}
          </DragResizer>
        </div>
      )}
    </>
  );
}
