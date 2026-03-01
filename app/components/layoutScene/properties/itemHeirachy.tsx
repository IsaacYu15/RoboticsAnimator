import { ComponentType } from "@/app/constants/components";
import { Component } from "@/shared-types/components";
import Item from "./item";

interface ItemHeirachyProps {
  components: Component[];
}

export default function ItemHeirachy({ components }: ItemHeirachyProps) {
  return (
    <div className="w-full px-6 py-4 pb-4">
      {components.map((component) => (
        <Item
          key={component.id}
          name={component.name}
          type={component.type as ComponentType}
          selected={false}
          setSelected={() => {}}
          level={0}
        ></Item>
      ))}
    </div>
  );
}
