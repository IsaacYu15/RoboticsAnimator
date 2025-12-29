"use client";

import { ModuleDetails } from "@/types";
import { HiOutlineRefresh } from "react-icons/hi";

import { useEffect, useState } from "react";

export default function ModuleManager(props: ModuleDetails) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const checkModuleConnection = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(`http://${props.address}/status`, {
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

  useEffect(() => {
    checkModuleConnection();
  }, [props.address]);

  return (
    <div className="bg-slate-100 p-6 rounded-2xl aspect-square w-1/3 flex flex-col justify-between">
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
            {isLoading ? "loading" : isConnected ? "connected" : "disconnected"}
          </p>
          <div />
        </div>
        <button
          onClick={checkModuleConnection}
          className={` ${isLoading ? "animate-spin" : ""} `}
        >
          <HiOutlineRefresh></HiOutlineRefresh>
        </button>
      </div>
    </div>
  );
}
