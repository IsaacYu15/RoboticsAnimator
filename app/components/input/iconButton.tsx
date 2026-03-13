import { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon;
  onClick: () => void;
}

export default function IconButton({ icon: Icon, onClick }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative cursor-pointer before:absolute before:-inset-1 before:rounded-lg hover:before:bg-gray-light-medium"
    >
      <Icon className="icon-default relative" />
    </button>
  );
}
