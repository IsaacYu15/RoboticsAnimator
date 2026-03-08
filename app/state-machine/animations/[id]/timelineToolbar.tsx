"use client";

import { useState } from "react";
import { FastForward, Pause, Play, RotateCcw, Zap, ZapOff } from "lucide-react";
import CircleButton, {
  CircleButtonSize,
} from "@/app/components/input/circleButton";

export interface TimelineToolbarProps {
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onFastForward: () => void;
  onRestart: () => void;
  isLiveMode: boolean;
  setIsLiveMode: (live: boolean) => void;
}

export default function TimelineToolbar({
  playbackSpeed,
  setPlaybackSpeed,
  isPlaying,
  setIsPlaying,
  onFastForward,
  onRestart,
  isLiveMode,
  setIsLiveMode,
}: TimelineToolbarProps) {
  const [showSpeedSlider, setShowSpeedSlider] = useState(false);
  const MAX_SPEED = 2.0;
  const MIN_SPEED = 0.25;
  const SPEED_STEP = 0.25;

  return (
    <div className="flex flex-row gap-2 items-center justify-center p-2">
      <div className="relative">
        <CircleButton
          onClick={() => setShowSpeedSlider(!showSpeedSlider)}
          size={CircleButtonSize.Small}
          active={showSpeedSlider}
        >
          {Number.isInteger(playbackSpeed)
            ? playbackSpeed.toFixed(1)
            : playbackSpeed}
          x
        </CircleButton>
        {showSpeedSlider && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 p-2 w-32">
            <input
              type="range"
              min={MIN_SPEED}
              max={MAX_SPEED}
              step={SPEED_STEP}
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-medium
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-blue
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-blue
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:cursor-pointer"
              onMouseUp={() => setShowSpeedSlider(false)}
            />
          </div>
        )}
      </div>
      <CircleButton
        icon={FastForward}
        onClick={onFastForward}
        size={CircleButtonSize.Small}
      />
      <CircleButton
        icon={isPlaying ? Pause : Play}
        onClick={() => setIsPlaying(!isPlaying)}
        size={CircleButtonSize.Large}
        active={isPlaying}
      />
      <CircleButton
        icon={RotateCcw}
        onClick={onRestart}
        size={CircleButtonSize.Small}
      />
      <CircleButton
        icon={isLiveMode ? ZapOff : Zap}
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
