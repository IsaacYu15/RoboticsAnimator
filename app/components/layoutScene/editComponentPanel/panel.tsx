"use client";

import { updateComponent } from "@/app/actions/components";
import { tryParseInt } from "@/app/services/parse";
import { Component as ComponentData } from "@/shared-types";
import { useEffect, useState } from "react";

export interface PanelProps {
  component: ComponentData;
}

export function Panel(props: PanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<string | null>(null);
  const [pin, setPin] = useState<number | null>(null);

  useEffect(() => {
    setType(props.component.type);
    setPin(props.component.pin);
  }, [props]);

  const onSubmit = async () => {
    const updatedObject = {
      type: type,
      pin: pin,
    };

    await updateComponent(props.component.id, updatedObject);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white h-screen p-5 flex flex-col justify-between border-l border-slate-200 shadow-xl">
      <form onSubmit={handleSave}>
        <div className="mb-5">
          <label className="block mb-2.5 text-sm font-medium text-heading">
            Type
          </label>
          <input
            value={type ?? "N/A"}
            onChange={(e) => setType(e.target.value)}
            className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base block w-full px-3 py-2.5"
            required
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2.5 text-sm font-medium text-heading">
            Pin
          </label>
          <input
            value={pin ?? "N/A"}
            onChange={(e) => setPin(tryParseInt(e.target.value) ?? 0)}
            className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base block w-full px-3 py-2.5"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="text-white bg-slate-900 p-3 rounded-2xl disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
