import {
  DASHBOARD_ROUTE,
  MODULES_ROUTE,
  STATE_MACHINE_ROUTE,
} from "@/app/constants";

export interface NavSection {
  name: string;
  href: string;
}

export const NavSections: NavSection[] = [
  { name: "Home", href: DASHBOARD_ROUTE },
  { name: "Modules", href: MODULES_ROUTE },
  { name: "Animator", href: STATE_MACHINE_ROUTE },
];
