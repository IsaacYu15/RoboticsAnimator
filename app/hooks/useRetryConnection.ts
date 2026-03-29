"use client";

import { ConnectionStatus } from "@/shared-types";
import { useCallback, useRef, useState } from "react";

export interface RetryConfig {
  maxRetries?: number;
  connectionTimeout?: number;
}

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_CONNECTION_TIMEOUT = 500;

export default function useRetryConnection(config?: RetryConfig) {
  const maxRetries = config?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const connectionTimeout =
    config?.connectionTimeout ?? DEFAULT_CONNECTION_TIMEOUT;

  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const retryCountRef = useRef(0);
  const shouldRetryRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearRetryTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleRetry = useCallback(
    (connectFn: () => void) => {
      if (shouldRetryRef.current && retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        console.log(
          `Reconnecting... attempt ${retryCountRef.current}/${maxRetries}`,
        );
        setStatus("connecting");
        timeoutRef.current = setTimeout(connectFn, connectionTimeout);
      } else {
        setStatus("disconnected");
      }
    },
    [maxRetries, connectionTimeout],
  );

  const retrySuccess = useCallback(() => {
    retryCountRef.current = 0;
    setStatus("connected");
  }, []);

  const retryBegin = useCallback(() => {
    clearRetryTimeout();
    shouldRetryRef.current = true;
    retryCountRef.current = 0;
    setStatus("connecting");
  }, [clearRetryTimeout]);

  const retryStop = useCallback(() => {
    shouldRetryRef.current = false;
    clearRetryTimeout();
    setStatus("disconnected");
  }, [clearRetryTimeout]);

  return {
    retryStatus: status,
    retryConnectionTimeout: connectionTimeout,
    retryBegin,
    retryStop,
    retrySuccess,
    scheduleRetry,
  };
}
