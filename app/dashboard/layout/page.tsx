"use server";

import { getComponents } from "@/app/actions/components";
import LayoutScene from "../../components/layoutScene/layoutScene";

export default async function Page() {
  const components = await getComponents();

  return (
    <div className="h-full w-full">
      <LayoutScene components={components} />
    </div>
  );
}
