import { degreesToRadians } from "@/app/utils/math";
import { Component, OBJECT_TYPE_CONFIG, ObjectType } from "@/shared-types";
import { useGLTF } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Box3, Group, Mesh, Vector3 } from "three";

interface ObjectProps {
  component: Component;
  objectType: ObjectType;
  onSelect: () => void;
  registerObjectRef: (object: Group) => void;
}

const MODEL_SCALE = 0.02;

export default function Object(props: ObjectProps) {
  const groupRef = useRef<Group>(null);
  const modelPath = OBJECT_TYPE_CONFIG[props.objectType].model;
  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    if (groupRef.current) {
      props.registerObjectRef(groupRef.current);
    }
  }, [props]);

  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = child.material.clone();
        child.material.color.set(props.component.colour);
      }
    });
    return cloned;
  }, [scene, props.component.colour]);

  const centerOffset = useMemo(() => {
    const box = new Box3().setFromObject(clonedScene);
    const center = new Vector3();
    box.getCenter(center);
    return center.multiplyScalar(-MODEL_SCALE);
  }, [clonedScene]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    props.onSelect();
  };

  return (
    <group
      ref={groupRef}
      userData={{ id: props.component.id }}
      position={[
        Number(props.component.x),
        Number(props.component.y),
        Number(props.component.z),
      ]}
      rotation={[
        Number(degreesToRadians(props.component.rot_x)),
        Number(degreesToRadians(props.component.rot_y)),
        Number(degreesToRadians(props.component.rot_z)),
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
