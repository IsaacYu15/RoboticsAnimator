"use client";

import { X } from "lucide-react";

export interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export default function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div className="bg-gray-medium-dark text-white px-4 py-3 rounded-lg flex items-center gap-3 shadow-lg min-w-64 max-w-80">
      <span className="flex-1 text-white text-sm">{message}</span>
      <button
        onClick={onDismiss}
        className="cursor-pointer hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}
