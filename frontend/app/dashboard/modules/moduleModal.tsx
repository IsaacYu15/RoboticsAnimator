import { useState } from "react";

import { Module } from "@/shared-types";
import { HiX } from "react-icons/hi";

interface ModuleModalProps {
  onSubmit: (module: Module) => void;
  exitModule: () => void;
  details: Module;
}

export default function ModuleModal(props: ModuleModalProps) {
  const [name, setName] = useState(props.details.name);
  const [type, setType] = useState(props.details.type);
  const [address, setAddress] = useState(props.details.address);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await props.onSubmit({
        id: props.details.id,
        name: name,
        type: type,
        address: address,
      });
      props.exitModule();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute top-0 left-0 w-screen h-screen bg-black/50 flex flex-col items-center justify-center z-50">
      <div className="bg-slate-100 rounded-2xl p-4 relative">
        <button className="absolute right-3" onClick={props.exitModule}>
          <HiX></HiX>
        </button>
        <form onSubmit={handleSave}>
          <div className="mb-5">
            <label className="block mb-2.5 text-sm font-medium text-heading">
              Module Name
            </label>
            <input
              value={name ?? "N/A"}
              onChange={(e) => setName(e.target.value)}
              className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base block w-full px-3 py-2.5"
              required
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2.5 text-sm font-medium text-heading">
              Type
            </label>
            <input
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base block w-full px-3 py-2.5"
              required
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2.5 text-sm font-medium text-heading">
              Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base block w-full px-3 py-2.5"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3 py-2 rounded-sm bg-blue text-white disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
