"use client";

import { updateComponent } from "@/app/actions/components";
import { HORIZ_DRAGGABLE_SECTIONS } from "@/app/components/dragHandlers/constants";
import { ComponentType } from "@/app/constants/components";
import { Component, Direction } from "@/shared-types";
import { useState } from "react";
import { Object3D } from "three";
import DragResizer from "../dragHandlers/dragResizer";
import { ServoPanel } from "./editComponentPanel/servoPanel";
import List from "./hierarchy/list";
import Scene from "./sceneObjects/scene";

export interface LayoutSceneProps {
  components: Component[];
  refresh: () => void;
}

export default function LayoutScene(props: LayoutSceneProps) {
  const [selectedObject, setSelectedObject] = useState<Object3D | null>(null);
  const [canvasActive, setCanvasActive] = useState(false);

  const saveObjectChanges = async () => {
    if (!selectedObject) return;

    const data = selectedObject.userData.data;

    await updateComponent(data.id, {
      x: selectedObject.position.x,
      y: selectedObject.position.y,
      z: selectedObject.position.z,
      rot_x: selectedObject.rotation.x,
      rot_y: selectedObject.rotation.y,
      rot_z: selectedObject.rotation.z,
    });
  };

  const getComponentPanel = (component: Component) => {
    switch (component.type) {
      case ComponentType.SERVO:
        return <ServoPanel component={component} refresh={props.refresh} />;
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
          <List title="Some animation" components={props.components}></List>
        </DragResizer>
      </div>

      <Scene
        selectedObject={selectedObject}
        setSelectedObject={setSelectedObject}
        canvasActive={canvasActive}
        setCanvasActive={setCanvasActive}
        saveObjectChanges={saveObjectChanges}
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
