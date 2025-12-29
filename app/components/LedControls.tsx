export interface ControlsProps {
  title: string;
  pin: number;
  state: string;
  loading: boolean;
  controlLED: (pin: number, state: string) =>void;
}

export default function LedControls(props: ControlsProps) {

  return (
    <div className="flex-1 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
            {props.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Status:
          </span>

        </div>

        <div className="flex gap-2">
          <button
            onClick={() => props.controlLED(props.pin, "on")}
            disabled={props.loading || props.state === "on"}
            className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Turn ON
          </button>
          <button
            onClick={() => props.controlLED(props.pin, "off")}
            disabled={props.loading || props.state === "off"}
            className="flex-1 rounded-lg bg-zinc-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Turn OFF
          </button>
        </div>
      </div>
    </div>
  );
}
