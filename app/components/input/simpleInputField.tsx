type Field = {
  value: number;
  onChange: (value: string) => void;
};

interface SimpleInputFieldProps {
  label: string;
  fields: Field[];
}

export default function SimpleInputField(props: SimpleInputFieldProps) {
  return (
    <div className="flex flex-row items-center justify-between">
      <p className="flex-1">{props.label}</p>

      <div className="flex flex-row items-start justify-end gap-2 w-2/3">
        {props.fields.map((field, index) => (
          <input
            key={index}
            className="flex-1 min-w-0 max-w-1/2 bg-white border-gray-light-medium border-2 rounded-lg px-2 py-1 text-right text-xs"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
          ></input>
        ))}
      </div>
    </div>
  );
}
