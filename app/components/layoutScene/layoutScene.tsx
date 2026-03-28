"use client";

import {
  addComponent,
  deleteComponent,
  getComponentById,
  updateComponent,
} from "@/app/actions/components";
import { deleteAsset } from "@/app/actions/assets";
import { HORIZ_DRAGGABLE_SECTIONS } from "@/app/components/dragHandlers/constants";
import { ComponentType } from "@/app/constants/components";
import {
  AnimationEvent,
  Asset,
  Component,
  Direction,
  MovementMode,
  TransformMode,
} from "@/shared-types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mesh, Object3D } from "three";
import DragResizer from "../dragHandlers/dragResizer";
import {
  createPanelState,
  PanelState,
  ServoPanelState,
} from "./editComponentPanel/panelState";
import { ServoPanel } from "./editComponentPanel/servoPanel";
import PropertiesPanel from "./properties/propertiesPanel";
import Scene from "./sceneObjects/scene";
import { degreesToRadians, radiansToDegrees } from "@/app/services/math";
import { Eye, Hand, LucideIcon, Move, Rotate3D } from "lucide-react";
import { KEY_BACKSPACE } from "@/app/constants";
import { useSelection } from "@/app/context/selectionContext";

interface LayoutSceneProps {
  id: number;
  title: string;
  moduleAddress?: string;
  currentTime: number;
  animationEvents: AnimationEvent[];
  components: Component[];
  assets: Asset[];
  refresh: () => void;
}

