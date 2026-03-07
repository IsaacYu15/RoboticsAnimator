"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import ToastContainer from "../components/toast/toastContainer";

export interface Toast {
  id: string;
  message: string;
}

interface ToastContextValue {
  toast: (message: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
  dismiss: () => {},
});

const TOAST_DURATION = 4000;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message }]);

      setTimeout(() => {
        dismiss(id);
      }, TOAST_DURATION);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
