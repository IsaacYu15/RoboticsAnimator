import { ComponentType } from "@/app/constants/components";
import { ObjectType } from "@/shared-types";
import { SettingsIcon } from "lucide-react";

export function getObjectType(componentType: string | null): ObjectType | null {
  switch (componentType) {
    case ComponentType.SERVO:
      return ObjectType.SG90_SERVO;
    default:
      return null;
  }
}

export function getComponentIcon(type: string | null) {
  switch (type) {
    case ComponentType.SERVO:
      return <SettingsIcon className="icon-default" />;
    default:
      return null;
  }
}
