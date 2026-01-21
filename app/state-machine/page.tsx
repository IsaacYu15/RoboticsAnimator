"use client";

import { Direction, StateDetails, TransitionDetails } from "@/types";
import { useEffect, useState } from "react";
import { HiCodeBracketSquare, HiFilm } from "react-icons/hi2";
import State from "./state";
import Arrow from "./arrow";
import useStateManager from "../hooks/useStatesManager";
import useTransitionsManager from "../hooks/useTransitionsManager";
import DragResizer from "../components/dragHandlers/dragResizer";
import { HORIZ_DRAGGABLE_SECTIONS } from "../components/dragHandlers";
import { tryParseInt } from "../services/parse";
import useAnimations from "../hooks/useAnimations";
import { useRouter } from "next/navigation";

export default function Page() {
  const {
    states,
    statesMap,
    fetchStates,
    addState,
    updateStates,
    deleteState,
  } = useStateManager();
  const { transitions, fetchTransitions, addTransitions } =
    useTransitionsManager();
  const { addAnimation } = useAnimations();
  const router = useRouter();

  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [fromId, setFromId] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState<string>("");
  const [animationId, setAnimationId] = useState<number | null>(null);

  const onRefresh = () => {
    fetchStates();
    fetchTransitions();
  };

  const createNewState = async () => {
    const centerX = Math.floor(window.innerWidth / 2);
    const centerY = Math.floor(window.innerHeight / 2);

    await addState({
      id: 0,
      animation_id: null,
      name: "New State",
      x: centerX,
      y: centerY,
    });

    await onRefresh();
  };

  const openAnimationPage = (id: number) => {
    router.push(`/state-machine/animation?id=${id}`);
  };

  const createNewAnimation = async () => {
    try {
      const newAnimation = await addAnimation({
        id: 0,
        name: "New Animation",
        duration_s: 1,
        loop: false,
      });

      if (newAnimation) {
        openAnimationPage(newAnimation.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const trackArrowState = async (id: number) => {
    if (!fromId) {
      setFromId(id);
    } else {
      await addTransitions({
        id: 0,
        from_id: fromId,
        to_id: id,
        condition: "",
      });
      setFromId(null);
      await onRefresh();
    }
  };

  const openStatesViewer = (id: number) => {
    if (id === selectedState) {
      setSelectedState(null);
      setName("");
      setAnimationId(null);
    } else {
      setSelectedState(id);
      const stateData = statesMap.get(id);
      if (stateData) {
        setName(stateData.name);
        setAnimationId(stateData.animation_id);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedState === null) return;

    setIsSubmitting(true);
    try {
      await updateStates({
        id: selectedState,
        animation_id: animationId,
        name: name,
        x: statesMap?.get(selectedState)?.x || 0,
        y: statesMap?.get(selectedState)?.y || 0,
      });
      await onRefresh();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <div className="w-screen h-screen bg-gray-50 relative bg-[radial-gradient(#D3D3D3_1px,transparent_0)] bg-[length:20px_20px]">
      {selectedState && statesMap && (
        <DragResizer
          minDim={HORIZ_DRAGGABLE_SECTIONS}
          direction={Direction.RIGHT}
        >
          <div className="bg-white h-screen p-5 flex flex-col justify-between border-l border-slate-200 shadow-xl">
            <form
              id="state-editor-form"
              onSubmit={handleSave}
              className="flex flex-col"
            >
              <h2 className="text-xl font-bold mb-6 text-slate-800">
                Edit State
              </h2>

              <div className="mb-5">
                <label className="block mb-2.5 text-sm font-medium text-slate-600">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-slate-300 text-slate-900 text-sm rounded-lg block w-full px-3 py-2.5"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block mb-2.5 text-sm font-medium text-slate-600">
                  Animation Id
                </label>
                <input
                  type="number"
                  value={animationId ?? ""}
                  onChange={(e) =>
                    setAnimationId(tryParseInt(e.target.value) ?? null)
                  }
                  className="border border-slate-300 text-slate-900 text-sm rounded-lg block w-full px-3 py-2.5"
                />
              </div>
            </form>

            {animationId && (
              <button
                className=" bg-slate-900 text-white p-3 rounded-xl"
                onClick={() => openAnimationPage(animationId)}
              >
                Edit Animation
              </button>
            )}

            <div className="flex flex-row gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 p-3 rounded-xl transition-colors font-medium"
                onClick={() => {
                  deleteState(selectedState);
                  setSelectedState(null);
                  onRefresh();
                }}
              >
                Delete
              </button>
              <button
                form="state-editor-form"
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-slate-900 text-white p-3 rounded-xl disabled:opacity-50 hover:bg-slate-800 transition-colors font-medium"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </DragResizer>
      )}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 h-12 rounded-2xl drop-shadow-2xl bg-white border border-slate-200 px-6 flex flex-row justify-center items-center z-40 gap-4">
        <button
          className="text-3xl text-slate-700 hover:text-slate-900 transition-transform active:scale-90"
          onClick={createNewState}
          title="Add New State"
        >
          <HiCodeBracketSquare />
        </button>
        <button
          className="text-3xl text-slate-700 hover:text-slate-900 transition-transform active:scale-90"
          onClick={createNewAnimation}
          title="Add New Animation"
        >
          <HiFilm />
        </button>
      </div>

      {states?.map((state: StateDetails) => (
        <State
          key={state.id}
          {...state}
          onRefresh={onRefresh}
          onTransitionClick={trackArrowState}
          onClick={openStatesViewer}
        />
      ))}

      {statesMap &&
        transitions?.map((transition: TransitionDetails) => {
          const from = statesMap.get(transition.from_id) ?? { x: 0, y: 0 };
          const to = statesMap.get(transition.to_id) ?? { x: 0, y: 0 };

          return (
            <Arrow
              key={transition.id}
              from={{ x: from.x, y: from.y }}
              to={{ x: to.x, y: to.y }}
            />
          );
        })}
    </div>
  );
}
