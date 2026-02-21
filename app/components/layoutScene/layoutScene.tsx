"use client";

import { updateComponent } from "@/app/actions/components";
import { VERT_DRAGGABLE_SECTIONS } from "@/app/components/dragHandlers";
import { Component, Direction } from "@/shared-types";
import { useState } from "react";
import { Object3D } from "three";
import DragResizer from "../dragHandlers/dragResizer";
import { Panel } from "./editComponentPanel/panel";
import List from "./hierarchy/list";
import Scene from "./sceneObjects/scene";

export interface LayoutSceneProps {
  components: Component[];
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
    });
  };

  return (
    <>
      <div onClick={() => setCanvasActive(false)}>
        <DragResizer
          minDim={VERT_DRAGGABLE_SECTIONS}
          dragDirection={Direction.RIGHT}
        >
          <List
            title="Some animation"
            components={props.components}
          ></List>
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

      {selectedObject && (
        <div onClick={() => setCanvasActive(false)}>
          <DragResizer
            minDim={VERT_DRAGGABLE_SECTIONS}
            dragDirection={Direction.LEFT}
          >
            <Panel component={selectedObject.userData.data}></Panel>
          </DragResizer>
        </div>
      )}
    </>
  );
}
