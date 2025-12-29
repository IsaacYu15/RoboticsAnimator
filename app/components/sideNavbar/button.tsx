export interface NavButtonProps {
  name: string;
  href: string;
  active: boolean;
}

export default function NavButton(props: NavButtonProps) {
  return (
    <a
      href={props.href}
      className={`
        font-semibold p-2 rounded-b-sm
        ${props.active ? "text-gray-50 bg-gray-50/5" : "text-gray-400 hover:text-gray-50"}
        `}
    >
      {props.name}
    </a>
  );
}
