export type OfflineMutation = {
  id: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  collection: string;
  entityId?: string;
  data: Record<string, unknown>;
  expectedVersion?: number;
  createdAt: string;
};
const KEY = "grid-v2-offline-queue";
type Store = Pick<Storage, "getItem" | "setItem">;
export function readQueue(store: Store = localStorage): OfflineMutation[] {
  try {
    return JSON.parse(store.getItem(KEY) ?? "[]") as OfflineMutation[];
  } catch {
    return [];
  }
}
export function enqueue(item: OfflineMutation, store: Store = localStorage) {
  const queue = readQueue(store);
  if (!queue.some((x) => x.id === item.id)) {
    queue.push(item);
    store.setItem(KEY, JSON.stringify(queue));
  }
  return queue.length;
}
export function removeQueued(id: string, store: Store = localStorage) {
  const queue = readQueue(store).filter((x) => x.id !== id);
  store.setItem(KEY, JSON.stringify(queue));
  return queue.length;
}
