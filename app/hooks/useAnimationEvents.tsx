import { AnimationEvent } from "@/types";
import { useState } from "react";

export default function useAnimationEvents() {
  const [animationEvents, setAnimationEvents] = useState<AnimationEvent[]>([]);
  const [animationEventsMap, setAnimationEventsMap] = useState<
    Map<number, AnimationEvent>
  >(new Map());

  const fetchAnimationEvents = async (animationId?: number) => {
    try {
      const url = animationId
        ? `/api/animation-events?animation_id=${animationId}`
        : "/api/animation-events";

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch animation events");
      }
      const data = await response.json();
      setAnimationEvents(data);

      const tempMap = new Map<number, AnimationEvent>();
      data.forEach((value: AnimationEvent) => {
        tempMap.set(value.id, value);
      });
      setAnimationEventsMap(tempMap);

      return data;
    } catch (error) {
      console.error("Failed to fetch animation events:", error);
      return [];
    }
  };

  const getAnimationEventById = async (id: number) => {
    try {
      const response = await fetch(`/api/animation-events/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch animation event");
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch animation event with id ${id}:`, error);
      return null;
    }
  };

  const addAnimationEvent = async (details: AnimationEvent) => {
    try {
      const response = await fetch("/api/animation-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(details),
      });
      if (!response.ok) {
        throw new Error("Failed to add animation event");
      }
      const newEvent = await response.json();
      await fetchAnimationEvents();
      return newEvent;
    } catch (error) {
      console.error("Failed to add animation event:", error);
      throw error;
    }
  };

  const updateAnimationEvent = async (details: AnimationEvent) => {
    try {
      const response = await fetch(`/api/animation-events/${details.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(details),
      });
      if (!response.ok) {
        throw new Error("Failed to update animation event");
      }
      const updatedEvent = await response.json();
      await fetchAnimationEvents();
      return updatedEvent;
    } catch (error) {
      console.error("Failed to update animation event:", error);
      throw error;
    }
  };

  const deleteAnimationEvent = async (id: number) => {
    try {
      const response = await fetch(`/api/animation-events/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete animation event");
      }
      await fetchAnimationEvents();
    } catch (error) {
      console.error("Failed to delete animation event:", error);
      throw error;
    }
  };

  return {
    animationEvents,
    animationEventsMap,
    fetchAnimationEvents,
    getAnimationEventById,
    addAnimationEvent,
    updateAnimationEvent,
    deleteAnimationEvent,
  };
}
