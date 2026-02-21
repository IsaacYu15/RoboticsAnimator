import Movement from "@/app/components/threeNavigation/movement";
import { Component } from "@/shared-types";
import { TransformControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Object3D } from "three";
import Object from "./object";

export interface SceneProps {
  selectedObject: Object3D | null;
  setSelectedObject: (object: Object3D | null) => void;
  canvasActive: boolean;
  setCanvasActive: (active: boolean) => void;
  saveObjectChanges: () => void;
  components: Component[];
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
      onPointerMissed={() => props.setSelectedObject(null)}
      onClick={() => props.setCanvasActive(true)}
    >
      <gridHelper />

      {props.selectedObject && (
        <TransformControls
          object={props.selectedObject}
          onMouseUp={props.saveObjectChanges}
        ></TransformControls>
      )}

      {props.components.map((component: Component) => (
        <Object
          key={component.id}
          component={component}
          onSelect={(obj: Object3D) => props.setSelectedObject(obj)}
        ></Object>
      ))}

      {props.canvasActive && <Movement></Movement>}

      <ambientLight args={[0xffffff]} intensity={0.2} />
      <directionalLight position={[1, 1, 1]} intensity={0.8} />
    </Canvas>
  );
}
