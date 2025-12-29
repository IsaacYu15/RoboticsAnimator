"use client";

import { useEffect, useState } from "react";

import ModuleManager from "../../components/moduleManager/moduleManager";
import { ModuleDetails } from "@/types";

export default function Page() {
  const [modules, setModules] = useState<ModuleDetails[]>([]);

  const getModules = async () => {
    const response = await fetch("/api/ports");
    const data = await response.json();

    setModules(data as ModuleDetails[]);
  };
  
  useEffect(() => {
    if (modules?.length == 0) {
      getModules();
    }
  }, [modules]);

  return (
    <div>
      {modules.map((module: ModuleDetails) => {
        return (
          <ModuleManager
            key={module.id}
            id={module.id}
            name={module.name}
            address={module.address}
          ></ModuleManager>
        );
      })}
    </div>
  );
}
