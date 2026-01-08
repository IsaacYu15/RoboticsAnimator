import { ComponentDetails } from "@/types";
import { useState } from "react";

export default function useComponents() {
  const [components, setComponents] = useState<ComponentDetails[]>();

  const fetchComponents = async () => {
    const response = await fetch("/api/components");
    const data = await response.json();

    setComponents(data as ComponentDetails[]);

    return components;
  };

  const updateComponent = async (details: ComponentDetails) => {
    const response = await fetch("/api/components", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: details.id,
        type: details.type,
        pin: details.pin,
        x: details.x,
        y: details.y,
      }),
    });

    console.log(response);
  };

  const addComponent = async (details: ComponentDetails) => {
    const response = await fetch("/api/components", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: details.id,
        type: details.type,
        pin: details.pin,
        x: details.x,
        y: details.y,
      }),
    });

    console.log(response);
  };

  return { components, fetchComponents, updateComponent, addComponent };
}
