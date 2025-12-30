"use client";

import { useEffect, useState } from "react";
import useModules from "../../hooks/useModules";

import ModuleManager from "../../components/moduleManager/moduleManager";
import ModuleModal from "../../components/moduleManager/moduleModal";
import { FormAction, ModuleDetails } from "@/types";

export default function Page() {
  const { modules, fetchModules, addModule } = useModules();
  const [moduleModalActive, setModuleModalActive] = useState<boolean>(false);

  const exitModule = () => {
    setModuleModalActive(false);
    fetchModules();
  };

  useEffect(() => {
    fetchModules();
  }, []);
  
  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={() => {
          setModuleModalActive(true);
        }}
        className="bg-slate-900 text-white p-2 w-fit rounded-2xl"
      >
        Add Modules
      </button>
      
      {moduleModalActive && (
        <ModuleModal
          onSubmit={addModule}
          exitModule={exitModule}
          details={{
            id: 0,
            name: "n/a",
            address: "n/a",
          }}
        ></ModuleModal>
      )}

      <div className="grid grid-cols-3 gap-5">
        {modules?.map((module: ModuleDetails) => {
          return (
            <ModuleManager
              key={module.id}
              id={module.id}
              name={module.name}
              address={module.address}
              mode={FormAction.UPDATE}
              onRefresh={fetchModules}
            ></ModuleManager>
          );
        })}
      </div>
    </div>
  );
}
