import { ComponentType } from "@/app/constants/components";
import { Component } from "@/shared-types/components";
import Item from "./item";

interface ItemHeirachyProps {
  components: Component[];
  selectedComponentId: number | null;
  setSelectedComponentId: (id: number) => void;
}

export default function ItemHeirachy({
  components,
  selectedComponentId,
  setSelectedComponentId,
}: ItemHeirachyProps) {
  return (
    <div className="w-full px-6 py-4 pb-4">
      {components.map((component) => (
        <Item
          key={component.id}
          name={component.name}
          type={component.type as ComponentType}
          selected={component.id === selectedComponentId}
          setSelected={() => {
            setSelectedComponentId(component.id);
          }}
          level={0}
        ></Item>
      ))}
    </div>
  );
}
