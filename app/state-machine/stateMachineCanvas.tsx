"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HiCodeBracketSquare, HiFilm } from "react-icons/hi2";
import { createState, updateState, deleteState } from "@actions/states";
import { createTransition } from "@actions/transitions";
import { createAnimation } from "@actions/animations";
import { State, Transition, Direction } from "@/shared-types";
import { tryParseInt } from "../services/parse";
import DragResizer from "../components/dragHandlers/dragResizer";
import { HORZ_DRAGGABLE_SECTIONS } from "../components/dragHandlers/constants";
import StateComponent from "./state";
import Arrow from "./arrow";
import { ANIMATION_ROUTE } from "../constants";

interface CanvasProps {
  initialStates: State[];
  initialTransitions: Transition[];
}

export default function StateMachineCanvas({
  initialStates,
  initialTransitions,
}: CanvasProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [fromId, setFromId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editAnimId, setEditAnimId] = useState<number | null>(null);

  const statesMap = new Map(initialStates.map((s) => [s.id, s]));

  const handleCreateState = () => {
    startTransition(async () => {
      await createState({
        name: "New State",
        x: Math.floor(window.innerWidth / 2),
        y: Math.floor(window.innerHeight / 2),
      });
    });
  };

  const handleCreateAnimation = async () => {
    const result = await createAnimation({
      name: "New Animation",
      duration_s: 1,
      loop: false,
    });
    if (result.success && result.data) {
      router.push(`/state-machine/animation?id=${result.data.id}`);
    }
  };

  const handleStateClick = (id: number) => {
    if (selectedStateId === id) {
      setSelectedStateId(null);
    } else {
      const data = statesMap.get(id);
      setSelectedStateId(id);
      setEditName(data?.name || "");
      setEditAnimId(data?.animation_id || null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStateId || !editAnimId) return;

    await updateState(selectedStateId, {
      name: editName,
      animations: {
        connect: { id: editAnimId },
      },
    });
  };

  const handleLinkStates = async (toId: number) => {
    if (!fromId) {
      setFromId(toId);
    } else {
      await createTransition({
        from_id: fromId,
        to_id: toId,
        condition: "",
      });
      setFromId(null);
    }
  };

  return (
    <div
      className={`w-screen h-screen bg-gray-50 relative bg-[radial-gradient(#D3D3D3_1px,transparent_0)] bg-[length:20px_20px] ${isPending ? "opacity-70" : ""}`}
    >
      {selectedStateId && (
        <DragResizer
          minDim={HORZ_DRAGGABLE_SECTIONS}
          dragDirection={Direction.LEFT}
        >
          <div className="bg-white h-screen p-5 flex flex-col justify-between border-l border-slate-200 shadow-xl">
            <form onSubmit={handleSave} className="flex flex-col">
              <h2 className="text-xl font-bold mb-6">Edit State</h2>
              <div className="mb-5">
                <label className="text-sm font-medium">Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border p-2 w-full rounded-lg"
                />
              </div>
              <div className="mb-5">
                <label className="text-sm font-medium">Animation ID</label>
                <input
                  type="number"
                  value={editAnimId ?? ""}
                  onChange={(e) => setEditAnimId(tryParseInt(e.target.value))}
                  className="border p-2 w-full rounded-lg"
                />
              </div>
              {editAnimId && (
                <a
                  className="bg-slate-900 text-white p-3 rounded-xl hover:bg-black transition-colors"
                  href={`${ANIMATION_ROUTE}/${editAnimId}`}
                >
                  Edit Animation
                </a>
              )}
            </form>

            <div className="flex flex-row gap-1 h-auto">
              <button
                type="submit"
                className="bg-slate-900 text-white p-3 rounded-xl hover:bg-black transition-colors"
              >
                Save Changes
              </button>
              <button
                className="bg-red-50 text-red-600 p-3 rounded-xl font-medium"
                onClick={() => {
                  deleteState(selectedStateId);
                  setSelectedStateId(null);
                }}
              >
                Delete State
              </button>
            </div>
          </div>
        </DragResizer>
      )}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 h-14 rounded-2xl drop-shadow-2xl bg-white border border-slate-200 px-8 flex items-center z-40 gap-6">
        <button
          onClick={handleCreateState}
          className="text-3xl hover:scale-110 transition-transform"
        >
          <HiCodeBracketSquare />
        </button>
        <button
          onClick={handleCreateAnimation}
          className="text-3xl hover:scale-110 transition-transform"
        >
          <HiFilm />
        </button>
      </div>

      {initialStates.map((state) => (
        <StateComponent
          key={state.id}
          {...state}
          isSelected={selectedStateId === state.id}
          onTransitionClick={() => handleLinkStates(state.id)}
          onClick={() => handleStateClick(state.id)}
        />
      ))}

      {initialTransitions.map((t) => {
        const from = statesMap.get(t.from_id);
        const to = statesMap.get(t.to_id);
        if (!from || !to) return null;
        return <Arrow key={t.id} from={from} to={to} />;
      })}
    </div>
  );
}
