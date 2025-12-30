"use client";

import useAnimations from "@/app/hooks/useAnimations";
import useModules from "@/app/hooks/useModules";
import { executeAnimationEvents } from "@/app/services/animationService";
import { ModuleDetails } from "@/types";
import { useEffect, useState } from "react";

export default function Page() {
  const { animations, fetchAnimations } = useAnimations();
  const { modules, fetchModules } = useModules();
  const [ moduleIdDictionary, setModuleIdDictionary ]= useState<Map<number, ModuleDetails>>(new Map());

  useEffect(() => {
    fetchAnimations();

    fetchModules().then((fetchedModules) => {
      const tempDictionary = new Map<number, ModuleDetails>();

      fetchedModules.forEach((module: ModuleDetails) => {
        tempDictionary.set(module.id as number, {
          id: module.id,
          address: module.address,
          name: module.name,
        });
      });

      setModuleIdDictionary(tempDictionary);
    });
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative overflow-x-auto border border-default">
        <table className="w-full text-sm text-left rtl:text-right text-body">
          <thead className="text-sm border-b border-default-medium">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium">
                module id
              </th>
              <th scope="col" className="px-6 py-3 font-medium">
                pin
              </th>
              <th scope="col" className="px-6 py-3 font-medium">
                delay
              </th>
              <th scope="col" className="px-6 py-3 font-medium">
                action
              </th>
            </tr>
          </thead>
          <tbody>
            {animations?.map((event, id) => {
              return (
                <tr key={id}>
                  <th className="px-6 py-4">{event.module_id}</th>
                  <td className="px-6 py-4">{event.pin}</td>
                  <td className="px-6 py-4">{event.delay}</td>
                  <td className="px-6 py-4">{event.action}</td>
                  <td className="flex items-center px-6 py-4">
                    <a href="#" className="hover:underline">
                      Edit
                    </a>
                    <a href="#" className="hover:underline ms-3">
                      Remove
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button
        onClick={() => executeAnimationEvents(animations ?? [], moduleIdDictionary ?? [])}
        className="bg-slate-900 text-white p-2 w-fit rounded-2xl"
      >
        Trigger Animation
      </button>
    </div>
  );
}
