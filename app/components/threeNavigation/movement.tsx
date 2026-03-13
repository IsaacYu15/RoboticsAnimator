import {
  KEY_A,
  KEY_D,
  KEY_S,
  KEY_SPACE,
  KEY_W,
  MIDDLE_MOUSE_BUTTON,
  RIGHT_MOUSE_BUTTON,
} from "@/app/constants/inputs";
import { useInputContext } from "@/app/context/inputContext";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";
import {
  CAMERA_LOOK_SPEED,
  CAMERA_MOVE_SPEED,
  CAMERA_ZOOM_SPEED,
} from "./constants";
import { MovementMode } from "@/shared-types";

interface MovementProps {
  mode: MovementMode;
  setMovementMode: (mode: MovementMode) => void;
}
export default function Movement({ mode, setMovementMode }: MovementProps) {
  const { camera } = useThree();
  const { inputs, mousePos, scrollRef } = useInputContext();
  const mouseLastPos = useRef({ x: 0, y: 0 });
  const scrollLastPos = useRef(0);

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

    let currentMode = mode;
    if (inputs.current.has(RIGHT_MOUSE_BUTTON.toString()) && mode == "pan") {
      currentMode = "firstPerson";
      setMovementMode("firstPerson");
    } else if (
      inputs.current.has(MIDDLE_MOUSE_BUTTON.toString()) &&
      mode == "firstPerson"
    ) {
      currentMode = "pan";
      setMovementMode("pan");
    }

    if (currentMode == "firstPerson") {
      if (inputs.current.has(KEY_W)) moveVector.add(moveForward());
      if (inputs.current.has(KEY_A))
        moveVector.addScaledVector(moveRight(), -1);
      if (inputs.current.has(KEY_S))
        moveVector.addScaledVector(moveForward(), -1);
      if (inputs.current.has(KEY_D)) moveVector.add(moveRight());
      if (inputs.current.has(KEY_SPACE)) moveVector.add(new Vector3(0, 1, 0));

      if (inputs.current.has(RIGHT_MOUSE_BUTTON.toString())) {
        const yDir = mousePos.current.y - mouseLastPos.current.y;
        const xDir = mousePos.current.x - mouseLastPos.current.x;

        camera.rotateOnWorldAxis(
          new Vector3(0, 1, 0),
          -delta * CAMERA_LOOK_SPEED * xDir,
        );
        camera.rotateX(-yDir * CAMERA_LOOK_SPEED * delta);
      }
    } else if (inputs.current.has(MIDDLE_MOUSE_BUTTON.toString())) {
      const yDir = mousePos.current.y - mouseLastPos.current.y;
      const xDir = mousePos.current.x - mouseLastPos.current.x;

      const localUp = new Vector3(0, -1, 0).applyQuaternion(camera.quaternion);
      moveVector.add(localUp.multiplyScalar(yDir));
      const localRight = new Vector3(1, 0, 0).applyQuaternion(
        camera.quaternion,
      );
      moveVector.add(localRight.multiplyScalar(xDir));
    }

    camera.position.addScaledVector(
      moveVector.normalize(),
      delta * CAMERA_MOVE_SPEED,
    );

    //scroll should not be normalized, we should be able to scroll faster than the move speed
    const scrollDelta = scrollRef.current - scrollLastPos.current;
    if (scrollDelta !== 0) {
      camera.position.addScaledVector(
        moveForward(),
        -Math.sign(scrollDelta) * CAMERA_ZOOM_SPEED * delta,
      );
    }

    //update mouse pos
    mouseLastPos.current = { ...mousePos.current };
    scrollLastPos.current = scrollRef.current;
  });
  return null;
}
