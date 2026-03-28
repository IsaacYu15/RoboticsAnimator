import { useState, useEffect, useRef, RefObject } from "react";
import { clamp } from "@/app/services/math";

interface UseTimelineDragOptions {
  timelineRef: RefObject<HTMLElement | null>;
  timelineUnitWidth: number;
  timelineUnitSeconds: number;
  initialTime: number;
  onDrag?: (newTime: number) => void;
  onDragEnd?: (newTime: number) => void;
  onClick?: () => void;
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
  onDragEnd,
  onClick,
}: UseTimelineDragOptions): UseTimelineDragResult<T> {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<number>();

  const ref = useRef<T>(null);
  const wasDragged = useRef(false);

  const position =
    dragPosition ?? (initialTime / timelineUnitSeconds) * timelineUnitWidth;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setIsDragging(true);
    wasDragged.current = false;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const timeline = timelineRef.current;
      if (!timeline) return;

      wasDragged.current = true;
      const timelineRect = timeline.getBoundingClientRect();
      const newX = clamp(0, e.clientX - timelineRect.left, timelineRect.width);
      setDragPosition(newX);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;

      const timeline = timelineRef.current;
      if (!timeline) return;

      setIsDragging(false);

      if (wasDragged.current) {
        const timelineRect = timeline.getBoundingClientRect();
        const rawX = e.clientX - timelineRect.left;
        const snappedUnits = Math.round(rawX / timelineUnitWidth);
        const snappedX = snappedUnits * timelineUnitWidth;
        const newTime = Math.max(0, snappedUnits * timelineUnitSeconds);

        setDragPosition(snappedX);
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
    onDragEnd,
    onClick,
  ]);

  return { ref, position, isDragging, handleMouseDown };
}
