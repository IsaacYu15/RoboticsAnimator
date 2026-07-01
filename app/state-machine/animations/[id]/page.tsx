"use client";

import { getComponentsWithAnimations } from "@/app/actions/components";
import {
  MAX_VERT_DRAGGABLE_SECTIONS,
  VERT_DRAGGABLE_SECTIONS,
} from "@/app/components/dragHandlers/constants";
import DragResizer from "@/app/components/dragHandlers/dragResizer";
import LayoutScene from "@/app/components/layoutScene/layoutScene";
import { Asset, ComponentWithAnimation, Direction } from "@/shared-types";
import { use, useCallback, useEffect, useRef, useState } from "react";
import ComponentTag from "./componentTag";
import ComponentTimeline from "./componentTimeline";
import Playhead from "./timelinePlayhead";
import {
  sendAnimation,
  buildFramePayload,
} from "@/app/services/servoController";
import { getModules } from "@/app/actions/modules";
import { getAnimationById } from "@/app/actions/animations";
import { getAssets } from "@/app/actions/assets";
import TimelineToolbar from "./timelineToolbar";
import { useToast } from "@/app/context/toastContext";
import { SelectionProvider } from "@/app/context/selectionContext";
import { formatDecimals, tryParseFloat } from "@/app/utils/parse";
import { clamp } from "@/app/utils/math";
import {
  KEYFRAME_TAG_HEIGHT,
  SMALLEST_TIMELINE_UNIT_IN_SECONDS,
  TAG_COLUMN_WIDTH,
  TIMELINE_HEADER_HEIGHT,
} from "./constants";
import useESPWebSocket from "@/app/hooks/useESPWebSocket";
import TimelineTime from "./timelineTime";

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

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [playHeadTime, setPlayHeadTime] = useState(0);
  const [playheadInputValue, setPlayheadInputValue] = useState(
    formatDecimals(0, 3),
  );
  const [isEditingPlayheadInput, setIsEditingPlayheadInput] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineStart] = useState(0);
  const [timelineEnd, setTimelineEnd] = useState(10);
  const [timelineUnitWidth, setTimelineUnitWidth] = useState(0);

  const toast = useToast();

  const {
    currentTime,
    isPlaying,
    isPaused,
    pauseResume,
    sendFrame,
    websocketStatus,
    websocketConnect,
    websocketDisconnect,
  } = useESPWebSocket(moduleAddress);

  const timelineWidth = useCallback(() => {
    return (
      (timelineEnd - timelineStart) / SMALLEST_TIMELINE_UNIT_IN_SECONDS + 1
    );
  }, [timelineStart, timelineEnd]);

  const commitPlayheadInput = useCallback(() => {
    const parsed = tryParseFloat(playheadInputValue, 3);
    if (parsed === null) {
      setPlayheadInputValue(formatDecimals(playHeadTime, 3));
      return;
    }

    const clampedTime = clamp(parsed, timelineStart, timelineEnd);
    setPlayHeadTime(clampedTime);
    setPlayheadInputValue(formatDecimals(clampedTime, 3));
  }, [playheadInputValue, playHeadTime, timelineStart, timelineEnd]);

  const handlePlay = async () => {
    setIsLiveMode(false);

    if (!isPlaying) {
      try {
        await sendAnimation(components, moduleAddress);
      } catch (error) {
        toast.toast(`Error sending animation: ${error}`);
      }
    } else {
      console.log("pauseResume");
      pauseResume();
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

  const handleLocalEventTimeChange = useCallback(
    (componentId: number, eventId: number, newTime: number) => {
      setComponents((previous) =>
        previous.map((component) => {
          if (component.id !== componentId) return component;

          const updatedEvents = component.animation_events
            .map((event) =>
              event.id === eventId
                ? { ...event, trigger_time: newTime }
                : event,
            )
            .sort((a, b) => Number(a.trigger_time) - Number(b.trigger_time));

          return { ...component, animation_events: updatedEvents };
        }),
      );
    },
    [],
  );

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

  useEffect(() => {
    setPlayHeadTime(currentTime / 1000);
  }, [currentTime]);

  useEffect(() => {
    if (!isEditingPlayheadInput) {
      setPlayheadInputValue(formatDecimals(playHeadTime, 3));
    }
  }, [playHeadTime, isEditingPlayheadInput]);

  useEffect(() => {
    const setup = async () => {
      const animation = await getAnimationById(parseInt(id));
      setTitle(animation?.name ?? "Animation");

      refreshComponents();
    };

    setup();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (!isLiveMode) return;

    const payload = buildFramePayload(playHeadTime, components);
    if (payload.length > 0) {
      sendFrame(payload);
    }
  }, [playHeadTime, isLiveMode, components, sendFrame]);

  return (
    <SelectionProvider>
      <div className="w-screen h-screen flex flex-col justify-start items-center bg-white">
        <LayoutScene
          id={parseInt(id)}
          title={title}
          moduleAddress={moduleAddress}
          components={components}
          assets={assets}
          refresh={refreshComponents}
          currentTime={playHeadTime}
          animationEvents={components.flatMap((c) => c.animation_events)}
          websocketStatus={websocketStatus}
          websocketConnect={websocketConnect}
          websocketDisconnect={websocketDisconnect}
        />

        <DragResizer
          minDim={VERT_DRAGGABLE_SECTIONS}
          maxDim={MAX_VERT_DRAGGABLE_SECTIONS}
          dragDirection={Direction.UP}
        >
          <>
            {isPlaying && (
              <div className="fixed inset-0 bg-black opacity-50 z-75" />
            )}

            <div className="h-full w-full bg-gray-light flex flex-col relative border-t border-gray-light-medium">
              <Playhead
                timelineRef={timelineRef}
                timelineUnitWidth={timelineUnitWidth}
                timelineUnitSeconds={SMALLEST_TIMELINE_UNIT_IN_SECONDS}
                currentTime={playHeadTime}
                onTimeChange={setPlayHeadTime}
                leftOffset={TAG_COLUMN_WIDTH}
              />
              <div
                className="flex flex-row"
                style={{ height: TIMELINE_HEADER_HEIGHT }}
              >
                <div
                  className="bg-gray-light border-r border-gray-light-medium px-2 flex flex-row items-center gap-2"
                  style={{ width: TAG_COLUMN_WIDTH }}
                >
                  <TimelineToolbar
                    isPlaying={isPlaying && !isPaused}
                    handlePlay={handlePlay}
                    isLiveMode={isLiveMode}
                    setIsLiveMode={setIsLiveMode}
                  />
                  <div className="flex flex-row items-center gap-1 min-w-0 flex-1">
                    <input
                      className="w-full min-w-0 bg-white border border-gray-light-medium rounded-xs px-1 py-0.5 text-[10px] text-gray-medium-dark"
                      value={playheadInputValue}
                      onFocus={() => setIsEditingPlayheadInput(true)}
                      onChange={(e) => setPlayheadInputValue(e.target.value)}
                      onBlur={() => {
                        setIsEditingPlayheadInput(false);
                        commitPlayheadInput();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur();
                        }
                        if (e.key === "Escape") {
                          setPlayheadInputValue(
                            formatDecimals(playHeadTime, 3),
                          );
                          setIsEditingPlayheadInput(false);
                          e.currentTarget.blur();
                        }
                      }}
                    />
                    <span className="text-[10px] text-gray-medium">s</span>
                  </div>
                </div>
                <TimelineTime
                  timelineWidth={timelineWidth}
                  timelineUnitWidth={timelineUnitWidth}
                  timelineStart={timelineStart}
                  timelineEnd={timelineEnd}
                  setTimelineEnd={setTimelineEnd}
                />
              </div>

              <div className="flex-1 overflow-y-auto flex flex-row scrollbar-hidden">
                <div
                  className="flex flex-col"
                  style={{ width: TAG_COLUMN_WIDTH }}
                >
                  {components.map((component) => (
                    <div
                      className="shrink-0"
                      style={{ height: KEYFRAME_TAG_HEIGHT }}
                      key={component.id}
                    >
                      <ComponentTag
                        type={component.type}
                        name={component.name}
                      />
                    </div>
                  ))}
                </div>

                <div ref={timelineRef} className="flex-1">
                  <div className="relative min-h-full">
                    {components.map((component: ComponentWithAnimation) => (
                      <div
                        key={component.id}
                        className="shrink-0"
                        style={{ height: KEYFRAME_TAG_HEIGHT }}
                      >
                        <ComponentTimeline
                          timelineRef={timelineRef}
                          component={component}
                          animationId={parseInt(id)}
                          currentTime={playHeadTime}
                          animations={component.animation_events}
                          onEventTimeChange={handleLocalEventTimeChange}
                          refresh={refreshComponents}
                          onTimeChange={setPlayHeadTime}
                          timelineUnitWidth={timelineUnitWidth}
                          timelineUnitSeconds={
                            SMALLEST_TIMELINE_UNIT_IN_SECONDS
                          }
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
