import { ConnectionStatus } from "@/shared-types";
import { RefreshCcw } from "lucide-react";

interface StatusDisplayProps {
  status: ConnectionStatus;
  label: string;
  connect: () => void;
}

export default function StatusDisplay({
  status,
  label,
  connect,
}: StatusDisplayProps) {
  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-row items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-green-500" : status === "connecting" ? "bg-yellow-500" : "bg-red-500"}`}
        ></div>
        <p>{label}</p>
      </div>
      <button
        onClick={connect}
        className={`relative size-3 flex items-center justify-center rounded-sm cursor-pointer ${status === "connecting" ? "animate-spin" : ""}`}
      >
        <RefreshCcw className="icon-default" />
      </button>
    </div>
  );
}
