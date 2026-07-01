"use client";

import { Component } from "@/shared-types";
import { createContext, useContext, useState, useCallback } from "react";

interface SelectionContextValue {
  selectedComponent?: Component;
  selectComponent: (component?: Component) => void;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionContextValue>({
  selectedComponent: undefined,
  selectComponent: () => {},
  clearSelection: () => {},
});

export const SelectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedComponent, setSelectedComponent] = useState<Component>();

  const clearSelection = useCallback(() => {
    setSelectedComponent(undefined);
  }, []);

  const selectComponent = useCallback((component?: Component) => {
    setSelectedComponent(component);
  }, []);

  return (
    <SelectionContext.Provider
      value={{
        selectedComponent,
        selectComponent,
        clearSelection,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => useContext(SelectionContext);
