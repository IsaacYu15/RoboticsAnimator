"use client";

import { ConnectionStatus, AnimationEvent } from "@/shared-types";
import { getWebSocketUrl } from "@/shared-types/esp";
import { useCallback, useEffect, useRef, useState } from "react";
import useRetryConnection from "./useRetryConnection";

type ESPResponse = {
  currentTime: number;
  isPlaying: boolean;
  isPaused: boolean;
};

export default function useESPWebSocket(address?: string): {
  currentTime: number;
  isPlaying: boolean;
  isPaused: boolean;
  websocketStatus: ConnectionStatus;
  pauseResume: () => void;
  sendFrame: (entries: AnimationEvent[]) => void;
  websocketConnect: () => void;
  websocketDisconnect: () => void;
} {
  const socketRef = useRef<WebSocket | null>(null);
  const addressRef = useRef(address);
  const [currentTime, setCurrenTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const {
    retryStatus,
    retryConnectionTimeout,
    retryBegin,
    retryStop,
    retrySuccess,
    scheduleRetry,
  } = useRetryConnection();

  const connect = useCallback(() => {
    if (
      !addressRef.current ||
      socketRef.current?.readyState === WebSocket.OPEN ||
      socketRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    const ws = new WebSocket(getWebSocketUrl(addressRef.current));

    const connectionTimeoutId = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        console.log("WebSocket connection timeout");
        ws.close();
      }
    }, retryConnectionTimeout);

    ws.onopen = () => {
      clearTimeout(connectionTimeoutId);
      console.log("WebSocket connected to ESP");
      retrySuccess();
    };

    ws.onmessage = (event) => {
      try {
        const data: ESPResponse = JSON.parse(event.data);
        setCurrenTime(data.currentTime);
        setIsPlaying(data.isPlaying);
        setIsPaused(data.isPaused);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      clearTimeout(connectionTimeoutId);
      console.log("WebSocket disconnected");
      socketRef.current = null;
      scheduleRetry(connect);
    };

    ws.onerror = (error) => {
      clearTimeout(connectionTimeoutId);
      console.error("WebSocket error:", error);
    };

    socketRef.current = ws;
  }, [retryConnectionTimeout, retrySuccess, scheduleRetry]);

  const send = useCallback((message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.warn("WebSocket not connected, cannot send:", message);
    }
  }, []);

  const pauseResume = useCallback(() => {
    send(JSON.stringify({ type: "pauseResume" }));
  }, [send]);

  const sendFrame = useCallback(
    (entries: AnimationEvent[]) => {
      send(JSON.stringify({ type: "frame", data: entries }));
    },
    [send],
  );

  useEffect(() => {
    addressRef.current = address;
    if (address) {
      retryBegin();
      connect();
    }

    return () => {
      retryStop();
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const websocketConnect = useCallback(() => {
    retryBegin();
    connect();
  }, [retryBegin, connect]);

  const websocketDisconnect = useCallback(() => {
    retryStop();
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, [retryStop]);

  return {
    currentTime,
    isPlaying,
    isPaused,
    websocketStatus: retryStatus,
    pauseResume,
    sendFrame,
    websocketConnect,
    websocketDisconnect,
  };
}
