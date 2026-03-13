"use client";

import { useState } from "react";

type Field = {
  value: number;
  onValidate: (value: string) => void;
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
    <input
      type="text"
      inputMode="decimal"
      className="flex-1 min-w-0 max-w-1/2 input-default text-right"
      value={editValue ?? field.value}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}

export default function SimpleInputField({ label, fields }: SimpleInputFieldProps) {
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
