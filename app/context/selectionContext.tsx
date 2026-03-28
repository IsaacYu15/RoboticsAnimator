"use client";

import { Component } from "@/shared-types";
import { createContext, useContext, useState, useCallback } from "react";

interface SelectionContextValue {
  selectedComponent?: Component;
  selectComponent: (component?: Component) => void;
  selectedKeyframeId?: number;
  selectKeyframe: (id?: number) => void;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionContextValue>({
  selectedComponent: undefined,
  selectComponent: () => {},
  selectedKeyframeId: undefined,
  selectKeyframe: () => {},
  clearSelection: () => {},
});

export const SelectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedComponent, setSelectedComponent] = useState<Component>();
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<number>();

  const clearSelection = useCallback(() => {
    setSelectedComponent(undefined);
    setSelectedKeyframeId(undefined);
  }, []);

  const selectComponent = useCallback((component?: Component) => {
    setSelectedComponent(component);
  }, []);

  const selectKeyframe = useCallback((id?: number) => {
    setSelectedKeyframeId(id);
  }, []);

  return (
    <SelectionContext.Provider
      value={{
        selectedComponent,
        selectComponent,
        selectedKeyframeId,
        selectKeyframe,
        clearSelection,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => useContext(SelectionContext);
