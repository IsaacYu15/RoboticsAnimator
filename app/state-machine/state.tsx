"use client";

import { State } from "@/shared-types";
import { updateState } from "@actions/states";
import DragMover from "../components/dragHandlers/dragMover";
import { useRef } from "react";

export interface StateProps extends State {
  onTransitionClick: (id: number) => void;
  onClick: (id: number) => void;
  isSelected?: boolean;
}

export default function StateNode(props: StateProps) {
  const dragRef = useRef<HTMLDivElement>(null);

  const handleSavePosition = async () => {
    if (!dragRef?.current) return;

    const rect = dragRef.current.getBoundingClientRect();

    await updateState(props.id, {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
    });
  };

  return (
    <DragMover
      x={props.x ?? 0}
      y={props.y ?? 0}
      savePosition={handleSavePosition}
    >
      <div
        className="relative flex flex-row group"
        onClick={() => props.onClick(props.id)}
      >
        <button
          className="relative w-5 h-auto"
          onClick={(e) => {
            e.stopPropagation();
            props.onTransitionClick(props.id);
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="hidden group-hover:block bg-blue-400 rounded-full w-3 h-3 absolute top-3 right-0 translate-x-1/2 shadow-sm border border-white"></div>
        </button>

        <div
          ref={dragRef}
          className={`bg-white border-2 border-solid rounded-2xl py-1 px-5 transition-colors ${
            props.isSelected ? "border-blue-500 shadow-md" : "border-gray-500"
          }`}
        >
          <h1 className="font-medium text-slate-800">{props.name}</h1>
        </div>
      </div>
    </DragMover>
  );
}
