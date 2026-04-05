export const isInputFieldFocused = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement;

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
};
