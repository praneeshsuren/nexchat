declare module 'sockjs-client' {
  class SockJS {
  constructor(url: string, _reserved?: unknown, options?: unknown);
    // Add minimal type definitions for commonly used methods/properties
    readyState: number;
  onopen: ((e?: unknown) => void) | null;
  onclose: ((e?: unknown) => void) | null;
    onmessage: ((e: { data: string }) => void) | null;
    send(data: string): void;
    close(): void;
  }
  export default SockJS;
}
