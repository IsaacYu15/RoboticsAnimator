"use client";

import { ReactNode, useState } from "react";
import { Direction } from "@/shared-types";

export interface DragResizerProps {
  minDim: number;
  direction: Direction;
  children: ReactNode;
}

export default function DragResizer(props: DragResizerProps) {
  const [dim, setDim] = useState<number>(props.minDim);

  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault();

    const onMouseMove = (e: MouseEvent) => {
      let newDim = dim;

      switch (props.direction) {
        case Direction.LEFT:
          newDim = Math.max(e.clientX, props.minDim);
          break;
        case Direction.RIGHT:
          newDim = Math.max(window.innerWidth - e.clientX, props.minDim);
          break;
        case Direction.UP:
          newDim = Math.max(window.innerHeight - e.clientY, props.minDim);
          break;
        case Direction.DOWN:
          newDim = Math.max(e.clientY, props.minDim);
          break;
      }

      console.log(newDim);

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
    props.direction === Direction.LEFT || props.direction === Direction.RIGHT;

  const isVertical =
    props.direction === Direction.UP || props.direction === Direction.DOWN;

  return (
    <div
      className={`fixed z-50
        ${props.direction === Direction.LEFT ? "left-0 top-0 h-full" : ""}
        ${props.direction === Direction.RIGHT ? "right-0 top-0 h-full" : ""}
        ${props.direction === Direction.UP ? "bottom-0 left-0 w-full" : ""}
        ${props.direction === Direction.DOWN ? "top-0 left-0 w-full" : ""}
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
          ${props.direction === Direction.LEFT ? "right-1" : ""}
          ${props.direction === Direction.RIGHT ? "left-1" : ""}
          ${props.direction === Direction.UP ? "top-1" : ""}
          ${props.direction === Direction.DOWN ? "bottom-1" : ""}
        `}
      />

      {props.children}
    </div>
  );
}
