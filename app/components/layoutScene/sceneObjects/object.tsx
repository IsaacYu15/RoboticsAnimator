import { Component } from "@/shared-types";
import { Object3D } from "three";

export interface ObjectProps {
  component: Component;
  onSelect: (object: Object3D) => void;
}

export default function Object(props: ObjectProps) {
  return (
    <mesh
      userData={{ data: props.component }}
      position={[
        Number(props.component.x),
        Number(props.component.y),
        Number(props.component.z),
      ]}
      onClick={(e) => {
        e.stopPropagation();
        props.onSelect(e.object);
      }}
    >
      <boxGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
