interface PlaybackSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function PlaybackSlider({ value, onChange }: PlaybackSliderProps) {
  const MAX_SPEED = 2.0;
  const MIN_SPEED = 0.25;

  return (
    <div className="absolute bottom-full p-2 w-48">
      <input
        type="range"
        min={MIN_SPEED}
        max={MAX_SPEED}
        step={0.25}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-medium"
      />
    </div>
  );
}
