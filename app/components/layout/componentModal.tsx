"use client";

import useComponents from "@/app/hooks/useComponents";
import { tryParseInt } from "@/app/services/parse";
import { ComponentDetails } from "@/types";
import { useEffect, useState } from "react";
import { HiX } from "react-icons/hi";

export interface ComponentModalProps extends ComponentDetails {
  exitModal: () => void;
}

export function ComponentModal(props: ComponentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<string>("");
  const [pin, setPin] = useState<number>(0);
  const { updateComponent, addComponent } = useComponents();

  useEffect(() => {
    setType(props.type);
    setPin(props.pin);
  }, [props]);

  const onSubmit = async () => {
    const updatedObject = {
      id: props.id,
      type: type,
      pin: pin,
      x: props.x,
      y: props.y,
    };

    if (props.id == 0) {
      await addComponent(updatedObject);
    } else {
      await updateComponent(updatedObject);
    }

    props.exitModal();
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
    <div className="absolute top-0 left-0 w-screen h-screen bg-black/50 flex flex-col items-center justify-center z-50">
      <div className="bg-slate-100 rounded-2xl p-4 relative">
        <button className="absolute right-3" onClick={() => props.exitModal()}>
          <HiX></HiX>
        </button>
        <form onSubmit={handleSave}>
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
              Pin
            </label>
            <input
              value={pin}
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
    </div>
  );
}
