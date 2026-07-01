interface NavButtonProps {
  name: string;
  href: string;
  active: boolean;
}

export default function NavButton(props: NavButtonProps) {
  return (
    <a
      href={props.href}
      className={`
         p-2 rounded-sm
        ${props.active ? "text-gray-dark bg-gray-light-medium" : "text-gray-light"}
        `}
    >
      {props.name}
    </a>
  );
}
