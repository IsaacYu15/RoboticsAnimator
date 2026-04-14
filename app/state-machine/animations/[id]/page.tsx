"use client";

import { getComponentsWithAnimations } from "@/app/actions/components";
import { VERT_DRAGGABLE_SECTIONS } from "@/app/components/dragHandlers/constants";
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
import {
  KEYFRAME_TAG_HEIGHT,
  GRAPH_TAG_HEIGHT,
  SMALLEST_TIMELINE_UNIT_IN_SECONDS,
  TAG_COLUMN_WIDTH,
  TIMELINE_HEADER_HEIGHT,
  TimelineMode,
} from "./constants";
import useESPWebSocket from "@/app/hooks/useESPWebSocket";
import TimelineOptions from "./timelineOptions";
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
  const [timelineMode, setTimelineMode] = useState<TimelineMode>(
    TimelineMode.KEYFRAME,
  );

  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineStart, setTimelineStart] = useState(0);
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

  const handleRestart = useCallback(() => {
    // TODO: implement restart logic
  }, []);

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
          dragDirection={Direction.UP}
        >
          <>
            {isPlaying && (
              <div className="fixed inset-0 bg-black opacity-50 z-75" />
            )}
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-full flex flex-row gap-1 z-100">
              <TimelineToolbar
                isPlaying={isPlaying && !isPaused}
                handlePlay={handlePlay}
                onRestart={handleRestart}
                isLiveMode={isLiveMode}
                setIsLiveMode={setIsLiveMode}
              />
            </div>

            <div className="h-full w-full bg-gray-light flex flex-col relative">
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
                <TimelineOptions
                  timelineMode={timelineMode}
                  setTimelineMode={setTimelineMode}
                />
                <TimelineTime
                  timelineWidth={timelineWidth}
                  timelineUnitWidth={timelineUnitWidth}
                  timelineStart={timelineStart}
                  timelineEnd={timelineEnd}
                  setTimelineEnd={setTimelineEnd}
                />
              </div>

              <div className="flex-1 overflow-y-auto flex flex-row">
                <div
                  className="flex flex-col"
                  style={{ width: TAG_COLUMN_WIDTH }}
                >
                  {components.map((component) => (
                    <div
                      className="shrink-0"
                      style={{
                        height:
                          timelineMode === TimelineMode.GRAPH
                            ? GRAPH_TAG_HEIGHT
                            : KEYFRAME_TAG_HEIGHT,
                      }}
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
                        style={{
                          height:
                            timelineMode === TimelineMode.GRAPH
                              ? GRAPH_TAG_HEIGHT
                              : KEYFRAME_TAG_HEIGHT,
                        }}
                      >
                        <ComponentTimeline
                          timelineRef={timelineRef}
                          component={component}
                          animationId={parseInt(id)}
                          animations={component.animation_events}
                          refresh={refreshComponents}
                          onTimeChange={setPlayHeadTime}
                          timelineUnitWidth={timelineUnitWidth}
                          timelineUnitSeconds={
                            SMALLEST_TIMELINE_UNIT_IN_SECONDS
                          }
                          timelineMode={timelineMode}
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
