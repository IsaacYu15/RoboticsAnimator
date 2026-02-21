import {
  Component,
  ObjectType,
  OBJECT_TYPE_TO_MODEL_PATH,
} from "@/shared-types";
import { useGLTF } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Box3, Group, Vector3 } from "three";

export interface ObjectProps {
  component: Component;
  objectType: ObjectType;
  onSelect: (object: Group) => void;
}

const MODEL_SCALE = 0.02;

export default function Object(props: ObjectProps) {
  const groupRef = useRef<Group>(null);
  const modelPath = OBJECT_TYPE_TO_MODEL_PATH[props.objectType];
  const { scene } = useGLTF(modelPath);

  const clonedScene = useMemo(() => scene.clone(), [scene]);

  const centerOffset = useMemo(() => {
    const box = new Box3().setFromObject(clonedScene);
    const center = new Vector3();
    box.getCenter(center);
    return center.multiplyScalar(-MODEL_SCALE);
  }, [clonedScene]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (groupRef.current) {
      props.onSelect(groupRef.current);
    }
  };

  return (
    <group
      ref={groupRef}
      userData={{ data: props.component }}
      position={[
        Number(props.component.x),
        Number(props.component.y),
        Number(props.component.z),
      ]}
      rotation={[
        Number(props.component.rot_x),
        Number(props.component.rot_y),
        Number(props.component.rot_z),
      ]}
    >
      <mesh onClick={handleClick}>
        <boxGeometry args={[0.5, 0.5, 0.8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <primitive
        object={clonedScene}
        scale={MODEL_SCALE}
        position={[centerOffset.x, centerOffset.y, centerOffset.z]}
      />
    </group>
  );
}
