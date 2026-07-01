"use client";

import { ConnectionStatus } from "@/shared-types";
import { getHttpUrl } from "@/shared-types/esp";
import { useCallback, useEffect, useRef } from "react";
import useRetryConnection from "./useRetryConnection";

export default function useESPWebServer(address?: string): {
  serverStatus: ConnectionStatus;
  checkServerStatus: () => void;
} {
  const addressRef = useRef(address);

  const {
    retryStatus,
    retryConnectionTimeout,
    retryBegin,
    retryStop,
    retrySuccess,
    scheduleRetry,
  } = useRetryConnection();

  const connect = useCallback(async () => {
    if (!addressRef.current) return;

    try {
      const response = await fetch(getHttpUrl(addressRef.current, "/status"), {
        signal: AbortSignal.timeout(retryConnectionTimeout),
      });
      if (response.ok) {
        retrySuccess();
      } else {
        scheduleRetry(connect);
      }
    } catch (error) {
      console.log(`Error connecting to module: ${error}`);
      scheduleRetry(connect);
    }
  }, [retryConnectionTimeout, retrySuccess, scheduleRetry]);

  useEffect(() => {
    addressRef.current = address;
    if (address) {
      retryBegin();
      connect();
    }

    return () => {
      retryStop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const checkServerStatus = useCallback(() => {
    retryBegin();
    connect();
  }, [retryBegin, connect]);

  return {
    serverStatus: retryStatus,
    checkServerStatus,
  };
}
