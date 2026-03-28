"use client";

import { getComponentsWithAnimations } from "@/app/actions/components";
import {
  HORIZ_DRAGGABLE_SECTIONS,
  VERT_DRAGGABLE_SECTIONS,
} from "@/app/components/dragHandlers/constants";
import DragResizer from "@/app/components/dragHandlers/dragResizer";
import LayoutScene from "@/app/components/layoutScene/layoutScene";
import { Asset, ComponentWithAnimation, Direction } from "@/shared-types";
import { use, useCallback, useEffect, useRef, useState } from "react";
import ComponentTag from "./componentTag";
import ComponentTimeline from "./componentTimeline";
import Playhead from "./timelinePlayhead";
import { sendAnimation } from "@/app/services/servoController";
import { getModules } from "@/app/actions/modules";
import { getAnimationById } from "@/app/actions/animations";
import { getAssets } from "@/app/actions/assets";
import TimelineToolbar from "./timelineToolbar";
import { formatDecimals } from "@/app/services/parse";
import { useToast } from "@/app/context/toastContext";
import { SelectionProvider } from "@/app/context/selectionContext";
import {
  COMPONENT_TAG_HEIGHT,
  MAX_TIMELINE_RANGE,
  MIN_TIMELINE_RANGE,
  SMALLEST_TIMELINE_UNIT_IN_SECONDS,
  TIMELINE_HEADER_HEIGHT,
  ZOOM_FACTOR,
} from "./constants";

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

  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(10);

  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineStart, setTimelineStart] = useState(0);
  const [timelineEnd, setTimelineEnd] = useState(10);
  const [timelineUnitWidth, setTimelineUnitWidth] = useState(0);

  const toast = useToast();

  const timelineWidth = useCallback(() => {
    return (
      (timelineEnd - timelineStart) / SMALLEST_TIMELINE_UNIT_IN_SECONDS + 1
    );
  }, [timelineStart, timelineEnd]);

  useEffect(() => {
    if (!timelineRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      const currentWidth = timelineWidth();
      if (width) {
        setTimelineUnitWidth(width / currentWidth);
      }
    });

    observer.observe(timelineRef.current);
    return () => observer.disconnect();
  }, [timelineWidth]);

  const handleTimelineWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      const delta = e.deltaY / Math.abs(e.deltaY);
      const currentRange = timelineEnd - timelineStart;
      const zoomAmount = currentRange * ZOOM_FACTOR * delta;

      const newEnd = timelineEnd + zoomAmount;

      if (
        newEnd - timelineStart >= MIN_TIMELINE_RANGE &&
        newEnd - timelineStart <= MAX_TIMELINE_RANGE
      ) {
        setTimelineEnd(newEnd);
      }
    },
    [timelineStart, timelineEnd],
  );

  const handleFastForward = useCallback(() => {
    // TODO: implement fast forward logic
  }, []);

  const handleRestart = useCallback(() => {
    // TODO: implement restart logic
  }, []);

  const handlePlay = async (playing: boolean) => {
    setIsPlaying((prev) => !prev);
    if (playing) {
      try {
        await sendAnimation(components, moduleAddress);
      } catch (error) {
        toast.toast(`Error sending animation: ${error}`);
      }
    }
  };

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
    <SelectionProvider>
      <div className="w-screen h-screen flex flex-col justify-start items-center bg-white">
        <LayoutScene
          id={parseInt(id)}
          title={title}
          components={components}
          assets={assets}
          refresh={refreshComponents}
          currentTime={currentTime}
          animationEvents={components.flatMap((c) => c.animation_events)}
        />

        <DragResizer
          minDim={VERT_DRAGGABLE_SECTIONS}
          dragDirection={Direction.UP}
        >
          <>
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-full flex flex-row gap-1 z-10">
              <TimelineToolbar
                playbackSpeed={playbackSpeed}
                setPlaybackSpeed={setPlaybackSpeed}
                isPlaying={isPlaying}
                setIsPlaying={handlePlay}
                onFastForward={handleFastForward}
                onRestart={handleRestart}
                isLiveMode={isLiveMode}
                setIsLiveMode={setIsLiveMode}
              />
            </div>

            <div className="h-full w-full bg-gray-light flex flex-row">
              <DragResizer
                minDim={HORIZ_DRAGGABLE_SECTIONS}
                dragDirection={Direction.RIGHT}
                isNested={true}
              >
                <div
                  className="relative w-full bg-gray-medium"
                  style={{ height: TIMELINE_HEADER_HEIGHT }}
                >
                  <div className="absolute inset-y-0 -right-4 w-4 bg-gray-medium" />
                </div>

                <div className="h-full w-full flex flex-col justify-start">
                  {components.map((component) => (
                    <div
                      style={{ height: COMPONENT_TAG_HEIGHT }}
                      key={component.id}
                    >
                      <ComponentTag
                        type={component.type ?? undefined}
                        name={component.name ?? undefined}
                      />
                    </div>
                  ))}
                </div>
              </DragResizer>

              <div className="flex-1 h-full min-w-0 pl-2">
                <div
                  ref={timelineRef}
                  onWheel={handleTimelineWheel}
                  className="h-full w-full relative"
                >
                  <Playhead
                    timelineRef={timelineRef}
                    timelineUnitWidth={timelineUnitWidth}
                    timelineUnitSeconds={SMALLEST_TIMELINE_UNIT_IN_SECONDS}
                    currentTime={currentTime}
                    onTimeChange={setCurrentTime}
                  />
                  <div
                    className="flex flex-row bg-gray-medium relative z-50"
                    style={{ height: TIMELINE_HEADER_HEIGHT }}
                  >
                    {Array.from({ length: timelineWidth() }).map((_, i) => {
                      const timeUnit = i * SMALLEST_TIMELINE_UNIT_IN_SECONDS;
                      const isFullSecond =
                        i % (1 / SMALLEST_TIMELINE_UNIT_IN_SECONDS) == 0;
                      return (
                        <div
                          key={i}
                          className="h-full absolute flex flex-col items-center justify-end"
                          style={{ left: i * timelineUnitWidth }}
                        >
                          <div
                            className={`relative w-0 border border-r border-white ${isFullSecond ? "h-2.5" : "h-1.5"}`}
                          >
                            {isFullSecond && (
                              <span className="text-white text-[8px] absolute bottom-1 -translate-y-1/2 -translate-x-1/2">
                                {formatDecimals(timeUnit, 2)}s
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-full w-full flex flex-col justify-start">
                    {components.map((component: ComponentWithAnimation) => (
                      <div
                        key={component.id}
                        style={{ height: COMPONENT_TAG_HEIGHT }}
                      >
                        <ComponentTimeline
                          timelineRef={timelineRef}
                          component={component}
                          animationId={parseInt(id)}
                          animations={component.animation_events}
                          refresh={refreshComponents}
                          onTimeChange={setCurrentTime}
                          timelineUnitWidth={timelineUnitWidth}
                          timelineUnitSeconds={SMALLEST_TIMELINE_UNIT_IN_SECONDS}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        </DragResizer>
      </div>
    </SelectionProvider>
  );
}
