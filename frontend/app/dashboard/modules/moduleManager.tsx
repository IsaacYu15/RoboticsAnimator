"use client";

import { CreateModule, FormAction, Module, UpdateModule } from "@/shared-types";
import { HiOutlineRefresh, HiOutlineTrash } from "react-icons/hi";
import { useCallback, useEffect, useState, useTransition } from "react";

import ModuleModal from "./moduleModal";

interface ModuleManagerProps extends Module {
  mode: FormAction;
  updateModule: (id: number, module: UpdateModule) => Promise<Module>;
  createModule: (module: CreateModule) => Promise<Module>;
  deleteModule: (id: number) => Promise<void>;
}

export default function ModuleManager(props: ModuleManagerProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [moduleModalActive, setModuleModalActive] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const checkModuleConnection = useCallback(
    async (address: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsCheckingStatus(true);

      try {
        const response = await fetch(`http://${address}/status`, {
          signal: AbortSignal.timeout(3000),
        });
        setIsConnected(response.ok);
      } catch (error) {
        setIsConnected(false);
        console.log(`Error occured connection to module: ${error}`);
      } finally {
        setIsCheckingStatus(false);
      }
    },
    [],
  );

  const submitModal = async (module: Module) => {
    if (props.mode === FormAction.UPDATE) {
      await props.updateModule(module.id, {
        address: module.address,
        type: module.type,
        name: module.name,
      });
    } else if (props.mode === FormAction.ADD) {
      await props.createModule({
        address: module.address,
        type: module.type,
        name: module.name,
      });
    }
    setModuleModalActive(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await props.deleteModule(props.id);
    });
  };

  useEffect(() => {
    checkModuleConnection(props.address);
  }, [props.address, checkModuleConnection]);

  return (
    <>
      {moduleModalActive && (
        <ModuleModal
          onSubmit={submitModal}
          exitModule={() => setModuleModalActive(false)}
          details={props}
        />
      )}
      <div
        className={`relative w-full px-3 py-2 rounded-sm border border-gray-light-medium bg-white hover:bg-gray-light text-gray-medium-dark`}
        onClick={() => setModuleModalActive(true)}
      >
        <button
          className="absolute top-3 right-3 z-50 hover:text-red-600"
          onClick={handleDelete}
          disabled={isPending}
        >
          <HiOutlineTrash />
        </button>

        <div>
          <h3 className="font-bold uppercase">{props.name}</h3>
          <h3 className="font-light">{props.address}</h3>
          <h5 className="font-light">{props.type}</h5>
        </div>

        <div className="text-sm font-bold uppercase text-zinc-400 flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <p>
              {isCheckingStatus
                ? "checking..."
                : isConnected
                  ? "connected"
                  : "disconnected"}
            </p>
          </div>
          <button
            onClick={(e) => checkModuleConnection(props.address, e)}
            className={`${isCheckingStatus ? "animate-spin" : ""}`}
          >
            <HiOutlineRefresh />
          </button>
        </div>
      </div>
    </>
  );
}
