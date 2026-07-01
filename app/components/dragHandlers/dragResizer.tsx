"use client";

import { ReactNode, useEffect, useState } from "react";
import { clamp } from "@/app/utils/math";
import { Direction } from "@/shared-types";

interface DragResizerProps {
  minDim: number;
  maxDim: number;
  dragDirection: Direction;
  children: ReactNode;
  isNested?: boolean;
}

export default function DragResizer(props: DragResizerProps) {
  const [dim, setDim] = useState<number>(props.minDim);
  const boundedDim = clamp(dim, props.minDim, props.maxDim);

  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault();

    const onMouseMove = (e: MouseEvent) => {
      let newDim = boundedDim;

      switch (props.dragDirection) {
        case Direction.LEFT:
          newDim = window.innerWidth - e.clientX;
          break;
        case Direction.RIGHT:
          newDim = e.clientX;
          break;
        case Direction.UP:
          newDim = window.innerHeight - e.clientY;
          break;
        case Direction.DOWN:
          newDim = e.clientY;
          break;
      }
      newDim = clamp(newDim, props.minDim, props.maxDim);

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

  const horizontalPanelHeight =
    !props.isNested && isHorizontal
      ? "calc(100% - var(--bottom-panel-height, 0px))"
      : "100%";

  useEffect(() => {
    if (props.dragDirection !== Direction.UP || props.isNested) return;

    document.documentElement.style.setProperty(
      "--bottom-panel-height",
      `${boundedDim}px`,
    );

    return () => {
      document.documentElement.style.removeProperty("--bottom-panel-height");
    };
  }, [boundedDim, props.dragDirection, props.isNested]);

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
        width: isHorizontal ? boundedDim : "100%",
        height: isVertical ? boundedDim : horizontalPanelHeight,
      }}
    >
      {props.children}

      <div
        onMouseDown={handleResize}
        className={`absolute z-100
          ${
            isHorizontal
              ? "top-1/2 -translate-y-1/2 h-full w-1.5 cursor-col-resize"
              : ""
          }
          ${
            isVertical
              ? "left-1/2 -translate-x-1/2 w-full h-1.5 cursor-row-resize"
              : ""
          }
          ${props.dragDirection === Direction.LEFT ? "left-0" : ""}
          ${props.dragDirection === Direction.RIGHT ? "right-0" : ""}
          ${props.dragDirection === Direction.UP ? "top-0" : ""}
          ${props.dragDirection === Direction.DOWN ? "bottom-0" : ""}
        `}
      />
    </div>
  );
}
