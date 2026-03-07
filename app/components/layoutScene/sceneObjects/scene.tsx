"use client";

import Movement from "@/app/components/threeNavigation/movement";
import { Component, MovementMode, TransformMode } from "@/shared-types";
import { TransformControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { RefObject } from "react";
import { Group, Object3D } from "three";
import { getObjectType } from "../utils";
import Object from "./object";

export interface SceneProps {
  components: Component[];

  canvasActive: boolean;
  setCanvasActive: (active: boolean) => void;
  transformMode: TransformMode;
  movementMode: MovementMode;
  setMovementMode: (mode: MovementMode) => void;

  selectedComponentId: number | null;
  setSelectedComponentId: (componentId: number | null) => void;

  objectRefs: RefObject<Record<number, Object3D>>;
  registerObjectRef: (componentId: number, object: Group) => void;
  saveObjectChanges: () => void;
}

export default function Scene(props: SceneProps) {
  return (
    <Canvas
      camera={{
        near: 0.1,
        far: 1000,
        zoom: 1,
        position: [0, 0, 5],
      }}
      onPointerMissed={() => props.setSelectedComponentId(null)}
      onClick={() => props.setCanvasActive(true)}
    >
      <gridHelper />

      {props.selectedComponentId && (
        <TransformControls
          mode={props.transformMode}
          object={props.objectRefs.current[props.selectedComponentId]}
          onMouseUp={props.saveObjectChanges}
        ></TransformControls>
      )}

      {props.components.map((component: Component) => {
        const objectType = getObjectType(component.type);
        if (objectType === null) return null;

        return (
          <Object
            key={component.id}
            component={component}
            objectType={objectType}
            onSelect={() => props.setSelectedComponentId(component.id)}
            registerObjectRef={(obj: Group) =>
              props.registerObjectRef(component.id, obj)
            }
          />
        );
      })}

      {props.canvasActive && (
        <Movement
          mode={props.movementMode}
          setMovementMode={props.setMovementMode}
        ></Movement>
      )}

      <ambientLight args={[0xffffff]} intensity={0.2} />
      <directionalLight position={[1, 1, 1]} intensity={0.8} />
    </Canvas>
  );
}
