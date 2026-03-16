"use client";

import { useState } from "react";

type Field = {
  value: number;
  onValidate: (value: string) => void;
  barColor?: string;
};

interface SimpleInputFieldProps {
  label: string;
  fields: Field[];
}

function Input({ field }: { field: Field }) {
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
    <div className="relative flex-1 min-w-0 max-w-1/2">
      {field.barColor && (
        <div
          className="absolute left-1 top-1.75 bottom-1.75 w-1 rounded-lg"
          style={{ backgroundColor: field.barColor }}
        />
      )}
      <input
        type="text"
        inputMode="decimal"
        className="w-full input-default text-right"
        value={editValue ?? field.value}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </div>
  );
}

export default function SimpleInputField({
  label,
  fields,
}: SimpleInputFieldProps) {
  return (
    <div className="flex flex-row items-center justify-between">
      <p className="flex-1">{label}</p>

      <div className="flex flex-row items-start justify-end gap-2 w-2/3">
        {fields.map((field, index) => (
          <Input key={`${label}-${index}`} field={field} />
        ))}
      </div>
    </div>
  );
}
