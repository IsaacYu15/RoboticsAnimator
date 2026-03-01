import { ComponentType } from "@/app/constants/components";
import { SettingsIcon } from "lucide-react";

export interface ItemProps {
  name: string | null;
  type: ComponentType;
  level: number;
  selected: boolean;
  setSelected: () => void;
}

const LEVEL_INDENTATION = 16;

export default function Item({
  name,
  type,
  selected,
  setSelected,
  level,
}: ItemProps) {
  const getIcon = () => {
    switch (type) {
      case ComponentType.SERVO:
        return <SettingsIcon className="icon-default" />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={setSelected}
      className={`w-full  rounded-lg py-1 px-2 ${
        selected ? "bg-blue-light" : "hover:bg-gray-light-medium"
      }`}
    >
      <div
        className={`flex flex-row items-center gap-1 h-8`}
        style={{ paddingLeft: `${level * LEVEL_INDENTATION}px` }}
      >
        {getIcon()}
        <h5>{name}</h5>
      </div>
    </button>
  );
}
