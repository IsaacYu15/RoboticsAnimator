import { useFrame, useThree } from "@react-three/fiber";
import { Raycaster, Vector3 } from "three";
import { CAMERA_MOVE_SPEED, CAMERA_LOOK_SPEED } from "./constants";
import { useRef } from "react";
import { useInputContext } from "@/app/context/inputContext";
import {
  KEY_A,
  KEY_D,
  KEY_S,
  KEY_SPACE,
  KEY_W,
  LEFT_MOUSE_BUTTON,
  RIGHT_MOUSE_BUTTON,
} from "@/app/constants/inputs";

export default function Movement() {
  const { scene, camera } = useThree();
  const mouseLastPos = useRef({ x: 0, y: 0 });
  const { inputs, mousePos } = useInputContext();

  const moveForward = () => {
    const forward = new Vector3();
    camera.getWorldDirection(forward);
    return forward;
  };

  const moveRight = () => {
    const right = new Vector3();
    camera.getWorldDirection(right);
    right.cross(camera.up);
    return right;
  };

  useFrame((_, delta) => {
    //movement
    const moveVector = new Vector3();

    if (inputs.current.has(KEY_W)) moveVector.add(moveForward());
    if (inputs.current.has(KEY_A)) moveVector.addScaledVector(moveRight(), -1);
    if (inputs.current.has(KEY_S))
      moveVector.addScaledVector(moveForward(), -1);
    if (inputs.current.has(KEY_D)) moveVector.add(moveRight());
    if (inputs.current.has(KEY_SPACE)) moveVector.add(new Vector3(0, 1, 0));

    camera.position.addScaledVector(
      moveVector.normalize(),
      delta * CAMERA_MOVE_SPEED,
    );

    //looking
    if (inputs.current.has(RIGHT_MOUSE_BUTTON.toString())) {
      const yDir = mousePos.current.y - mouseLastPos.current.y;
      const xDir = mousePos.current.x - mouseLastPos.current.x;

      camera.rotateOnWorldAxis(
        new Vector3(0, 1, 0),
        -delta * CAMERA_LOOK_SPEED * xDir,
      );
      camera.rotateX(-yDir * CAMERA_LOOK_SPEED * delta);
    }

    //update mouse pos
    mouseLastPos.current = { ...mousePos.current };
  });
  return null;
}
