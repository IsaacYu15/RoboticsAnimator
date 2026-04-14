"use client";

import { useEffect, useRef } from "react";

export interface ContextMenuItem {
  key: string;
  label: string;
}

interface ContextMenuProps {
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onSelect: (key: string) => void;
  onClose: () => void;
}

export default function ContextMenu({
  position,
  items,
  onSelect,
  onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      onClose();
    };
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("wheel", handleScroll);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("wheel", handleScroll);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-200 bg-white border border-gray-light-medium rounded-sm py-1 flex flex-col"
      style={{ left: position.x, top: position.y }}
    >
      {items.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className="text-left px-2 py-1 text-sm hover:bg-gray-light-medium cursor-pointer whitespace-nowrap"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
