"use client";

import type { FC, SVGProps } from "react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

type SvgIcon = FC<SVGProps<SVGSVGElement>>;

type Field = {
  value: number;
  onValidate: (value: string) => void;
};

interface IconInputFieldProps {
  icon?: LucideIcon | SvgIcon;
  label?: string;
  field: Field;
}

export default function IconInputField({
  icon: Icon,
  label,
  field,
}: IconInputFieldProps) {
  const [editValue, setEditValue] = useState<string>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(String(e.target.value));
  };

  const handleBlur = () => {
    if (editValue !== undefined) {
      field.onValidate(editValue);
    }
    setEditValue(undefined);
  };

  return (
    <div className="relative">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
        {Icon && <Icon className="icon-default" />}
        {label && <p className="shrink-0">{label}</p>}
      </div>
      <input
        type="text"
        inputMode="decimal"
        className="w-full min-w-0 input-default text-right"
        value={editValue ?? field.value}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </div>
  );
}
