"use client";

import { getComponentById, updateComponent } from "@/app/actions/components";
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
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(
    null,
  );

  const [panelState, setPanelState] = useState<PanelState | null>(null);

  const objectRefs = useRef<Record<number, Object3D>>({});

  const updatePanelState = async (id: number | null) => {
    if (id === null) {
      setPanelState(null);
      return;
    }

    const component = await getComponentById(id);
    if (!component) {
      console.error("Selected object contains and invalid component id");
      return;
    }

    setPanelState(createPanelState(component));
  };

  useEffect(() => {
    // eslint-disable-next-line
    updatePanelState(selectedComponentId);
  }, [selectedComponentId]);

  //for any changes to the panel state we want to see an immediate update
  useEffect(() => {
    if (selectedComponentId === null) return;

    const selectedObject = objectRefs.current[selectedComponentId];

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
  }, [selectedComponentId, panelState]);

  const registerObjectRef = (componentId: number, object: Object3D) => {
    objectRefs.current[componentId] = object;
  };

  const handleSetSelectedComponentId = async (componentId: number | null) => {
    if (componentId !== null) {
      setSelectedComponentId(componentId);
    } else {
      //only on exiting the panel, we will save the changes to the component
      if (selectedComponentId) {
        const selectedObject = objectRefs.current[selectedComponentId];

        await updateComponent(selectedComponentId, {
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

      setSelectedComponentId(null);
      setPanelState(null);
    }
  };

  //strictly used for saving the object when transforming with gizmos
  const saveObjectTransform = async () => {
    if (selectedComponentId === null) return;

    const selectedObject = objectRefs.current[selectedComponentId];

    await updateComponent(selectedComponentId, {
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
  const getComponentPanel = () => {
    if (!panelState) return null;

    switch (panelState.type) {
      case ComponentType.SERVO:
        return (
          <ServoPanel
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
            setSelectedComponentId={setSelectedComponentId}
            selectedComponentId={selectedComponentId}
          ></PropertiesPanel>
        </DragResizer>
      </div>

      <Scene
        components={props.components}
        canvasActive={canvasActive}
        setCanvasActive={setCanvasActive}
        selectedComponentId={selectedComponentId}
        setSelectedComponentId={handleSetSelectedComponentId}
        objectRefs={objectRefs}
        registerObjectRef={registerObjectRef}
        saveObjectChanges={saveObjectTransform}
      ></Scene>

      {selectedComponentId && (
        <div onClick={() => setCanvasActive(false)}>
          <DragResizer
            minDim={HORIZ_DRAGGABLE_SECTIONS}
            dragDirection={Direction.LEFT}
          >
            {getComponentPanel()}
          </DragResizer>
        </div>
      )}
    </>
  );
}
