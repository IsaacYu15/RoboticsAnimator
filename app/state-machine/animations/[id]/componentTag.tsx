export interface ComponentTagProps {
  name: string | null;
  selected: boolean;
}

export default function ComponentTag(props: ComponentTagProps) {
  return <div className="h-10 bg-white">{props.name}</div>;
}
