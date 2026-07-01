import { useState, useEffect, useRef, RefObject } from "react";
import { clamp } from "@/app/utils/math";
import { MATCH_TOLERANCE } from "./constants";

interface UseTimelineDragOptions {
  timelineRef: RefObject<HTMLElement | null>;
  timelineUnitWidth: number;
  timelineUnitSeconds: number;
  initialTime: number;
  onDrag?: (newTime: number) => void;
  onDragEnd?: (newTime: number) => void;
  onClick?: () => void;
  snapTimeOnDrag?: (newTime: number) => number;
  snapTime?: (newTime: number) => number;
}

interface UseTimelineDragResult<T extends HTMLElement> {
  ref: RefObject<T | null>;
  position: number;
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
}

export function useTimelineDrag<T extends HTMLElement>({
  timelineRef,
  timelineUnitWidth,
  timelineUnitSeconds,
  initialTime,
  onDrag,
  onDragEnd,
  onClick,
  snapTimeOnDrag,
  snapTime,
}: UseTimelineDragOptions): UseTimelineDragResult<T> {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<number>();
  const [optimisticTime, setOptimisticTime] = useState<{
    sourceTime: number;
    value: number;
  } | null>(null);

  const ref = useRef<T>(null);
  const wasDragged = useRef(false);

  const position =
    dragPosition ??
    ((optimisticTime &&
    Math.abs(optimisticTime.sourceTime - initialTime) < MATCH_TOLERANCE
      ? optimisticTime.value
      : initialTime) /
      timelineUnitSeconds) *
      timelineUnitWidth;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setIsDragging(true);
    wasDragged.current = false;
    setOptimisticTime(null);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const timeline = timelineRef.current;
      if (!timeline) return;

      wasDragged.current = true;
      const timelineRect = timeline.getBoundingClientRect();
      const rawX = clamp(e.clientX - timelineRect.left, 0, timelineRect.width);
      const rawTime =
        timelineUnitWidth > 0
          ? (rawX / timelineUnitWidth) * timelineUnitSeconds
          : initialTime;
      const nextTime = Math.max(0, snapTimeOnDrag?.(rawTime) ?? rawTime);
      const nextX =
        timelineUnitSeconds > 0
          ? (nextTime / timelineUnitSeconds) * timelineUnitWidth
          : rawX;

      setDragPosition(clamp(nextX, 0, timelineRect.width));
      onDrag?.(nextTime);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;

      const timeline = timelineRef.current;
      if (!timeline) {
        setIsDragging(false);
        setDragPosition(undefined);
        return;
      }

      setIsDragging(false);

      if (wasDragged.current) {
        const timelineRect = timeline.getBoundingClientRect();
        const rawX = clamp(
          e.clientX - timelineRect.left,
          0,
          timelineRect.width,
        );
        const rawTime =
          timelineUnitWidth > 0
            ? (rawX / timelineUnitWidth) * timelineUnitSeconds
            : initialTime;
        const newTime = Math.max(0, snapTime?.(rawTime) ?? rawTime);
        if (!onDrag) {
          setOptimisticTime({ sourceTime: initialTime, value: newTime });
        }

        onDragEnd?.(newTime);
        setDragPosition(undefined);
      } else {
        setDragPosition(undefined);
        onClick?.();
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    timelineRef,
    timelineUnitWidth,
    timelineUnitSeconds,
    initialTime,
    onDrag,
    onDragEnd,
    onClick,
    snapTimeOnDrag,
    snapTime,
  ]);

  return { ref, position, isDragging, handleMouseDown };
}
