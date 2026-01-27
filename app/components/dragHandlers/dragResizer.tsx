"use client";

import { ReactNode, useState } from "react";
import { Direction } from "@/shared-types";

export interface DragResizerProps {
  minDim: number;
  dragDirection: Direction;
  children: ReactNode;
  isNested?: boolean;
}

export default function DragResizer(props: DragResizerProps) {
  const [dim, setDim] = useState<number>(props.minDim);

  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault();

    const onMouseMove = (e: MouseEvent) => {
      let newDim = dim;

      switch (props.dragDirection) {
        case Direction.LEFT:
          newDim = Math.max(window.innerWidth - e.clientX, props.minDim);
          break;
        case Direction.RIGHT:
          newDim = Math.max(e.clientX, props.minDim);
          break;
        case Direction.UP:
          newDim = Math.max(window.innerHeight - e.clientY, props.minDim);
          break;
        case Direction.DOWN:
          newDim = Math.max(e.clientY, props.minDim);
          break;
      }

      setDim(newDim);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const isHorizontal =
    props.dragDirection === Direction.LEFT ||
    props.dragDirection === Direction.RIGHT;

  const isVertical =
    props.dragDirection === Direction.UP ||
    props.dragDirection === Direction.DOWN;

  return (
    <div
      className={`z-50
        ${props.isNested ? "relative" : "fixed"}
        ${props.dragDirection === Direction.LEFT ? "right-0 top-0 h-full" : ""}
        ${props.dragDirection === Direction.RIGHT ? "left-0 top-0 h-full" : ""}
        ${props.dragDirection === Direction.UP ? "bottom-0 left-0 w-full" : ""}
        ${props.dragDirection === Direction.DOWN ? "top-0 left-0 w-full" : ""}
      `}
      style={{
        width: isHorizontal ? dim : "100%",
        height: isVertical ? dim : "100%",
      }}
    >
      <div
        onMouseDown={handleResize}
        className={`absolute bg-slate-950/40 rounded-full
          ${
            isHorizontal
              ? "top-1/2 -translate-y-1/2 h-12 w-1.5 cursor-col-resize"
              : ""
          }
          ${
            isVertical
              ? "left-1/2 -translate-x-1/2 w-12 h-1.5 cursor-row-resize"
              : ""
          }
          ${props.dragDirection === Direction.LEFT ? "left-1" : ""}
          ${props.dragDirection === Direction.RIGHT ? "right-1" : ""}
          ${props.dragDirection === Direction.UP ? "top-1" : ""}
          ${props.dragDirection === Direction.DOWN ? "bottom-1" : ""}
        `}
      />

      {props.children}
    </div>
  );
}
