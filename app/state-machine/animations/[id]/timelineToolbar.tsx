import { Pause, Play, RotateCcw, Zap, ZapOff } from "lucide-react";
import CircleButton, {
  CircleButtonSize,
} from "@/app/components/input/circleButton";

interface TimelineToolbarProps {
  isPlaying: boolean;
  handlePlay: () => void;
  onRestart: () => void;
  isLiveMode: boolean;
  setIsLiveMode: (live: boolean) => void;
}

export default function TimelineToolbar({
  isPlaying,
  handlePlay,
  onRestart,
  isLiveMode,
  setIsLiveMode,
}: TimelineToolbarProps) {
  return (
    <div className="flex flex-row gap-2 items-center justify-center p-2">
      <CircleButton
        icon={RotateCcw}
        onClick={onRestart}
        size={CircleButtonSize.Small}
      />
      <CircleButton
        icon={isPlaying ? Pause : Play}
        onClick={handlePlay}
        size={CircleButtonSize.Large}
        active={isPlaying}
      />
      <CircleButton
        icon={isLiveMode ? Zap : ZapOff}
        onClick={() => setIsLiveMode(!isLiveMode)}
        size={CircleButtonSize.Small}
        active={isLiveMode}
      >
        <div
          className={`absolute -top-0.5 -right-0.5 size-4 ${isLiveMode ? "bg-green" : "bg-red"} border-2 border-blue rounded-full`}
        ></div>
      </CircleButton>
    </div>
  );
}
