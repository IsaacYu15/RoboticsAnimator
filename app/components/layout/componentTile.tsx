"use client";

import { ComponentDetails } from "@/types";
import { useState } from "react";
import { ComponentModal } from "./componentModal";

export interface ComponentTileProps extends ComponentDetails {
  onRefresh: () => void;
}

export default function ComponentTile(props: ComponentTileProps) {
  const [modifyTileVisible, setModifyTileVisible] = useState<boolean>(false);

  return (
    <>
      {modifyTileVisible && (
        <ComponentModal
          id={props.id}
          type={props.type}
          pin={props.pin}
          x={props.x}
          y={props.y}
          exitModal={() => {
            setModifyTileVisible(false);
            props.onRefresh();
          }}
        ></ComponentModal>
      )}
      <button
        className="w-auto aspect-square bg-slate-500 p-4 rounded-2xl flex flex-col justify-center items-center relative"
        onClick={() => setModifyTileVisible((prev) => !prev)}
      >
        <h1 className="text-slate-50 font-bold">{props.type}</h1>
        <p className="text-slate-50">{props.pin}</p>
      </button>
    </>
  );
}
