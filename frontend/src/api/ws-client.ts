export type CustomerArrivedEvent = {
  type: "customer.arrived";
  id: string;
  name: string;
  persona: string;
  ailment_narrative: string;
  ailment_category: string;
};

export type WsEvent = CustomerArrivedEvent;

type Listener = (event: WsEvent) => void;
type StatusListener = (connected: boolean) => void;

const BACKOFFS_MS = [1000, 2000, 5000];

export class WsClient {
  private ws: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private statusListeners = new Set<StatusListener>();
  private attempt = 0;
  private closed = false;

  constructor(private url: string) {}

  connect(): void {
    this.closed = false;
    this.open();
  }

  close(): void {
    this.closed = true;
    this.ws?.close();
    this.ws = null;
  }

  on(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private open(): void {
    const ws = new WebSocket(this.url);
    this.ws = ws;
    ws.addEventListener("open", () => {
      this.attempt = 0;
      this.statusListeners.forEach((l) => l(true));
    });
    ws.addEventListener("message", (e) => {
      try {
        const event = JSON.parse(e.data) as WsEvent;
        this.listeners.forEach((l) => l(event));
      } catch {
        // ignore malformed
      }
    });
    ws.addEventListener("close", () => {
      this.statusListeners.forEach((l) => l(false));
      if (this.closed) return;
      const delay = BACKOFFS_MS[Math.min(this.attempt, BACKOFFS_MS.length - 1)];
      this.attempt += 1;
      setTimeout(() => this.open(), delay);
    });
    ws.addEventListener("error", () => {
      ws.close();
    });
  }
}

export function makeWsClient(): WsClient {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return new WsClient(`${proto}//${window.location.host}/ws/events`);
}
