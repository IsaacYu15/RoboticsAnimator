import { DASHBOARD_ANIMATION_ROUTE } from "@/constants";

export interface NavSection {
  name: string;
  href: string;
}

export const NavSections: NavSection[] = [
  { name: "Animations", href: DASHBOARD_ANIMATION_ROUTE },
];
