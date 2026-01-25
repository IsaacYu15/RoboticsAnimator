"use client";

import { Point } from "@/shared-types";
import React, {
  createContext,
  RefObject,
  useContext,
  useEffect,
  useRef,
} from "react";

const InputContext = createContext<{
  inputs: RefObject<Set<string>>;
  mousePos: RefObject<Point>;
}>({
  inputs: { current: new Set<string>() },
  mousePos: { current: { x: 0, y: 0 } },
});

export const InputProvider = ({ children }: { children: React.ReactNode }) => {
  const inputs = useRef<Set<string>>(new Set<string>());
  const mousePos = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const setMousePos = (e?: MouseEvent) => {
      const x = e?.clientX ?? 0;
      const y = e?.clientY ?? 0;
      return { x: x, y: y };
    };

    const onKeyDown = (e: KeyboardEvent) => inputs.current.add(e.code);
    const onKeyUp = (e: KeyboardEvent) => inputs.current.delete(e.code);
    const onMouseDown = (e: MouseEvent) => {
      inputs.current.add(e.button.toString());
    };
    const onMouseUp = (e: MouseEvent) => {
      inputs.current.delete(e.button.toString());
    };
    const onMouseMove = (e?: MouseEvent) => {
      setMousePos(e);
      mousePos.current = { ...setMousePos(e) };
    };
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("contextmenu", onContextMenu);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("contextmenu", onContextMenu);
    };
  }, []);

  return (
    <InputContext.Provider value={{ inputs: inputs, mousePos: mousePos }}>
      {children}
    </InputContext.Provider>
  );
};

export const useInputContext = () => useContext(InputContext);
