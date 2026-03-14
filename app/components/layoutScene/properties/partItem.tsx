import { ComponentIcon } from "../../identifiers/componentIcon";

interface PartItemProps {
  name?: string;
  type?: string;
  level: number;
  selected: boolean;
  setSelected: () => void;
}

const LEVEL_INDENTATION = 16;

export default function PartItem({
  name,
  type,
  level,
  selected,
  setSelected,
}: PartItemProps) {
  return (
    <button
      onClick={setSelected}
      className={`w-full  rounded-lg py-1 px-2 ${
        selected ? "bg-blue-light" : "hover:bg-gray-light-medium"
      }`}
    >
      <div
        className={`flex flex-row items-center gap-1 h-8`}
        style={{ paddingLeft: level * LEVEL_INDENTATION }}
      >
        {ComponentIcon(type)}
        <h5>{name}</h5>
      </div>
    </button>
  );
}
