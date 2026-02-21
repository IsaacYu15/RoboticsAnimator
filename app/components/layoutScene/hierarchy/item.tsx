export interface ItemProps {
  name: string | null;
  level: number;
}

export default function Item(props: ItemProps) {
  return (
    <div>
      <h1>{props.name}</h1>
    </div>
  );
}
