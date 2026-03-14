import { ComponentIcon } from "@/app/components/identifiers/componentIcon";

interface ComponentTagProps {
  name?: string;
  type?: string;
}

export default function ComponentTag(props: ComponentTagProps) {
  return (
    <div className="h-full w-full bg-white border border-gray-light-medium border-t-0 flex flex-row items-center gap-1 p-2">
      {ComponentIcon(props.type)}
      <h5>{props.name}</h5>
    </div>
  );
}
