"use client";

import { getComponentsWithAnimations } from "@/app/actions/components";
import {
  HORIZ_DRAGGABLE_SECTIONS,
  VERT_DRAGGABLE_SECTIONS,
} from "@/app/components/dragHandlers/constants";
import DragResizer from "@/app/components/dragHandlers/dragResizer";
import LayoutScene from "@/app/components/layoutScene/layoutScene";
import { Asset, ComponentWithAnimation, Direction } from "@/shared-types";
import { use, useCallback, useEffect, useState } from "react";
import ComponentTag from "./componentTag";
import ComponentTimeline from "./componentTimeline";
import { sendAnimation } from "@/app/services/servoController";
import { getModules } from "@/app/actions/modules";
import { getAnimationById } from "@/app/actions/animations";
import { getAssets } from "@/app/actions/assets";

export default function AnimationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [title, setTitle] = useState<string>("");
  const [components, setComponents] = useState<ComponentWithAnimation[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [moduleAddress, setModuleAddress] = useState<string>();

  //fetch all async calls together to avoid multiple re-renders
  const refreshComponents = useCallback(async () => {
    try {
      const [fetchedComponents, fetchedModules, fetchedAssets] =
        await Promise.all([
          getComponentsWithAnimations(),
          getModules(),
          getAssets(),
        ]);
      setComponents(fetchedComponents);
      setModuleAddress(fetchedModules[0]?.address);
      setAssets(fetchedAssets);
    } catch (error) {
      console.error("Error refreshing components: ", error);
    }
  }, []);

  useEffect(() => {
    const setup = async () => {
      const animation = await getAnimationById(parseInt(id));
      setTitle(animation?.name ?? "Animation");

      refreshComponents();
    };

    setup();
    // eslint-disable-next-line
  }, [id]);

  return (
    <div className="w-screen h-screen flex flex-col justify-start items-center p-10 bg-gray-50">
      <LayoutScene
        id={parseInt(id)}
        title={title}
        components={components}
        assets={assets}
        refresh={refreshComponents}
      ></LayoutScene>

      <button
        className="bg-slate-800 text-white p-2 rounded-2xl mb-0.5"
        onClick={() => {
          sendAnimation(components, moduleAddress);
        }}
      >
        Play
      </button>

      <DragResizer
        minDim={VERT_DRAGGABLE_SECTIONS}
        dragDirection={Direction.UP}
      >
        <>
          <div className="bg-slate-800 h-full w-full flex flex-row gap-2 pt-5">
            <DragResizer
              minDim={HORIZ_DRAGGABLE_SECTIONS}
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
