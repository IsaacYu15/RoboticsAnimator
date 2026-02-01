"use client";

import { FormAction, Module } from "@/shared-types";
import { HiOutlineRefresh, HiOutlineTrash } from "react-icons/hi";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  deleteModule,
  updateModule,
  createModule,
} from "@/app/actions/modules";

import ModuleModal from "./moduleModal";

interface ModuleManagerProps extends Module {
  mode: FormAction;
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
      await updateModule(module.id, {
        address: module.address,
        name: module.name,
      });
    } else if (props.mode === FormAction.ADD) {
      await createModule({ address: module.address, name: module.name });
    }
    setModuleModalActive(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await deleteModule(props.id);
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
        className={`relative bg-slate-100 p-6 rounded-2xl aspect-square flex flex-col justify-between hover:bg-slate-200 transition-opacity ${isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}
        onClick={() => setModuleModalActive(true)}
      >
        <button
          className="absolute top-3 right-3 text-xl z-50 hover:text-red-600"
          onClick={handleDelete}
          disabled={isPending}
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
