"use client";

import { Toast as ToastType } from "@/app/context/toastContext";
import Toast from "./toast";

interface ToastContainerProps {
  toasts: ToastType[];
  dismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, dismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          onDismiss={() => dismiss(toast.id)}
        />
      ))}
    </div>
  );
}
