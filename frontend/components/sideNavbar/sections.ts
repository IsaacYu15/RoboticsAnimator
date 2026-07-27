import {
  DASHBOARD_ANIMATION_ROUTE,
  DASHBOARD_ROUTE,
  DASHBOARD_MODULE_ROUTE,
} from "@/constants";

export interface NavSection {
  name: string;
  href: string;
}

export const NavSections: NavSection[] = [
  { name: "Dashboard", href: DASHBOARD_ROUTE },
  { name: "Animations", href: DASHBOARD_ANIMATION_ROUTE },
  { name: "Modules", href: DASHBOARD_MODULE_ROUTE },
];
