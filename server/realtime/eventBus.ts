import { EventEmitter } from "node:events";
export type RealtimeEvent = {
  id: string;
  collection: string;
  entityId: string;
  action: string;
  version?: number;
  createdAt: string;
};
class EventBus extends EventEmitter {
  publish(event: RealtimeEvent) {
    this.emit("event", event);
  }
  subscribe(listener: (event: RealtimeEvent) => void) {
    this.on("event", listener);
    return () => this.off("event", listener);
  }
}
export const eventBus = new EventBus();
