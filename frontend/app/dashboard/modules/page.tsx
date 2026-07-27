"use client";
import { CreateModule, FormAction } from "@/shared-types";
import ModuleManager from "./moduleManager";
import ModuleModal from "./moduleModal";
import { useModules } from "@/hooks/useModules";
import { useState } from "react";

export default function Page() {
  const { modules, createModule, updateModule, deleteModule } = useModules();
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = async (formData: CreateModule) => {
    await createModule(formData);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-5 p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Modules</h1>
        <form action={() => setIsOpen(true)}>
          <button
            type="submit"
            className="px-3 py-2 rounded-sm bg-blue text-white text-sm font-medium hover:bg-blue-dark"
          >
            Add Module
          </button>
        </form>
      </div>

      {isOpen && (
        <ModuleModal
          onSubmit={handleAdd}
          exitModule={() => setIsOpen(false)}
          details={{ id: 0, name: "", type: "", address: "" }}
        />
      )}

      <div className="flex flex-col gap-2">
        {modules?.map((module) => (
          <ModuleManager
            key={module.id}
            id={module.id}
            name={module.name ?? "N/A"}
            type={module.type}
            address={module.address}
            mode={FormAction.UPDATE}
            updateModule={updateModule}
            createModule={createModule}
            deleteModule={deleteModule}
          />
        ))}
      </div>
    </div>
  );
}
