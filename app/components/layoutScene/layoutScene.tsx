"use client";

import { updateComponent } from "@/app/actions/components";
import ComponentObject from "./componentObject";
import Movement from "@/app/components/threeNavigation/movement";
import { Component, Direction } from "@/shared-types";
import { TransformControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { Object3D } from "three";
import DragResizer from "../dragHandlers/dragResizer";
import { VERT_DRAGGABLE_SECTIONS } from "@/app/components/dragHandlers";
import { EditComponentPanel } from "./editComponentPanel";

export interface LayoutSceneProps {
  components: Component[];
}

export default function LayoutScene(props: LayoutSceneProps) {
  const [selectedObject, setSelectedObject] = useState<Object3D | null>(null);

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
      <Canvas
        camera={{
          near: 0.1,
          far: 1000,
          zoom: 1,
          position: [0, 0, 5],
        }}
        onPointerMissed={() => setSelectedObject(null)}
      >
        <gridHelper />

        {selectedObject && (
          <TransformControls
            object={selectedObject}
            onMouseUp={saveObjectChanges}
          ></TransformControls>
        )}

        {props.components.map((component: Component) => (
          <ComponentObject
            key={component.id}
            component={component}
            onSelect={(obj: Object3D) => setSelectedObject(obj)}
          ></ComponentObject>
        ))}
        <Movement></Movement>
        <ambientLight args={[0xffffff]} intensity={0.2} />
        <directionalLight position={[1, 1, 1]} intensity={0.8} />
      </Canvas>

      {selectedObject && (
        <DragResizer
          minDim={VERT_DRAGGABLE_SECTIONS}
          dragDirection={Direction.LEFT}
        >
          <EditComponentPanel
            component={selectedObject.userData.data}
          ></EditComponentPanel>
        </DragResizer>
      )}
    </>
  );
}
