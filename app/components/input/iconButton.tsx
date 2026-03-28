import { IconButtonVariant } from "@/shared-types";
import { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  variant?: IconButtonVariant;
}

const variantStyles: Record<
  IconButtonVariant,
  { button: string; icon: string }
> = {
  default: {
    button: "hover:bg-gray-light-medium",
    icon: "icon-default",
  },
  blue: {
    button: "bg-blue hover:bg-blue-dark",
    icon: "size-4 text-white",
  },
};

export default function IconButton({
  icon: Icon,
  onClick,
  variant = "default",
}: IconButtonProps) {
  const styles = variantStyles[variant];
  return (
    <button
      onClick={onClick}
      className={`relative size-6 flex items-center justify-center rounded-sm cursor-pointer ${styles.button}`}
    >
      <Icon className={`relative ${styles.icon}`} />
    </button>
  );
}
