import { LucideIcon } from "lucide-react";

export enum CircleButtonSize {
  Small,
  Large,
}

interface CircleButtonProps {
  icon?: LucideIcon;
  onClick: () => void;
  size?: CircleButtonSize;
  active?: boolean;
  children?: React.ReactNode;
}

const sizeClasses: Record<CircleButtonSize, { button: string; icon: string }> =
  {
    [CircleButtonSize.Small]: {
      button: "size-12",
      icon: "size-6",
    },
    [CircleButtonSize.Large]: {
      button: "size-16",
      icon: "size-8",
    },
  };

export default function CircleButton({
  icon: Icon,
  onClick,
  size = CircleButtonSize.Large,
  active = false,
  children,
}: CircleButtonProps) {
  const sizeClass = sizeClasses[size];

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded-full border-2 border-blue text-white text-sm font-medium
        ${sizeClass.button}
        ${active ? "bg-blue-dark" : "bg-blue hover:bg-blue-dark"}
        cursor-pointer relative`}
    >
      {Icon && <Icon className={`text-white ${sizeClass.icon}`} />}
      {children && <>{children}</>}
    </button>
  );
}
