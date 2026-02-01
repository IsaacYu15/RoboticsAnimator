"use client";

import { updateAnimationEvent } from "@/app/actions/animation-event";
import { deleteAnimationEvent } from "@/app/actions/animation-event";
import { AnimationEvent } from "@/shared-types";
import { useState } from "react";

interface KeyframeTooltipProps {
  event: AnimationEvent;
  onClose: () => void;
}

export default function KeyframeTooltip({
  event,
  onClose,
}: KeyframeTooltipProps) {
  const [action, setAction] = useState(event.action);

  const handleSave = async () => {
    await updateAnimationEvent(event.id, { action });
    onClose();
  };

  const handleDelete = async () => {
    await deleteAnimationEvent(event.id);
    onClose();
  };

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white p-2 rounded-md shadow-lg z-10">
      <div className="flex flex-col gap-2">
        <div>
          <label htmlFor="action" className="sr-only">
            Action (degrees)
          </label>
          <input
            type="text"
            id="action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm"
          />
        </div>
        <div className="flex justify-between gap-2">
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
