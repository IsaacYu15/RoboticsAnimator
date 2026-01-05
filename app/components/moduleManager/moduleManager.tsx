"use client";

import { FormAction, ModuleDetails } from "@/types";
import { HiOutlineRefresh, HiOutlineTrash } from "react-icons/hi";
import { useEffect, useState } from "react";

import ModuleModal from "./moduleModal";
import useModules from "@/app/hooks/useModules";

interface ModuleManagerProps extends ModuleDetails {
  mode: FormAction;
  onRefresh: () => void;
}

export default function ModuleManager(props: ModuleManagerProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [moduleModalActive, setModuleModalActive] = useState<boolean>(false);
  const { updateModule, addModule, deleteModule } = useModules();

  const checkModuleConnection = async (
    address: string,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(`http://${address}/status`, {
        signal: AbortSignal.timeout(3000),
      });

      setIsConnected(response.ok);
    } catch (err) {
      setIsConnected(false);
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitModal = async (module: ModuleDetails) => {
    if (props.mode === FormAction.UPDATE) {
      return updateModule(module);
    } else if (props.mode === FormAction.ADD) {
      return addModule(module);
    }

    return () => {};
  };

  const exitModule = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setModuleModalActive(false);

    props.onRefresh();
  };

  useEffect(() => {
    checkModuleConnection(props.address);
  }, [props.address, moduleModalActive]);

  return (
    <>
      {moduleModalActive && (
        <ModuleModal
          onSubmit={submitModal}
          exitModule={exitModule}
          details={props}
        ></ModuleModal>
      )}
      <div
        className="relative bg-slate-100 p-6 rounded-2xl aspect-square flex flex-col justify-between hover:bg-slate-200"
        onClick={() => {
          setModuleModalActive(true);
        }}
      >
        <button
          className="absolute top-3 right-3 text-xl z-50"
          onClick={(e) => {
            e?.stopPropagation();
            deleteModule(props.id);
            props.onRefresh();
          }}
        >
          <HiOutlineTrash />
        </button>

        <div>
          <h1 className="font-bold text-xl uppercase">{props.name}</h1>
          <h1 className="font-light">{props.address}</h1>
        </div>

        <div className="text-sm font-bold uppercase text-zinc-400 flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <p>
              {isLoading
                ? "loading"
                : isConnected
                ? "connected"
                : "disconnected"}
            </p>
            <div />
          </div>
          <button
            onClick={(e) => checkModuleConnection(props.address, e)}
            className={` ${isLoading ? "animate-spin" : ""} `}
          >
            <HiOutlineRefresh></HiOutlineRefresh>
          </button>
        </div>
      </div>
    </>
  );
}
