"use client";

import { useState } from "react";
import ModuleModal from "./moduleModal";
import { createModule } from "@actions/modules";
import { CreateModuleInput } from "@shared-types";

export default function AddModuleButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = async (formData: CreateModuleInput) => {
    await createModule(formData);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-slate-900 text-white p-2 w-fit rounded-2xl hover:bg-slate-800"
      >
        Add Module
      </button>

      {isOpen && (
        <ModuleModal
          onSubmit={handleAdd}
          exitModule={() => setIsOpen(false)}
          details={{ id: 0, name: "", address: "" }}
        />
      )}
    </>
  );
}
