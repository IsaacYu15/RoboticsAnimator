import { Pause, Play, Zap, ZapOff } from "lucide-react";

interface TimelineToolbarProps {
  isPlaying: boolean;
  handlePlay: () => void;
  isLiveMode: boolean;
  setIsLiveMode: (live: boolean) => void;
}

export default function TimelineToolbar({
  isPlaying,
  handlePlay,
  isLiveMode,
  setIsLiveMode,
}: TimelineToolbarProps) {
  const playIconClasses = `size-4 ${isPlaying ? "text-blue-dark" : "text-gray-medium-dark"} hover:text-blue-dark`;
  const liveIconClasses = `size-4 ${isLiveMode ? "text-green-dark" : "text-gray-medium-dark"} hover:text-green-dark`;

  return (
    <div className="flex flex-row gap-2 items-center justify-center">
      <button onClick={handlePlay} className="cursor-pointer">
        {isPlaying ? (
          <Pause className={playIconClasses} />
        ) : (
          <Play className={playIconClasses} />
        )}
      </button>
      <button
        onClick={() => setIsLiveMode(!isLiveMode)}
        className="cursor-pointer"
      >
        {isLiveMode ? (
          <Zap className={liveIconClasses} />
        ) : (
          <ZapOff className={liveIconClasses} />
        )}
      </button>
    </div>
  );
}