export default function LayoutScene(props: LayoutSceneProps) {
  const [canvasActive, setCanvasActive] = useState(false);
  const { selectedComponent, selectComponent, clearSelection } = useSelection();

  const [panelState, setPanelState] = useState<PanelState>();
  const [transformMode, setTransformMode] =
    useState<TransformMode>("translate");
  const [movementMode, setMovementMode] = useState<MovementMode>("firstPerson");

  const objectRefs = useRef<Record<number, Object3D>>({});

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (
        e.key === KEY_BACKSPACE &&
        selectedComponent?.id !== undefined &&
        canvasActive
      ) {
        e.preventDefault();
        const result = await deleteComponent(selectedComponent?.id);
        if (result.success) {
          clearSelection();
          setPanelState(undefined);
          await props.refresh();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedComponent?.id, props, canvasActive, clearSelection]);

  useEffect(() => {
    // eslint-disable-next-line
    updatePanelState(selectedComponent?.id);
  }, [selectedComponent?.id]);

  /* Immediate Updates */
  useEffect(() => {
    if (selectedComponent?.id === undefined) return;

    const selectedObject = objectRefs.current[selectedComponent?.id];

    if (selectedObject && panelState) {
      selectedObject.position.set(panelState.x, panelState.y, panelState.z);
      selectedObject.rotation.set(
        degreesToRadians(panelState.rotX),
        degreesToRadians(panelState.rotY),
        degreesToRadians(panelState.rotZ),
      );
      selectedObject.traverse((child) => {
        if (child instanceof Mesh) {
          child.material.color.set(panelState.colour);
        }
      });
    }
  }, [selectedComponent?.id, panelState]);

  /* Object Ref Management */
  const registerObjectRef = (componentId: number, object: Object3D) => {
    objectRefs.current[componentId] = object;
  };

  const handleSetSelectedComponentId = async (componentId?: number) => {
    if (selectedComponent?.id && selectedComponent?.id !== componentId) {
      const selectedObject = objectRefs.current[selectedComponent?.id];

      await updateComponent(selectedComponent?.id, {
        name: panelState?.name,
        x: selectedObject?.position.x ?? 0,
        y: selectedObject?.position.y ?? 0,
        z: selectedObject?.position.z ?? 0,
        rot_x: radiansToDegrees(selectedObject?.rotation.x ?? 0),
        rot_y: radiansToDegrees(selectedObject?.rotation.y ?? 0),
        rot_z: radiansToDegrees(selectedObject?.rotation.z ?? 0),
        colour: panelState?.colour,
        pin: panelState?.pin,
        config: panelState?.generateConfig(),
      });
      await props.refresh();
    }

    if (componentId !== undefined) {
      const component = props.components.find((c) => c.id === componentId);
      selectComponent(component);
      await updatePanelState(componentId);
    } else {
      clearSelection();
      setPanelState(undefined);
    }
  };

  /* Save Logic */
  const saveObjectTransform = async () => {
    if (selectedComponent?.id === undefined) return;

    const selectedObject = objectRefs.current[selectedComponent?.id];

    await updateComponent(selectedComponent?.id, {
      x: selectedObject.position.x,
      y: selectedObject.position.y,
      z: selectedObject.position.z,
      rot_x: radiansToDegrees(selectedObject.rotation.x),
      rot_y: radiansToDegrees(selectedObject.rotation.y),
      rot_z: radiansToDegrees(selectedObject.rotation.z),
    });

    setPanelState((prev) =>
      prev
        ? prev.clone().updateTransform({
            x: selectedObject.position.x,
            y: selectedObject.position.y,
            z: selectedObject.position.z,
            rotX: radiansToDegrees(selectedObject.rotation.x),
            rotY: radiansToDegrees(selectedObject.rotation.y),
            rotZ: radiansToDegrees(selectedObject.rotation.z),
          })
        : undefined,
    );
  };

  const handleSpawnAsset = async (asset: Asset) => {
    const result = await addComponent({
      type: asset.type,
      name: asset.name,
      colour: asset.colour,
      config: asset.config,
      pin: 0,
      x: 0,
      y: 0,
      z: 0,
      rot_x: 0,
      rot_y: 0,
      rot_z: 0,
    });

    if (result.success) {
      await props.refresh();
    }
  };

  const handleDeleteAsset = async (asset: Asset) => {
    const result = await deleteAsset(asset.id);
    if (result.success) {
      await props.refresh();
    }
  };

  /* Transform Button Nav */
  const TransformButton = ({
    icon: Icon,
    isSelected,
    onClick,
  }: {
    icon: LucideIcon;
    isSelected?: boolean;
    onClick: () => void;
  }) => {
    return (
      <button
        onClick={onClick}
        className={`relative cursor-pointer p-1 rounded ${isSelected ? "bg-blue-light" : ""}`}
      >
        <Icon
          className={`size-5 p-1 ${isSelected ? "text-gray-medium-dark" : "text-gray-medium"}`}
        />
      </button>
    );
  };

  const TransformButtonContainer = () => {
    return (
      <div className="flex flex-col gap-1 bg-gray-light rounded-lg p-1">
        <TransformButton
          icon={movementMode == "firstPerson" ? Eye : Hand}
          isSelected={false}
          onClick={() =>
            setMovementMode(
              movementMode == "firstPerson" ? "pan" : "firstPerson",
            )
          }
        />
        <TransformButton
          icon={Move}
          isSelected={"translate" == transformMode}
          onClick={() => setTransformMode("translate")}
        />
        <TransformButton
          icon={Rotate3D}
          isSelected={"rotate" == transformMode}
          onClick={() => setTransformMode("rotate")}
        />
      </div>
    );
  };

  /* Component Panel */
  const updatePanelState = async (id?: number) => {
    if (id === undefined) {
      setPanelState(undefined);
      return;
    }

    const component = await getComponentById(id);
    if (!component) {
      console.error("Selected object contains and invalid component id");
      return;
    }

    setPanelState(createPanelState(component));
  };

  const componentEvents = useMemo(() => {
    if (!selectedComponent) return [];
    return props.animationEvents
      .filter((e) => e.component_id === selectedComponent.id)
      .sort((a, b) => Number(a.trigger_time) - Number(b.trigger_time));
  }, [selectedComponent, props.animationEvents]);

  const getComponentPanel = useCallback(() => {
    if (!panelState) return null;
    switch (panelState.type) {
      case ComponentType.SERVO:
        return (
          <ServoPanel
            moduleAddress={props.moduleAddress}
            state={panelState as ServoPanelState}
            setState={setPanelState}
            currentTime={props.currentTime}
            componentEvents={componentEvents}
            animationId={props.id}
            onRefresh={props.refresh}
          />
        );
      default:
        return null;
    }
  }, [panelState, props.currentTime, componentEvents, props.id, props.refresh]);

  return (
    <div
      className={`${movementMode == "firstPerson" ? "cursor-default" : "cursor-grab"} w-full h-full`}
    >
      <div onClick={() => setCanvasActive(false)}>
        <PropertiesPanel
          id={props.id}
          title={props.title}
          components={props.components}
          assets={props.assets}
          setSelectedComponentId={handleSetSelectedComponentId}
          selectedComponentId={selectedComponent?.id}
          onSpawnAsset={handleSpawnAsset}
          onDeleteAsset={handleDeleteAsset}
        ></PropertiesPanel>
      </div>

      <Scene
        components={props.components}
        canvasActive={canvasActive}
        transformMode={transformMode}
        movementMode={movementMode}
        setMovementMode={setMovementMode}
        setCanvasActive={setCanvasActive}
        selectedComponentId={selectedComponent?.id}
        setSelectedComponentId={handleSetSelectedComponentId}
        objectRefs={objectRefs}
        registerObjectRef={registerObjectRef}
        saveObjectChanges={saveObjectTransform}
      ></Scene>

      {selectedComponent?.id ? (
        <div onClick={() => setCanvasActive(false)}>
          <DragResizer
            minDim={HORIZ_DRAGGABLE_SECTIONS}
            dragDirection={Direction.LEFT}
          >
            {getComponentPanel()}
            <div className="absolute top-6 -left-[48px] flex flex-col gap-1 z-10">
              <TransformButtonContainer />
            </div>
          </DragResizer>
        </div>
      ) : (
        <div className="absolute top-6 right-6 flex flex-col gap-1 z-10">
          <TransformButtonContainer />
        </div>
      )}
    </div>
  );
}
