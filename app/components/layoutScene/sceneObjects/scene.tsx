"use client";

import Movement from "@/app/components/threeNavigation/movement";
import { Component, ObjectType } from "@/shared-types";
import { TransformControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Group, Object3D } from "three";
import Object from "./object";
import { RefObject, useState } from "react";

type TransformMode = "translate" | "rotate";

export interface SceneProps {
  components: Component[];

  canvasActive: boolean;
  setCanvasActive: (active: boolean) => void;

  selectedComponentId: number | null;
  setSelectedComponentId: (componentId: number | null) => void;

  objectRefs: RefObject<Record<number, Object3D>>;
  registerObjectRef: (componentId: number, object: Group) => void;
  saveObjectChanges: () => void;
}

export default function Scene(props: SceneProps) {
  const [transformMode, setTransformMode] =
    useState<TransformMode>("translate");

  return (
    <>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
        <button
          className="bg-blue-500 text-white p-2 rounded-md"
          onClick={() => setTransformMode("translate")}
        >
          Translate
        </button>
        <button
          className="bg-blue-500 text-white p-2 rounded-md"
          onClick={() => setTransformMode("rotate")}
        >
          Rotate
        </button>
      </div>
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
            mode={transformMode}
            object={props.objectRefs.current[props.selectedComponentId]}
            onMouseUp={props.saveObjectChanges}
          ></TransformControls>
        )}

        {props.components.map((component: Component) => (
          <Object
            key={component.id}
            component={component}
            objectType={ObjectType.SG90_SERVO}
            onSelect={() => props.setSelectedComponentId(component.id)}
            registerObjectRef={(obj: Group) =>
              props.registerObjectRef(component.id, obj)
            }
          ></Object>
        ))}

        {props.canvasActive && <Movement></Movement>}

        <ambientLight args={[0xffffff]} intensity={0.2} />
        <directionalLight position={[1, 1, 1]} intensity={0.8} />
      </Canvas>
    </>
  );
}
