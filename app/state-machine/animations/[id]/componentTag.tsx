import { ComponentIcon } from "@/app/components/identifiers/componentIcon";

interface ComponentTagProps {
  name?: string;
  type?: string;
  selected: boolean;
}

export default function ComponentTag(props: ComponentTagProps) {
  return (
    <div className="h-full w-full bg-white border-2 border-gray-light-medium border-t-0 flex flex-row items-center gap-1">
      {ComponentIcon(props.type)}
      {props.name}
    </div>
  );
}
