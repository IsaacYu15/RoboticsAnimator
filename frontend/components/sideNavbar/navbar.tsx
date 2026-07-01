"use client";

import { usePathname } from "next/navigation";
import NavButton from "./button";
import { NavSections, NavSection } from "./sections";

export default function Navbar() {
  const pathName = usePathname();

  return (
    <nav className="flex flex-col gap-3 p-8 bg-gray-light w-fit">
      {NavSections.map((section: NavSection, id: number) => {
        const isActive = pathName == section.href;

        return (
          <NavButton
            key={id}
            name={section.name}
            href={section.href}
            active={isActive}
          ></NavButton>
        );
      })}
    </nav>
  );
}
