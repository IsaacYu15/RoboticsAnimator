export interface TabButtonProps {
  text: string;
  active: boolean;
  onClick: () => void;
}

export default function TabButton({ text, active, onClick }: TabButtonProps) {
  return (
    <button
      className={`py-1 px-2 rounded-lg hover:bg-gray-light-medium
        ${active ? "bg-gray-light-medium text-gray-medium-dark" : "bg-transparent text-gray-medium"}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
