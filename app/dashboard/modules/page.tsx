import { getModules } from "@actions/modules";
import { FormAction } from "@/shared-types";
import ModuleManager from "./moduleManager";
import AddModuleButton from "./addModuleButton";

export default async function Page() {
  const modules = await getModules();

  return (
    <div className="flex flex-col gap-5 p-10">
      <AddModuleButton />

      <div className="grid grid-cols-3 gap-5">
        {modules?.map((module) => (
          <ModuleManager
            key={module.id}
            id={module.id}
            name={module.name ?? "N/A"}
            address={module.address}
            mode={FormAction.UPDATE}
          />
        ))}
      </div>
    </div>
  );
}
