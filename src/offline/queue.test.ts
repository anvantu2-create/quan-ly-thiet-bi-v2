import assert from "node:assert/strict";
import test from "node:test";
import { enqueue, readQueue, removeQueued } from "./queue.js";
class MemoryStore {
  value: string | null = null;
  getItem() {
    return this.value;
  }
  setItem(_key: string, value: string) {
    this.value = value;
  }
}
test("offline queue chống operationId trùng và không chứa token", () => {
  const store = new MemoryStore(),
    item = {
      id: "op-1",
      action: "CREATE" as const,
      collection: "devices",
      data: { code: "D1" },
      createdAt: "now",
    };
  enqueue(item, store);
  enqueue(item, store);
  assert.equal(readQueue(store).length, 1);
  assert.equal(store.value?.includes("token"), false);
  removeQueued("op-1", store);
  assert.equal(readQueue(store).length, 0);
});
