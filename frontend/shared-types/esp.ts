const ESP_HTTP_PORT = 80;
const ESP_WEBSOCKET_PORT = 81;

export function getHttpUrl(address?: string, path: string = ""): string {
  if (!address) {
    return "";
  }

  return `http://${address}:${ESP_HTTP_PORT}${path}`;
}

export function getWebSocketUrl(address?: string): string {
  if (!address) {
    return "";
  }

  return `ws://${address}:${ESP_WEBSOCKET_PORT}`;
}
