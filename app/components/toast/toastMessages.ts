export const ToastMessages = {
  ASSET_SAVED: "Asset saved",
  ERROR: (message: string | undefined) =>
    `Error: ${message ?? "Unknown error"}`,
};
