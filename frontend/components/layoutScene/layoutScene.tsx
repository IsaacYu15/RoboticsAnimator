"use client";

import { useAnimationEvents } from "@/hooks/useAnimationEvents";
import { useComponents } from "@/hooks/useComponents";
import { useAssets } from "@/hooks/useAssets";
import {
  HORIZ_DRAGGABLE_SECTIONS,
  MAX_HORIZ_DRAGGABLE_SECTIONS,
} from "@/components/dragHandlers/constants";
import { ComponentType } from "@/constants/components";
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
import { degreesToRadians, radiansToDegrees } from "@/utils/math";
import { Eye, Hand, LucideIcon, Move, Rotate3D } from "lucide-react";
import { KEY_BACKSPACE } from "@/constants";
import { useSelection } from "@/context/selectionContext";
import { ConnectionStatus } from "@/shared-types";

interface LayoutSceneProps {
  id: number;
  title: string;
  moduleAddress?: string;
  currentTime: number;
  animationEvents: AnimationEvent[];
  components: Component[];
  assets: Asset[];
  refresh: () => void;
  websocketStatus: ConnectionStatus;
  websocketConnect: () => void;
  websocketDisconnect: () => void;
}

export default function LayoutScene(props: LayoutSceneProps) {
  const [canvasActive, setCanvasActive] = useState(false);
  const { selectedComponent, selectComponent, clearSelection } = useSelection();

  const [panelState, setPanelState] = useState<PanelState>();
  const [transformMode, setTransformMode] =
    useState<TransformMode>("translate");
  const [movementMode, setMovementMode] = useState<MovementMode>("firstPerson");

  const { deleteAnimationEvent } = useAnimationEvents();
  const { updateComponent, deleteComponent, createComponent, getComponent } =
    useComponents();
  const { deleteAsset } = useAssets();

  const objectRefs = useRef<Record<number, Object3D>>({});
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      setCanvasActive(sceneRef.current?.contains(e.target as Node) ?? false);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key !== KEY_BACKSPACE || !selectedComponent) return;

      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      e.preventDefault();

      const keyframe = props.animationEvents.find(
        (ev) =>
          Number(ev.trigger_time) === props.currentTime &&
          ev.component_id === selectedComponent.id,
      );

      if (canvasActive) {
        try {
          await deleteComponent(selectedComponent.id);
          clearSelection();
          setPanelState(undefined);
          await props.refresh();
        } catch (error) {
          console.log(error);
        }
      }

      if (keyframe) {
        await deleteAnimationEvent(keyframe.id);
        await props.refresh();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedComponent, props, canvasActive, clearSelection, deleteComponent]);

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
    console.log(asset);
    const result = await createComponent({
      type: asset.type ?? "",
      name: asset.name ?? "",
      colour: asset.colour ?? "",
      config: asset.config,
      pin: 0,
    });
    console.log(result);

    if (result) {
      await props.refresh();
    }
  };

  const handleCreateComponent = async () => {
    const result = await createComponent({
      type: "servo",
      name: "default",
      pin: 0,
      config: { pwmMinAngle: 0, pwmMaxAngle: 100 },
    });

    if (result) {
      await props.refresh();
    }
  };

  const handleDeleteAsset = async (asset: Asset) => {
    try {
      await deleteAsset(asset.id);
      await props.refresh();
    } catch (error) {
      console.log(error);
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
          className={`icon-default ${isSelected ? "text-gray-medium-dark" : "text-gray-medium"}`}
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

    const component = await getComponent(id);
    if (!component) {
      console.error("Selected object contains and invalid component id");
      return;
    }

    console.log(component);

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
  }, [
    panelState,
    props.currentTime,
    componentEvents,
    props.id,
    props.refresh,
    props.moduleAddress,
  ]);

  return (
    <div
      className={`${movementMode == "firstPerson" ? "cursor-default" : "cursor-grab"} w-full h-full`}
    >
      <div>
        <PropertiesPanel
          id={props.id}
          title={props.title}
          moduleAddress={props.moduleAddress}
          components={props.components}
          assets={props.assets}
          setSelectedComponentId={handleSetSelectedComponentId}
          selectedComponentId={selectedComponent?.id}
          onSpawnAsset={handleSpawnAsset}
          onDeleteAsset={handleDeleteAsset}
          onCreateComponent={handleCreateComponent}
          websocketStatus={props.websocketStatus}
          websocketConnect={props.websocketConnect}
          websocketDisconnect={props.websocketDisconnect}
        ></PropertiesPanel>
      </div>

      <div ref={sceneRef} className="w-full h-full" data-scene-input="true">
        <Scene
          components={props.components}
          canvasActive={canvasActive}
          transformMode={transformMode}
          movementMode={movementMode}
          setMovementMode={setMovementMode}
          selectedComponentId={selectedComponent?.id}
          setSelectedComponentId={handleSetSelectedComponentId}
          objectRefs={objectRefs}
          registerObjectRef={registerObjectRef}
          saveObjectChanges={saveObjectTransform}
        ></Scene>
      </div>

      {selectedComponent?.id ? (
        <div>
          <DragResizer
            minDim={HORIZ_DRAGGABLE_SECTIONS}
            maxDim={MAX_HORIZ_DRAGGABLE_SECTIONS}
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
