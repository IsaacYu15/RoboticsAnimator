"use client";

import { getComponentsWithAnimations } from "@/app/actions/components";
import {
  HORZ_DRAGGABLE_SECTIONS,
  VERT_DRAGGABLE_SECTIONS,
} from "@/app/components/dragHandlers";
import DragResizer from "@/app/components/dragHandlers/dragResizer";
import LayoutScene from "@/app/components/layoutScene/layoutScene";
import { ComponentWithAnimation, Direction } from "@/shared-types";
import { use, useEffect, useState } from "react";
import ComponentTag from "./componentTag";
import ComponentTimeline from "./componentTimeline";
import { sendAnimation } from "@/app/services/servoController";
import { getModules } from "@/app/actions/modules";

export default function AnimationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [components, setComponents] = useState<ComponentWithAnimation[]>([]);
  const [moduleAddress, setModuleAddress] = useState<string>();

  const refreshComponents = () => {
    const fetchComponents = async () => {
      const fetchedComponents = await getComponentsWithAnimations();
      setComponents(fetchedComponents);
    };

    //TODO: associate layout with module
    const fetchModules = async () => {
      const fetchedModules = await getModules();
      setModuleAddress(fetchedModules[0].address);
    };

    fetchComponents();
    fetchModules();
  };

  useEffect(() => {
    refreshComponents();
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col justify-start items-center p-10 bg-gray-50">
      <div className="w-full flex flex-row justify-start">
        <h1 className="text-2xl font-bold">Editing Animation: {id}</h1>
      </div>

      <LayoutScene components={components}></LayoutScene>

      <DragResizer
        minDim={VERT_DRAGGABLE_SECTIONS}
        dragDirection={Direction.UP}
      >
        <>
          <button
            className="bg-slate-800 text-white p-2 rounded-2xl mb-0.5"
            onClick={() => {
              sendAnimation(components, moduleAddress);
            }}
          >
            Play
          </button>
          <div className="bg-slate-800 h-full w-full flex flex-row gap-2 pt-5">
            <DragResizer
              minDim={HORZ_DRAGGABLE_SECTIONS}
              dragDirection={Direction.RIGHT}
              isNested={true}
            >
              <div className="h-5"></div>
              <div className="h-full w-full flex flex-col justify-start gap-1">
                {components.map((component) => (
                  <ComponentTag
                    key={component.id}
                    name={component.name}
                    selected={false}
                  />
                ))}
              </div>
            </DragResizer>

            <div className="flex-1 bg-slate-700 h-full min-w-0 relative">
              <div className="h-5 flex flex-row">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute flex flex-col gap-0.5"
                    style={{
                      left: `${i * 100}px`,
                    }}
                  >
                    <h2>{i}</h2>
                  </div>
                ))}
              </div>
              <div className="h-full w-full flex flex-col justify-start">
                {components.map((component: ComponentWithAnimation) =>
                  component.animation_events.length > 0 ? (
                    <ComponentTimeline
                      key={component.id}
                      component={component}
                      animationId={component.animation_events[0].animation_id}
                      animations={component.animation_events}
                      refresh={refreshComponents}
                    />
                  ) : null,
                )}
              </div>
            </div>
          </div>
        </>
      </DragResizer>
    </div>
  );
}
