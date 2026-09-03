import assert from "node:assert/strict";
import test from "node:test";
import { eventBus, type RealtimeEvent } from "./eventBus.js";
test("mỗi lần publish chỉ gửi đúng một event cho subscriber", () => {
  let count = 0;
  const stop = eventBus.subscribe(() => count++),
    event: RealtimeEvent = {
      id: "op-1",
      collection: "devices",
      entityId: "d1",
      action: "UPDATE",
      createdAt: new Date().toISOString(),
    };
  eventBus.publish(event);
  stop();
  eventBus.publish({ ...event, id: "op-2" });
  assert.equal(count, 1);
});
